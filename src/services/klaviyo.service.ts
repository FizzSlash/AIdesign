import { query } from '../db/index.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import fetch from 'node-fetch';

const KLAVIYO_API_BASE = 'https://a.klaviyo.com/api';
const API_REVISION = '2024-10-15';

interface ConnectData {
  privateKey: string;
  publicKey?: string;
}

export async function connectKlaviyo(userId: string, data: ConnectData) {
  const { privateKey, publicKey } = data;
  
  // Validate API key by making a test request
  try {
    const response = await fetch(`${KLAVIYO_API_BASE}/accounts/`, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${privateKey}`,
        'revision': API_REVISION,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new AppError(401, 'Invalid Klaviyo API key');
    }
    
    const accountData: any = await response.json();
    const account = accountData.data[0];
    
    // Encrypt and store API keys
    const privateKeyEncrypted = encrypt(privateKey);
    const publicKeyEncrypted = publicKey ? encrypt(publicKey) : null;
    
    // Upsert Klaviyo account
    const result = await query(
      `INSERT INTO klaviyo_accounts (user_id, private_api_key_encrypted, public_api_key_encrypted, account_id, account_name, is_connected, last_synced_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         private_api_key_encrypted = $2,
         public_api_key_encrypted = $3,
         account_id = $4,
         account_name = $5,
         is_connected = true,
         updated_at = NOW()
       RETURNING id`,
      [userId, privateKeyEncrypted, publicKeyEncrypted, account.id, account.attributes?.test_account ? 'Test Account' : 'Production Account']
    );
    
    logger.info('Klaviyo account connected', { userId, accountId: account.id });
    
    // Start template sync in background
    await syncTemplates(userId);
    
    return {
      message: 'Klaviyo account connected successfully',
      accountId: account.id,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Klaviyo connection failed', { error, userId });
    throw new AppError(500, 'Failed to connect Klaviyo account');
  }
}

export async function getConnectionStatus(userId: string) {
  const result = await query(
    `SELECT is_connected, account_id, account_name, last_synced_at, sync_status, error_message
     FROM klaviyo_accounts WHERE user_id = $1`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    return { isConnected: false };
  }
  
  const account = result.rows[0];
  
  return {
    isConnected: account.is_connected,
    accountId: account.account_id,
    accountName: account.account_name,
    lastSynced: account.last_synced_at,
    syncStatus: account.sync_status,
    error: account.error_message,
  };
}

export async function syncTemplates(userId: string): Promise<string> {
  // Create background job
  const jobResult = await query(
    `INSERT INTO background_jobs (user_id, job_type, status, input_data)
     VALUES ($1, 'klaviyo_template_sync', 'pending', '{}')
     RETURNING id`,
    [userId]
  );
  
  const jobId = jobResult.rows[0].id;
  
  // Process job asynchronously
  processTemplateSyncJob(jobId, userId).catch(error => {
    logger.error('Template sync job failed', { jobId, userId, error });
  });
  
  return jobId;
}

async function processTemplateSyncJob(jobId: string, userId: string) {
  try {
    // Update job status
    await query(
      `UPDATE background_jobs SET status = 'processing', started_at = NOW() WHERE id = $1`,
      [jobId]
    );
    
    // Get Klaviyo credentials
    const credentials = await getKlaviyoCredentials(userId);
    
    if (!credentials) {
      throw new Error('Klaviyo not connected');
    }
    
    // Fetch templates from Klaviyo
    const templates = await fetchKlaviyoTemplates(credentials.privateKey);
    
    // Store templates
    for (const template of templates) {
      await query(
        `INSERT INTO email_templates (user_id, name, description, source, klaviyo_template_id, html_content, layout_type, created_at)
         VALUES ($1, $2, $3, 'klaviyo', $4, $5, 'imported', NOW())
         ON CONFLICT (user_id, klaviyo_template_id) DO UPDATE SET
           name = $2,
           html_content = $5,
           updated_at = NOW()`,
        [userId, template.name, template.text, template.id, template.html]
      );
    }
    
    // Update job status
    await query(
      `UPDATE background_jobs 
       SET status = 'completed', completed_at = NOW(), output_data = $2
       WHERE id = $1`,
      [jobId, JSON.stringify({ templatesImported: templates.length })]
    );
    
    // Update Klaviyo account sync status
    await query(
      `UPDATE klaviyo_accounts SET last_synced_at = NOW(), sync_status = 'completed' WHERE user_id = $1`,
      [userId]
    );
    
    logger.info('Template sync completed', { userId, count: templates.length });
  } catch (error: any) {
    await query(
      `UPDATE background_jobs 
       SET status = 'failed', completed_at = NOW(), error_message = $2
       WHERE id = $1`,
      [jobId, error.message]
    );
    
    await query(
      `UPDATE klaviyo_accounts SET sync_status = 'failed', error_message = $2 WHERE user_id = $1`,
      [userId, error.message]
    );
  }
}

async function fetchKlaviyoTemplates(apiKey: string) {
  const response = await fetch(`${KLAVIYO_API_BASE}/templates/`, {
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'revision': API_REVISION,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch templates from Klaviyo');
  }
  
  const data: any = await response.json();
  
  return data.data.map((template: any) => ({
    id: template.id,
    name: template.attributes.name,
    html: template.attributes.html,
    text: template.attributes.text,
  }));
}

export async function getImportedTemplates(userId: string) {
  const result = await query(
    `SELECT id, name, description, klaviyo_template_id, layout_type, created_at, updated_at
     FROM email_templates
     WHERE user_id = $1 AND source = 'klaviyo'
     ORDER BY created_at DESC`,
    [userId]
  );
  
  return result.rows;
}

export async function pushTemplateToKlaviyo(userId: string, emailId: string, templateName: string) {
  // Get email content
  const emailResult = await query(
    `SELECT html_content FROM generated_emails WHERE id = $1 AND user_id = $2`,
    [emailId, userId]
  );
  
  if (emailResult.rows.length === 0) {
    throw new AppError(404, 'Email not found');
  }
  
  const htmlContent = emailResult.rows[0].html_content;
  
  // Get Klaviyo credentials
  const credentials = await getKlaviyoCredentials(userId);
  
  if (!credentials) {
    throw new AppError(400, 'Klaviyo not connected');
  }
  
  // Push to Klaviyo
  const response = await fetch(`${KLAVIYO_API_BASE}/templates/`, {
    method: 'POST',
    headers: {
      'Authorization': `Klaviyo-API-Key ${credentials.privateKey}`,
      'revision': API_REVISION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'template',
        attributes: {
          name: templateName,
          html: htmlContent,
        },
      },
    }),
  });
  
  if (!response.ok) {
    throw new AppError(500, 'Failed to push template to Klaviyo');
  }
  
  const result: any = await response.json();
  const klaviyoTemplateId = result.data.id;
  
  // Update email record
  await query(
    `UPDATE generated_emails 
     SET klaviyo_template_id = $1, pushed_to_klaviyo_at = NOW(), status = 'sent_to_klaviyo'
     WHERE id = $2`,
    [klaviyoTemplateId, emailId]
  );
  
  logger.info('Template pushed to Klaviyo', { userId, emailId, klaviyoTemplateId });
  
  return {
    message: 'Template pushed to Klaviyo successfully',
    klaviyoTemplateId,
  };
}

export async function disconnectKlaviyo(userId: string) {
  await query(
    `UPDATE klaviyo_accounts SET is_connected = false WHERE user_id = $1`,
    [userId]
  );
  
  logger.info('Klaviyo account disconnected', { userId });
}

async function getKlaviyoCredentials(userId: string) {
  const result = await query(
    `SELECT private_api_key_encrypted, public_api_key_encrypted
     FROM klaviyo_accounts WHERE user_id = $1 AND is_connected = true`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  
  return {
    privateKey: decrypt(row.private_api_key_encrypted),
    publicKey: row.public_api_key_encrypted ? decrypt(row.public_api_key_encrypted) : null,
  };
}

