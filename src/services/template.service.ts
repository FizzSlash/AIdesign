import { query } from '../db/index.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getTemplates(
  userId: string,
  filters: { campaignType?: string; favorite?: boolean; limit?: number; offset?: number }
) {
  const conditions: string[] = ['user_id = $1', 'is_archived = false'];
  const params: any[] = [userId];
  let paramIndex = 2;

  if (filters.campaignType) {
    conditions.push(`campaign_type = $${paramIndex}`);
    params.push(filters.campaignType);
    paramIndex++;
  }

  if (filters.favorite) {
    conditions.push(`is_favorite = true`);
  }

  const result = await query(
    `SELECT id, name, description, layout_type, campaign_type, subject_line,
            preview_text, times_used, is_favorite, created_at, updated_at
     FROM email_templates
     WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, filters.limit || 50, filters.offset || 0]
  );

  return result.rows;
}

export async function createTemplate(userId: string, data: any) {
  const result = await query(
    `INSERT INTO email_templates (
      user_id, name, description, source, html_content, mjml_content,
      layout_type, campaign_type, subject_line, preview_text
    ) VALUES ($1, $2, $3, 'manual', $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      userId,
      data.name,
      data.description,
      data.htmlContent,
      data.mjmlContent,
      data.layoutType,
      data.campaignType,
      data.subjectLine,
      data.previewText,
    ]
  );

  return result.rows[0];
}

export async function getTemplateById(userId: string, templateId: string) {
  const result = await query(
    `SELECT * FROM email_templates WHERE id = $1 AND user_id = $2`,
    [templateId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Template not found');
  }

  return result.rows[0];
}

export async function updateTemplate(userId: string, templateId: string, data: any) {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.name) {
    fields.push(`name = $${paramIndex}`);
    params.push(data.name);
    paramIndex++;
  }

  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex}`);
    params.push(data.description);
    paramIndex++;
  }

  if (data.htmlContent) {
    fields.push(`html_content = $${paramIndex}`);
    params.push(data.htmlContent);
    paramIndex++;
  }

  if (data.mjmlContent) {
    fields.push(`mjml_content = $${paramIndex}`);
    params.push(data.mjmlContent);
    paramIndex++;
  }

  if (data.isFavorite !== undefined) {
    fields.push(`is_favorite = $${paramIndex}`);
    params.push(data.isFavorite);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new AppError(400, 'No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  params.push(templateId, userId);

  const result = await query(
    `UPDATE email_templates
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Template not found');
  }

  return result.rows[0];
}

export async function deleteTemplate(userId: string, templateId: string) {
  const result = await query(
    `UPDATE email_templates SET is_archived = true WHERE id = $1 AND user_id = $2`,
    [templateId, userId]
  );

  if (result.rowCount === 0) {
    throw new AppError(404, 'Template not found');
  }
}

