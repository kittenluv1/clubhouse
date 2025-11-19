import { supabase } from "../../lib/db";
import { createAuthenticatedClient } from "@/app/lib/server-db";

export async function GET(req) {
  try {
    // get the page number, page param, and sort from URL
    const name = req.nextUrl.searchParams.get("name");
    const pageParam = req.nextUrl.searchParams.get("page");
    const sortType = req.nextUrl.searchParams.get("sort") || "rating";
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1; // default display page is first page
    const pageSize = 10; // show only 10 cards per page
    const startIndex = (pageNum - 1) * pageSize; // calculate indices of 'data' to be returned (i.e. 10 per page)
    const endIndex = startIndex + pageSize - 1;

    // Configure sorting with secondary sort for consistency
    let sortBy = "average_satisfaction";
    let ascending = false;
    if (sortType === "reviews") {
      sortBy = "total_num_reviews";
    } else if (sortType === "alphabetical") {
      sortBy = "OrganizationName";
      ascending = true; // alphabetic order needs to go in ascending order
    }

    // Build query with consistent ordering
    // let query = supabase
    //   .from("clubs")
    //   .select("*", { count: "exact" })
    //   .order(sortBy, { ascending, nullsFirst: false });

    let query = supabase
    .from('clubs')
    .select('*', { count: 'exact' });

    if (sortType === 'rating') {
      query = query
        .order('average_satisfaction', { ascending: false, nullsFirst: false })
        .order('total_num_reviews', { ascending: false });
    } else if (sortType === 'reviews') {
      query = query.order('total_num_reviews', { ascending: false });
    }

    // Add secondary sort by ID (or another unique field) for consistency
    // This ensures identical values in the primary sort column have predictable order
    if (sortType !== "alphabetical") {
      query = query.order("OrganizationName", { ascending: true });
    }
    // Always add ID as final tiebreaker
    query = query.order("OrganizationID", { ascending: true });

    // Apply search filter if provided
    if (name) {
      query = query.ilike("OrganizationName", `%${name}%`);
    }

    // Apply pagination
    const result = await query.range(startIndex, endIndex);
    
    const { data, count, error } = result;

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: "Database query failed" }), {
        status: 500,
      });
    }

    console.log("success");
    console.log(count, "total number of rows");

    const totalNumPages = Math.ceil(count / pageSize);

    // Batch fetch likes for all clubs on this page
    let likesMap = {};
    if (data && data.length > 0) {
      const clubIds = data.map(club => club.OrganizationID);

      // Fetch all likes for counting (only need club_id)
      const { data: allLikes, error: likesError } = await supabase
        .from('club_likes')
        .select('club_id')
        .in('club_id', clubIds);

      if (!likesError && allLikes) {
        // Get current user (if authenticated)
        const authSupabase = await createAuthenticatedClient();
        const { data: { user }, error: authError } = await authSupabase.auth.getUser();

        // Fetch only current user's likes for these clubs
        let userLikedSet = new Set();
        if (!authError && user) {
          const { data: userLikes, error: userLikesError } = await supabase
            .from('club_likes')
            .select('club_id')
            .eq('user_id', user.id)
            .in('club_id', clubIds);

          if (!userLikesError && userLikes) {
            userLikedSet = new Set(userLikes.map(like => like.club_id));
          }
        }

        // Build likesMap: { clubId: { count, userLiked } }
        clubIds.forEach(clubId => {
          const clubLikes = allLikes.filter(like => like.club_id === clubId);
          likesMap[clubId] = {
            count: clubLikes.length,
            userLiked: userLikedSet.has(clubId)
          };
        });
      }
    }

    return new Response(
      JSON.stringify(
        {
          orgList: data,
          currPage: pageNum,
          totalNumPages,
          likesMap,
        },
        null,
        2,
      ),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch data",
      }),
      { status: 500 },
    );
  }
}