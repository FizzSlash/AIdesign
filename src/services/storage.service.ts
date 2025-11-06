import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';
import sharp from 'sharp';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const BUCKET_NAME = 'email-assets';

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  file: Buffer,
  filename: string,
  options?: {
    folder?: string;
    optimize?: boolean;
  }
): Promise<string> {
  try {
    let imageBuffer = file;

    // Optimize image if requested
    if (options?.optimize !== false) {
      imageBuffer = await sharp(file)
        .resize(1200, null, { withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const folder = options?.folder || 'uploads';
    const path = `${folder}/${timestamp}_${randomStr}_${filename}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      logger.error('Supabase upload failed', { error, filename });
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    logger.info('Image uploaded to Supabase', { filename, path });

    return urlData.publicUrl;
  } catch (error) {
    logger.error('Image upload error', { error, filename });
    throw error;
  }
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  files: Array<{ buffer: Buffer; filename: string }>,
  folder?: string
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadImage(file.buffer, file.filename, { folder })
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    // Extract path from URL
    const urlObj = new URL(url);
    const path = urlObj.pathname.split('/public/email-assets/')[1];

    if (!path) {
      throw new Error('Invalid image URL');
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      logger.error('Supabase delete failed', { error, url });
      throw new Error(`Delete failed: ${error.message}`);
    }

    logger.info('Image deleted from Supabase', { path });
  } catch (error) {
    logger.error('Image delete error', { error, url });
    throw error;
  }
}

/**
 * Get signed URL for private images (if needed)
 */
export async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * List all images for a user
 */
export async function listImages(folder: string): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folder);

  if (error) {
    throw new Error(`Failed to list images: ${error.message}`);
  }

  return data.map((file) => file.name);
}

