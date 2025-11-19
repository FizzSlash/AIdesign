# 🚀 V1 Implementation Plan - AI Email Designer

## 🎯 Goal: Launch-Ready Product in 2 Weeks

**Focus:** Beautiful, brand-aligned emails with smart product selection and audience-appropriate copy.

**Removed:** Klaviyo segments (too complex for V1)  
**Kept:** Audience targeting for copy curation

---

## 📊 **Current State Assessment**

### ✅ **What You Have (Working)**
- [x] User authentication
- [x] Shopify integration (product sync)
- [x] Klaviyo integration (template push)
- [x] AI email generation (GPT-4)
- [x] MJML rendering
- [x] Brand website scraping
- [x] Image optimization
- [x] Database schema (13 tables)
- [x] API endpoints (28 routes)

### 🔴 **What's Missing (Critical for V1)**
- [ ] **Enhanced brand profile** (needs major work)
- [ ] **Text overlay on images** (hero section)
- [ ] **Smart product selection** (AI-powered)
- [ ] **Audience-based copy** (tone adjustment)
- [ ] **Multiple email layouts** (5-7 templates)
- [ ] **Remix feature** (swap images/copy)
- [ ] **Frontend UI** (React dashboard)

---

## 🏗️ **Build Order (2 Weeks)**

### **Week 1: Backend Foundation**

#### **Day 1-2: Enhanced Brand Profile** ⭐ START HERE

**Why First?**
- Everything depends on brand data
- Affects all email generation
- One-time setup per user

**What to Build:**

##### **1. Update Database Schema**

```sql
-- Enhanced brand_profiles table
ALTER TABLE brand_profiles 
ADD COLUMN IF NOT EXISTS brand_personality JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visual_style JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS messaging_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS example_emails JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS competitor_urls TEXT[],
ADD COLUMN IF NOT EXISTS target_audience_primary VARCHAR(100),
ADD COLUMN IF NOT EXISTS brand_keywords TEXT[];

-- Structure:
-- brand_personality: { tone: "luxury", adjectives: ["elegant", "sophisticated"], voice_description: "..." }
-- visual_style: { layout_preference: "minimal", image_style: "lifestyle", overlay_style: "dark" }
-- messaging_preferences: { cta_style: "action", urgency_level: "medium", emoji_usage: "minimal" }
-- example_emails: [{ url: "...", notes: "Love the hero layout" }]
```

##### **2. Enhanced Brand Analysis Service**

```typescript
// src/services/brand-enhanced.service.ts

interface EnhancedBrandProfile {
  // Visual Identity
  logo_urls: {
    primary: string;
    secondary?: string;
    icon?: string;
  };
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    overlay?: string; // For text overlays
  };
  typography: {
    heading: { font: string; weight: number };
    body: { font: string; weight: number };
    cta: { font: string; weight: number };
  };
  
  // Brand Personality
  brand_personality: {
    tone: 'luxury' | 'casual' | 'playful' | 'professional' | 'minimal';
    adjectives: string[]; // ["elegant", "sophisticated", "timeless"]
    voice_description: string; // AI-generated
    formality_level: 1-5; // 1=very casual, 5=very formal
  };
  
  // Visual Style
  visual_style: {
    layout_preference: 'minimal' | 'rich' | 'editorial' | 'product-focused';
    image_style: 'lifestyle' | 'product-only' | 'mixed';
    overlay_style: 'dark' | 'light' | 'gradient' | 'none';
    spacing: 'tight' | 'normal' | 'spacious';
  };
  
  // Messaging
  messaging_preferences: {
    cta_style: 'action' | 'benefit' | 'urgency'; // "Shop Now" vs "Discover More" vs "Limited Time"
    urgency_level: 'low' | 'medium' | 'high';
    emoji_usage: 'none' | 'minimal' | 'moderate' | 'heavy';
    sentence_length: 'short' | 'medium' | 'long';
  };
  
  // Examples & References
  example_emails: Array<{
    url: string;
    screenshot?: string;
    notes: string;
    liked_elements: string[]; // ["hero layout", "color scheme", "copy tone"]
  }>;
  
  competitor_urls: string[];
  target_audience_primary: 'new_customers' | 'loyal' | 'vip' | 'general';
  brand_keywords: string[]; // ["sustainable", "handcrafted", "luxury"]
}

class EnhancedBrandService {
  
  async analyzeWebsiteEnhanced(websiteUrl: string, userId: string) {
    // 1. Scrape website (existing)
    const pages = await this.scrapeWebsite(websiteUrl);
    
    // 2. Extract visual assets (existing)
    const visualAssets = await this.extractVisualAssets(pages);
    
    // 3. NEW: Analyze brand personality with AI
    const personality = await this.analyzeBrandPersonality(pages);
    
    // 4. NEW: Analyze visual style
    const visualStyle = await this.analyzeVisualStyle(pages, visualAssets);
    
    // 5. NEW: Analyze messaging patterns
    const messaging = await this.analyzeMessagingStyle(pages);
    
    // 6. Save enhanced profile
    return await this.saveEnhancedProfile({
      userId,
      ...visualAssets,
      brand_personality: personality,
      visual_style: visualStyle,
      messaging_preferences: messaging
    });
  }
  
  async analyzeBrandPersonality(pages: ScrapedPage[]) {
    const textContent = pages.map(p => p.text).join('\n').slice(0, 3000);
    
    const prompt = `Analyze this brand's personality and voice:

${textContent}

Return JSON:
{
  "tone": "luxury|casual|playful|professional|minimal",
  "adjectives": ["3-5 words describing the brand"],
  "voice_description": "2-3 sentence description of brand voice",
  "formality_level": 1-5,
  "example_phrases": ["3 phrases that exemplify the brand voice"]
}`;

    const response = await this.ai.generate({ prompt, model: 'gpt-4' });
    return JSON.parse(response);
  }
  
  async analyzeVisualStyle(pages: ScrapedPage[], assets: VisualAssets) {
    // Analyze homepage hero section
    const heroImages = assets.images.filter(img => img.isHero);
    
    const prompt = `Analyze these hero images and determine visual style preferences:

Images: ${heroImages.map(img => img.url).join(', ')}

Consider:
- Are images lifestyle or product-focused?
- Is there text overlay? What color?
- Minimal or rich design?
- Spacing: tight or spacious?

Return JSON:
{
  "layout_preference": "minimal|rich|editorial|product-focused",
  "image_style": "lifestyle|product-only|mixed",
  "overlay_style": "dark|light|gradient|none",
  "spacing": "tight|normal|spacious"
}`;

    const response = await this.ai.analyzeImages({
      prompt,
      images: heroImages.slice(0, 3)
    });
    
    return JSON.parse(response);
  }
  
  async analyzeMessagingStyle(pages: ScrapedPage[]) {
    // Extract CTAs from website
    const ctas = this.extractCTAs(pages);
    const headlines = this.extractHeadlines(pages);
    
    const prompt = `Analyze the messaging style:

CTAs: ${ctas.join(', ')}
Headlines: ${headlines.join(', ')}

Determine:
1. CTA style: action-oriented ("Shop Now") vs benefit ("Discover More") vs urgency ("Limited Time")
2. Urgency level: how often do they use time-sensitive language?
3. Emoji usage: none, minimal, moderate, or heavy?
4. Sentence length: short/punchy vs medium vs long/descriptive?

Return JSON:
{
  "cta_style": "action|benefit|urgency",
  "urgency_level": "low|medium|high",
  "emoji_usage": "none|minimal|moderate|heavy",
  "sentence_length": "short|medium|long",
  "common_ctas": ["top 5 CTAs they use"]
}`;

    const response = await this.ai.generate({ prompt, model: 'gpt-4' });
    return JSON.parse(response);
  }
}
```

##### **3. Brand Setup API Endpoints**

```typescript
// src/routes/brand-enhanced.routes.ts

// Step 1: Analyze website (enhanced)
POST /api/v1/brand/analyze-enhanced
{
  "websiteUrl": "https://example.com",
  "exampleEmails": [
    { "url": "...", "notes": "Love the hero layout" }
  ],
  "competitorUrls": ["https://competitor1.com"]
}
→ Returns jobId

// Step 2: Get analysis results
GET /api/v1/brand/analysis/:jobId
→ Returns enhanced brand profile

// Step 3: User can refine
PATCH /api/v1/brand/profile
{
  "brand_personality": {
    "tone": "luxury",
    "adjectives": ["elegant", "timeless", "sophisticated"]
  },
  "visual_style": {
    "overlay_style": "dark"
  },
  "messaging_preferences": {
    "cta_style": "benefit",
    "emoji_usage": "minimal"
  }
}

// Step 4: Upload example emails (screenshots)
POST /api/v1/brand/examples
FormData: { file, notes, liked_elements }
```

---

#### **Day 3-4: Smart Product Selection**

**Goal:** AI picks best products from Shopify catalog based on campaign

##### **1. Product Selection Service**

```typescript
// src/services/product-selector.service.ts

interface CampaignContext {
  campaignType: 'sale' | 'launch' | 'newsletter' | 'seasonal';
  promotionType: 'limited_time' | 'flash_sale' | 'new_arrival' | 'featured';
  theme: string; // "evening wear", "summer collection"
  targetAudience: 'new_customers' | 'loyal' | 'vip' | 'general';
  productCount: number; // How many products to select
}

class ProductSelectorService {
  
  async selectProductsForCampaign(
    userId: string,
    context: CampaignContext
  ): Promise<SelectedProduct[]> {
    
    // 1. Get user's Shopify products
    const allProducts = await this.getShopifyProducts(userId);
    
    // 2. Filter by availability
    const availableProducts = allProducts.filter(p => 
      p.in_stock && 
      p.total_inventory > 5 &&
      p.status === 'active'
    );
    
    // 3. AI-powered product matching
    const matchedProducts = await this.matchProductsToCampaign(
      availableProducts,
      context
    );
    
    // 4. Rank by relevance + inventory + sales
    const rankedProducts = await this.rankProducts(matchedProducts, context);
    
    // 5. Return top N with reasons
    return rankedProducts.slice(0, context.productCount).map(p => ({
      ...p,
      selectionReason: this.explainSelection(p, context)
    }));
  }
  
  async matchProductsToCampaign(
    products: ShopifyProduct[],
    context: CampaignContext
  ) {
    // Use AI to match products to campaign theme
    const prompt = `You're selecting products for an email campaign.

Campaign: ${context.campaignType} - ${context.theme}
Target Audience: ${context.targetAudience}

Available products (showing first 50):
${products.slice(0, 50).map(p => 
  `- ${p.title} (${p.product_type}) [Tags: ${p.tags.join(', ')}] [Inventory: ${p.total_inventory}]`
).join('\n')}

Select the ${context.productCount} BEST products for this campaign.
Consider:
1. Relevance to theme
2. Product type and tags
3. Inventory levels
4. Audience appropriateness

Return JSON array of product titles:
["Product Title 1", "Product Title 2", ...]`;

    const response = await this.ai.generate({ 
      prompt, 
      model: 'gpt-4',
      temperature: 0.3 
    });
    
    const selectedTitles = JSON.parse(response);
    
    return products.filter(p => selectedTitles.includes(p.title));
  }
  
  explainSelection(product: ShopifyProduct, context: CampaignContext): string {
    const reasons = [];
    
    if (product.total_inventory > 50) {
      reasons.push("High inventory");
    }
    
    if (product.tags.some(tag => context.theme.toLowerCase().includes(tag.toLowerCase()))) {
      reasons.push("Perfect match for theme");
    }
    
    if (product.product_type && context.theme.includes(product.product_type.toLowerCase())) {
      reasons.push("Matches campaign category");
    }
    
    return reasons.join(' • ') || "Good fit for campaign";
  }
}
```

##### **2. Product Selection API**

```typescript
// src/routes/products.routes.ts

// Get AI-suggested products
POST /api/v1/products/suggest
{
  "campaignType": "sale",
  "theme": "evening wear",
  "targetAudience": "loyal",
  "productCount": 6
}
→ Returns:
{
  "suggestedProducts": [
    {
      "id": "...",
      "title": "Velvet Turtleneck",
      "images": [...],
      "price": "89.99",
      "inventory": 47,
      "reason": "High inventory • Perfect match for theme"
    }
  ],
  "allowManualOverride": true
}

// Add manual product by URL
POST /api/v1/products/add-by-url
{
  "productUrl": "https://store.myshopify.com/products/..."
}
→ Scrapes product, adds to selection
```

---

#### **Day 5-6: Text Overlay Intelligence**

**Goal:** Smart text color selection for hero images

##### **1. Image Analysis Service**

```typescript
// src/services/image-overlay.service.ts

interface OverlayAnalysis {
  textColor: 'white' | 'black';
  textShadow: string;
  overlayColor?: string; // Optional darkening/lightening
  overlayOpacity?: number;
  textPosition: 'top' | 'center' | 'bottom';
  confidence: number; // 0-1
}

class ImageOverlayService {
  
  async analyzeImageForTextOverlay(imageUrl: string): Promise<OverlayAnalysis> {
    // Try programmatic analysis first (fast & free)
    const quickAnalysis = await this.quickBrightnessAnalysis(imageUrl);
    
    // If confidence is low, use AI
    if (quickAnalysis.confidence < 0.7) {
      return await this.aiImageAnalysis(imageUrl);
    }
    
    return quickAnalysis;
  }
  
  async quickBrightnessAnalysis(imageUrl: string): Promise<OverlayAnalysis> {
    const image = sharp(await this.downloadImage(imageUrl));
    const metadata = await image.metadata();
    
    // Analyze top 40% of image (where text usually goes)
    const topSection = await image
      .extract({ 
        left: 0, 
        top: 0, 
        width: metadata.width!, 
        height: Math.floor(metadata.height! * 0.4) 
      })
      .stats();
    
    // Calculate average brightness
    const brightness = (
      topSection.channels[0].mean + 
      topSection.channels[1].mean + 
      topSection.channels[2].mean
    ) / 3;
    
    // Determine text color
    const useWhiteText = brightness < 128;
    
    // Calculate confidence based on how far from middle (128)
    const confidence = Math.abs(brightness - 128) / 128;
    
    return {
      textColor: useWhiteText ? 'white' : 'black',
      textShadow: useWhiteText 
        ? '0 2px 4px rgba(0,0,0,0.5)' 
        : '0 2px 4px rgba(255,255,255,0.5)',
      overlayColor: useWhiteText ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)',
      overlayOpacity: 0.3,
      textPosition: 'center',
      confidence
    };
  }
  
  async aiImageAnalysis(imageUrl: string): Promise<OverlayAnalysis> {
    const prompt = `Analyze this image for text overlay.

Determine:
1. Should overlaid text be WHITE or BLACK?
2. Where should text be positioned: TOP, CENTER, or BOTTOM?
3. Is the image too busy for text overlay?
4. Should we add a darkening/lightening overlay?

Return JSON:
{
  "textColor": "white|black",
  "textPosition": "top|center|bottom",
  "needsOverlay": true|false,
  "overlayColor": "rgba(...)",
  "confidence": 0.0-1.0
}`;

    const response = await this.ai.analyzeImage({
      prompt,
      imageUrl,
      model: 'gpt-4-vision-preview'
    });
    
    const analysis = JSON.parse(response);
    
    return {
      textColor: analysis.textColor,
      textShadow: analysis.textColor === 'white'
        ? '0 2px 4px rgba(0,0,0,0.5)'
        : '0 2px 4px rgba(255,255,255,0.5)',
      overlayColor: analysis.needsOverlay ? analysis.overlayColor : undefined,
      overlayOpacity: analysis.needsOverlay ? 0.3 : 0,
      textPosition: analysis.textPosition,
      confidence: analysis.confidence
    };
  }
}
```

---

#### **Day 7: Audience-Based Copy Generation**

**Goal:** Adjust copy tone based on target audience

##### **1. Copy Generation Service**

```typescript
// src/services/copy-generator.service.ts

interface CopyContext {
  campaignType: string;
  theme: string;
  offer: string;
  targetAudience: 'new_customers' | 'loyal' | 'vip' | 'general';
  brandProfile: EnhancedBrandProfile;
}

class CopyGeneratorService {
  
  async generateEmailCopy(context: CopyContext) {
    const audienceGuidelines = this.getAudienceGuidelines(context.targetAudience);
    const brandVoice = context.brandProfile.brand_personality;
    const messaging = context.brandProfile.messaging_preferences;
    
    const prompt = `Generate email copy for this campaign:

BRAND VOICE:
- Tone: ${brandVoice.tone}
- Adjectives: ${brandVoice.adjectives.join(', ')}
- Description: ${brandVoice.voice_description}
- Formality: ${brandVoice.formality_level}/5

MESSAGING STYLE:
- CTA Style: ${messaging.cta_style}
- Urgency: ${messaging.urgency_level}
- Emoji Usage: ${messaging.emoji_usage}
- Sentence Length: ${messaging.sentence_length}

CAMPAIGN:
- Type: ${context.campaignType}
- Theme: ${context.theme}
- Offer: ${context.offer}

TARGET AUDIENCE: ${context.targetAudience}
${audienceGuidelines}

Generate:
1. Hero Headline (max 6 words, impactful)
2. Hero Subheadline (max 12 words, benefit-focused)
3. Body Copy (2-3 sentences)
4. Primary CTA (2-3 words)
5. Subject Line (max 50 characters)
6. Preview Text (max 100 characters)

Return JSON:
{
  "heroHeadline": "...",
  "heroSubheadline": "...",
  "bodyCopy": "...",
  "primaryCTA": "...",
  "subjectLine": "...",
  "previewText": "..."
}`;

    const response = await this.ai.generate({ 
      prompt, 
      model: 'gpt-4',
      temperature: 0.7 
    });
    
    return JSON.parse(response);
  }
  
  getAudienceGuidelines(audience: string): string {
    const guidelines = {
      new_customers: `
- Focus on introduction and welcome
- Explain value proposition clearly
- Build trust and credibility
- Use welcoming, inclusive language
- Avoid assuming prior knowledge`,
      
      loyal: `
- Show appreciation for their loyalty
- Use familiar, friendly tone
- Reference past purchases or engagement
- Offer exclusive perks or early access
- Create FOMO (they don't want to miss out)`,
      
      vip: `
- Treat as VIP/insider
- Use exclusive, premium language
- Emphasize scarcity and exclusivity
- Offer best deals or first access
- Make them feel special and valued`,
      
      general: `
- Broad appeal messaging
- Clear value proposition
- Balanced urgency
- Inclusive language
- Focus on product benefits`
    };
    
    return guidelines[audience] || guidelines.general;
  }
}
```

---

### **Week 2: Email Generation + Frontend**

#### **Day 8-9: Enhanced Email Generation**

**Goal:** Bring it all together - generate beautiful emails with overlays

##### **1. Update Email Generation Service**

```typescript
// src/services/email-generation-v2.service.ts

class EmailGenerationV2Service {
  
  async generateEmail(request: EmailGenerationRequest) {
    const { userId, campaignContext, selectedProducts } = request;
    
    // 1. Get enhanced brand profile
    const brandProfile = await this.brandService.getEnhancedProfile(userId);
    
    // 2. Select products (if not provided)
    const products = selectedProducts || await this.productSelector.selectProductsForCampaign(
      userId,
      campaignContext
    );
    
    // 3. Analyze hero image for text overlay
    const heroProduct = products[0];
    const overlayAnalysis = await this.imageOverlay.analyzeImageForTextOverlay(
      heroProduct.images[0].src
    );
    
    // 4. Generate audience-appropriate copy
    const copy = await this.copyGenerator.generateEmailCopy({
      ...campaignContext,
      brandProfile
    });
    
    // 5. Select email layout based on brand style
    const layout = this.selectLayout(brandProfile.visual_style, products.length);
    
    // 6. Assemble MJML with overlay
    const mjml = await this.assembleMJMLWithOverlay({
      brandProfile,
      products,
      copy,
      overlayAnalysis,
      layout
    });
    
    // 7. Render to HTML
    const html = await this.mjmlService.renderMJMLToHTML(mjml);
    
    // 8. Save to database
    const email = await this.saveGeneratedEmail({
      userId,
      html,
      mjml,
      copy,
      products,
      metadata: {
        overlayAnalysis,
        layout,
        generatedAt: new Date()
      }
    });
    
    return {
      emailId: email.id,
      html,
      copy,
      products,
      remixOptions: {
        alternativeImages: heroProduct.images,
        alternativeHeadlines: await this.generateAlternativeHeadlines(copy.heroHeadline, 2)
      }
    };
  }
  
  async assembleMJMLWithOverlay(data: any) {
    const { brandProfile, products, copy, overlayAnalysis } = data;
    
    return `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="${brandProfile.typography.body.font}" />
      <mj-text color="${brandProfile.color_palette.text}" line-height="1.6" />
    </mj-attributes>
  </mj-head>
  
  <mj-body background-color="${brandProfile.color_palette.background}">
    
    <!-- Header with Logo -->
    <mj-section padding="20px">
      <mj-column>
        <mj-image 
          src="${brandProfile.logo_urls.primary}" 
          width="150px" 
          alt="${brandProfile.brand_name}"
        />
      </mj-column>
    </mj-section>
    
    <!-- Hero Section with Text Overlay -->
    <mj-section padding="0">
      <mj-column>
        <mj-image 
          src="${products[0].images[0].src}" 
          alt="${products[0].title}"
          href="${products[0].url}"
        />
        
        <!-- Text Overlay -->
        <mj-text 
          align="center"
          font-size="48px"
          font-weight="bold"
          color="${overlayAnalysis.textColor}"
          text-transform="uppercase"
          padding="0"
          css-class="hero-text-overlay"
        >
          ${copy.heroHeadline}
        </mj-text>
        
        <mj-text 
          align="center"
          font-size="20px"
          color="${overlayAnalysis.textColor}"
          padding="10px 20px"
        >
          ${copy.heroSubheadline}
        </mj-text>
        
        <mj-button 
          background-color="${brandProfile.color_palette.primary}"
          color="white"
          href="${products[0].url}"
          border-radius="4px"
          font-size="16px"
          padding="20px"
        >
          ${copy.primaryCTA}
        </mj-button>
      </mj-column>
    </mj-section>
    
    <!-- Body Copy -->
    <mj-section padding="40px 20px">
      <mj-column>
        <mj-text font-size="16px" line-height="1.6">
          ${copy.bodyCopy}
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Product Grid -->
    <mj-section padding="20px">
      ${products.slice(1, 5).map(product => `
        <mj-column width="50%">
          <mj-image 
            src="${product.images[0].src}" 
            alt="${product.title}"
            href="${product.url}"
          />
          <mj-text font-size="16px" font-weight="bold" align="center">
            ${product.title}
          </mj-text>
          <mj-text font-size="20px" color="${brandProfile.color_palette.primary}" align="center">
            $${product.price}
          </mj-text>
          <mj-button 
            background-color="${brandProfile.color_palette.primary}"
            href="${product.url}"
            font-size="14px"
          >
            Shop Now
          </mj-button>
        </mj-column>
      `).join('')}
    </mj-section>
    
    <!-- Footer -->
    <mj-section background-color="#f5f5f5" padding="40px 20px">
      <mj-column>
        <mj-text align="center" font-size="12px" color="#666">
          ${brandProfile.footer_template || 'You received this email as a customer of ' + brandProfile.brand_name}
        </mj-text>
        <mj-text align="center" font-size="12px">
          <a href="{{unsubscribe_url}}">Unsubscribe</a>
        </mj-text>
      </mj-column>
    </mj-section>
    
  </mj-body>
</mjml>`;
  }
}
```

---

#### **Day 10-11: Remix Feature**

**Goal:** Allow users to swap images and edit copy

##### **1. Remix API Endpoints**

```typescript
// src/routes/email-remix.routes.ts

// Get remix options for an email
GET /api/v1/emails/:emailId/remix-options
→ Returns:
{
  "alternativeHeroImages": [...],
  "alternativeHeadlines": [...],
  "alternativeSubheadlines": [...],
  "alternativeCTAs": [...]
}

// Apply remix changes
PATCH /api/v1/emails/:emailId/remix
{
  "heroImageIndex": 2, // Use 3rd image from product
  "headline": "New custom headline",
  "subheadline": "New subheadline",
  "cta": "New CTA"
}
→ Regenerates email with changes

// Swap featured product
POST /api/v1/emails/:emailId/swap-hero-product
{
  "productId": "new-product-id"
}
→ Regenerates email with new hero product
```

---

#### **Day 12-14: Frontend UI**

**Goal:** Simple, beautiful React dashboard

##### **Key Screens:**

1. **Dashboard** - List of generated emails
2. **Campaign Creator** - Multi-step form
3. **Email Preview** - Desktop/mobile toggle
4. **Remix Panel** - Swap images/edit copy
5. **Brand Setup** - Enhanced brand profile form

**Tech Stack:**
- React 18 + TypeScript
- TanStack Query (data fetching)
- Tailwind CSS (styling)
- shadcn/ui (components)

##### **Campaign Creator Flow:**

```typescript
// Step 1: Campaign Details
<CampaignForm>
  <Select label="Campaign Type">
    <option>Sale</option>
    <option>Product Launch</option>
    <option>Newsletter</option>
  </Select>
  
  <Select label="Promotion Type">
    <option>Limited Time Sale</option>
    <option>Flash Sale</option>
    <option>New Arrival</option>
  </Select>
  
  <Select label="Target Audience">
    <option>New Customers</option>
    <option>Loyal Customers</option>
    <option>VIP</option>
    <option>General</option>
  </Select>
  
  <Input label="Theme" placeholder="e.g., Evening Wear" />
  <Textarea label="Offer Description" placeholder="e.g., 20% off for today only" />
</CampaignForm>

// Step 2: Product Selection
<ProductSelector>
  <AIProductSuggestions 
    products={suggestedProducts}
    onAccept={handleAcceptSuggestions}
  />
  
  <ManualProductAdd 
    onAddByUrl={handleAddByUrl}
  />
  
  <ProductList 
    products={selectedProducts}
    onReorder={handleReorder}
    onSetFeatured={handleSetFeatured}
  />
</ProductSelector>

// Step 3: Generate & Preview
<EmailGenerator>
  <Button onClick={handleGenerate}>
    Generate Email ✨
  </Button>
  
  {isGenerating && <LoadingSpinner />}
  
  {email && (
    <EmailPreview 
      html={email.html}
      mode={previewMode} // desktop | mobile
    />
  )}
  
  <RemixPanel 
    email={email}
    onSwapImage={handleSwapImage}
    onEditCopy={handleEditCopy}
  />
</EmailGenerator>
```

---

## 📊 **V1 Feature Checklist**

### **Backend (Week 1)**
- [ ] Enhanced brand profile schema
- [ ] Brand personality analysis (AI)
- [ ] Visual style analysis (AI)
- [ ] Messaging style analysis (AI)
- [ ] Smart product selection (AI)
- [ ] Image overlay text color detection
- [ ] Audience-based copy generation
- [ ] Enhanced email generation with overlays
- [ ] Remix API endpoints

### **Frontend (Week 2)**
- [ ] Campaign creator (multi-step form)
- [ ] Product selector UI
- [ ] Email preview (desktop/mobile)
- [ ] Remix panel (swap images/edit copy)
- [ ] Brand setup wizard
- [ ] Dashboard (email list)

### **Polish**
- [ ] Error handling
- [ ] Loading states
- [ ] Success messages
- [ ] Responsive design
- [ ] Email validation

---

## 🎯 **What to Start With: Enhanced Brand Profile**

**Why?**
1. Everything depends on brand data
2. Affects all downstream features
3. One-time setup per user
4. Biggest differentiator from competitors

**Day 1 Tasks:**

1. **Update database schema** (1 hour)
   ```bash
   psql ai_email_designer < UPDATE_BRAND_PROFILE_TABLE.sql
   ```

2. **Create enhanced brand service** (4 hours)
   - Brand personality analysis
   - Visual style analysis
   - Messaging style analysis

3. **Test brand analysis** (2 hours)
   - Run on 3-5 example websites
   - Verify AI outputs are good
   - Adjust prompts if needed

**Day 2 Tasks:**

1. **Create brand API endpoints** (3 hours)
   - POST /brand/analyze-enhanced
   - GET /brand/analysis/:jobId
   - PATCH /brand/profile

2. **Test end-to-end** (2 hours)
   - Connect Shopify
   - Analyze brand
   - Verify data saved correctly

3. **Document brand profile structure** (1 hour)
   - For frontend team
   - Example responses

---

## 🚀 **Success Metrics for V1**

### **Technical**
- [ ] Email generation time < 30 seconds
- [ ] Brand analysis time < 5 minutes
- [ ] Text overlay accuracy > 85%
- [ ] Product selection relevance > 80%

### **User Experience**
- [ ] Setup time < 10 minutes
- [ ] Email generation < 5 clicks
- [ ] Preview works on desktop + mobile
- [ ] Export to Klaviyo < 10 seconds

### **Quality**
- [ ] Emails look professional
- [ ] Copy matches brand voice
- [ ] Products are relevant
- [ ] Colors/fonts match brand

---

## 💡 **Key Differentiators (vs Backstroke)**

1. **Deeper Brand Learning** ✅
   - Personality, visual style, messaging preferences
   - Not just colors/fonts

2. **Transparent AI** ✅
   - "I picked these products because..."
   - "I chose white text because image is dark"

3. **Smarter Product Selection** ✅
   - AI analyzes entire catalog
   - Explains selections

4. **Audience-Appropriate Copy** ✅
   - Different tone for new vs loyal vs VIP
   - Not generic

5. **Affordable** ✅
   - $750/month vs $3,000/month

---

## 📝 **Next Steps**

**Ready to start?**

1. I'll create the enhanced brand profile schema
2. Build the brand analysis service
3. Test on real websites
4. Move to product selection

**Which one should I build first?** 🎯

