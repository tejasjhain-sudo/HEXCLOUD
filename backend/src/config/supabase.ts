import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://eelpwxsjqindjccbdzgo.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_vNcIIiQR3vme628zfBmgQA_nHrrYlbv';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Public client — validates JWT via auth.getUser */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Server client — bypasses RLS for jobs & admin writes. Falls back to anon in dev. */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export function hasServiceRole(): boolean {
  return Boolean(supabaseServiceKey);
}
