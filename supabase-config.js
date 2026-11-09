
/*
  साहित्यिक शब्द लोक - Supabase Configuration

  Supabase Dashboard से:
  Project Settings → API
  Project URL और Publishable/anon key यहाँ डालें।

  IMPORTANT:
  यहाँ कभी भी service_role या secret key न डालें।
*/

export const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";

export const SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";

export const SUPABASE_CONFIGURED =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("YOUR_SUPABASE") &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");

export const SITE_NAME = "साहित्यिक शब्द लोक";
export const BRAND_NAME = "Adarsh Raj Shayar";
export const BRAND_SHORT_NAME = "ARS";

export const YOUTUBE_URL = "https://www.youtube.com/@Adarshshyari";

// Instagram link बाद में Admin Settings से जोड़ा जा सकता है।
export const INSTAGRAM_URL = "";

export const DEFAULT_CONTACT_EMAIL = "";
