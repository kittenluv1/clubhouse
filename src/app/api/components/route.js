import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function DELETE(req) {
    try {
        const { userId } = await req.json(); 
        if (!userId) {
            return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (error) {
            console.error("Error deleting user:", error.message);
            return new Response(JSON.stringify({ error: "Failed to delete user" }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: "success" }), { status: 200 });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        return new Response(JSON.stringify({ error: "Failed to delete user" }), { status: 500 });
    } 
};