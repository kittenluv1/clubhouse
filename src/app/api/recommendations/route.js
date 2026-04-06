import { createAuthenticatedClient } from "../../lib/server-db";
import { supabaseServer } from "../../lib/server-db";
import { RecommendationService } from "../../lib/recommendation";

export async function GET(req) {
  try {
    const supabase = await createAuthenticatedClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - please sign in" }),
        { status: 401 }
      );
    }

    const userId = user.id;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('majors, minors')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[Recommendations API] Profile fetch error:', profileError);
    }

    // Fetch user interest categories from user_interests table
    const { data: userInterestsData, error: interestsError } = await supabase
      .from('user_interests')
      .select('category')
      .eq('user_id', userId);

    if (interestsError) {
      console.error('[Recommendations API] User interests fetch error:', interestsError);
    }

    const userProfile = {
      majors: profile?.majors || [],
      minors: profile?.minors || [],
      interests: (userInterestsData || []).map(row => row.category),
    };

    // Fetch user's liked clubs to build context and exclusion set
    const { data: likedClubsData, error: likedError } = await supabase
      .from('club_likes')
      .select(`
        club_id,
        clubs!club_likes_club_id_fkey(Category1Name, Category2Name)
      `)
      .eq('user_id', userId);

    if (likedError) {
      console.error('[Recommendations API] Liked clubs fetch error:', likedError);
    }

    const likedClubIds = new Set(
      (likedClubsData || []).map(item => item.club_id)
    );

    // Build likedCategories context from liked clubs
    const likedCategories = [];
    for (const item of (likedClubsData || [])) {
      if (item.clubs?.Category1Name) likedCategories.push(item.clubs.Category1Name);
      if (item.clubs?.Category2Name) likedCategories.push(item.clubs.Category2Name);
    }

    // Fetch user's saved clubs to build context
    const { data: savedClubsData, error: savedError } = await supabase
      .from('club_saves')
      .select(`
        club_id,
        clubs!saved_clubs_club_id_fkey(Category1Name, Category2Name)
      `)
      .eq('user_id', userId);

    if (savedError) {
      console.error('[Recommendations API] Saved clubs fetch error:', savedError);
    }

    const savedClubIds = new Set(
      (savedClubsData || []).map(item => item.club_id)
    );

    // Build savedCategories context from saved clubs
    const savedCategories = [];
    for (const item of (savedClubsData || [])) {
      if (item.clubs?.Category1Name) savedCategories.push(item.clubs.Category1Name);
      if (item.clubs?.Category2Name) savedCategories.push(item.clubs.Category2Name);
    }

    // Fetch user's club memberships (clubs they are already in)
    const { data: memberClubsData, error: memberError } = await supabase
      .from('club_memberships')
      .select(`
        club_id,
        clubs!club_memberships_club_id_fkey(Category1Name, Category2Name)
      `)
      .eq('user_id', userId);

    if (memberError) {
      console.error('[Recommendations API] Member clubs fetch error:', memberError);
    }

    const memberClubIds = new Set(
      (memberClubsData || []).map(item => item.club_id)
    );

    // Build memberCategories context from clubs the user is in
    const memberCategories = [];
    for (const item of (memberClubsData || [])) {
      if (item.clubs?.Category1Name) memberCategories.push(item.clubs.Category1Name);
      if (item.clubs?.Category2Name) memberCategories.push(item.clubs.Category2Name);
    }

    // Fetch all clubs
    const { data: allClubs, error: clubsError } = await supabaseServer
      .from('clubs')
      .select('*');

    if (clubsError) {
      console.error('[Recommendations API] Clubs fetch error:', clubsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch clubs' }),
        { status: 500 }
      );
    }

    // Filter out clubs the user already liked, saved, or is a member of
    const candidateClubs = (allClubs || []).filter(
      club => !likedClubIds.has(club.OrganizationID)
        && !savedClubIds.has(club.OrganizationID)
        && !memberClubIds.has(club.OrganizationID)
    );

    // Score and rank
    const service = new RecommendationService();
    const ranked = service.rankClubs(userProfile, candidateClubs, { likedCategories, savedCategories, memberCategories });

    // Check if profile is complete enough for meaningful recommendations
    const profileComplete = Boolean(
      (userProfile.majors && userProfile.majors.length > 0) ||
      (userProfile.minors && userProfile.minors.length > 0) ||
      (userProfile.interests && userProfile.interests.length > 0)
    );

    const results = ranked.slice(0, limit).map(({ club, score, breakdown }) => ({
      ...club,
      recommendation_score: score,
      recommendation_breakdown: breakdown,
    }));

    return new Response(
      JSON.stringify({
        recommendations: results,
        profileComplete,
        total: ranked.length,
        limit,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[Recommendations API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate recommendations' }),
      { status: 500 }
    );
  }
}
