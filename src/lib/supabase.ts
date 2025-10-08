/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase config check:", {
  hasUrl: Boolean(supabaseUrl),
  hasKey: Boolean(supabaseKey),
  url: supabaseUrl,
  keyPrefix: supabaseKey?.substring(0, 20),
});

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server."
  );
  throw new Error("Supabase configuration is missing");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // DISABLE: This can cause hanging in some browsers
    flowType: "implicit", // Switch from PKCE to implicit flow
    storage: window.localStorage,
    storageKey: "supabase.auth.token",
  },
  global: {
    headers: {
      "X-Client-Info": "supabase-js-web",
    },
  },
});
