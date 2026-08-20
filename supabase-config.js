// WBSL Supabase configuration
// IMPORTANT: Put ONLY the public Project URL and Publishable/anon key here.
// NEVER put service_role or secret keys in GitHub Pages.

export const SUPABASE_URL = 'PASTE_YOUR_SUPABASE_PROJECT_URL_HERE';
export const SUPABASE_ANON_KEY = 'PASTE_YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE';

export const SUPABASE_CONFIGURED =
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('PASTE_YOUR_') &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes('PASTE_YOUR_');
