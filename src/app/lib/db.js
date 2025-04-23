import { createClient } from '@supabase/supabase-js';

// This is to be used for simple GET calls, a client created with the Public Supabase key has limited privilege
// Used on client-side

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Service Role Key is missing.");
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);