import { query } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { AppError } from '../middleware/errorHandler.js';

interface ShopifyProduct {
  id: number;
  title: string;
  description: string;
  productType: string;
  vendor: string;
  handle: string;
  tags: string[];
  images: Array<{ src: string; width: number; height: number; alt?: string }>;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    compareAtPrice?: string;
    inventoryQuantity: number;
    sku: string;
  }>;
  url: string;
}

/**
 * Enhanced sync - stores ALL product data
 */
export async function syncCatalogEnhanced(userId: string) {
  logger.info('Starting enhanced Shopify catalog sync', { userId });

  try {
    const credentials = await getShopifyCredentials(userId);
    
    // Fetch all data from Shopify
    const products = await fetchAllProducts(credentials);
    const collections = await fetchAllCollections(credentials);
    
    logger.info(`Fetched ${products.length} products and ${collections.length} collections`);
    
    // Store collections
    let collectionsStored = 0;
    for (const collection of collections) {
      try {
        await query(`
          INSERT INTO shopify_collections (
            user_id, shopify_collection_id, title, handle, description, 
            image_url, products_count, published
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (user_id, shopify_collection_id) DO UPDATE SET
            title = $3,
            description = $5,
            image_url = $6,
            products_count = $7,
            updated_at = NOW()
        `, [
          userId,
          collection.id,
          collection.title,
          collection.handle,
          collection.description,
          collection.image?.src || null,
          collection.productsCount,
          collection.published
        ]);
        collectionsStored++;
      } catch (error) {
        logger.error('Failed to store collection', { collectionId: collection.id, error });
      }
    }
    
    // Store products with ALL data
    let productsStored = 0;
    let totalImages = 0;
    let totalVariants = 0;
    
    for (const product of products) {
      try {
        // Calculate total inventory across all variants
        const totalInventory = product.variants.reduce(
          (sum, v) => sum + (v.inventoryQuantity || 0), 
          0
        );
        
        // Get lowest price variant
        const lowestPrice = Math.min(...product.variants.map(v => parseFloat(v.price)));
        const compareAtPrice = product.variants[0]?.compareAtPrice 
          ? parseFloat(product.variants[0].compareAtPrice)
          : null;
        
        // Fetch which collections this product belongs to
        const productCollections = await fetchProductCollections(credentials, product.id);
        
        await query(`
          INSERT INTO shopify_products (
            user_id, shopify_product_id, title, description,
            product_type, vendor, handle, tags,
            price, compare_at_price,
            images, variants,
            total_inventory, in_stock,
            collections, shopify_url, product_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (user_id, shopify_product_id) DO UPDATE SET
            title = $3,
            description = $4,
            price = $9,
            compare_at_price = $10,
            images = $11,
            variants = $12,
            total_inventory = $13,
            in_stock = $14,
            collections = $15,
            updated_at = NOW(),
            last_synced_at = NOW()
        `, [
          userId,
          product.id,
          product.title,
          product.description,
          product.productType,
          product.vendor,
          product.handle,
          product.tags,
          lowestPrice,
          compareAtPrice,
          JSON.stringify(product.images),  // ALL images!
          JSON.stringify(product.variants),  // ALL variants!
          totalInventory,
          totalInventory > 0,
          JSON.stringify(productCollections),
          product.url,
          product.url
        ]);
        
        productsStored++;
        totalImages += product.images.length;
        totalVariants += product.variants.length;
        
      } catch (error) {
        logger.error('Failed to store product', { productId: product.id, error });
      }
    }
    
    logger.info('Enhanced sync complete', { 
      userId, 
      productsStored, 
      collectionsStored,
      totalImages,
      totalVariants
    });
    
    return {
      productsSync: productsStored,
      collectionsFound: collectionsStored,
      imagesStored: totalImages,
      variantsStored: totalVariants,
      totalInventory: products.reduce((sum, p) => 
        sum + p.variants.reduce((s, v) => s + (v.inventoryQuantity || 0), 0), 0
      )
    };
    
  } catch (error) {
    logger.error('Enhanced sync failed', { error, userId });
    throw error;
  }
}

/**
 * Get products with filters
 */
export async function getProducts(
  userId: string,
  filters?: {
    collectionId?: string;
    minInventory?: number;
    inStockOnly?: boolean;
    productType?: string;
    search?: string;
  }
) {
  const conditions = ['user_id = $1'];
  const params: any[] = [userId];
  let paramIndex = 2;
  
  if (filters?.collectionId) {
    // Check if collectionId is numeric
    const collectionIdNum = parseInt(filters.collectionId);
    if (!isNaN(collectionIdNum)) {
      conditions.push(`collections::text ILIKE '%"id":${collectionIdNum}%'`);
    }
  }
  
  if (filters?.minInventory) {
    conditions.push(`total_inventory >= $${paramIndex}`);
    params.push(filters.minInventory);
    paramIndex++;
  }
  
  if (filters?.inStockOnly) {
    conditions.push(`in_stock = true`);
  }
  
  if (filters?.productType) {
    conditions.push(`product_type ILIKE $${paramIndex}`);
    params.push(`%${filters.productType}%`);
    paramIndex++;
  }
  
  if (filters?.search) {
    conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }
  
  const result = await query(`
    SELECT * FROM shopify_products
    WHERE ${conditions.join(' AND ')}
    ORDER BY total_inventory DESC, created_at DESC
    LIMIT 50
  `, params);
  
  return result.rows.map(row => ({
    ...row,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
    variants: typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants,
    collections: typeof row.collections === 'string' ? JSON.parse(row.collections) : row.collections
  }));
}

/**
 * Get collections
 */
export async function getCollections(userId: string) {
  const result = await query(`
    SELECT * FROM shopify_collections
    WHERE user_id = $1
    ORDER BY products_count DESC, title ASC
  `, [userId]);
  
  return result.rows;
}

// Helper functions
async function getShopifyCredentials(userId: string) {
  const result = await query(
    `SELECT shop_domain, access_token_encrypted
     FROM shopify_accounts
     WHERE user_id = $1 AND is_connected = true`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Shopify not connected');
  }

  return {
    shopDomain: result.rows[0].shop_domain,
    accessToken: decrypt(result.rows[0].access_token_encrypted),
  };
}

async function fetchAllProducts(credentials: any): Promise<ShopifyProduct[]> {
  const url = `https://${credentials.shopDomain}/admin/api/2024-10/products.json?limit=250`;

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': credentials.accessToken,
      'Content-Type': 'application/json',
    },
  });

  const data: any = await response.json();

  return data.products.map((product: any) => ({
    id: product.id,
    title: product.title,
    description: product.body_html?.replace(/<[^>]*>/g, '') || '',
    productType: product.product_type || '',
    vendor: product.vendor || '',
    handle: product.handle,
    tags: product.tags?.split(',').map((t: string) => t.trim()).filter(Boolean) || [],
    images: product.images?.map((img: any) => ({
      src: img.src,
      width: img.width,
      height: img.height,
      alt: img.alt || product.title,
    })) || [],
    variants: product.variants?.map((v: any) => ({
      id: v.id,
      title: v.title,
      price: v.price,
      compareAtPrice: v.compare_at_price,
      inventoryQuantity: v.inventory_quantity || 0,
      sku: v.sku || '',
    })) || [],
    url: `https://${credentials.shopDomain.replace('.myshopify.com', '')}/products/${product.handle}`,
  }));
}

async function fetchAllCollections(credentials: any) {
  const url = `https://${credentials.shopDomain}/admin/api/2024-10/custom_collections.json`;

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': credentials.accessToken,
      'Content-Type': 'application/json',
    },
  });

  const data: any = await response.json();

  return data.custom_collections?.map((col: any) => ({
    id: col.id,
    title: col.title,
    handle: col.handle,
    description: col.body_html?.replace(/<[^>]*>/g, '') || '',
    image: col.image ? { src: col.image.src } : null,
    productsCount: col.products_count || 0,
    published: col.published_at != null,
  })) || [];
}

async function fetchProductCollections(credentials: any, productId: number) {
  try {
    const url = `https://${credentials.shopDomain}/admin/api/2024-10/products/${productId}/collections.json`;

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': credentials.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data: any = await response.json();
    
    return data.custom_collections?.map((col: any) => ({
      id: col.id,
      title: col.title,
      handle: col.handle,
    })) || [];
  } catch (error) {
    return [];
  }
}

export { getShopifyCredentials, fetchAllProducts, fetchAllCollections };

