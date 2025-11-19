import { createAuthenticatedClient } from "../../../lib/server-db";

// GET /api/clubLikes/:clubId (remove this, should be done in clubs[id]/route.js, this logic is also doing a lot more work than needed)
// just use the data you already fetched, and search in the array to see if the userid is there.
// Returns like count for the club and whether the current user has liked it
export async function GET(req, { params }) {
    try {
        const { clubId } = params || {};
        if (!clubId) {
            return new Response(JSON.stringify({ error: 'Missing clubId parameter' }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        // create authenticated client to optionally detect current user
        const supabase = await createAuthenticatedClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Fetch count of likes for the club
        const { data: rows, error: likeError } = await supabase
            .from('club_likes')
            .select('user_id')
            .eq('club_id', clubId);

        if (likeError) {
            console.error('Error fetching likes for club:', likeError);
            return new Response(JSON.stringify({ error: likeError.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        const likeCount = Array.isArray(rows) ? rows.length : 0;

        let currentUserLiked = false;
        if (!authError && user) {
            const { data: check, error: checkErr } = await supabase
                .from('club_likes')
                .select('user_id')
                .eq('club_id', clubId)
                .eq('user_id', user.id)
                .limit(1);
            if (!checkErr && Array.isArray(check) && check.length > 0) currentUserLiked = true;
        }

        return new Response(JSON.stringify({ club_id: clubId, likeCount, currentUserLiked }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        console.error('Unexpected error in GET /api/clubLikes/[clubId]:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
