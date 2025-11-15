/**
 * Email Strategy Service
 * Controls how AI generates copy and selects images
 */

import { logger } from '../utils/logger.js';

export interface EmailStrategy {
  // Copy Strategy
  headlineStyle?: 'urgency' | 'benefit' | 'curiosity' | 'direct';
  copyLength?: 'concise' | 'detailed' | 'minimal';
  includeDiscount?: boolean;
  discountCode?: string;
  
  // Image Strategy
  heroImageType?: 'lifestyle' | 'product' | 'graphic' | 'collection';
  productImageStyle?: 'front' | 'styled' | 'lifestyle' | 'multi';
  imagesPerProduct?: number;
  
  // Email Goal
  emailGoal?: 'sales' | 'awareness' | 'launch' | 'engagement';
  
  // Tone modifiers
  useUrgency?: boolean;
  useSocialProof?: boolean;
  useStorytelling?: boolean;
}

/**
 * Generate headline with strategy
 */
export function generateHeadlinePrompt(
  campaignBrief: string,
  strategy: EmailStrategy,
  brandVoice: string
): string {
  const styleGuides = {
    urgency: 'Create urgency and FOMO. Use time-sensitive language.',
    benefit: 'Focus on customer benefits and value proposition.',
    curiosity: 'Create intrigue and make them want to learn more.',
    direct: 'Be straightforward and clear about the offer.'
  };

  const lengthGuides = {
    concise: 'Keep it under 40 characters. Punchy and memorable.',
    detailed: 'Can be 60-80 characters. Include more context.',
    minimal: 'Ultra-short. 20-30 characters maximum.'
  };

  return `You are an expert email copywriter.

Campaign: "${campaignBrief}"
Brand Voice: ${brandVoice}
Email Goal: ${strategy.emailGoal || 'sales'}

Headline Style: ${styleGuides[strategy.headlineStyle || 'benefit']}
Length: ${lengthGuides[strategy.copyLength || 'concise']}

${strategy.includeDiscount ? `Include: "${strategy.discountCode}" discount code` : ''}
${strategy.useUrgency ? 'Add urgency language (limited time, ending soon, etc.)' : ''}

Generate 3 headline options. Return as JSON:
{
  "headlines": [
    "Option 1 here",
    "Option 2 here", 
    "Option 3 here"
  ],
  "recommended": "Option 1 here"
}`;
}

/**
 * Generate product description with strategy
 */
export function generateProductDescriptionPrompt(
  products: any[],
  strategy: EmailStrategy,
  brandVoice: string
): string {
  const goalContext = {
    sales: 'Focus on benefits and create desire to purchase. Use action-oriented language.',
    awareness: 'Educate about product features and use cases. Be informative.',
    launch: 'Tell the product story. Build excitement and anticipation.',
    engagement: 'Create connection. Use conversational tone.'
  };

  return `You are an expert email copywriter writing product descriptions.

Brand Voice: ${brandVoice}
Email Goal: ${strategy.emailGoal || 'sales'}
Context: ${goalContext[strategy.emailGoal || 'sales']}

Products to describe:
${products.map((p, i) => `
${i + 1}. ${p.title}
   Price: $${p.price}
   ${p.description ? `Current: ${p.description.slice(0, 100)}` : ''}
`).join('\n')}

For each product, write:
- ${strategy.copyLength === 'detailed' ? '25-35 word' : '15-20 word'} description
- Focus on ${strategy.emailGoal === 'sales' ? 'benefits and value' : 'features and use cases'}
- ${strategy.useSocialProof ? 'Include social proof elements' : 'Be concise'}
- Action-oriented CTA (2-4 words)

Keep EXACT product names. Return JSON:
{
  "products": [
    {
      "name": "Exact product name",
      "description": "Compelling description",
      "ctaText": "Shop Now"
    }
  ]
}`;
}

/**
 * Select images based on strategy
 */
export function selectImagesWithStrategy(
  products: any[],
  strategy: EmailStrategy
): any[] {
  return products.map(product => {
    const allImages = product.allImages || [];
    
    if (allImages.length === 0) {
      return {
        ...product,
        selectedImages: []
      };
    }
    
    // Select images based on strategy
    let selectedImages = [];
    
    switch (strategy.productImageStyle) {
      case 'front':
        // Use first image (usually front view)
        selectedImages = [allImages[0]];
        break;
        
      case 'styled':
        // Prefer lifestyle/styled shots
        const styled = allImages.find((img: any) => 
          img.alt?.toLowerCase().includes('lifestyle') ||
          img.alt?.toLowerCase().includes('styled')
        );
        selectedImages = styled ? [styled] : [allImages[0]];
        break;
        
      case 'multi':
        // Use multiple images
        const count = strategy.imagesPerProduct || 2;
        selectedImages = allImages.slice(0, count);
        break;
        
      default:
        selectedImages = [allImages[0]];
    }
    
    return {
      ...product,
      selectedImages,
      heroCandidate: allImages[0] // Best for hero
    };
  });
}

/**
 * Select hero image based on strategy
 */
export function selectHeroImage(
  products: any[],
  strategy: EmailStrategy
): any {
  if (products.length === 0) return null;
  
  switch (strategy.heroImageType) {
    case 'lifestyle':
      // Find first product with lifestyle image
      for (const product of products) {
        const lifestyle = product.allImages?.find((img: any) =>
          img.alt?.toLowerCase().includes('lifestyle') ||
          img.alt?.toLowerCase().includes('model')
        );
        if (lifestyle) return { ...lifestyle, url: product.url };
      }
      return { ...products[0].allImages?.[0], url: products[0].url };
      
    case 'product':
      // Use first product's main image
      return { ...products[0].allImages?.[0], url: products[0].url };
      
    case 'collection':
      // Use collection image if available
      // Fallback to product image
      return { ...products[0].allImages?.[0], url: products[0].url };
      
    default:
      // Smart selection - prefer lifestyle, fallback to product
      const firstProduct = products[0];
      const bestImage = firstProduct.allImages?.find((img: any) =>
        img.alt?.toLowerCase().includes('lifestyle')
      ) || firstProduct.allImages?.[0];
      
      return { ...bestImage, url: firstProduct.url };
  }
}

export type { EmailStrategy };

