import { createClient } from "@supabase/supabase-js";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// In Docker dev, SUPABASE_INTERNAL_URL=http://kong:8000 (container-to-container).
// In all other environments it is unset, so we fall back to NEXT_PUBLIC_SUPABASE_URL.
const supabaseUrl =
  process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Service Role Key is missing.");
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export function createServerClient(authHeader) {
  if (!authHeader) {
    throw new Error("No authorization header provided");
  }

  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

export async function createAuthenticatedClient() {
  const cookieStore = await cookies();

  return createSSRClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore.
        }
      },
    },
  });
}
