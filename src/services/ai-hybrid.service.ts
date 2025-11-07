import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';

// Initialize clients
const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
const claude = config.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: config.ANTHROPIC_API_KEY })
  : null;

/**
 * Hybrid AI service - uses best model for each task
 */

/**
 * Generate copy (use Claude - better at copywriting)
 */
export async function generateCopy(prompt: string, options: any = {}) {
  const useClaude = config.USE_CLAUDE_FOR_COPY && claude;
  
  if (useClaude) {
    logger.info('Using Claude for copy generation');
    
    try {
      const response = await claude!.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      
      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
      
    } catch (error) {
      logger.warn('Claude failed, falling back to OpenAI', { error });
      // Fall through to OpenAI
    }
  }
  
  // Use OpenAI as fallback or default
  logger.info('Using OpenAI for copy generation');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1024,
  });
  
  return response.choices[0].message.content || '';
}

/**
 * Generate structured JSON (use Claude - better at following format)
 */
export async function generateJSON(prompt: string, options: any = {}) {
  const useClaude = config.USE_CLAUDE_FOR_COPY && claude;
  
  if (useClaude) {
    logger.info('Using Claude for JSON generation');
    
    try {
      const response = await claude!.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.3,
        messages: [{
          role: 'user',
          content: prompt + '\n\nReturn ONLY valid JSON, no markdown, no explanation.'
        }]
      });
      
      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '{}';
      
      // Clean up response (remove markdown if present)
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(cleaned);
      
    } catch (error) {
      logger.warn('Claude JSON failed, falling back to OpenAI', { error });
      // Fall through to OpenAI
    }
  }
  
  // Use OpenAI
  logger.info('Using OpenAI for JSON generation');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a JSON-only response bot. Always respond with valid JSON and nothing else.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: options.temperature || 0.3,
    response_format: { type: 'json_object' },
  });
  
  const content = response.choices[0].message.content || '{}';
  return JSON.parse(content);
}

/**
 * Analyze image (use GPT-4 Vision - only one with vision)
 */
export async function analyzeImage(imageUrl: string): Promise<string> {
  logger.info('Using GPT-4 Vision for image analysis');
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image in 1-2 sentences. Focus on the main subject, style, colors, and mood. What product category is this?',
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content || 'Image analysis unavailable';
  } catch (error) {
    logger.error('Image analysis failed', { error });
    return 'Image';
  }
}

/**
 * Calculate cost based on model used
 */
export function calculateCost(model: string, tokensUsed: number): number {
  const pricing: Record<string, number> = {
    'claude-3-5-sonnet-20241022': 0.003 / 1000, // Input
    'claude-3-sonnet': 0.003 / 1000,
    'gpt-4-turbo': 0.01 / 1000,
    'gpt-4': 0.03 / 1000,
    'gpt-4-vision-preview': 0.01 / 1000,
    'text-embedding-3-small': 0.0001 / 1000,
  };

  return (pricing[model] || 0.01 / 1000) * tokensUsed;
}

/**
 * Get recommended model for task
 */
export function getRecommendedModel(task: 'copy' | 'json' | 'vision' | 'analysis') {
  const recommendations = {
    copy: claude ? 'claude-3-5-sonnet' : 'gpt-4-turbo',
    json: claude ? 'claude-3-5-sonnet' : 'gpt-4-turbo',
    vision: 'gpt-4-vision-preview', // Only GPT-4 has vision
    analysis: claude ? 'claude-3-5-sonnet' : 'gpt-4-turbo',
  };
  
  return recommendations[task];
}

export { openai, claude };

