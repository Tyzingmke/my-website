import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
  publishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "",
};

export function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.publishableKey);
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;

  if (!browserClient) {
    browserClient = createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}
