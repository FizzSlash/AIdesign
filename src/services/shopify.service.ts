import { query } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { encrypt, decrypt } from '../utils/encryption.js';

interface ShopifyProduct {
  id: number;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  images: Array<{
    src: string;
    width: number;
    height: number;
    alt?: string;
  }>;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    compareAtPrice?: string;
    inventoryQuantity: number;
    sku: string;
  }>;
  collections: Array<{
    id: number;
    title: string;
    handle: string;
  }>;
  handle: string;
  url: string;
}

interface ShopifyCollection {
  id: number;
  title: string;
  handle: string;
  description: string;
  image?: {
    src: string;
  };
  productsCount: number;
}

/**
 * Store Shopify credentials
 */
export async function connectShopify(
  userId: string,
  shopDomain: string,
  accessToken: string
) {
  // Validate credentials by making a test request
  try {
    const response = await fetch(`https://${shopDomain}/admin/api/2024-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Invalid Shopify credentials');
    }

    const shopData: any = await response.json();

    // Encrypt and store credentials
    const accessTokenEncrypted = encrypt(accessToken);

    await query(
      `INSERT INTO shopify_accounts (user_id, shop_domain, access_token_encrypted, shop_name, is_connected)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (user_id) DO UPDATE SET
         shop_domain = $2,
         access_token_encrypted = $3,
         shop_name = $4,
         is_connected = true,
         updated_at = NOW()`,
      [userId, shopDomain, accessTokenEncrypted, shopData.shop.name]
    );

    logger.info('Shopify connected', { userId, shopDomain });

    return {
      message: 'Shopify connected successfully',
      shopName: shopData.shop.name,
    };
  } catch (error) {
    logger.error('Shopify connection failed', { error, userId });
    throw new Error('Failed to connect Shopify account');
  }
}

/**
 * Get Shopify credentials
 */
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

/**
 * Fetch products from Shopify
 */
export async function fetchProducts(
  userId: string,
  options?: {
    collectionId?: number;
    productType?: string;
    limit?: number;
  }
): Promise<ShopifyProduct[]> {
  const credentials = await getShopifyCredentials(userId);
  
  let url = `https://${credentials.shopDomain}/admin/api/2024-10/products.json?limit=${options?.limit || 250}`;
  
  if (options?.collectionId) {
    url = `https://${credentials.shopDomain}/admin/api/2024-10/collections/${options.collectionId}/products.json`;
  }
  
  if (options?.productType) {
    url += `&product_type=${encodeURIComponent(options.productType)}`;
  }

  logger.info('Fetching products from Shopify', { userId, url });

  try {
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': credentials.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data: any = await response.json();

    const products: ShopifyProduct[] = data.products.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.body_html?.replace(/<[^>]*>/g, '') || '',
      descriptionHtml: product.body_html || '',
      vendor: product.vendor,
      productType: product.product_type,
      tags: product.tags?.split(',').map((t: string) => t.trim()) || [],
      images: product.images?.map((img: any) => ({
        src: img.src,
        width: img.width,
        height: img.height,
        alt: img.alt,
      })) || [],
      variants: product.variants?.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: v.price,
        compareAtPrice: v.compare_at_price,
        inventoryQuantity: v.inventory_quantity,
        sku: v.sku,
      })) || [],
      collections: [], // Will be populated if needed
      handle: product.handle,
      url: `https://${credentials.shopDomain.replace('.myshopify.com', '')}/products/${product.handle}`,
    }));

    logger.info(`Fetched ${products.length} products from Shopify`);
    return products;
  } catch (error) {
    logger.error('Failed to fetch products from Shopify', { error, userId });
    throw error;
  }
}

/**
 * Fetch collections from Shopify
 */
export async function fetchCollections(userId: string): Promise<ShopifyCollection[]> {
  const credentials = await getShopifyCredentials(userId);

  const url = `https://${credentials.shopDomain}/admin/api/2024-10/custom_collections.json`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': credentials.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data: any = await response.json();

    const collections: ShopifyCollection[] = data.custom_collections.map((col: any) => ({
      id: col.id,
      title: col.title,
      handle: col.handle,
      description: col.body_html?.replace(/<[^>]*>/g, '') || '',
      image: col.image ? { src: col.image.src } : undefined,
      productsCount: col.products_count || 0,
    }));

    logger.info(`Fetched ${collections.length} collections from Shopify`);
    return collections;
  } catch (error) {
    logger.error('Failed to fetch collections from Shopify', { error, userId });
    throw error;
  }
}

/**
 * Search products
 */
export async function searchProducts(
  userId: string,
  query: string,
  limit: number = 20
): Promise<ShopifyProduct[]> {
  const allProducts = await fetchProducts(userId, { limit: 250 });
  
  const searchLower = query.toLowerCase();
  
  return allProducts
    .filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(t => t.toLowerCase().includes(searchLower)) ||
      p.productType.toLowerCase().includes(searchLower)
    )
    .slice(0, limit);
}

/**
 * Get products by collection
 */
export async function getProductsByCollection(
  userId: string,
  collectionId: number
): Promise<ShopifyProduct[]> {
  return fetchProducts(userId, { collectionId });
}

/**
 * Sync Shopify catalog to database
 */
export async function syncCatalog(userId: string) {
  logger.info('Syncing Shopify catalog', { userId });

  try {
    const products = await fetchProducts(userId);
    const collections = await fetchCollections(userId);

    // Store products in database
    for (const product of products) {
      // Store each product image
      for (const image of product.images) {
        // Check if image already exists
        const existing = await query(
          `SELECT id FROM brand_assets WHERE user_id = $1 AND original_url = $2`,
          [userId, image.src]
        );
        
        if (existing.rows.length > 0) {
          continue; // Skip if already exists
        }
        
        await query(
          `INSERT INTO brand_assets (
            user_id, asset_type, category, subcategory, original_url, cdn_url,
            filename, alt_text, dimensions, upload_source, ai_description, tags
          ) VALUES ($1, 'product', $2, $3, $4, $5, $6, $7, $8, 'shopify', $9, $10)`,
          [
            userId,
            product.productType || 'product',
            product.title,
            image.src,
            image.src, // Using Shopify's CDN
            product.handle,
            image.alt || product.title,
            JSON.stringify({ width: image.width, height: image.height }),
            `${product.title} - ${product.description}`.slice(0, 500),
            product.tags,
          ]
        );
      }
    }

    logger.info(`Synced ${products.length} products from Shopify`, { userId });

    return {
      productsSync: products.length,
      collectionsFound: collections.length,
      imagesStored: products.reduce((sum, p) => sum + p.images.length, 0),
    };
  } catch (error) {
    logger.error('Failed to sync Shopify catalog', { error, userId });
    throw error;
  }
}

/**
 * Get product by ID
 */
export async function getProduct(userId: string, productId: number): Promise<ShopifyProduct> {
  const credentials = await getShopifyCredentials(userId);

  const url = `https://${credentials.shopDomain}/admin/api/2024-10/products/${productId}.json`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': credentials.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Product not found: ${productId}`);
    }

    const data: any = await response.json();
    const product = data.product;

    return {
      id: product.id,
      title: product.title,
      description: product.body_html?.replace(/<[^>]*>/g, '') || '',
      descriptionHtml: product.body_html || '',
      vendor: product.vendor,
      productType: product.product_type,
      tags: product.tags?.split(',').map((t: string) => t.trim()) || [],
      images: product.images?.map((img: any) => ({
        src: img.src,
        width: img.width,
        height: img.height,
        alt: img.alt,
      })) || [],
      variants: product.variants?.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: v.price,
        compareAtPrice: v.compare_at_price,
        inventoryQuantity: v.inventory_quantity,
        sku: v.sku,
      })) || [],
      collections: [],
      handle: product.handle,
      url: `https://${credentials.shopDomain.replace('.myshopify.com', '')}/products/${product.handle}`,
    };
  } catch (error) {
    logger.error('Failed to fetch product from Shopify', { error, userId, productId });
    throw error;
  }
}

