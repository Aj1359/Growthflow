import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!rawUrl || !rawKey) {
  throw new Error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variable is missing.');
}

export const isSupabaseConfigured = true;

export const supabase: SupabaseClient = createClient(rawUrl, rawKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type AuthUser = {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  platform_admin?: boolean;
};
