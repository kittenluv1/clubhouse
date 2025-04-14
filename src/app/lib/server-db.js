import { createClient } from '@supabase/supabase-js';

// This is to be used for DB altering calls, i.e. POST calls. A client created using the service keys get elevated privileges
// Mainly for backend logic

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase URL or Service Role Key is missing.");
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);