import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client that stores sessions in cookies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing.");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
