import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;
let portalClient: ReturnType<typeof createClient> | null = null;

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function getSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return browserClient;
}

export function getSupabasePortalClient() {
  if (!hasSupabaseConfig()) return null;
  if (!portalClient) portalClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storageKey: "enzothome-portal-auth", detectSessionInUrl: false } },
  );
  return portalClient;
}
