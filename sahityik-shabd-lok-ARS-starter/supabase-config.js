// Supabase project settings. Replace these placeholders after creating your project.
// Only the Project URL and anon/publishable key belong here. NEVER add service_role/secret key.
export const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY";
export const isSupabaseConfigured = !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_");