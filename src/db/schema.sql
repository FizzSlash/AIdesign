-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for embeddings (pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active, created_at DESC);

-- Klaviyo Integration
CREATE TABLE klaviyo_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    private_api_key_encrypted TEXT NOT NULL,
    public_api_key_encrypted TEXT,
    account_id VARCHAR(255),
    account_name VARCHAR(255),
    is_connected BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_klaviyo UNIQUE(user_id)
);

CREATE INDEX idx_klaviyo_user ON klaviyo_accounts(user_id);
CREATE INDEX idx_klaviyo_sync ON klaviyo_accounts(last_synced_at);

-- Brand Profiles
CREATE TABLE brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    website_url VARCHAR(500),
    brand_name VARCHAR(255),
    
    -- Brand Assets (stored as JSONB for flexibility)
    logo_urls JSONB DEFAULT '{}',
    color_palette JSONB DEFAULT '{}',
    typography JSONB DEFAULT '{}',
    
    -- Learned patterns
    brand_voice VARCHAR(100),
    brand_adjectives TEXT[],
    common_ctas JSONB DEFAULT '[]',
    footer_template TEXT,
    
    -- Settings
    default_layout VARCHAR(100),
    preferred_tone VARCHAR(50),
    
    -- Analysis status
    analysis_status VARCHAR(50) DEFAULT 'pending',
    analysis_completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_user_brand UNIQUE(user_id)
);

CREATE INDEX idx_brand_user ON brand_profiles(user_id);

-- Asset Library
CREATE TABLE brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    asset_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- File info
    original_url TEXT,
    cdn_url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Image metadata
    dimensions JSONB,
    alt_text TEXT,
    tags TEXT[],
    
    -- AI Analysis
    ai_description TEXT,
    dominant_colors JSONB,
    embedding vector(1536),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    upload_source VARCHAR(50) DEFAULT 'manual',
    
    uploaded_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_asset_type CHECK (asset_type IN ('logo', 'product', 'lifestyle', 'icon', 'banner', 'other'))
);

CREATE INDEX idx_assets_user ON brand_assets(user_id, uploaded_at DESC);
CREATE INDEX idx_assets_type ON brand_assets(asset_type);
CREATE INDEX idx_assets_category ON brand_assets(category);
CREATE INDEX idx_assets_tags ON brand_assets USING GIN(tags);
CREATE INDEX idx_assets_embedding ON brand_assets USING ivfflat(embedding vector_cosine_ops);

-- Email Templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template source
    source VARCHAR(50) NOT NULL DEFAULT 'generated',
    klaviyo_template_id VARCHAR(255),
    
    -- Email content
    html_content TEXT NOT NULL,
    mjml_content TEXT,
    
    -- Metadata
    layout_type VARCHAR(100),
    campaign_type VARCHAR(100),
    subject_line TEXT,
    preview_text TEXT,
    
    -- Component tracking
    components_used JSONB DEFAULT '[]',
    assets_used UUID[],
    
    -- Analytics
    times_used INTEGER DEFAULT 0,
    avg_open_rate DECIMAL(5,2),
    avg_click_rate DECIMAL(5,2),
    last_used_at TIMESTAMP,
    
    -- User preferences
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_source CHECK (source IN ('generated', 'imported', 'klaviyo', 'manual'))
);

CREATE INDEX idx_templates_user ON email_templates(user_id, created_at DESC);
CREATE INDEX idx_templates_type ON email_templates(campaign_type);
CREATE INDEX idx_templates_favorite ON email_templates(user_id, is_favorite) WHERE is_favorite = true;

-- Generated Emails
CREATE TABLE generated_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    
    -- User input
    campaign_brief TEXT NOT NULL,
    campaign_type VARCHAR(100),
    campaign_options JSONB DEFAULT '{}',
    
    -- AI Generation metadata
    model_used VARCHAR(100),
    generation_time_ms INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,4),
    
    -- Generated content
    html_content TEXT NOT NULL,
    mjml_content TEXT,
    subject_line TEXT,
    preview_text TEXT,
    
    -- Assets used
    images_used JSONB DEFAULT '[]',
    components_used JSONB DEFAULT '[]',
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'draft',
    klaviyo_template_id VARCHAR(255),
    pushed_to_klaviyo_at TIMESTAMP,
    
    -- User feedback
    user_rating INTEGER,
    user_feedback TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN ('draft', 'sent_to_klaviyo', 'archived', 'deleted')),
    CONSTRAINT valid_rating CHECK (user_rating >= 1 AND user_rating <= 5)
);

CREATE INDEX idx_generated_user ON generated_emails(user_id, created_at DESC);
CREATE INDEX idx_generated_status ON generated_emails(status);
CREATE INDEX idx_generated_type ON generated_emails(campaign_type);

-- Component Library
CREATE TABLE email_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    component_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Component content
    html_snippet TEXT NOT NULL,
    mjml_snippet TEXT,
    
    -- Metadata
    is_global BOOLEAN DEFAULT false,
    variables JSONB DEFAULT '{}',
    preview_image_url TEXT,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Categories
    tags TEXT[],
    category VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_component_type CHECK (component_type IN (
        'header', 'footer', 'hero', 'product_grid', 'cta', 'divider', 
        'text_block', 'image_block', 'social_icons', 'navigation'
    ))
);

CREATE INDEX idx_components_user ON email_components(user_id);
CREATE INDEX idx_components_type ON email_components(component_type);
CREATE INDEX idx_components_global ON email_components(is_global) WHERE is_global = true;

-- Background Jobs
CREATE TABLE background_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    job_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Job data
    input_data JSONB,
    output_data JSONB,
    
    -- Progress tracking
    progress INTEGER DEFAULT 0,
    total_steps INTEGER,
    current_step VARCHAR(255),
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timing
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_job_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX idx_jobs_user ON background_jobs(user_id, created_at DESC);
CREATE INDEX idx_jobs_status ON background_jobs(status, created_at);
CREATE INDEX idx_jobs_type ON background_jobs(job_type);

-- Usage Analytics
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    
    -- Usage details
    metadata JSONB DEFAULT '{}',
    tokens_used INTEGER,
    cost_usd DECIMAL(10,4),
    
    -- Request info
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_user ON usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_action ON usage_logs(action);
CREATE INDEX idx_usage_date ON usage_logs(created_at);

-- Subscription Plans (for future billing)
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    
    -- Limits
    emails_per_month INTEGER,
    templates_limit INTEGER,
    assets_storage_gb INTEGER,
    team_members INTEGER DEFAULT 1,
    
    features JSONB DEFAULT '[]',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    
    status VARCHAR(50) DEFAULT 'active',
    
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    
    -- Usage tracking
    emails_generated_this_month INTEGER DEFAULT 0,
    
    -- Billing
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing'))
);

CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, emails_per_month, templates_limit, assets_storage_gb) VALUES
('Free', 0, 0, 10, 5, 1),
('Starter', 29, 290, 100, 50, 10),
('Professional', 79, 790, 500, 200, 50),
('Enterprise', 199, 1990, -1, -1, 200);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_klaviyo_updated_at BEFORE UPDATE ON klaviyo_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_updated_at BEFORE UPDATE ON brand_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_updated_at BEFORE UPDATE ON generated_emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON email_components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

