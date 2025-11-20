-- Deep Brand Audit Migration
-- Adds comprehensive brand analysis fields

-- Add new columns for deep audit
ALTER TABLE brand_profiles 
ADD COLUMN IF NOT EXISTS brand_identity JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visual_dna JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS copy_audit JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS email_playbook JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS audit_version VARCHAR(10) DEFAULT 'v1',
ADD COLUMN IF NOT EXISTS last_audit_at TIMESTAMP;

-- Add index for audit queries
CREATE INDEX IF NOT EXISTS idx_brand_profiles_audit_version 
ON brand_profiles(audit_version);

CREATE INDEX IF NOT EXISTS idx_brand_profiles_last_audit 
ON brand_profiles(last_audit_at DESC);

-- Comments for documentation
COMMENT ON COLUMN brand_profiles.brand_identity IS 'Market position, demographics, archetype, brand score';
COMMENT ON COLUMN brand_profiles.visual_dna IS 'Aesthetic, color psychology, typography, imagery style';
COMMENT ON COLUMN brand_profiles.copy_audit IS 'Writing style, headline formulas, emotional drivers, messaging pillars';
COMMENT ON COLUMN brand_profiles.email_playbook IS 'Recommended layouts, templates, subject lines, audience guidelines';
COMMENT ON COLUMN brand_profiles.audit_version IS 'Audit schema version for future compatibility';

-- Example data structures:
/*
brand_identity: {
  "marketPosition": "mid-tier",
  "targetDemographic": {
    "ageRange": "25-45",
    "incomeLevel": "middle to upper-middle",
    "lifestyle": "urban professionals",
    "psychographic": "confident, style-conscious"
  },
  "brandArchetype": "lover",
  "brandScore": 8.5,
  "brandSummary": "NY&Company is a mid-tier fashion retailer...",
  "valueProp": "Affordable, versatile workwear",
  "differentiators": ["fit-focused", "work-to-weekend", "accessible luxury"]
}

visual_dna: {
  "aesthetic": "modern minimalist with editorial touches",
  "colorPsychology": {
    "primary": { "hex": "#000000", "meaning": "sophistication", "emotion": "confident" },
    "secondary": { "hex": "#C8A882", "meaning": "warmth", "emotion": "accessible luxury" },
    "temperature": "neutral",
    "colorStory": "Black and gold create sophisticated yet accessible luxury"
  },
  "typography": {
    "headingFont": { "name": "Montserrat", "personality": "modern, bold, clean" },
    "bodyFont": { "name": "Open Sans", "readability": "excellent, approachable" },
    "fontPairing": "Modern sans-serif pairing creates cohesive, professional look"
  },
  "imageryStyle": {
    "photographyStyle": "lifestyle-focused with diverse models",
    "composition": "clean, centered, product-forward",
    "emotionalTone": "confident, aspirational, relatable"
  },
  "designPhilosophy": "Clean, modern aesthetic that balances aspiration with accessibility"
}

copy_audit: {
  "writingStyle": {
    "sentenceLength": "short to medium",
    "complexity": "moderate",
    "readingLevel": "grade 8-10"
  },
  "headlineFormulas": [
    {
      "pattern": "[Emotion] + [Product] + For + [Occasion]",
      "example": "Confident Styles for Every Occasion",
      "effectiveness": "high"
    }
  ],
  "voiceCharacteristics": {
    "perspective": "you-focused",
    "formality": 5,
    "tone": "confident, empowering, approachable"
  },
  "emotionalDrivers": [
    { "emotion": "confidence", "frequency": "high", "examples": ["Feel your best", "Own your style"] }
  ],
  "messagingPillars": [
    { "theme": "Versatility", "description": "Work-to-weekend styling", "examples": [...] }
  ]
}

email_playbook: {
  "recommendedLayouts": [
    {
      "name": "Hero + 2-Column Grid",
      "description": "Large hero with text overlay, 4-6 products in grid",
      "whenToUse": "Sales, new arrivals, seasonal",
      "rationale": "Matches minimalist aesthetic"
    }
  ],
  "headlineTemplates": [...],
  "subjectLineFormulas": [...],
  "audienceGuidelines": {...}
}
*/

