import { query } from '../db/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
// import puppeteer from 'puppeteer'; // Removed for Vercel compatibility
import sharp from 'sharp';
import * as aiService from './ai.service.js';
import config from '../config/index.js';

export async function analyzeWebsite(userId: string, websiteUrl: string): Promise<string> {
  // Create background job
  const jobResult = await query(
    `INSERT INTO background_jobs (user_id, job_type, status, input_data)
     VALUES ($1, 'brand_analysis', 'pending', $2)
     RETURNING id`,
    [userId, JSON.stringify({ websiteUrl })]
  );

  const jobId = jobResult.rows[0].id;

  // Process job asynchronously
  processBrandAnalysisJob(jobId, userId, websiteUrl).catch((error) => {
    logger.error('Brand analysis job failed', { jobId, userId, error });
  });

  return jobId;
}

async function processBrandAnalysisJob(jobId: string, userId: string, websiteUrl: string) {
  try {
    await query(
      `UPDATE background_jobs SET status = 'processing', started_at = NOW(), progress = 10 WHERE id = $1`,
      [jobId]
    );

    // Scrape website
    await updateJobProgress(jobId, 20, 'Scraping website');
    const scrapedData = await scrapeWebsite(websiteUrl);

    // Extract brand elements
    await updateJobProgress(jobId, 40, 'Extracting brand elements');
    const colorPalette = extractColorPalette(scrapedData.styles);
    const typography = extractTypography(scrapedData.styles);
    const logos = extractLogos(scrapedData.images);

    // Analyze brand voice
    await updateJobProgress(jobId, 60, 'Analyzing brand voice');
    const brandVoice = await analyzeBrandVoice(scrapedData.text);

    // Save images to assets
    await updateJobProgress(jobId, 80, 'Saving brand assets');
    const savedAssets = await saveScrapedImages(userId, scrapedData.images, websiteUrl);

    // Update/create brand profile
    await query(
      `INSERT INTO brand_profiles (
        user_id, website_url, brand_name, logo_urls, color_palette, typography,
        brand_voice, brand_adjectives, analysis_status, analysis_completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed', NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        website_url = $2,
        logo_urls = $4,
        color_palette = $5,
        typography = $6,
        brand_voice = $7,
        brand_adjectives = $8,
        analysis_status = 'completed',
        analysis_completed_at = NOW(),
        updated_at = NOW()`,
      [
        userId,
        websiteUrl,
        extractBrandName(websiteUrl),
        JSON.stringify(logos),
        JSON.stringify(colorPalette),
        JSON.stringify(typography),
        brandVoice.voice,
        brandVoice.adjectives,
      ]
    );

    await query(
      `UPDATE background_jobs 
       SET status = 'completed', completed_at = NOW(), progress = 100, output_data = $2
       WHERE id = $1`,
      [jobId, JSON.stringify({ assetsCount: savedAssets.length })]
    );

    logger.info('Brand analysis completed', { userId, websiteUrl });
  } catch (error: any) {
    await query(
      `UPDATE background_jobs 
       SET status = 'failed', completed_at = NOW(), error_message = $2
       WHERE id = $1`,
      [jobId, error.message]
    );
  }
}

async function scrapeWebsite(url: string) {
  // Puppeteer removed for Vercel compatibility
  // For V1, users will upload brand assets manually
  // TODO: Implement with external scraping service or Vercel Edge function
  
  throw new Error('Website scraping temporarily disabled. Please upload brand assets manually.');
  
  // Placeholder return for TypeScript
  return {
    html: '',
    text: '',
    images: [],
    styles: ''
  };
}

function extractColorPalette(styles: string) {
  const colors = new Map<string, number>();
  const colorRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})|rgb\([^)]+\)/g;

  const matches = styles.match(colorRegex) || [];

  matches.forEach((color) => {
    const normalized = normalizeColor(color);
    if (normalized) {
      colors.set(normalized, (colors.get(normalized) || 0) + 1);
    }
  });

  const sorted = Array.from(colors.entries()).sort((a, b) => b[1] - a[1]);

  return {
    primary: sorted[0]?.[0] || '#000000',
    secondary: sorted[1]?.[0] || '#666666',
    accent: sorted[2]?.[0] || '#0066CC',
    background: '#FFFFFF',
    text: '#1F1F1F',
  };
}

function normalizeColor(color: string): string | null {
  // Convert RGB to hex
  if (color.startsWith('rgb')) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    }
  }

  // Normalize hex
  if (color.startsWith('#')) {
    return color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase()
      : color.toUpperCase();
  }

  return null;
}

function extractTypography(styles: string) {
  const fontFamilyRegex = /font-family:\s*([^;}]+)/g;
  const fonts = new Set<string>();

  let match;
  while ((match = fontFamilyRegex.exec(styles)) !== null) {
    const font = match[1].split(',')[0].replace(/['"]/g, '').trim();
    if (font && !font.includes('serif') && !font.includes('sans')) {
      fonts.add(font);
    }
  }

  const primaryFont = Array.from(fonts)[0] || 'Arial, sans-serif';

  return {
    heading: {
      font: primaryFont,
      size: '32px',
      weight: 'bold',
    },
    body: {
      font: primaryFont,
      size: '14px',
      weight: 'normal',
    },
  };
}

function extractLogos(images: any[]) {
  // Simple heuristic: look for small images likely to be logos
  const logoImages = images.filter(
    (img) =>
      (img.alt?.toLowerCase().includes('logo') ||
        img.src?.toLowerCase().includes('logo')) &&
      img.width < 500 &&
      img.height < 200
  );

  return {
    header: logoImages[0]?.src || '',
    footer: logoImages[1]?.src || logoImages[0]?.src || '',
  };
}

function extractBrandName(url: string): string {
  const domain = new URL(url).hostname.replace('www.', '');
  const name = domain.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function analyzeBrandVoice(text: string): Promise<{ voice: string; adjectives: string[] }> {
  const prompt = `Analyze the brand voice from this website content.

Content sample:
${text.slice(0, 2000)}

Classify the brand voice as ONE of:
- luxury: High-end, sophisticated, exclusive
- casual: Friendly, approachable, conversational
- playful: Fun, energetic, quirky
- professional: Expert, trustworthy, authoritative

Also provide 3-5 adjectives that describe the brand.

Return ONLY valid JSON:
{
  "voice": "luxury|casual|playful|professional",
  "adjectives": ["adjective1", "adjective2", "adjective3"]
}`;

  try {
    const response = await aiService.analyzeIntent(prompt, {}, {});
    return response as any;
  } catch {
    return { voice: 'professional', adjectives: ['modern', 'clean', 'trustworthy'] };
  }
}

async function saveScrapedImages(userId: string, images: any[], sourceUrl: string) {
  const savedAssets = [];

  for (const image of images.slice(0, 10)) {
    try {
      // Download image
      const response = await fetch(image.src);
      const buffer = Buffer.from(await response.arrayBuffer());

      // Optimize
      const optimized = await sharp(buffer)
        .resize(1200, null, { withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // TODO: Upload to S3/CDN
      // For now, store locally (in production, use S3)
      const filename = `brand_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
      const cdnUrl = `${config.CDN_BASE_URL}/${filename}`;

      // Save to database
      const result = await query(
        `INSERT INTO brand_assets (
          user_id, asset_type, original_url, cdn_url, filename,
          file_size, dimensions, alt_text, upload_source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'scraper')
        RETURNING id`,
        [
          userId,
          'lifestyle',
          image.src,
          cdnUrl,
          filename,
          optimized.length,
          JSON.stringify({ width: image.width, height: image.height }),
          image.alt || '',
        ]
      );

      savedAssets.push(result.rows[0].id);
    } catch (error) {
      logger.warn('Failed to save scraped image', { url: image.src, error });
    }
  }

  return savedAssets;
}

async function updateJobProgress(jobId: string, progress: number, step: string) {
  await query(
    `UPDATE background_jobs SET progress = $1, current_step = $2 WHERE id = $3`,
    [progress, step, jobId]
  );
}

export async function getAnalysisStatus(userId: string, jobId: string) {
  const result = await query(
    `SELECT status, progress, current_step, error_message, output_data
     FROM background_jobs
     WHERE id = $1 AND user_id = $2 AND job_type = 'brand_analysis'`,
    [jobId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Analysis job not found');
  }

  return result.rows[0];
}

export async function uploadAssets(
  userId: string,
  files: Express.Multer.File[],
  options: { assetType?: string; category?: string }
) {
  const savedAssets = [];

  for (const file of files) {
    try {
      // Optimize image
      const optimized = await sharp(file.buffer)
        .resize(1200, null, { withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // TODO: Upload to S3
      const filename = `upload_${Date.now()}_${file.originalname}`;
      const cdnUrl = `${config.CDN_BASE_URL}/${filename}`;

      // Get image metadata
      const metadata = await sharp(optimized).metadata();

      // Save to database
      const result = await query(
        `INSERT INTO brand_assets (
          user_id, asset_type, category, cdn_url, filename,
          file_size, dimensions, mime_type, upload_source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'manual')
        RETURNING *`,
        [
          userId,
          options.assetType || 'other',
          options.category,
          cdnUrl,
          filename,
          optimized.length,
          JSON.stringify({ width: metadata.width, height: metadata.height }),
          file.mimetype,
        ]
      );

      savedAssets.push(result.rows[0]);
    } catch (error) {
      logger.error('Failed to upload asset', { filename: file.originalname, error });
    }
  }

  return savedAssets;
}

export async function getBrandProfile(userId: string) {
  const result = await query(
    `SELECT * FROM brand_profiles WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0] || null;
}

export async function updateBrandProfile(userId: string, data: any) {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.brandName) {
    fields.push(`brand_name = $${paramIndex}`);
    params.push(data.brandName);
    paramIndex++;
  }

  if (data.brandVoice) {
    fields.push(`brand_voice = $${paramIndex}`);
    params.push(data.brandVoice);
    paramIndex++;
  }

  if (data.colorPalette) {
    fields.push(`color_palette = $${paramIndex}`);
    params.push(JSON.stringify(data.colorPalette));
    paramIndex++;
  }

  if (data.typography) {
    fields.push(`typography = $${paramIndex}`);
    params.push(JSON.stringify(data.typography));
    paramIndex++;
  }

  if (data.defaultLayout) {
    fields.push(`default_layout = $${paramIndex}`);
    params.push(data.defaultLayout);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new AppError(400, 'No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  params.push(userId);

  // Build column names from field assignments
  const columnNames = [];
  if (data.brandName) columnNames.push('brand_name');
  if (data.brandVoice) columnNames.push('brand_voice');
  if (data.colorPalette) columnNames.push('color_palette');
  if (data.typography) columnNames.push('typography');
  if (data.defaultLayout) columnNames.push('default_layout');

  const result = await query(
    `INSERT INTO brand_profiles (user_id, ${columnNames.join(', ')})
     VALUES ($${paramIndex}, ${params.slice(0, -1).map((_, i) => `$${i + 1}`).join(', ')})
     ON CONFLICT (user_id) DO UPDATE SET ${fields.join(', ')}
     RETURNING *`,
    params
  );

  return result.rows[0];
}

export async function getAssets(userId: string, filters: any) {
  const conditions = ['user_id = $1', 'is_active = true'];
  const params: any[] = [userId];
  let paramIndex = 2;

  if (filters.type) {
    conditions.push(`asset_type = $${paramIndex}`);
    params.push(filters.type);
    paramIndex++;
  }

  if (filters.category) {
    conditions.push(`category = $${paramIndex}`);
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.search) {
    conditions.push(`(alt_text ILIKE $${paramIndex} OR ai_description ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const result = await query(
    `SELECT * FROM brand_assets
     WHERE ${conditions.join(' AND ')}
     ORDER BY uploaded_at DESC
     LIMIT 50`,
    params
  );

  return result.rows;
}

export async function deleteAsset(userId: string, assetId: string) {
  const result = await query(
    `UPDATE brand_assets SET is_active = false WHERE id = $1 AND user_id = $2`,
    [assetId, userId]
  );

  if (result.rowCount === 0) {
    throw new AppError(404, 'Asset not found');
  }
}

