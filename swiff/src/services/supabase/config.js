import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Create Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Log configuration status
if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase is not configured!');
  console.warn('Please add your Supabase credentials to .env.local');
  console.warn('See QUICKSTART.md for setup instructions');
}

export default supabase;
