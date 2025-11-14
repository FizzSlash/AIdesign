-- Complete Products Table for Shopify Integration

CREATE TABLE IF NOT EXISTS shopify_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shopify_product_id BIGINT NOT NULL,
    
    -- Basic Info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    product_type VARCHAR(200),
    vendor VARCHAR(200),
    handle VARCHAR(500),
    tags TEXT[],
    
    -- Pricing
    price DECIMAL(10,2),
    compare_at_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Images (ALL images stored as JSON)
    images JSONB NOT NULL DEFAULT '[]',
    -- Format: [{"src": "url", "width": 2048, "height": 2048, "alt": "..."}]
    
    -- Variants (ALL sizes/colors)
    variants JSONB NOT NULL DEFAULT '[]',
    -- Format: [{"id": 123, "title": "Small/Blue", "price": "29.99", "inventory_quantity": 10, "sku": "..."}]
    
    -- Inventory
    total_inventory INT DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    low_stock_threshold INT DEFAULT 10,
    
    -- Collections
    collections JSONB DEFAULT '[]',
    -- Format: [{"id": 123, "title": "Summer Sale", "handle": "summer-sale"}]
    
    -- URLs
    shopify_url VARCHAR(500),
    product_url VARCHAR(500),
    
    -- Status
    published BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_synced_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_shopify_product UNIQUE(user_id, shopify_product_id)
);

-- Indexes for fast queries
CREATE INDEX idx_shopify_products_user ON shopify_products(user_id);
CREATE INDEX idx_shopify_products_type ON shopify_products(product_type);
CREATE INDEX idx_shopify_products_tags ON shopify_products USING GIN(tags);
CREATE INDEX idx_shopify_products_in_stock ON shopify_products(in_stock) WHERE in_stock = true;
CREATE INDEX idx_shopify_products_inventory ON shopify_products(total_inventory) WHERE total_inventory > 0;

-- Trigger for updated_at
CREATE TRIGGER update_shopify_products_updated_at 
BEFORE UPDATE ON shopify_products 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Collections table
CREATE TABLE IF NOT EXISTS shopify_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shopify_collection_id BIGINT NOT NULL,
    
    title VARCHAR(500) NOT NULL,
    handle VARCHAR(500),
    description TEXT,
    
    -- Collection image
    image_url VARCHAR(1000),
    
    -- Stats
    products_count INT DEFAULT 0,
    
    -- Status
    published BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_user_shopify_collection UNIQUE(user_id, shopify_collection_id)
);

CREATE INDEX idx_shopify_collections_user ON shopify_collections(user_id);
CREATE INDEX idx_shopify_collections_handle ON shopify_collections(handle);

-- Trigger for updated_at
CREATE TRIGGER update_shopify_collections_updated_at 
BEFORE UPDATE ON shopify_collections 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

