import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  APP_BRAND: z.enum(['reachflow', 'growthflow']).default('growthflow'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_JWKS_URL: z.string().url().optional(),
  ENCRYPTION_KEY: z.string().min(1, 'ENCRYPTION_KEY is required'),
  META_APP_ID: z.string().min(1, 'META_APP_ID is required'),
  META_APP_SECRET: z.string().min(1, 'META_APP_SECRET is required'),
  WEBHOOK_VERIFY_TOKEN: z.string().min(1, 'WEBHOOK_VERIFY_TOKEN is required'),
  CRON_SECRET: z.string().min(1, 'CRON_SECRET is required'),
  FRONTEND_ORIGIN: z.string().min(1, 'FRONTEND_ORIGIN is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

export const env = envSchema.parse(process.env);
