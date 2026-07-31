// These are Supabase publishable credentials, already exposed to the browser in
// legacy/js/main.js. Netlify environment variables take precedence so the
// project can be moved or keys rotated without changing function code.
const FALLBACK_SUPABASE_URL = 'https://wqyfxyzqgtndgmyobxfc.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_dAeQs8XgnG8BBHAaVfzoxA_pwJyQk-f';

function getSupabaseConfig() {
  return {
    supabaseUrl: process.env.SUPABASE_URL || FALLBACK_SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY
  };
}

module.exports = { getSupabaseConfig };
