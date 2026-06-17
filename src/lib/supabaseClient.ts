import { createClient } from "@supabase/supabase-js";

let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// Sanitize URL: strip trailing /rest/v1/ or /rest/v1 or trailing slashes
if (rawUrl.endsWith("/rest/v1/")) {
  rawUrl = rawUrl.slice(0, -9);
} else if (rawUrl.endsWith("/rest/v1")) {
  rawUrl = rawUrl.slice(0, -8);
}
if (rawUrl.endsWith("/")) {
  rawUrl = rawUrl.slice(0, -1);
}

const supabaseUrl = rawUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
