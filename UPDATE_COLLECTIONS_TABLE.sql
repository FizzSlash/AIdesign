-- Add product_ids column to existing shopify_collections table

ALTER TABLE shopify_collections 
ADD COLUMN IF NOT EXISTS product_ids BIGINT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_shopify_collections_products 
ON shopify_collections USING GIN(product_ids);

