import OpenAI from 'openai';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

export interface IntentAnalysis {
  campaignType: string;
  primaryAction: string;
  targetAudience: string;
  urgency: string;
  keyProducts: string[];
  tone: string;
  suggestedSubjectLines: string[];
  previewText: string;
  estimatedSections: string[];
}

export interface HeroSection {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  suggestedImage: string;
}

export interface ProductGridContent {
  products: Array<{
    name: string;
    description: string;
    price?: string;
    ctaText: string;
  }>;
}

/**
 * Analyze campaign intent from brief
 */
export async function analyzeIntent(
  campaignBrief: string,
  brandProfile: any,
  options: any = {}
): Promise<IntentAnalysis> {
  const prompt = `You are an email marketing strategist. Analyze this campaign brief and extract key information.

Brand Context:
- Brand Name: ${brandProfile.brand_name || 'Unknown'}
- Brand Voice: ${brandProfile.brand_voice || 'professional'}
- Industry: ${brandProfile.category || 'e-commerce'}

Campaign Brief:
"${campaignBrief}"

Additional Options:
${JSON.stringify(options, null, 2)}

Return ONLY a JSON object (no markdown, no extra text) with these exact fields:
{
  "campaignType": "(promotional|product_launch|newsletter|abandoned_cart|seasonal)",
  "primaryAction": "(drive_sales|build_awareness|educate|nurture)",
  "targetAudience": "(new_customers|existing_customers|vip|lapsed)",
  "urgency": "(low|medium|high)",
  "keyProducts": ["array of product categories or names"],
  "tone": "(luxury|casual|playful|professional|urgent)",
  "suggestedSubjectLines": ["array of 3 subject line options"],
  "previewText": "suggested preview text",
  "estimatedSections": ["hero", "product_grid", "cta", "footer"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only response bot. Always respond with valid JSON and nothing else.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    const analysis = JSON.parse(content);

    logger.info('Intent analyzed', { campaignBrief: campaignBrief.slice(0, 50) });

    return analysis as IntentAnalysis;
  } catch (error) {
    logger.error('Intent analysis failed', { error });
    throw error;
  }
}

/**
 * Generate hero section content
 */
export async function generateHeroSection(
  intent: IntentAnalysis,
  brandProfile: any
): Promise<HeroSection> {
  const prompt = `Generate the hero section for an email campaign.

Brand Profile:
- Name: ${brandProfile.brand_name || 'Unknown'}
- Voice: ${brandProfile.brand_voice || 'professional'}
- Tone for this campaign: ${intent.tone}

Campaign Intent:
- Type: ${intent.campaignType}
- Primary Action: ${intent.primaryAction}
- Target Audience: ${intent.targetAudience}
- Urgency: ${intent.urgency}

Generate:
1. Main headline (40-60 characters, attention-grabbing)
2. Subheadline (60-90 characters, provide context)
3. Primary CTA text (2-4 words, action-oriented)
4. CTA link placeholder
5. Suggested image description

Return ONLY valid JSON with these exact fields:
{
  "headline": "string",
  "subheadline": "string",
  "ctaText": "string",
  "ctaLink": "placeholder_url",
  "suggestedImage": "description of ideal hero image"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only response bot. Always respond with valid JSON and nothing else.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content) as HeroSection;
  } catch (error) {
    logger.error('Hero generation failed', { error });
    throw error;
  }
}

/**
 * Generate product grid content
 */
export async function generateProductGrid(
  intent: IntentAnalysis,
  brandProfile: any,
  products: any[] = []
): Promise<ProductGridContent> {
  // Use actual product data if provided
  if (products.length > 0) {
    const prompt = `You are an expert email copywriter. Enhance these product descriptions for an email campaign.

Brand Voice: ${brandProfile.brand_voice || 'professional'}
Campaign Type: ${intent.campaignType}

ACTUAL PRODUCTS from the store:
${products.map((p, i) => `
${i + 1}. ${p.title || p.name}
   Price: $${p.price}
   Current description: ${p.description || 'No description'}
`).join('\n')}

For each product above, write:
- A compelling 15-25 word description that highlights benefits
- An action-oriented CTA (2-4 words)
- Keep the EXACT product name

Return ONLY valid JSON:
{
  "products": [
    {
      "name": "EXACT product name from above",
      "description": "Benefit-focused description",
      "ctaText": "Shop Now"
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON-only response bot. Always respond with valid JSON and nothing else.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';
      const generated = JSON.parse(content) as ProductGridContent;
      
      // Merge AI descriptions with actual product data
      return {
        products: products.slice(0, 6).map((product, i) => ({
          name: product.title || product.name,
          description: generated.products[i]?.description || product.description || '',
          price: product.price ? `$${product.price}` : undefined,
          ctaText: generated.products[i]?.ctaText || 'Shop Now'
        }))
      };
    } catch (error) {
      logger.error('Product grid generation failed', { error });
      // Fallback to using products as-is
      return {
        products: products.slice(0, 6).map(p => ({
          name: p.title || p.name,
          description: p.description || '',
          price: p.price ? `$${p.price}` : undefined,
          ctaText: 'Shop Now'
        }))
      };
    }
  }
  
  // Fallback if no products provided
  return { products: [] };
}

/**
 * Generate complete email copy
 */
export async function generateEmailCopy(
  campaignBrief: string,
  brandProfile: any,
  intent: IntentAnalysis
): Promise<string> {
  const prompt = `Write compelling email copy for this campaign.

Brand: ${brandProfile.brand_name}
Voice: ${brandProfile.brand_voice}
Campaign: ${campaignBrief}
Type: ${intent.campaignType}
Tone: ${intent.tone}

Write 2-3 paragraphs of body copy that:
- Matches the brand voice
- Supports the campaign goal
- Encourages the primary action
- Is scannable and concise

Return ONLY the copy text, no JSON, no formatting.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    logger.error('Email copy generation failed', { error });
    throw error;
  }
}

/**
 * Select best images using AI vision (if available)
 */
export async function analyzeImage(imageUrl: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image in 1-2 sentences. Focus on the main subject, style, and mood.',
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 100,
    });

    return response.choices[0].message.content || 'Image analysis unavailable';
  } catch (error) {
    logger.warn('Image analysis failed, skipping', { error });
    return 'Image';
  }
}

/**
 * Generate text embeddings for semantic search
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    logger.error('Embedding generation failed', { error });
    throw error;
  }
}

/**
 * Generic text generation function
 */
export async function generateText(options: {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const {
    prompt,
    model = 'gpt-4-turbo',
    temperature = 0.7,
    maxTokens = 1000
  } = options;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    logger.info('AI text generated', {
      model,
      tokensUsed: completion.usage?.total_tokens,
      cost: calculateCost(model, completion.usage?.total_tokens || 0),
    });

    return content;
  } catch (error: any) {
    logger.error('AI text generation failed', { error: error.message });
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

/**
 * Track token usage and cost
 */
export function calculateCost(model: string, tokensUsed: number): number {
  const pricing: Record<string, number> = {
    'gpt-4-turbo': 0.01 / 1000, // $0.01 per 1K tokens (average)
    'gpt-4': 0.03 / 1000,
    'gpt-3.5-turbo': 0.002 / 1000,
    'text-embedding-3-small': 0.0001 / 1000,
  };

  return (pricing[model] || 0.01 / 1000) * tokensUsed;
}

