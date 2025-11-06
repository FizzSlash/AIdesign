import { query } from '../db/index.js';
import { logger } from '../utils/logger.js';
import * as aiService from './ai.service.js';
// import puppeteer from 'puppeteer'; // Removed for Vercel compatibility

/**
 * Smart product discovery using AI vision
 * Automatically finds products matching campaign intent
 */

interface ProductMatch {
  assetId: string;
  productName: string;
  category: string;
  confidence: number;
  imageUrl: string;
  attributes: string[];
}

/**
 * Analyze all brand assets and categorize them
 */
export async function categorizeAllAssets(userId: string) {
  logger.info('Starting asset categorization', { userId });
  
  // Get all uncategorized assets
  const result = await query(
    `SELECT id, cdn_url, filename, ai_description
     FROM brand_assets
     WHERE user_id = $1 
       AND is_active = true
       AND (category IS NULL OR ai_description IS NULL)
     LIMIT 50`,
    [userId]
  );
  
  const assets = result.rows;
  logger.info(`Found ${assets.length} assets to categorize`);
  
  for (const asset of assets) {
    try {
      // Use GPT-4 Vision to analyze the image
      const analysis = await analyzeProductImage(asset.cdn_url);
      
      // Update asset with AI-generated metadata
      await query(
        `UPDATE brand_assets
         SET category = $1,
             subcategory = $2,
             ai_description = $3,
             tags = $4
         WHERE id = $5`,
        [
          analysis.category,
          analysis.subcategory,
          analysis.description,
          analysis.tags,
          asset.id
        ]
      );
      
      logger.info('Categorized asset', { 
        assetId: asset.id, 
        category: analysis.category 
      });
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      logger.error('Failed to categorize asset', { assetId: asset.id, error });
    }
  }
  
  logger.info('Asset categorization complete', { userId, processed: assets.length });
}

/**
 * Use GPT-4 Vision to analyze a product image
 */
async function analyzeProductImage(imageUrl: string) {
  const prompt = `Analyze this product image and return ONLY valid JSON with these exact fields:

{
  "category": "main category (e.g., dresses, tops, pottery, furniture)",
  "subcategory": "specific type (e.g., maxi-dress, casual-shirt, bowl)",
  "description": "detailed 1-sentence description",
  "tags": ["tag1", "tag2", "tag3"],
  "attributes": {
    "color": "primary color",
    "style": "style descriptor (casual, formal, modern, etc.)",
    "season": "season if applicable (spring, summer, etc.)"
  }
}`;

  const response = await aiService.analyzeImage(imageUrl);
  
  try {
    // Try to parse AI response as JSON
    const analysis = JSON.parse(response);
    return {
      category: analysis.category || 'uncategorized',
      subcategory: analysis.subcategory || '',
      description: analysis.description || response,
      tags: analysis.tags || [],
      attributes: analysis.attributes || {}
    };
  } catch {
    // Fallback if response isn't JSON
    return {
      category: extractCategory(response),
      subcategory: '',
      description: response,
      tags: extractTags(response),
      attributes: {}
    };
  }
}

/**
 * Find products matching campaign intent
 */
export async function findMatchingProducts(
  userId: string,
  campaignIntent: any
): Promise<ProductMatch[]> {
  const { keyProducts, tone, campaignType } = campaignIntent;
  const searchTerms = keyProducts.join(' ');
  
  logger.info('Finding matching products', { userId, searchTerms });
  
  // Search by category and tags
  const result = await query(
    `SELECT id, cdn_url, filename, category, subcategory, ai_description, tags, dimensions
     FROM brand_assets
     WHERE user_id = $1 
       AND is_active = true
       AND (
         category ILIKE ANY($2::text[])
         OR subcategory ILIKE ANY($2::text[])
         OR ai_description ILIKE ANY($3::text[])
         OR tags && $2::text[]
       )
     ORDER BY uploaded_at DESC
     LIMIT 20`,
    [
      userId,
      keyProducts.map((p: string) => `%${p}%`),
      keyProducts.map((p: string) => `%${p}%`)
    ]
  );
  
  const matches: ProductMatch[] = result.rows.map((asset: any) => ({
    assetId: asset.id,
    productName: asset.subcategory || extractProductName(asset.ai_description),
    category: asset.category,
    confidence: calculateConfidence(asset, keyProducts),
    imageUrl: asset.cdn_url,
    attributes: asset.tags || []
  }));
  
  logger.info(`Found ${matches.length} matching products`);
  return matches;
}

/**
 * Scrape website and auto-detect product categories
 */
export async function scrapeProductCollections(websiteUrl: string) {
  // Puppeteer removed for Vercel compatibility
  // Use Shopify/Klaviyo product APIs instead
  logger.warn('Website scraping disabled - use product APIs', { websiteUrl });
  
  throw new Error('Website scraping temporarily disabled. Use Shopify/Klaviyo product APIs instead.');
}

/**
 * Enhanced brand analysis that auto-categorizes by product type
 */
export async function analyzeWebsiteWithProductDetection(userId: string, websiteUrl: string) {
  // Scraping disabled for Vercel - use Shopify/Klaviyo APIs instead
  logger.warn('Website scraping disabled - use product APIs', { userId, websiteUrl });
  
  throw new Error('Website scraping temporarily disabled. Use Shopify/Klaviyo product catalog APIs instead.');
}

// Helper functions
function extractCategory(text: string): string {
  const categories = ['dress', 'top', 'bottom', 'shoe', 'accessory', 'pottery', 'furniture', 'decor'];
  const lowerText = text.toLowerCase();
  
  for (const cat of categories) {
    if (lowerText.includes(cat)) return cat;
  }
  
  return 'uncategorized';
}

function extractTags(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were'];
  
  return words
    .filter(w => w.length > 3 && !stopWords.includes(w))
    .slice(0, 5);
}

function extractProductName(description: string): string {
  const words = description.split(' ');
  return words.slice(0, 3).join(' ');
}

function calculateConfidence(asset: any, searchTerms: string[]): number {
  let score = 0;
  const text = `${asset.category} ${asset.subcategory} ${asset.ai_description} ${asset.tags?.join(' ')}`.toLowerCase();
  
  searchTerms.forEach(term => {
    if (text.includes(term.toLowerCase())) {
      score += 0.3;
    }
  });
  
  return Math.min(score, 1.0);
}

function extractCategoryFromUrl(url: string): string {
  const match = url.match(/\/(dresses|tops|bottoms|shoes|pottery|furniture|decor|clothing)/i);
  return match ? match[1] : 'general';
}

