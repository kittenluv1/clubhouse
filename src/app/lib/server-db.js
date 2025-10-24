import { createClient } from "@supabase/supabase-js";

// This is to be used for DB altering calls, i.e. POST calls. A client created using the service keys get elevated privileges
// Mainly for backend logic

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Serve Role Key Key is missing.");
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

// Special client that has the authorization in header so we can check for proper authorization. Maybe this should be the default client...
export function createServerClient(authHeader) {
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );
}