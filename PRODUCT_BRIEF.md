# AI Email Designer - Product Brief & Technical Framework v1

## Executive Summary
An AI-powered email design platform that integrates with Klaviyo to automatically generate on-brand, responsive HTML emails. Users connect their Klaviyo account, system learns their brand, and generates complete email campaigns from simple prompts.

---

## Product Overview

### Core Value Proposition
**"From API key to campaign-ready email in 5 minutes"**
- Eliminate manual email design work
- Maintain perfect brand consistency
- Generate mobile + desktop optimized emails
- Auto-populate with relevant products, copy, and CTAs

### Target Users
- E-commerce marketers using Klaviyo
- Small-medium businesses without design resources
- Agencies managing multiple client accounts
- Brands wanting faster campaign deployment

---

## User Flow

### 1. Onboarding (First-time setup)
```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Account Creation                                    │
│ - Sign up with email/password                               │
│ - Verify email                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Klaviyo Integration                                 │
│ - Enter Klaviyo Private API Key                             │
│ - Enter Klaviyo Public API Key                              │
│ - Auto-fetch: Recent templates, brand info, lists           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Brand Asset Learning                                │
│ - Enter website URL (auto-scrape)                           │
│ - Upload brand assets (optional): logos, product images     │
│ - Upload brand guidelines (optional): PDF/doc               │
│                                                              │
│ System automatically extracts:                              │
│ ✓ Color palette (primary, secondary, accent)                │
│ ✓ Typography (fonts, sizes, weights)                        │
│ ✓ Logo variations (header, footer)                          │
│ ✓ Product images                                            │
│ ✓ Lifestyle imagery                                         │
│ ✓ Common CTAs and messaging                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Template Analysis (Background)                      │
│ AI analyzes existing Klaviyo templates:                     │
│ - Layout patterns (2-col, 3-col, hero, etc.)                │
│ - Component library (buttons, headers, footers)             │
│ - Spacing/padding standards                                 │
│ - Email structure preferences                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Brand Profile Created ✓                             │
│ Ready to generate emails                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2. Email Generation (Core workflow)
```
┌─────────────────────────────────────────────────────────────┐
│ User Input: Campaign Brief                                  │
│                                                              │
│ Simple prompt:                                              │
│ "25% off all pottery, spring collection launch"             │
│                                                              │
│ OR Structured form:                                         │
│ - Campaign type: [Promotion/Product Launch/Newsletter]      │
│ - Main message: "25% off pottery"                           │
│ - Target products: [Auto-suggest from Klaviyo]              │
│ - CTA: "Shop Now"                                           │
│ - Tone: [Luxury/Casual/Playful/Professional]                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ AI Processing Engine                                        │
│                                                              │
│ 1. Intent Analysis                                          │
│    → Campaign type: Promotional                             │
│    → Key products: Pottery category                         │
│    → Urgency: Medium (discount offer)                       │
│                                                              │
│ 2. Layout Selection                                         │
│    → Choose template: "Hero + Product Grid + Footer"        │
│    → Based on: past performance, campaign type              │
│                                                              │
│ 3. Content Generation                                       │
│    → Headline: AI-generated, brand voice matched            │
│    → Body copy: Compelling, on-brand messaging              │
│    → Product descriptions: From Klaviyo/website             │
│                                                              │
│ 4. Asset Selection                                          │
│    → Hero image: Relevant pottery lifestyle shot            │
│    → Product images: Top sellers in category                │
│    → Logo: Appropriate size/placement                       │
│                                                              │
│ 5. CTA Optimization                                         │
│    → Button text: Action-oriented                           │
│    → Link URLs: Correct collection pages                    │
│    → Tracking parameters: Auto-added                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Email Preview                                               │
│                                                              │
│ [Desktop Preview] [Mobile Preview]                          │
│                                                              │
│ User actions:                                               │
│ - ✏️  Edit sections (inline editor)                         │
│ - 🔄 Regenerate (new variation)                             │
│ - 💾 Save as template                                       │
│ - 📤 Push to Klaviyo                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Klaviyo Integration                                         │
│ - Create template in Klaviyo                                │
│ - Upload images to Klaviyo CDN                              │
│ - Open in Klaviyo editor (optional)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Architecture

### System Architecture Diagram
```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐  │
│  │ Dashboard  │ Email Builder│ Asset Lib   │ Settings     │  │
│  └────────────┴──────────────┴─────────────┴──────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │ REST API / WebSocket
┌───────────────────────────┴──────────────────────────────────┐
│                     Backend (Node.js/Python)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              API Gateway (Express/FastAPI)             │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌─────────────┬──────────────┬─────────────┬────────────┐  │
│  │ Auth        │ Brand        │ Email Gen   │ Klaviyo    │  │
│  │ Service     │ Analyzer     │ Engine      │ Connector  │  │
│  └─────────────┴──────────────┴─────────────┴────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                      AI/ML Layer                              │
│  ┌─────────────┬──────────────┬─────────────┬────────────┐  │
│  │ OpenAI/     │ Image        │ Template    │ Brand      │  │
│  │ Claude API  │ Analysis     │ Parser      │ Learner    │  │
│  └─────────────┴──────────────┴─────────────┴────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                    Data & Storage Layer                       │
│  ┌─────────────┬──────────────┬─────────────┬────────────┐  │
│  │ PostgreSQL  │ Redis Cache  │ S3/CDN      │ Vector DB  │  │
│  │ (User/Brand)│ (Sessions)   │ (Images)    │ (Embeddings│  │
│  └─────────────┴──────────────┴─────────────┴────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                    External Integrations                      │
│  ┌─────────────┬──────────────┬─────────────┬────────────┐  │
│  │ Klaviyo API │ Web Scraper  │ MJML        │ Email      │  │
│  │             │ (Puppeteer)  │ Renderer    │ Validators │  │
│  └─────────────┴──────────────┴─────────────┴────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Tech Stack

#### Frontend
```javascript
- Framework: React 18 + TypeScript
- State Management: Zustand or Redux Toolkit
- UI Components: shadcn/ui + Tailwind CSS
- Email Preview: iframe sandbox
- Drag-and-Drop: react-dnd or dnd-kit (future)
- API Client: TanStack Query (React Query)
```

#### Backend
```python
- Runtime: Node.js 20+ OR Python 3.11+
- Framework: Express.js OR FastAPI
- Language: TypeScript OR Python
- Authentication: JWT + bcrypt
- Rate Limiting: express-rate-limit / slowapi
- Job Queue: Bull (Redis) or Celery
```

#### AI/ML
```
- LLM: OpenAI GPT-4 or Anthropic Claude 3.5
- Vision: GPT-4 Vision for image analysis
- Embeddings: OpenAI text-embedding-3-small
- Vector Search: Pinecone or pgvector
```

#### Database & Storage
```sql
- Primary DB: PostgreSQL 15+
- Cache: Redis 7+
- File Storage: AWS S3 or Cloudflare R2
- CDN: Cloudflare or AWS CloudFront
```

#### Email Technology
```
- Templating: MJML 4.x (responsive email framework)
- HTML Processing: Cheerio (Node) or BeautifulSoup (Python)
- Validation: email-validator
- Preview/Testing: Litmus or Email on Acid API (optional)
```

---

## Database Schema

### Core Tables

```sql
-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(50) DEFAULT 'free'
);

-- Klaviyo Integration
CREATE TABLE klaviyo_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    private_api_key_encrypted TEXT NOT NULL,
    public_api_key_encrypted TEXT NOT NULL,
    account_id VARCHAR(255),
    account_name VARCHAR(255),
    is_connected BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Brand Profiles
CREATE TABLE brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    website_url VARCHAR(500),
    brand_name VARCHAR(255),
    
    -- Brand Assets (JSON)
    logo_urls JSONB, -- {header: url, footer: url, square: url}
    color_palette JSONB, -- {primary: #hex, secondary: #hex, accent: #hex, ...}
    typography JSONB, -- {heading: {font, size, weight}, body: {...}}
    
    -- Learned patterns
    brand_voice TEXT, -- "luxury", "casual", "playful"
    common_ctas JSONB, -- ["Shop Now", "Learn More", ...]
    footer_template TEXT, -- Extracted footer HTML
    
    -- Settings
    default_layout VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Asset Library
CREATE TABLE brand_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    asset_type VARCHAR(50) NOT NULL, -- 'logo', 'product', 'lifestyle', 'icon'
    category VARCHAR(100), -- 'pottery', 'furniture', etc.
    
    original_url TEXT,
    cdn_url TEXT NOT NULL,
    filename VARCHAR(255),
    file_size INTEGER, -- bytes
    
    dimensions JSONB, -- {width: 600, height: 400}
    alt_text TEXT,
    tags TEXT[], -- searchable tags
    
    -- AI Analysis
    description TEXT, -- AI-generated
    dominant_colors JSONB,
    embedding VECTOR(1536), -- For similarity search
    
    is_active BOOLEAN DEFAULT true,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_asset_type (asset_type),
    INDEX idx_category (category),
    INDEX idx_tags (tags)
);

-- Email Templates (User's library)
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template source
    source VARCHAR(50), -- 'generated', 'imported', 'klaviyo'
    klaviyo_template_id VARCHAR(255),
    
    -- Email content
    html_content TEXT NOT NULL,
    mjml_content TEXT, -- If we use MJML
    
    -- Metadata
    layout_type VARCHAR(100), -- 'hero_grid', 'product_showcase', etc.
    campaign_type VARCHAR(100), -- 'promotional', 'newsletter', etc.
    subject_line TEXT,
    preview_text TEXT,
    
    -- Analytics
    times_used INTEGER DEFAULT 0,
    avg_open_rate DECIMAL(5,2),
    avg_click_rate DECIMAL(5,2),
    
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_templates (user_id, created_at DESC)
);

-- Generated Emails (History)
CREATE TABLE generated_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    
    -- User input
    campaign_brief TEXT NOT NULL,
    campaign_type VARCHAR(100),
    
    -- AI Generation metadata
    model_used VARCHAR(100), -- 'gpt-4-turbo', 'claude-3.5-sonnet'
    generation_time_ms INTEGER,
    tokens_used INTEGER,
    
    -- Generated content
    html_content TEXT NOT NULL,
    subject_line TEXT,
    preview_text TEXT,
    
    -- Assets used
    images_used JSONB, -- [{asset_id, url, placement}, ...]
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent_to_klaviyo', 'archived'
    klaviyo_template_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_generated (user_id, created_at DESC)
);

-- Component Library (Reusable blocks)
CREATE TABLE email_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    component_type VARCHAR(100) NOT NULL, -- 'header', 'footer', 'product_grid', 'cta', 'hero'
    name VARCHAR(255),
    
    html_snippet TEXT NOT NULL,
    mjml_snippet TEXT,
    
    -- Metadata
    is_global BOOLEAN DEFAULT false, -- System-wide component
    variables JSONB, -- Placeholder variables {product_url, cta_text, ...}
    
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_component_type (component_type)
);

-- Job Queue (for async tasks)
CREATE TABLE background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    job_type VARCHAR(100) NOT NULL, -- 'brand_analysis', 'email_generation', 'klaviyo_sync'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_job_status (status, created_at)
);

-- Usage Analytics
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    action VARCHAR(100) NOT NULL, -- 'email_generated', 'template_saved', 'klaviyo_synced'
    
    metadata JSONB,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,4),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_usage (user_id, created_at DESC)
);
```

---

## API Specification

### Core Endpoints

#### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
GET    /api/v1/auth/me
```

#### Klaviyo Integration
```
POST   /api/v1/klaviyo/connect
       Body: {privateKey, publicKey}
       → Validates keys, fetches account info, starts template sync

GET    /api/v1/klaviyo/status
       → Connection status, last sync time

POST   /api/v1/klaviyo/sync-templates
       → Manually trigger template import

GET    /api/v1/klaviyo/templates
       → List imported Klaviyo templates

POST   /api/v1/klaviyo/push-template
       Body: {emailId, templateName}
       → Push generated email to Klaviyo
```

#### Brand Profile
```
POST   /api/v1/brand/analyze-website
       Body: {websiteUrl}
       → Scrape website, extract brand assets, colors, fonts
       → Returns job_id (async process)

GET    /api/v1/brand/analysis-status/:jobId
       → Check status of brand analysis

POST   /api/v1/brand/upload-assets
       Body: FormData with files
       → Upload logos, brand guidelines, images

GET    /api/v1/brand/profile
       → Get current brand profile

PATCH  /api/v1/brand/profile
       Body: {colorPalette, typography, brandVoice, ...}
       → Update brand profile manually

GET    /api/v1/brand/assets
       Query: ?type=logo&category=pottery
       → List brand assets with filtering

DELETE /api/v1/brand/assets/:assetId
```

#### Email Generation (Core Feature)
```
POST   /api/v1/emails/generate
       Body: {
         campaignBrief: "25% off pottery",
         campaignType: "promotional",
         targetProducts?: [...],
         tone?: "luxury",
         layoutPreference?: "hero_grid"
       }
       → Generate email HTML
       → Returns job_id (async) or immediate response

GET    /api/v1/emails/generation-status/:jobId
       → Check generation progress
       → Returns: {status, progress, preview_url}

POST   /api/v1/emails/:emailId/regenerate
       Body: {section?: "hero", variation?: true}
       → Regenerate specific section or create variation

GET    /api/v1/emails
       → List generated emails (history)

GET    /api/v1/emails/:emailId
       → Get specific email details

PATCH  /api/v1/emails/:emailId
       Body: {htmlContent, subjectLine, ...}
       → Edit generated email

DELETE /api/v1/emails/:emailId
```

#### Templates
```
GET    /api/v1/templates
       → List saved templates

POST   /api/v1/templates
       Body: {name, description, htmlContent, layoutType}
       → Save email as template

GET    /api/v1/templates/:templateId

PATCH  /api/v1/templates/:templateId

DELETE /api/v1/templates/:templateId
```

#### Components
```
GET    /api/v1/components
       Query: ?type=header
       → List reusable components

GET    /api/v1/components/:componentId
```

---

## AI Engine Specification

### Email Generation Pipeline

```javascript
/**
 * Email Generation Flow
 */
class EmailGenerationEngine {
  
  async generateEmail(userId, campaignBrief, options) {
    // 1. Load brand context
    const brandProfile = await this.getBrandProfile(userId);
    const pastTemplates = await this.getSuccessfulTemplates(userId);
    
    // 2. Analyze intent
    const intent = await this.analyzeIntent(campaignBrief, options);
    /*
    Example intent output:
    {
      campaignType: 'promotional',
      primaryAction: 'drive_sales',
      targetAudience: 'existing_customers',
      urgency: 'medium',
      keyProducts: ['pottery', 'bowls', 'vases'],
      tone: 'luxury',
      estimatedSections: ['hero', 'product_grid', 'cta', 'footer']
    }
    */
    
    // 3. Select layout
    const layout = await this.selectLayout(intent, pastTemplates);
    
    // 4. Generate content sections in parallel
    const [hero, productGrid, footer] = await Promise.all([
      this.generateHeroSection(intent, brandProfile),
      this.generateProductGrid(intent, brandProfile),
      this.generateFooter(brandProfile)
    ]);
    
    // 5. Select and optimize images
    const images = await this.selectImages(intent, brandProfile);
    
    // 6. Assemble email
    const mjml = await this.assembleMJML({
      layout,
      sections: { hero, productGrid, footer },
      images,
      brandProfile
    });
    
    // 7. Render to HTML
    const html = await this.renderMJML(mjml);
    
    // 8. Validate and optimize
    const optimized = await this.validateAndOptimize(html);
    
    return {
      html: optimized,
      mjml,
      metadata: {
        intent,
        layout: layout.name,
        imagesUsed: images.map(i => i.id),
        generationTime: Date.now() - startTime
      }
    };
  }
  
  async analyzeIntent(campaignBrief, options) {
    const prompt = `
You are an email marketing strategist. Analyze this campaign brief and extract key information.

Brand Context:
${JSON.stringify(this.brandProfile, null, 2)}

Campaign Brief:
"${campaignBrief}"

Additional Options:
${JSON.stringify(options, null, 2)}

Return a JSON object with:
- campaignType: (promotional|product_launch|newsletter|abandoned_cart|seasonal)
- primaryAction: (drive_sales|build_awareness|educate|nurture)
- targetAudience: (new_customers|existing_customers|vip|lapsed)
- urgency: (low|medium|high)
- keyProducts: array of product categories or names
- tone: (luxury|casual|playful|professional|urgent)
- suggestedSubjectLines: array of 3 subject line options
- previewText: suggested preview text
- estimatedSections: array of sections needed
`;

    const response = await this.llm.generate({
      prompt,
      model: 'gpt-4-turbo',
      responseFormat: 'json'
    });
    
    return JSON.parse(response);
  }
  
  async generateHeroSection(intent, brandProfile) {
    const prompt = `
Generate the hero section for an email campaign.

Brand Profile:
- Name: ${brandProfile.brandName}
- Voice: ${brandProfile.brandVoice}
- Primary Color: ${brandProfile.colorPalette.primary}

Campaign Intent:
${JSON.stringify(intent, null, 2)}

Generate:
1. Main headline (45 characters max)
2. Subheadline (80 characters max)
3. Primary CTA text
4. CTA link (use placeholder if product-specific)

Return JSON with: {headline, subheadline, ctaText, ctaLink, suggestedImage}
`;

    const response = await this.llm.generate({ prompt });
    return JSON.parse(response);
  }
  
  async selectImages(intent, brandProfile) {
    // Get relevant assets from database
    const assets = await db.query(`
      SELECT * FROM brand_assets
      WHERE user_id = $1
        AND asset_type IN ('product', 'lifestyle')
        AND ($2::text[] IS NULL OR category = ANY($2))
      ORDER BY uploaded_at DESC
      LIMIT 20
    `, [userId, intent.keyProducts]);
    
    // Use embeddings for semantic search
    const queryEmbedding = await this.getEmbedding(
      `${intent.campaignType} ${intent.keyProducts.join(' ')} ${intent.tone}`
    );
    
    const rankedAssets = await this.vectorSearch(queryEmbedding, assets);
    
    return rankedAssets.slice(0, 6); // Top 6 images
  }
  
  async assembleMJML(components) {
    const { layout, sections, images, brandProfile } = components;
    
    // Use template literal or template engine
    const mjml = `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="${brandProfile.typography.body.font}" />
      <mj-text color="${brandProfile.colorPalette.text}" line-height="1.6" />
    </mj-attributes>
    <mj-style>
      ${this.generateCustomStyles(brandProfile)}
    </mj-style>
  </mj-head>
  
  <mj-body background-color="${brandProfile.colorPalette.background}">
    ${this.generateHeader(brandProfile)}
    ${this.generateHero(sections.hero, images[0])}
    ${this.generateProductGrid(sections.productGrid, images.slice(1))}
    ${this.generateFooter(sections.footer, brandProfile)}
  </mj-body>
</mjml>
    `.trim();
    
    return mjml;
  }
}
```

### AI Models & Prompts

#### Model Selection Strategy
```javascript
const MODEL_CONFIG = {
  intentAnalysis: {
    model: 'gpt-4-turbo',
    temperature: 0.3,
    maxTokens: 500
  },
  
  copyGeneration: {
    model: 'claude-3.5-sonnet',
    temperature: 0.7,
    maxTokens: 1000
  },
  
  imageSelection: {
    model: 'gpt-4-vision',
    temperature: 0.5,
    maxTokens: 300
  },
  
  subjectLines: {
    model: 'gpt-4-turbo',
    temperature: 0.8, // More creative
    maxTokens: 100
  }
};
```

---

## Brand Analysis System

### Website Scraper
```javascript
/**
 * Brand Asset Extractor
 */
class BrandAnalyzer {
  
  async analyzeWebsite(websiteUrl) {
    // 1. Scrape homepage and key pages
    const pages = await this.scrapePages(websiteUrl, [
      '/',
      '/products',
      '/collections',
      '/about'
    ]);
    
    // 2. Extract visual assets
    const assets = {
      logos: await this.extractLogos(pages),
      images: await this.extractImages(pages),
      colors: await this.extractColorPalette(pages),
      typography: await this.extractTypography(pages)
    };
    
    // 3. Analyze brand voice
    const textContent = pages.map(p => p.text).join('\n');
    const brandVoice = await this.analyzeBrandVoice(textContent);
    
    // 4. Extract common CTAs
    const ctas = await this.extractCTAs(pages);
    
    // 5. Download and store assets
    await this.downloadAndStoreAssets(assets);
    
    return {
      assets,
      brandVoice,
      ctas
    };
  }
  
  async scrapePages(baseUrl, paths) {
    const browser = await puppeteer.launch();
    const results = [];
    
    for (const path of paths) {
      const page = await browser.newPage();
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle0' });
      
      // Extract data
      const data = await page.evaluate(() => ({
        html: document.documentElement.outerHTML,
        text: document.body.innerText,
        images: Array.from(document.images).map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.naturalWidth,
          height: img.naturalHeight
        })),
        styles: Array.from(document.styleSheets).map(sheet => {
          try {
            return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
          } catch(e) { return ''; }
        }).join('\n')
      }));
      
      results.push(data);
      await page.close();
    }
    
    await browser.close();
    return results;
  }
  
  async extractColorPalette(pages) {
    // Analyze CSS and images for color usage
    const colors = new Map();
    
    // Parse CSS for color values
    pages.forEach(page => {
      const cssColors = page.styles.match(/#[0-9A-Fa-f]{6}|rgb\([^)]+\)/g) || [];
      cssColors.forEach(color => {
        const normalized = this.normalizeColor(color);
        colors.set(normalized, (colors.get(normalized) || 0) + 1);
      });
    });
    
    // Sort by frequency
    const sorted = Array.from(colors.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return {
      primary: sorted[0]?.[0],
      secondary: sorted[1]?.[0],
      accent: sorted[2]?.[0],
      background: sorted[3]?.[0] || '#FFFFFF',
      text: sorted[4]?.[0] || '#000000'
    };
  }
  
  async analyzeBrandVoice(textContent) {
    const prompt = `
Analyze the brand voice from this website content.

Content sample:
${textContent.slice(0, 2000)}

Classify the brand voice as ONE of:
- luxury: High-end, sophisticated, exclusive
- casual: Friendly, approachable, conversational
- playful: Fun, energetic, quirky
- professional: Expert, trustworthy, authoritative
- minimal: Simple, clean, understated

Also provide:
- Key adjectives (3-5 words that describe the brand)
- Typical sentence structure (short/long, simple/complex)
- Common themes or topics

Return JSON: {voice, adjectives, sentenceStyle, themes}
`;

    const response = await this.llm.generate({ prompt, model: 'gpt-4-turbo' });
    return JSON.parse(response);
  }
}
```

---

## Klaviyo Integration

### Template Sync
```javascript
/**
 * Klaviyo API Integration
 */
class KlaviyoConnector {
  
  constructor(privateKey, publicKey) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.baseUrl = 'https://a.klaviyo.com/api';
  }
  
  async fetchTemplates() {
    const response = await fetch(`${this.baseUrl}/templates`, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${this.privateKey}`,
        'revision': '2024-10-15'
      }
    });
    
    const templates = await response.json();
    return templates.data;
  }
  
  async analyzeTemplate(templateId) {
    const template = await this.getTemplate(templateId);
    
    // Parse HTML to extract patterns
    const analysis = {
      layout: this.detectLayout(template.html),
      components: this.extractComponents(template.html),
      styles: this.extractStyles(template.html),
      variables: this.extractVariables(template.html)
    };
    
    return analysis;
  }
  
  async pushTemplate(emailHtml, name) {
    // Upload images first
    const imageUrls = await this.uploadImages(emailHtml);
    
    // Replace local URLs with Klaviyo CDN URLs
    const updatedHtml = this.replaceImageUrls(emailHtml, imageUrls);
    
    // Create template
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${this.privateKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify({
        data: {
          type: 'template',
          attributes: {
            name,
            html: updatedHtml,
            text: this.htmlToText(updatedHtml)
          }
        }
      })
    });
    
    const result = await response.json();
    return result.data.id;
  }
  
  async uploadImages(html) {
    // Extract image URLs from HTML
    const imageUrls = this.extractImageUrls(html);
    const uploadedUrls = new Map();
    
    for (const url of imageUrls) {
      // Download image
      const imageBuffer = await this.downloadImage(url);
      
      // Upload to Klaviyo
      const formData = new FormData();
      formData.append('file', imageBuffer, 'image.jpg');
      
      const response = await fetch(`${this.baseUrl}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.privateKey}`
        },
        body: formData
      });
      
      const result = await response.json();
      uploadedUrls.set(url, result.data.attributes.url);
    }
    
    return uploadedUrls;
  }
}
```

---

## Security & Performance

### Security Measures
```javascript
// 1. API Key Encryption
const encryptApiKey = (apiKey, userSecret) => {
  const cipher = crypto.createCipher('aes-256-gcm', userSecret);
  return cipher.update(apiKey, 'utf8', 'hex') + cipher.final('hex');
};

// 2. Rate Limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each user to 100 requests per windowMs
  keyGenerator: (req) => req.user.id
});

// 3. Input Validation
const validateCampaignBrief = (brief) => {
  if (brief.length > 1000) throw new Error('Brief too long');
  // Sanitize HTML, prevent injection
  return sanitizeHtml(brief);
};

// 4. CORS Configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
};
```

### Performance Optimization
```javascript
// 1. Caching Strategy
const cacheConfig = {
  brandProfile: { ttl: 3600 }, // 1 hour
  templates: { ttl: 1800 },     // 30 min
  assets: { ttl: 86400 }        // 24 hours
};

// 2. Async Job Processing
const processEmailGeneration = async (jobId, userId, brief) => {
  await updateJobStatus(jobId, 'processing');
  
  try {
    const email = await emailEngine.generate(userId, brief);
    await saveEmail(userId, email);
    await updateJobStatus(jobId, 'completed', { emailId: email.id });
    
    // Send WebSocket notification
    io.to(userId).emit('generation_complete', { jobId, emailId: email.id });
  } catch (error) {
    await updateJobStatus(jobId, 'failed', { error: error.message });
    io.to(userId).emit('generation_failed', { jobId, error: error.message });
  }
};

// 3. Image Optimization
const optimizeImage = async (imageBuffer) => {
  return await sharp(imageBuffer)
    .resize(1200, null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
};

// 4. Database Query Optimization
// Use indexes, connection pooling, prepared statements
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000
});
```

---

## MVP Feature Roadmap

### Phase 1: Foundation (Weeks 1-4)
```
✅ User authentication & account creation
✅ Klaviyo API connection
✅ Basic brand profile (manual input)
✅ Simple email generation (single template)
✅ Preview & export HTML
```

### Phase 2: Intelligence (Weeks 5-8)
```
✅ Website scraping & brand analysis
✅ AI-powered layout selection
✅ Multiple template variations
✅ Image library & selection
✅ Push to Klaviyo functionality
```

### Phase 3: Polish (Weeks 9-12)
```
✅ Inline email editor
✅ Component library
✅ Template marketplace
✅ Analytics dashboard
✅ A/B variant generation
```

### Phase 4: Scale (Weeks 13-16)
```
✅ Multi-brand support
✅ Team collaboration
✅ API access for developers
✅ Advanced customization
✅ Performance optimization
```

---

## Cost Estimation

### Per Email Generation
```
AI Costs:
- Intent analysis: ~500 tokens × $0.01/1K = $0.005
- Copy generation: ~1000 tokens × $0.03/1K = $0.030
- Image selection: ~300 tokens × $0.01/1K = $0.003
Total AI cost: ~$0.038 per email

Infrastructure:
- Image storage (S3): ~$0.001 per email
- Database operations: ~$0.002 per email
- CDN bandwidth: ~$0.005 per email
Total infra: ~$0.008 per email

TOTAL: ~$0.05 per email generated
```

### Monthly Operating Costs (1000 users)
```
- Hosting (AWS/Railway): $200
- Database (Managed PostgreSQL): $150
- Redis cache: $50
- CDN & Storage: $100
- AI API (10k emails/mo): $500
- Monitoring & logs: $50
TOTAL: ~$1,050/month

Revenue (if $29/mo per user): $29,000
Gross margin: 96%
```

---

## Success Metrics

### Product KPIs
```
- Time to first email: < 5 minutes
- Email generation success rate: > 95%
- User satisfaction (NPS): > 40
- Emails pushed to Klaviyo: > 70% of generated
- Template reuse rate: > 30%
```

### Technical KPIs
```
- API response time (p95): < 2s
- Email generation time: < 30s
- Uptime: > 99.5%
- Error rate: < 1%
```

---

## Next Steps

### Immediate Actions
1. ✅ Set up development environment
2. ✅ Create database schema
3. ✅ Build authentication system
4. ✅ Implement Klaviyo connection
5. ✅ Create basic email generation flow
6. Build minimal frontend (React dashboard)
7. Deploy MVP to staging

### Tech Decisions Needed
- [ ] Node.js vs Python for backend?
- [ ] PostgreSQL hosting (AWS RDS, Supabase, Railway)?
- [ ] Which AI model(s) for production?
- [ ] MJML vs custom HTML templating?
- [ ] Monorepo vs separate repos?

---

**Ready to build?** Let's start with the backend scaffold and database setup.

