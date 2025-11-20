import { Pool } from 'pg';
import * as aiService from './ai.service.js';

interface ComprehensiveBrandAudit {
  // Brand Identity
  brandIdentity: {
    marketPosition: 'mid-tier' | 'luxury' | 'premium' | 'value' | 'ultra-luxury';
    targetDemographic: {
      ageRange: string;
      incomeLevel: string;
      lifestyle: string;
      psychographic: string;
    };
    brandArchetype: string;
    brandScore: number; // 1-10
    brandSummary: string; // 2-3 sentence executive summary
  };
  
  // Visual DNA
  visualDNA: {
    aesthetic: string;
    colorPsychology: {
      primary: { hex: string; meaning: string; emotion: string };
      secondary: { hex: string; meaning: string };
      accent: { hex: string; purpose: string };
      temperature: 'warm' | 'cool' | 'neutral';
      colorStory: string;
    };
    typography: {
      headingFont: { name: string; personality: string };
      bodyFont: { name: string; readability: string };
      fontPairing: string;
    };
    imageryStyle: {
      photographyStyle: string;
      composition: string;
      emotionalTone: string;
    };
  };
  
  // Copy Audit
  copyAudit: {
    writingStyle: {
      sentenceLength: string;
      complexity: string;
      readingLevel: string;
    };
    headlineFormulas: Array<{
      pattern: string;
      example: string;
      effectiveness: string;
    }>;
    voiceCharacteristics: {
      perspective: string; // "you-focused", "we-focused"
      formality: number; // 1-10
      tone: string;
    };
    emotionalDrivers: Array<{
      emotion: string;
      frequency: string;
      examples: string[];
    }>;
    messagingPillars: Array<{
      theme: string;
      description: string;
      examples: string[];
    }>;
  };
  
  // Email Recommendations
  emailPlaybook: {
    recommendedLayouts: Array<{
      name: string;
      description: string;
      whenToUse: string;
      example: string;
    }>;
    headlineTemplates: Array<{
      template: string;
      example: string;
      whenToUse: string;
    }>;
    subjectLineFormulas: Array<{
      formula: string;
      examples: string[];
      audiencefit: string;
    }>;
    audienceGuidelines: {
      newCustomers: {
        tone: string;
        focus: string;
        ctas: string[];
      };
      loyal: {
        tone: string;
        focus: string;
        ctas: string[];
      };
      vip: {
        tone: string;
        focus: string;
        ctas: string[];
      };
    };
  };
}

export class DeepBrandAuditService {
  private db: Pool;
  
  constructor(db: Pool) {
    this.db = db;
  }
  
  /**
   * Perform comprehensive brand audit
   */
  async performDeepAudit(
    websiteText: string,
    headlines: string[],
    ctas: string[],
    productDescriptions: string[],
    aboutContent: string,
    images: Array<{ url: string; alt: string }>
  ): Promise<ComprehensiveBrandAudit> {
    
    console.log('[Deep Audit] Starting comprehensive brand analysis...');
    
    // Run all analyses in parallel
    const [
      brandIdentity,
      visualDNA,
      copyAudit,
      emailPlaybook
    ] = await Promise.all([
      this.analyzeBrandIdentity(websiteText, aboutContent, productDescriptions),
      this.analyzeVisualDNA(images, websiteText),
      this.analyzeCopyComprehensive(headlines, ctas, websiteText, productDescriptions),
      this.generateEmailPlaybook(websiteText, headlines, ctas)
    ]);
    
    console.log('[Deep Audit] All analyses complete!');
    
    return {
      brandIdentity,
      visualDNA,
      copyAudit,
      emailPlaybook
    };
  }
  
  /**
   * Analyze brand identity and positioning
   */
  private async analyzeBrandIdentity(
    websiteText: string,
    aboutContent: string,
    productDescriptions: string[]
  ) {
    const prompt = `Perform a comprehensive brand identity analysis:

WEBSITE CONTENT:
${websiteText.slice(0, 2000)}

ABOUT SECTION:
${aboutContent.slice(0, 1000)}

SAMPLE PRODUCTS:
${productDescriptions.slice(0, 5).join('\n')}

Analyze and return ONLY valid JSON:
{
  "marketPosition": "luxury|premium|mid-tier|value|ultra-luxury",
  "targetDemographic": {
    "ageRange": "e.g., 25-45",
    "incomeLevel": "e.g., middle to upper-middle",
    "lifestyle": "e.g., urban professionals, busy moms",
    "psychographic": "e.g., confident, style-conscious, value-driven"
  },
  "brandArchetype": "Choose ONE: hero, sage, explorer, innocent, ruler, creator, caregiver, magician, lover, jester, everyman, rebel",
  "brandScore": 1-10,
  "brandSummary": "2-3 sentence executive summary of this brand",
  "valueProp": "Primary value proposition",
  "differentiators": ["key differentiator 1", "key differentiator 2", "key differentiator 3"]
}`;

    const response = await aiService.generateText({
      prompt,
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 800
    });
    
    return JSON.parse(response);
  }
  
  /**
   * Deep visual analysis
   */
  private async analyzeVisualDNA(
    images: Array<{ url: string; alt: string }>,
    websiteText: string
  ) {
    const prompt = `Analyze this brand's visual DNA:

IMAGES FOUND: ${images.slice(0, 10).map(img => img.alt || img.url).join(', ')}

WEBSITE TEXT (for context):
${websiteText.slice(0, 1000)}

Provide a comprehensive visual analysis. Return ONLY valid JSON:
{
  "aesthetic": "e.g., modern minimalist, editorial luxury, playful contemporary",
  "colorPsychology": {
    "primary": {
      "hex": "#000000",
      "meaning": "sophistication, elegance",
      "emotion": "confident, powerful"
    },
    "temperature": "warm|cool|neutral",
    "colorStory": "How colors work together and what they communicate"
  },
  "typography": {
    "headingFont": {
      "name": "detected font name",
      "personality": "bold, modern, sophisticated"
    },
    "bodyFont": {
      "name": "detected font name",
      "readability": "excellent, clean, professional"
    },
    "fontPairing": "How fonts work together"
  },
  "imageryStyle": {
    "photographyStyle": "e.g., lifestyle-focused, product-forward, editorial",
    "composition": "e.g., clean backgrounds, centered subjects",
    "emotionalTone": "e.g., aspirational, relatable, confident"
  },
  "designPhilosophy": "Overall design approach in 2-3 sentences"
}`;

    const response = await aiService.generateText({
      prompt,
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1000
    });
    
    return JSON.parse(response);
  }
  
  /**
   * Comprehensive copy analysis
   */
  private async analyzeCopyComprehensive(
    headlines: string[],
    ctas: string[],
    websiteText: string,
    productDescriptions: string[]
  ) {
    const prompt = `Perform a deep copy and messaging audit:

HEADLINES:
${headlines.slice(0, 10).join('\n')}

CTAs:
${ctas.slice(0, 20).join(', ')}

WEBSITE COPY SAMPLE:
${websiteText.slice(0, 1500)}

PRODUCT DESCRIPTIONS:
${productDescriptions.slice(0, 3).join('\n---\n')}

Analyze writing style, patterns, and emotional drivers. Return ONLY valid JSON:
{
  "writingStyle": {
    "sentenceLength": "short and punchy|medium|long and descriptive",
    "complexity": "simple|moderate|sophisticated",
    "readingLevel": "grade 6-8|grade 9-12|college level"
  },
  "headlineFormulas": [
    {
      "pattern": "e.g., [Emotion] + [Benefit]",
      "example": "actual headline that matches",
      "effectiveness": "high|medium|low"
    }
  ],
  "voiceCharacteristics": {
    "perspective": "you-focused|we-focused|brand-focused",
    "formality": 1-10,
    "tone": "confident, aspirational, friendly, etc."
  },
  "emotionalDrivers": [
    {
      "emotion": "e.g., confidence, empowerment, joy",
      "frequency": "high|medium|low",
      "examples": ["example phrase 1", "example phrase 2"]
    }
  ],
  "messagingPillars": [
    {
      "theme": "e.g., Quality, Versatility, Affordability",
      "description": "how this theme is communicated",
      "examples": ["example 1", "example 2"]
    }
  ],
  "copyStrengths": ["strength 1", "strength 2", "strength 3"],
  "copyOpportunities": ["opportunity 1", "opportunity 2"]
}`;

    const response = await aiService.generateText({
      prompt,
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1500
    });
    
    return JSON.parse(response);
  }
  
  /**
   * Generate email playbook with actionable recommendations
   */
  private async generateEmailPlaybook(
    websiteText: string,
    headlines: string[],
    ctas: string[]
  ) {
    const prompt = `Based on this brand, create an email marketing playbook:

BRAND CONTEXT:
${websiteText.slice(0, 2000)}

HEADLINES:
${headlines.slice(0, 10).join('\n')}

CTAs:
${ctas.slice(0, 20).join(', ')}

Generate actionable email recommendations. Return ONLY valid JSON:
{
  "recommendedLayouts": [
    {
      "name": "e.g., Hero + 2-Column Product Grid",
      "description": "Clean hero image with text overlay, followed by 4-6 products in 2-column grid",
      "whenToUse": "Sales, new arrivals, seasonal promotions",
      "rationale": "Matches minimalist aesthetic, balances visual impact with product focus"
    }
  ],
  "headlineTemplates": [
    {
      "template": "e.g., [Emotion] + [Product] + For + [Occasion]",
      "example": "Confident Styles for Every Occasion",
      "whenToUse": "New collection launches, seasonal campaigns"
    }
  ],
  "subjectLineFormulas": [
    {
      "formula": "e.g., [Benefit] + [Product] + [Urgency]",
      "examples": ["Your Perfect Fit is Here - Limited Time", "Wardrobe Staples You'll Love - Shop Now"],
      "audienceFit": "Works best for loyal customers"
    }
  ],
  "audienceGuidelines": {
    "newCustomers": {
      "tone": "welcoming, educational, reassuring",
      "focus": "value proposition, quality, fit guidance, easy returns",
      "ctas": ["Explore the Collection", "Find Your Fit", "Shop New Arrivals"]
    },
    "loyal": {
      "tone": "appreciative, familiar, exclusive",
      "focus": "early access, VIP perks, new arrivals, rewards",
      "ctas": ["Shop Your Favorites", "See What's New", "Get Early Access"]
    },
    "vip": {
      "tone": "premium, curated, insider",
      "focus": "exclusivity, limited editions, personal styling",
      "ctas": ["Shop VIP Exclusive", "Your Personal Picks", "Members Only"]
    }
  },
  "doThis": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ],
  "avoidThis": [
    "What not to do 1",
    "What not to do 2"
  ]
}`;

    const response = await aiService.generateText({
      prompt,
      model: 'gpt-4',
      temperature: 0.4,
      maxTokens: 2000
    });
    
    return JSON.parse(response);
  }
}

