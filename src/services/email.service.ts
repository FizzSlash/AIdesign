import { query } from '../db/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import * as aiService from './ai.service.js';
import * as mjmlService from './mjml.service.js';
import * as brandService from './brand.service.js';

interface GenerateEmailData {
  campaignBrief: string;
  campaignType?: string;
  targetProducts?: string[];
  tone?: string;
  layoutPreference?: string;
}

export async function generateEmail(userId: string, data: GenerateEmailData): Promise<string> {
  // Create background job
  const jobResult = await query(
    `INSERT INTO background_jobs (user_id, job_type, status, input_data)
     VALUES ($1, 'email_generation', 'pending', $2)
     RETURNING id`,
    [userId, JSON.stringify(data)]
  );

  const jobId = jobResult.rows[0].id;

  // Process job asynchronously
  processEmailGenerationJob(jobId, userId, data).catch((error) => {
    logger.error('Email generation job failed', { jobId, userId, error });
  });

  return jobId;
}

async function processEmailGenerationJob(jobId: string, userId: string, data: GenerateEmailData) {
  const startTime = Date.now();
  let totalTokens = 0;

  try {
    // Update job status
    await query(
      `UPDATE background_jobs SET status = 'processing', started_at = NOW(), progress = 10 WHERE id = $1`,
      [jobId]
    );

    // 1. Load brand context
    const brandProfile = await brandService.getBrandProfile(userId);

    if (!brandProfile) {
      throw new Error('Brand profile not found. Please complete brand setup first.');
    }

    await updateJobProgress(jobId, 20, 'Analyzing campaign intent');

    // 2. Analyze intent
    const intent = await aiService.analyzeIntent(data.campaignBrief, brandProfile, {
      campaignType: data.campaignType,
      tone: data.tone,
    });
    totalTokens += 500; // Approximate

    await updateJobProgress(jobId, 40, 'Generating content sections');

    // 3. Generate content sections in parallel
    const [heroSection, productGrid] = await Promise.all([
      aiService.generateHeroSection(intent, brandProfile),
      aiService.generateProductGrid(intent, brandProfile, data.targetProducts || []),
    ]);
    totalTokens += 1000;

    await updateJobProgress(jobId, 60, 'Selecting images');

    // 4. Select images from brand assets
    const images = await selectImages(userId, intent);

    await updateJobProgress(jobId, 75, 'Assembling email');

    // 5. Assemble MJML
    const mjml = await mjmlService.assembleMJML({
      brandProfile,
      heroSection,
      productGrid,
      images,
      intent,
    });

    // 6. Render to HTML
    const html = await mjmlService.renderMJMLToHTML(mjml);

    await updateJobProgress(jobId, 90, 'Finalizing');

    // 7. Save generated email
    const emailResult = await query(
      `INSERT INTO generated_emails (
        user_id, campaign_brief, campaign_type, campaign_options,
        model_used, generation_time_ms, tokens_used, cost_usd,
        html_content, mjml_content, subject_line, preview_text,
        images_used, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'draft')
      RETURNING id`,
      [
        userId,
        data.campaignBrief,
        intent.campaignType,
        JSON.stringify(data),
        config.DEFAULT_AI_MODEL,
        Date.now() - startTime,
        totalTokens,
        aiService.calculateCost(config.DEFAULT_AI_MODEL, totalTokens),
        html,
        mjml,
        intent.suggestedSubjectLines[0],
        intent.previewText,
        JSON.stringify(images.map((img) => ({ id: img.id, url: img.cdn_url }))),
      ]
    );

    const emailId = emailResult.rows[0].id;

    // Update job status
    await query(
      `UPDATE background_jobs 
       SET status = 'completed', completed_at = NOW(), progress = 100, output_data = $2
       WHERE id = $1`,
      [jobId, JSON.stringify({ emailId, tokensUsed: totalTokens })]
    );

    // Log usage
    await query(
      `INSERT INTO usage_logs (user_id, action, resource_type, resource_id, tokens_used, cost_usd, metadata)
       VALUES ($1, 'email_generated', 'email', $2, $3, $4, $5)`,
      [
        userId,
        emailId,
        totalTokens,
        aiService.calculateCost(config.DEFAULT_AI_MODEL, totalTokens),
        JSON.stringify({ campaignType: intent.campaignType }),
      ]
    );

    logger.info('Email generated successfully', { userId, emailId, jobId });
  } catch (error: any) {
    await query(
      `UPDATE background_jobs 
       SET status = 'failed', completed_at = NOW(), error_message = $2
       WHERE id = $1`,
      [jobId, error.message]
    );

    logger.error('Email generation failed', { jobId, userId, error: error.message });
  }
}

async function updateJobProgress(jobId: string, progress: number, step: string) {
  await query(
    `UPDATE background_jobs SET progress = $1, current_step = $2 WHERE id = $3`,
    [progress, step, jobId]
  );
}

async function selectImages(userId: string, intent: any) {
  const { keyProducts } = intent;
  
  // Smart search: Find images matching the campaign products
  const result = await query(
    `SELECT id, cdn_url, alt_text, dimensions, ai_description, category, tags
     FROM brand_assets
     WHERE user_id = $1 
       AND is_active = true
       AND (
         -- Match by category
         category ILIKE ANY($2::text[])
         OR subcategory ILIKE ANY($2::text[])
         -- Match by description
         OR ai_description ILIKE ANY($3::text[])
         -- Match by tags
         OR tags && $2::text[]
       )
     ORDER BY uploaded_at DESC
     LIMIT 20`,
    [
      userId,
      keyProducts, // e.g., ['dresses', 'summer']
      keyProducts.map((p: string) => `%${p}%`) // for ILIKE search
    ]
  );

  // If we found matching products, use them
  if (result.rows.length >= 6) {
    logger.info('Found matching products for campaign', { 
      count: result.rows.length, 
      products: keyProducts 
    });
    return result.rows.slice(0, 6);
  }
  
  // Fallback: Get any product images
  const fallback = await query(
    `SELECT id, cdn_url, alt_text, dimensions, ai_description
     FROM brand_assets
     WHERE user_id = $1 
       AND asset_type IN ('product', 'lifestyle', 'banner')
       AND is_active = true
     ORDER BY uploaded_at DESC
     LIMIT 10`,
    [userId]
  );
  
  logger.warn('Using fallback images - no specific matches found', { keyProducts });
  return fallback.rows.slice(0, 6);
}

export async function getGenerationStatus(userId: string, jobId: string) {
  const result = await query(
    `SELECT status, progress, current_step, error_message, output_data, started_at, completed_at
     FROM background_jobs
     WHERE id = $1 AND user_id = $2 AND job_type = 'email_generation'`,
    [jobId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Job not found');
  }

  const job = result.rows[0];

  return {
    status: job.status,
    progress: job.progress || 0,
    currentStep: job.current_step,
    error: job.error_message,
    emailId: job.output_data?.emailId,
    startedAt: job.started_at,
    completedAt: job.completed_at,
  };
}

export async function regenerateEmail(
  userId: string,
  emailId: string,
  options: { section?: string; variation?: boolean }
) {
  // Get original email
  const result = await query(
    `SELECT campaign_brief, campaign_type, campaign_options
     FROM generated_emails
     WHERE id = $1 AND user_id = $2`,
    [emailId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Email not found');
  }

  const original = result.rows[0];

  // Generate new email with same parameters
  return generateEmail(userId, {
    campaignBrief: original.campaign_brief,
    campaignType: original.campaign_type,
    ...JSON.parse(original.campaign_options || '{}'),
  });
}

export async function getEmails(
  userId: string,
  filters: { status?: string; campaignType?: string; limit?: number; offset?: number }
) {
  const conditions: string[] = ['user_id = $1'];
  const params: any[] = [userId];
  let paramIndex = 2;

  if (filters.status) {
    conditions.push(`status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.campaignType) {
    conditions.push(`campaign_type = $${paramIndex}`);
    params.push(filters.campaignType);
    paramIndex++;
  }

  const result = await query(
    `SELECT id, campaign_brief, campaign_type, subject_line, preview_text, 
            status, created_at, pushed_to_klaviyo_at, user_rating
     FROM generated_emails
     WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, filters.limit || 20, filters.offset || 0]
  );

  return result.rows;
}

export async function getEmailById(userId: string, emailId: string) {
  const result = await query(
    `SELECT *
     FROM generated_emails
     WHERE id = $1 AND user_id = $2`,
    [emailId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Email not found');
  }

  return result.rows[0];
}

export async function updateEmail(userId: string, emailId: string, data: any) {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.htmlContent) {
    fields.push(`html_content = $${paramIndex}`);
    params.push(data.htmlContent);
    paramIndex++;
  }

  if (data.subjectLine) {
    fields.push(`subject_line = $${paramIndex}`);
    params.push(data.subjectLine);
    paramIndex++;
  }

  if (data.previewText) {
    fields.push(`preview_text = $${paramIndex}`);
    params.push(data.previewText);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new AppError(400, 'No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  params.push(emailId, userId);

  const result = await query(
    `UPDATE generated_emails
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Email not found');
  }

  return result.rows[0];
}

export async function deleteEmail(userId: string, emailId: string) {
  const result = await query(
    `UPDATE generated_emails
     SET status = 'deleted'
     WHERE id = $1 AND user_id = $2`,
    [emailId, userId]
  );

  if (result.rowCount === 0) {
    throw new AppError(404, 'Email not found');
  }
}

export async function rateEmail(userId: string, emailId: string, data: { rating: number; feedback?: string }) {
  const result = await query(
    `UPDATE generated_emails
     SET user_rating = $1, user_feedback = $2
     WHERE id = $3 AND user_id = $4`,
    [data.rating, data.feedback, emailId, userId]
  );

  if (result.rowCount === 0) {
    throw new AppError(404, 'Email not found');
  }
}

import config from '../config/index.js';

