import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_URL: z.string().url().optional().or(z.literal('')).transform(val => val || 'http://localhost:3000'),
  
  DATABASE_URL: z.string().url(),
  DB_POOL_SIZE: z.string().transform(Number).default('20'),
  
  REDIS_URL: z.string().url().optional(),
  
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  ENCRYPTION_KEY: z.string().length(32),
  
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),
  DEFAULT_AI_MODEL: z.string().default('claude-3-5-sonnet'),
  USE_CLAUDE_FOR_COPY: z.string().transform(val => val === 'true').default('true'),
  DEFAULT_AI_TEMPERATURE: z.string().transform(Number).default('0.7'),
  
  // Storage (Supabase or AWS)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  
  // AWS (optional if using Supabase)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  CDN_BASE_URL: z.string().url().optional(),
  
  FRONTEND_URL: z.string().url(),
  
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  BULL_CONCURRENCY: z.string().transform(Number).default('5'),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const config = parsed.data;

export default config;

