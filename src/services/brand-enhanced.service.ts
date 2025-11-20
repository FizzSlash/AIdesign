import { Pool } from 'pg';
import * as aiService from './ai.service.js';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

interface EnhancedBrandProfile {
  id: string;
  user_id: string;
  website_url: string;
  brand_name: string;
  
  // Visual Identity
  logo_urls: {
    primary?: string;
    secondary?: string;
    icon?: string;
  };
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    overlay?: string;
  };
  typography: {
    heading: { font: string; weight: number };
    body: { font: string; weight: number };
    cta?: { font: string; weight: number };
  };
  
  // Brand Personality
  brand_personality: {
    tone: 'luxury' | 'casual' | 'playful' | 'professional' | 'minimal';
    adjectives: string[];
    voice_description: string;
    formality_level: number; // 1-5
    example_phrases?: string[];
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
    cta_style: 'action' | 'benefit' | 'urgency';
    urgency_level: 'low' | 'medium' | 'high';
    emoji_usage: 'none' | 'minimal' | 'moderate' | 'heavy';
    sentence_length: 'short' | 'medium' | 'long';
    common_ctas?: string[];
  };
  
  // References
  example_emails: Array<{
    url: string;
    screenshot?: string;
    notes: string;
    liked_elements: string[];
  }>;
  
  competitor_urls: string[];
  target_audience_primary: 'new_customers' | 'loyal' | 'vip' | 'general';
  brand_keywords: string[];
  
  // Status
  analysis_status: string;
  analysis_completed_at?: Date;
}

interface ScrapedPage {
  url: string;
  html: string;
  text: string;
  images: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
  }>;
  styles: string;
  ctas: string[];
  headlines: string[];
}

export class EnhancedBrandService {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Main entry point: Analyze website and create enhanced brand profile
   */
  async analyzeWebsiteEnhanced(
    websiteUrl: string, 
    userId: string,
    options?: {
      exampleEmails?: Array<{ url: string; notes: string }>;
      competitorUrls?: string[];
    }
  ): Promise<{ jobId: string; message: string }> {
    // Create initial brand profile with pending status
    const result = await this.db.query(
      `INSERT INTO brand_profiles (user_id, website_url, analysis_status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (user_id) 
       DO UPDATE SET website_url = $2, analysis_status = 'pending', updated_at = NOW()
       RETURNING id`,
      [userId, websiteUrl]
    );

    const brandProfileId = result.rows[0].id;

    // Start background analysis (in production, use a job queue like Bull)
    this.performEnhancedAnalysis(brandProfileId, userId, websiteUrl, options).catch(err => {
      console.error('Brand analysis failed:', err);
      this.db.query(
        `UPDATE brand_profiles SET analysis_status = 'failed', updated_at = NOW() WHERE id = $1`,
        [brandProfileId]
      );
    });

    return {
      jobId: brandProfileId,
      message: 'Brand analysis started. This will take 2-5 minutes.'
    };
  }

  /**
   * Perform the full enhanced analysis
   */
  private async performEnhancedAnalysis(
    brandProfileId: string,
    userId: string,
    websiteUrl: string,
    options?: any
  ) {
    try {
      // Update status to processing
      await this.db.query(
        `UPDATE brand_profiles SET analysis_status = 'processing' WHERE id = $1`,
        [brandProfileId]
      );

      console.log(`[Brand Analysis] Starting for ${websiteUrl}`);

      // 1. Scrape website
      console.log('[Brand Analysis] Step 1/5: Scraping website...');
      const pages = await this.scrapeWebsite(websiteUrl);

      // 2. Extract basic visual assets
      console.log('[Brand Analysis] Step 2/5: Extracting visual assets...');
      const visualAssets = await this.extractVisualAssets(pages);

      // 3. Analyze brand personality
      console.log('[Brand Analysis] Step 3/5: Analyzing brand personality...');
      const personality = await this.analyzeBrandPersonality(pages);

      // 4. Analyze visual style
      console.log('[Brand Analysis] Step 4/5: Analyzing visual style...');
      const visualStyle = await this.analyzeVisualStyle(pages, visualAssets);

      // 5. Analyze messaging patterns
      console.log('[Brand Analysis] Step 5/5: Analyzing messaging style...');
      const messaging = await this.analyzeMessagingStyle(pages);

      // 6. Save enhanced profile
      await this.saveEnhancedProfile(brandProfileId, {
        brand_name: await this.extractBrandName(pages),
        logo_urls: visualAssets.logo_urls,
        color_palette: visualAssets.color_palette,
        typography: visualAssets.typography,
        brand_personality: personality,
        visual_style: visualStyle,
        messaging_preferences: messaging,
        brand_keywords: personality.adjectives,
        example_emails: options?.exampleEmails || [],
        competitor_urls: options?.competitorUrls || []
      });

      console.log('[Brand Analysis] Complete!');

    } catch (error) {
      console.error('[Brand Analysis] Error:', error);
      throw error;
    }
  }

  /**
   * Scrape website pages
   */
  private async scrapeWebsite(websiteUrl: string): Promise<ScrapedPage[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });

    const pages: ScrapedPage[] = [];
    const pagesToScrape = [
      '/',
      '/products',
      '/collections',
      '/shop',
      '/about'
    ];

    try {
      for (const path of pagesToScrape) {
        try {
          const page = await browser.newPage();
          const url = new URL(path, websiteUrl).toString();
          
          await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
          });

          // Extract page data
          const pageData = await page.evaluate(() => {
            // Get text content
            const text = document.body.innerText;

            // Get images
            const images = Array.from(document.images).map(img => ({
              src: img.src,
              alt: img.alt || '',
              width: img.naturalWidth,
              height: img.naturalHeight
            }));

            // Get CTAs (buttons and links with common CTA text)
            const ctaElements = Array.from(document.querySelectorAll('a, button'));
            const ctas = ctaElements
              .map(el => el.textContent?.trim() || '')
              .filter(text => text.length > 0 && text.length < 30);

            // Get headlines (h1, h2)
            const headlineElements = Array.from(document.querySelectorAll('h1, h2'));
            const headlines = headlineElements
              .map(el => el.textContent?.trim() || '')
              .filter(text => text.length > 0);

            // Get computed styles (simplified)
            const styles = Array.from(document.styleSheets)
              .map(sheet => {
                try {
                  return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
                } catch (e) {
                  return '';
                }
              })
              .join('\n');

            return {
              html: document.documentElement.outerHTML,
              text,
              images,
              ctas: Array.from(new Set(ctas)), // Remove duplicates
              headlines,
              styles
            };
          });

          pages.push({
            url,
            ...pageData
          });

          await page.close();
        } catch (error) {
          console.warn(`Failed to scrape ${path}:`, error);
          // Continue with other pages
        }
      }
    } finally {
      await browser.close();
    }

    return pages;
  }

  /**
   * Extract visual assets (colors, fonts, logos)
   */
  private async extractVisualAssets(pages: ScrapedPage[]) {
    const homepage = pages[0];
    
    // Extract colors from CSS
    const colors = this.extractColors(homepage.styles);
    
    // Extract fonts
    const fonts = this.extractFonts(homepage.styles);
    
    // Find logo (largest image in header, or image with "logo" in alt/src)
    const logo = homepage.images.find(img => 
      img.alt.toLowerCase().includes('logo') ||
      img.src.toLowerCase().includes('logo')
    ) || homepage.images[0];

    return {
      logo_urls: {
        primary: logo?.src
      },
      color_palette: {
        primary: colors[0] || '#000000',
        secondary: colors[1] || '#666666',
        accent: colors[2] || '#0066cc',
        background: '#ffffff',
        text: '#000000'
      },
      typography: {
        heading: { font: fonts[0] || 'Arial', weight: 700 },
        body: { font: fonts[1] || fonts[0] || 'Arial', weight: 400 }
      }
    };
  }

  /**
   * Extract colors from CSS
   */
  private extractColors(css: string): string[] {
    const colorRegex = /#[0-9A-Fa-f]{6}|rgb\([^)]+\)/g;
    const matches = css.match(colorRegex) || [];
    
    // Count frequency
    const colorCounts = new Map<string, number>();
    matches.forEach(color => {
      const normalized = this.normalizeColor(color);
      colorCounts.set(normalized, (colorCounts.get(normalized) || 0) + 1);
    });

    // Sort by frequency and return top colors
    return Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color)
      .slice(0, 5);
  }

  /**
   * Normalize color to hex format
   */
  private normalizeColor(color: string): string {
    if (color.startsWith('#')) {
      return color.toUpperCase();
    }
    
    // Convert rgb to hex (simplified)
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    }
    
    return color;
  }

  /**
   * Extract fonts from CSS
   */
  private extractFonts(css: string): string[] {
    const fontRegex = /font-family:\s*([^;]+)/g;
    const matches = Array.from(css.matchAll(fontRegex));
    
    const fonts = matches
      .map(match => match[1].split(',')[0].trim().replace(/['"]/g, ''))
      .filter(font => !font.includes('inherit') && !font.includes('initial'));

    return Array.from(new Set(fonts)).slice(0, 3);
  }

  /**
   * Extract brand name from pages
   */
  private async extractBrandName(pages: ScrapedPage[]): Promise<string> {
    const homepage = pages[0];
    
    // Try to find brand name in title, h1, or logo alt text
    const $ = cheerio.load(homepage.html);
    
    const title = $('title').text().split('|')[0].split('-')[0].trim();
    const h1 = $('h1').first().text().trim();
    const logoAlt = $('img[alt*="logo"]').attr('alt') || '';
    
    return title || h1 || logoAlt || 'Brand';
  }

  /**
   * Analyze brand personality with AI
   */
  private async analyzeBrandPersonality(pages: ScrapedPage[]) {
    const textContent = pages
      .map(p => p.text)
      .join('\n')
      .slice(0, 3000); // Limit to first 3000 chars

    const prompt = `Analyze this brand's personality and voice based on their website content:

${textContent}

Determine:
1. Overall tone (luxury, casual, playful, professional, or minimal)
2. 3-5 adjectives that describe the brand
3. A 2-3 sentence description of their brand voice
4. Formality level (1=very casual, 5=very formal)
5. 3 example phrases that exemplify their voice

Return ONLY valid JSON (no markdown):
{
  "tone": "luxury|casual|playful|professional|minimal",
  "adjectives": ["adjective1", "adjective2", "adjective3"],
  "voice_description": "description here",
  "formality_level": 1-5,
  "example_phrases": ["phrase1", "phrase2", "phrase3"]
}`;

    const response = await aiService.generateText({
      prompt,
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 500
    });

    return JSON.parse(response);
  }

  /**
   * Analyze visual style
   */
  private async analyzeVisualStyle(pages: ScrapedPage[], assets: any) {
    const homepage = pages[0];
    
    // Simple heuristic-based analysis
    // In production, you could use GPT-4 Vision for more accuracy
    
    const hasLifestyleImages = homepage.images.some(img => 
      img.width > 800 && img.height > 600
    );
    
    const hasProductImages = homepage.images.some(img =>
      img.alt.toLowerCase().includes('product')
    );

    return {
      layout_preference: 'minimal', // Default, can be enhanced with AI
      image_style: hasLifestyleImages ? 'lifestyle' : hasProductImages ? 'product-only' : 'mixed',
      overlay_style: 'dark', // Default
      spacing: 'normal'
    };
  }

  /**
   * Analyze messaging style
   */
  private async analyzeMessagingStyle(pages: ScrapedPage[]) {
    const allCTAs = pages.flatMap(p => p.ctas).slice(0, 50);
    const allHeadlines = pages.flatMap(p => p.headlines).slice(0, 20);

    const prompt = `Analyze the messaging style from these CTAs and headlines:

CTAs: ${allCTAs.join(', ')}
Headlines: ${allHeadlines.join(', ')}

Determine:
1. CTA style: "action" (Shop Now, Buy), "benefit" (Discover, Explore), or "urgency" (Limited Time, Hurry)
2. Urgency level: low, medium, or high
3. Emoji usage: none, minimal, moderate, or heavy
4. Sentence length: short (< 10 words), medium (10-20 words), or long (> 20 words)
5. Top 5 most common CTAs they use

Return ONLY valid JSON (no markdown):
{
  "cta_style": "action|benefit|urgency",
  "urgency_level": "low|medium|high",
  "emoji_usage": "none|minimal|moderate|heavy",
  "sentence_length": "short|medium|long",
  "common_ctas": ["cta1", "cta2", "cta3", "cta4", "cta5"]
}`;

    const response = await aiService.generateText({
      prompt,
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 300
    });

    return JSON.parse(response);
  }

  /**
   * Save enhanced profile to database
   */
  private async saveEnhancedProfile(brandProfileId: string, data: any) {
    await this.db.query(
      `UPDATE brand_profiles 
       SET 
         brand_name = $1,
         logo_urls = $2,
         color_palette = $3,
         typography = $4,
         brand_personality = $5,
         visual_style = $6,
         messaging_preferences = $7,
         brand_keywords = $8,
         example_emails = $9,
         competitor_urls = $10,
         analysis_status = 'completed',
         analysis_completed_at = NOW(),
         updated_at = NOW()
       WHERE id = $11`,
      [
        data.brand_name,
        JSON.stringify(data.logo_urls),
        JSON.stringify(data.color_palette),
        JSON.stringify(data.typography),
        JSON.stringify(data.brand_personality),
        JSON.stringify(data.visual_style),
        JSON.stringify(data.messaging_preferences),
        data.brand_keywords,
        JSON.stringify(data.example_emails),
        data.competitor_urls,
        brandProfileId
      ]
    );
  }

  /**
   * Get enhanced brand profile
   */
  async getEnhancedProfile(userId: string): Promise<EnhancedBrandProfile | null> {
    const result = await this.db.query(
      `SELECT * FROM brand_profiles WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as EnhancedBrandProfile;
  }

  /**
   * Get analysis status
   */
  async getAnalysisStatus(jobId: string) {
    const result = await this.db.query(
      `SELECT analysis_status, analysis_completed_at, updated_at 
       FROM brand_profiles 
       WHERE id = $1`,
      [jobId]
    );

    if (result.rows.length === 0) {
      return { status: 'not_found' };
    }

    const row = result.rows[0];
    return {
      status: row.analysis_status,
      completedAt: row.analysis_completed_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Update brand profile (manual refinement)
   */
  async updateProfile(userId: string, updates: Partial<EnhancedBrandProfile>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.brand_personality) {
      fields.push(`brand_personality = $${paramCount++}`);
      values.push(JSON.stringify(updates.brand_personality));
    }

    if (updates.visual_style) {
      fields.push(`visual_style = $${paramCount++}`);
      values.push(JSON.stringify(updates.visual_style));
    }

    if (updates.messaging_preferences) {
      fields.push(`messaging_preferences = $${paramCount++}`);
      values.push(JSON.stringify(updates.messaging_preferences));
    }

    if (updates.target_audience_primary) {
      fields.push(`target_audience_primary = $${paramCount++}`);
      values.push(updates.target_audience_primary);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    await this.db.query(
      `UPDATE brand_profiles SET ${fields.join(', ')} WHERE user_id = $${paramCount}`,
      values
    );
  }
}

