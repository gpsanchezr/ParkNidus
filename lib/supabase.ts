import { createClient } from '@supabase/supabase-js'

// Validation
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is missing. Check .env.local');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is missing. Check .env.local');
}

console.log('[Supabase] Initializing with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL!.substring(0, 50) + '...');
console.log('[Supabase] Anon Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.length);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Not in .env.local, using anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

