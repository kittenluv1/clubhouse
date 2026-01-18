import { createAuthenticatedClient } from "../../lib/server-db";

// POST: create a save (body: { club_id })
export async function POST(req) {
    try {
        const supabase = await createAuthenticatedClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized - please sign in" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const body = await req.json();
        const club_id = body?.club_id;
        if (!club_id) {
            return new Response(JSON.stringify({ error: 'Missing club_id in request body' }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const userId = user.id;

        const { data, error } = await supabase
            .from('club_saves')
            .insert([{ club_id, user_id: userId }])
            .select();

        if (error) {
            // Handle unique constraint gracefully if configured
            const msg = error.message || 'Database error';
            if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
                return new Response(JSON.stringify({ message: 'Already saved' }), { status: 200, headers: { "Content-Type": "application/json" } });
            }
            return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ message: 'Club saved', save: data?.[0] }), { status: 201, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        console.error('Unexpected error in POST /api/clubSaves:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

// DELETE: remove a save (body: { club_id })
export async function DELETE(req) {
    try {
        const supabase = await createAuthenticatedClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized - please sign in" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const body = await req.json();
        const club_id = body?.club_id;
        if (!club_id) {
            return new Response(JSON.stringify({ error: 'Missing club_id in request body' }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const userId = user.id;

        const { data, error } = await supabase
            .from('club_saves')
            .delete()
            .eq('club_id', club_id)
            .eq('user_id', userId);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ message: 'Save removed' }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        console.error('Unexpected error in DELETE /api/clubSaves:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
