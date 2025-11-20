-- Enhanced Brand Profile Migration
-- Adds personality, visual style, and messaging preferences

-- Add new columns to brand_profiles
ALTER TABLE brand_profiles 
ADD COLUMN IF NOT EXISTS brand_personality JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visual_style JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS messaging_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS example_emails JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS competitor_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_audience_primary VARCHAR(100) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS brand_keywords TEXT[] DEFAULT '{}';

-- Update footer_template column type if needed
ALTER TABLE brand_profiles 
ALTER COLUMN footer_template TYPE TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_brand_profiles_target_audience 
ON brand_profiles(target_audience_primary);

CREATE INDEX IF NOT EXISTS idx_brand_profiles_analysis_status 
ON brand_profiles(analysis_status);

-- Add comments for documentation
COMMENT ON COLUMN brand_profiles.brand_personality IS 'Stores tone, adjectives, voice description, formality level';
COMMENT ON COLUMN brand_profiles.visual_style IS 'Stores layout preference, image style, overlay style, spacing';
COMMENT ON COLUMN brand_profiles.messaging_preferences IS 'Stores CTA style, urgency level, emoji usage, sentence length';
COMMENT ON COLUMN brand_profiles.example_emails IS 'Array of example email references with notes';
COMMENT ON COLUMN brand_profiles.competitor_urls IS 'URLs of competitor websites for reference';
COMMENT ON COLUMN brand_profiles.target_audience_primary IS 'Primary target audience: new_customers, loyal, vip, general';
COMMENT ON COLUMN brand_profiles.brand_keywords IS 'Key brand descriptors: sustainable, handcrafted, luxury, etc.';

-- Example data structure (for reference):
/*
brand_personality: {
  "tone": "luxury",
  "adjectives": ["elegant", "sophisticated", "timeless"],
  "voice_description": "Sophisticated and refined with a focus on quality and craftsmanship",
  "formality_level": 4,
  "example_phrases": ["Discover timeless elegance", "Crafted with care", "Elevate your style"]
}

visual_style: {
  "layout_preference": "minimal",
  "image_style": "lifestyle",
  "overlay_style": "dark",
  "spacing": "spacious"
}

messaging_preferences: {
  "cta_style": "benefit",
  "urgency_level": "low",
  "emoji_usage": "minimal",
  "sentence_length": "medium",
  "common_ctas": ["Discover More", "Shop the Collection", "Explore Now"]
}

example_emails: [
  {
    "url": "https://example.com/email-screenshot.png",
    "notes": "Love the minimalist hero layout",
    "liked_elements": ["hero layout", "color scheme", "typography"]
  }
]
*/


