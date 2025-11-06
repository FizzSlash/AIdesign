-- Add Shopify integration table

CREATE TABLE IF NOT EXISTS shopify_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shop_domain VARCHAR(255) NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    shop_name VARCHAR(255),
    is_connected BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_shopify UNIQUE(user_id)
);

CREATE INDEX idx_shopify_user ON shopify_accounts(user_id);
CREATE INDEX idx_shopify_sync ON shopify_accounts(last_synced_at);

-- Add trigger for updated_at
CREATE TRIGGER update_shopify_updated_at 
BEFORE UPDATE ON shopify_accounts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

