import { createAuthenticatedClient } from "../../lib/server-db";

export async function GET(req) {
  try {
    // Create authenticated Supabase client (reads from cookies)
    const supabase = await createAuthenticatedClient();

    // Get the authenticated user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[Profile API] Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - please sign in" }),
        { status: 401 }
      );
    }

    // Now use the verified user.id from the session (not from client)
    const userId = user.id;

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Fetch approved reviews
    const { data: approvedReviews, error: approvedError } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId);

    if (approvedError) {
      console.error('Error fetching approved reviews:', approvedError);
    }

    // Fetch pending reviews
    const { data: pendingReviews, error: pendingError } = await supabase
      .from('pending_reviews')
      .select('*')
      .eq('user_id', userId);

    if (pendingError) {
      console.error('Error fetching pending reviews:', pendingError);
    }

    // Fetch rejected reviews
    const { data: rejectedReviews, error: rejectedError } = await supabase
      .from('rejected_reviews')
      .select('*')
      .eq('user_id', userId);

    if (rejectedError) {
      console.error('Error fetching rejected reviews:', rejectedError);
    }

    // Fetch liked clubs
    const { data: likedClubsData, error: likedClubsError } = await supabase
      .from('club_likes')
      .select(`
        club_id,
        clubs!club_likes_club_id_fkey(*)
      `)
      .eq('user_id', userId);

    if (likedClubsError) {
      console.error('Error fetching liked clubs:', likedClubsError);
    }

    // Fetch saved clubs
    const { data: savedClubsData, error: savedClubsError } = await supabase
      .from('club_saves')
      .select(`
        club_id,
        clubs!saved_clubs_club_id_fkey(*)
      `)
      .eq('user_id', userId);

    if (savedClubsError) {
      console.error('Error fetching saved clubs:', savedClubsError);
    }

    // Transform liked clubs data to match the format in the original code
    const likedClubs = likedClubsData ? likedClubsData.map(item => item.clubs) : [];
    const savedClubs = savedClubsData ? savedClubsData.map(item => item.clubs) : [];

    // Return all data
    return new Response(
      JSON.stringify({
        profile: profileData,
        approvedReviews: approvedReviews || [],
        pendingReviews: pendingReviews || [],
        rejectedReviews: rejectedReviews || [],
        likedClubs: likedClubs,
        savedClubs: savedClubs,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in profile API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch profile data' }),
      { status: 500 }
    );
  }
}
