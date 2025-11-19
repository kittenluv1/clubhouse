import { createAuthenticatedClient } from "../../lib/server-db";

// GET: clubs liked by the authenticated user (remove this, done in profile/route.js)
// POST: create a like (body: { club_id })
// DELETE: remove a like (body: { club_id })
export async function GET(req) {
    try {
        const supabase = await createAuthenticatedClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized - please sign in" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const userId = user.id;

        const { data: likedClubsData, error: likedClubsError } = await supabase
            .from('club_likes')
            .select(`
        club_id,
        clubs!club_likes_club_id_fkey(*)
      `)
            .eq('user_id', userId);

        if (likedClubsError) {
            console.error('Error fetching liked clubs:', likedClubsError);
            return new Response(JSON.stringify({ error: likedClubsError.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        const likedClubs = likedClubsData ? likedClubsData.map(item => item.clubs) : [];

        return new Response(JSON.stringify({ clubsLiked: likedClubs }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        console.error('Unexpected error in GET /api/clubLikes:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

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
            .from('club_likes')
            .insert([{ club_id, user_id: userId }]);

        if (error) {
            // Handle unique constraint gracefully if configured
            const msg = error.message || 'Database error';
            if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
                return new Response(JSON.stringify({ message: 'Already liked' }), { status: 200, headers: { "Content-Type": "application/json" } });
            }
            return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ message: 'Like added', like: data[0] }), { status: 201, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        console.error('Unexpected error in POST /api/clubLikes:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

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
            .from('club_likes')
            .delete()
            .eq('club_id', club_id)
            .eq('user_id', userId);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ message: 'Like removed' }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        console.error('Unexpected error in DELETE /api/clubLikes:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
