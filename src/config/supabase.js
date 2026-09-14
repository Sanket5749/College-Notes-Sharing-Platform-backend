import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    '[WARNING] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables. ' +
    'Please configure your .env file before executing database or storage queries.'
  );
}

/**
 * Supabase Client initialized with the Service Role Key.
 *
 * CRITICAL SECURITY NOTICE:
 * The Service Role Key bypasses Supabase Row-Level Security (RLS) policies.
 * This client must ONLY be used on the server/backend and MUST NEVER be exposed
 * to frontend code, public clients, or bundled in browser JavaScript.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseServiceRoleKey || 'placeholder-service-role-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'notes';

export default supabase;
