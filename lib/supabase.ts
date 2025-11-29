import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton pattern to prevent multiple client instances
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // This helps with OAuth callbacks
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        storageKey: "sb-auth-token",
      },
    }
  );

  return supabaseInstance;
}

// Export the singleton instance
export const supabase = getSupabaseClient();
