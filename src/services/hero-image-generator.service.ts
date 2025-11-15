/**
 * AI Hero Image Generation Service
 * Creates custom hero images for emails
 */

import OpenAI from 'openai';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

export interface HeroImageRequest {
  type: 'gradient' | 'dalle' | 'collage';
  text?: string;
  campaignBrief?: string;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  brandVoice?: string;
  productImages?: string[];
}

/**
 * Generate hero image with DALL-E 3
 */
export async function generateDALLEHero(request: HeroImageRequest): Promise<string> {
  const { campaignBrief, brandVoice, brandColors } = request;
  
  // Build detailed prompt
  const prompt = buildDALLEPrompt(campaignBrief || '', brandVoice || 'professional', brandColors);
  
  logger.info('Generating DALL-E hero image', { prompt });
  
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1792x1024", // Landscape for email hero
      quality: "hd",
      style: "vivid", // More dramatic and eye-catching
      n: 1
    });

    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }
    
    logger.info('DALL-E hero generated', { imageUrl });
    
    return imageUrl;
  } catch (error) {
    logger.error('DALL-E generation failed', { error });
    throw new Error('Failed to generate AI hero image');
  }
}

/**
 * Build optimized DALL-E prompt based on campaign
 */
function buildDALLEPrompt(
  campaignBrief: string,
  brandVoice: string,
  brandColors?: any
): string {
  const brief = campaignBrief.toLowerCase();
  
  // Determine scene type from brief
  let sceneType = '';
  let mood = '';
  let style = '';
  
  // Sale/Promotional
  if (brief.includes('sale') || brief.includes('discount') || brief.includes('off')) {
    sceneType = 'dramatic sale scene';
    mood = 'energetic, exciting, urgent';
    style = 'bold, high contrast, dynamic composition';
  }
  // Product Launch
  else if (brief.includes('launch') || brief.includes('new') || brief.includes('introducing')) {
    sceneType = 'elegant product showcase';
    mood = 'aspirational, premium, sophisticated';
    style = 'clean, modern, minimalist, studio lighting';
  }
  // Seasonal/Holiday
  else if (brief.includes('winter') || brief.includes('summer') || brief.includes('holiday')) {
    sceneType = 'seasonal lifestyle scene';
    mood = 'warm, inviting, lifestyle-focused';
    style = 'natural lighting, outdoor setting, authentic';
  }
  // Default
  else {
    sceneType = 'professional marketing photo';
    mood = 'clean, modern, professional';
    style = 'high-quality commercial photography';
  }
  
  // Adjust for brand voice
  const voiceAdjustments: Record<string, string> = {
    luxury: 'ultra-premium, sophisticated, elegant, high-end fashion photography',
    casual: 'approachable, friendly, authentic, lifestyle photography',
    playful: 'colorful, fun, energetic, vibrant, creative',
    professional: 'polished, corporate, trustworthy, business professional'
  };
  
  const voiceStyle = voiceAdjustments[brandVoice] || voiceAdjustments.professional;
  
  // Extract main subject
  const subject = brief.split(' ').slice(0, 3).join(' ');
  
  const finalPrompt = `Professional marketing hero image for email campaign. 
Subject: ${subject}
Scene: ${sceneType}
Mood: ${mood}
Style: ${style}, ${voiceStyle}
Quality: High-end commercial photography, perfect for email marketing
Format: Landscape orientation, wide-angle composition
Details: Clean, uncluttered, focus on main subject, brand-appropriate
No text overlays - clean image only`;

  return finalPrompt;
}

/**
 * Generate text + gradient hero (instant, free)
 */
export async function generateGradientHero(request: HeroImageRequest): Promise<string> {
  const { text, brandColors } = request;
  
  // For now, return a data URL or upload to storage
  // This would use Canvas API on backend or client
  
  logger.info('Gradient hero requested', { text, brandColors });
  
  // TODO: Implement Canvas/Sharp generation
  // For now, return placeholder
  return 'https://via.placeholder.com/1792x1024/6366f1/ffffff?text=' + encodeURIComponent(text || 'Sale');
}

/**
 * Get cost estimate for hero generation
 */
export function getHeroCost(type: string): number {
  const costs: Record<string, number> = {
    gradient: 0,      // Free
    dalle: 0.04,      // DALL-E 3 HD
    collage: 0        // Free
  };
  
  return costs[type] || 0;
}

export { buildDALLEPrompt };

