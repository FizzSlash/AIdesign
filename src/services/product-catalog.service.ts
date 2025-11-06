import { query } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { decrypt } from '../utils/encryption.js';

const KLAVIYO_API_BASE = 'https://a.klaviyo.com/api';
const API_REVISION = '2024-10-15';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  url: string;
  imageUrl: string;
  thumbnailUrl: string;
  published: boolean;
  categories: string[];
  metadata?: Record<string, any>;
}

interface Category {
  id: string;
  name: string;
  externalId?: string;
}

/**
 * Get Klaviyo API credentials for user
 */
async function getKlaviyoCredentials(userId: string) {
  const result = await query(
    `SELECT private_api_key_encrypted
     FROM klaviyo_accounts 
     WHERE user_id = $1 AND is_connected = true`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Klaviyo not connected');
  }

  return {
    privateKey: decrypt(result.rows[0].private_api_key_encrypted),
  };
}

/**
 * Fetch all products from Klaviyo catalog
 */
export async function fetchProducts(
  userId: string,
  options?: {
    category?: string;
    search?: string;
    limit?: number;
    publishedOnly?: boolean;
  }
): Promise<Product[]> {
  const credentials = await getKlaviyoCredentials(userId);
  
  // Build filter query
  const filters: string[] = [];
  
  if (options?.publishedOnly !== false) {
    filters.push('equals(published,true)');
  }
  
  if (options?.category) {
    filters.push(`equals(categories.name,"${options.category}")`);
  }
  
  const filterQuery = filters.length > 0 
    ? `?filter=${filters.join(' and ')}` 
    : '';
  
  const url = `${KLAVIYO_API_BASE}/catalog-items/${filterQuery}`;
  
  logger.info('Fetching products from Klaviyo', { userId, url });
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${credentials.privateKey}`,
        'revision': API_REVISION,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Klaviyo API error: ${response.status}`);
    }

    const data: any = await response.json();
    
    const products: Product[] = data.data.map((item: any) => ({
      id: item.id,
      title: item.attributes.title,
      description: item.attributes.description || '',
      price: item.attributes.price || 0,
      url: item.attributes.url,
      imageUrl: item.attributes.image_full_url || '',
      thumbnailUrl: item.attributes.image_thumbnail_url || '',
      published: item.attributes.published,
      categories: item.relationships?.categories?.data?.map((c: any) => c.id) || [],
      metadata: item.attributes.custom_metadata || {},
    }));
    
    logger.info(`Fetched ${products.length} products from Klaviyo`);
    
    // Apply search filter if provided
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      return products.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply limit
    if (options?.limit) {
      return products.slice(0, options.limit);
    }
    
    return products;
    
  } catch (error) {
    logger.error('Failed to fetch products from Klaviyo', { error, userId });
    throw error;
  }
}

/**
 * Fetch product categories from Klaviyo
 */
export async function fetchCategories(userId: string): Promise<Category[]> {
  const credentials = await getKlaviyoCredentials(userId);
  
  logger.info('Fetching categories from Klaviyo', { userId });
  
  try {
    const response = await fetch(
      `${KLAVIYO_API_BASE}/catalog-categories/`,
      {
        headers: {
          'Authorization': `Klaviyo-API-Key ${credentials.privateKey}`,
          'revision': API_REVISION,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Klaviyo API error: ${response.status}`);
    }

    const data: any = await response.json();
    
    const categories: Category[] = data.data.map((cat: any) => ({
      id: cat.id,
      name: cat.attributes.name,
      externalId: cat.attributes.external_id,
    }));
    
    logger.info(`Fetched ${categories.length} categories from Klaviyo`);
    return categories;
    
  } catch (error) {
    logger.error('Failed to fetch categories from Klaviyo', { error, userId });
    throw error;
  }
}

/**
 * Get specific product by ID
 */
export async function getProduct(userId: string, productId: string): Promise<Product> {
  const credentials = await getKlaviyoCredentials(userId);
  
  try {
    const response = await fetch(
      `${KLAVIYO_API_BASE}/catalog-items/${productId}`,
      {
        headers: {
          'Authorization': `Klaviyo-API-Key ${credentials.privateKey}`,
          'revision': API_REVISION,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Product not found: ${productId}`);
    }

    const data: any = await response.json();
    const item = data.data;
    
    return {
      id: item.id,
      title: item.attributes.title,
      description: item.attributes.description || '',
      price: item.attributes.price || 0,
      url: item.attributes.url,
      imageUrl: item.attributes.image_full_url || '',
      thumbnailUrl: item.attributes.image_thumbnail_url || '',
      published: item.attributes.published,
      categories: item.relationships?.categories?.data?.map((c: any) => c.id) || [],
      metadata: item.attributes.custom_metadata || {},
    };
    
  } catch (error) {
    logger.error('Failed to fetch product from Klaviyo', { error, userId, productId });
    throw error;
  }
}

/**
 * Search products by keyword
 */
export async function searchProducts(
  userId: string,
  keyword: string,
  limit: number = 20
): Promise<Product[]> {
  return fetchProducts(userId, {
    search: keyword,
    limit,
    publishedOnly: true,
  });
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  userId: string,
  categoryName: string,
  limit: number = 20
): Promise<Product[]> {
  return fetchProducts(userId, {
    category: categoryName,
    limit,
    publishedOnly: true,
  });
}

/**
 * Cache products in database for faster access
 */
export async function syncProductCatalog(userId: string) {
  logger.info('Syncing product catalog', { userId });
  
  try {
    // Fetch all products
    const products = await fetchProducts(userId);
    
    // Store in database for caching
    for (const product of products) {
      await query(
        `INSERT INTO brand_assets (
          user_id, asset_type, category, original_url, cdn_url, 
          filename, alt_text, dimensions, upload_source, ai_description
        ) VALUES ($1, 'product', 'product', $2, $3, $4, $5, $6, 'klaviyo_catalog', $7)
        ON CONFLICT (user_id, original_url) DO UPDATE SET
          cdn_url = $3,
          alt_text = $5,
          ai_description = $7,
          updated_at = NOW()`,
        [
          userId,
          product.imageUrl,
          product.imageUrl, // Using Klaviyo's CDN
          product.title,
          product.title,
          JSON.stringify({ price: product.price }),
          `${product.title} - ${product.description}`.slice(0, 500),
        ]
      );
    }
    
    logger.info(`Synced ${products.length} products to database`, { userId });
    
    return {
      synced: products.length,
      categories: await fetchCategories(userId),
    };
    
  } catch (error) {
    logger.error('Failed to sync product catalog', { error, userId });
    throw error;
  }
}

