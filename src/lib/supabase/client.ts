import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Browser client (client components). Uses the anon key only.
 */
export function createBrowserClient() {
  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/**
 * Server client bound to the request cookies (anon key).
 * Used for public reads and to resolve the current admin user session.
 */
export async function createServerClientBound() {
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // called from a Server Component; safe to ignore for middleware writes
        }
      },
    },
  });
}

/**
 * Plain anon client (no cookie handling). For non-request server contexts
 * such as sitemap generation and background tasks.
 */
export function createAnonClient() {
  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client. SERVER ONLY — never expose to the browser.
 * Bypasses RLS; used for admin CRUD and auth admin operations.
 */
export function createServiceClient() {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasSupabaseEnv() {
  return Boolean(url && anonKey);
}

export function getSupabaseUrl() {
  return url;
}
