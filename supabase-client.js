
/*
  साहित्यिक शब्द लोक
  Supabase Client Initialization

  यह फाइल Supabase के public browser client को initialize करती है।
*/

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_CONFIGURED
} from "./supabase-config.js";

let supabase = null;

if (SUPABASE_CONFIGURED) {
  try {
    const { createClient } = await import(
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    );

    supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );

    console.info("ARS Supabase client initialized.");
  } catch (error) {
    console.error("Supabase initialization failed:", error);
  }
} else {
  console.warn(
    "Supabase is not configured. Add your Project URL and public key in supabase-config.js."
  );
}

export { supabase, SUPABASE_CONFIGURED };

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Backend अभी configure नहीं है। कृपया Supabase URL और public key सेट करें।"
    );
  }

  return supabase;
}
