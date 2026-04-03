import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Please define the SUPABASE_URL environment variable in .env');
}
if (!supabaseServiceRoleKey) {
  throw new Error('Please define the SUPABASE_SERVICE_ROLE_KEY environment variable in .env');
}

// Service-role client: bypasses Row Level Security — only use server-side
let _supabase;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _supabase;
}
