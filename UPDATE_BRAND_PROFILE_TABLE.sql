-- Add new columns to brand_profiles for footer and logo customization

-- Add logo_urls if not exists (might already be there)
ALTER TABLE brand_profiles 
ADD COLUMN IF NOT EXISTS logo_urls JSONB DEFAULT '{}';

-- Add footer template choice
ALTER TABLE brand_profiles 
ADD COLUMN IF NOT EXISTS footer_template VARCHAR(50) DEFAULT 'minimal';

-- Add footer links
ALTER TABLE brand_profiles 
ADD COLUMN IF NOT EXISTS footer_links JSONB DEFAULT '[]';

-- Add button style preferences
ALTER TABLE brand_profiles
ADD COLUMN IF NOT EXISTS button_style JSONB DEFAULT '{"radius": "4px", "size": "normal"}';

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_brand_profiles_footer_template 
ON brand_profiles(footer_template);

