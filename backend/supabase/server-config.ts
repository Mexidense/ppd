import { createClient } from '@supabase/supabase-js';

// Server-side Supabase configuration with service role key
// This bypasses RLS and should only be used in secure server-side contexts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.error('❌ CRITICAL: Supabase URL is missing. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.');
}

if (!supabaseServiceRoleKey) {
  console.error('❌ CRITICAL: Supabase Service Role Key is missing. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.');
  console.error('   This is required for admin operations like document deletion.');
  console.error('   Get it from: https://app.supabase.com/project/_/settings/api (under "service_role" section)');
}

// Create a Supabase client with service role key for admin operations
// This client bypasses Row Level Security (RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

