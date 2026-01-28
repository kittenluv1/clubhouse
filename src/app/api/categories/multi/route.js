import { supabase } from "../../../lib/db";
import { createAuthenticatedClient } from "@/app/lib/server-db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawList = searchParams.get("list");
    const pageParam = searchParams.get("page");
    const sortType = searchParams.get("sort") || "rating";

    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = 10;
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;

    if (!rawList) {
      return new Response(
        JSON.stringify({ orgList: [], currPage: 1, totalNumPages: 1 }),
        { status: 200 },
      );
    }

    const categories = decodeURIComponent(rawList)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!categories.length) {
      return new Response(
        JSON.stringify({ orgList: [], currPage: 1, totalNumPages: 1 }),
        { status: 200 },
      );
    }

    // Build dynamic OR filters
    const filters = categories.flatMap((cat) => [
      `Category1Name.ilike.%${cat}%`,
      `Category2Name.ilike.%${cat}%`,
    ]);

    // Configure sort priority based on sortType
    let sortConfig = [];
    if (sortType === "rating") {
      sortConfig = [
        { column: "average_satisfaction", ascending: false },
        { column: "total_num_reviews", ascending: false },
        { column: "OrganizationName", ascending: true },
      ];
    } else if (sortType === "reviews") {
      sortConfig = [
        { column: "total_num_reviews", ascending: false },
        { column: "average_satisfaction", ascending: false },
        { column: "OrganizationName", ascending: true },
      ];
    } else if (sortType === "alphabetical") {
      sortConfig = [
        { column: "OrganizationName", ascending: true },
        { column: "average_satisfaction", ascending: false },
        { column: "total_num_reviews", ascending: false },
      ];
    } else if (sortType === "likes") {
      sortConfig = [
        { column: "like_count", ascending: false },
        { column: "average_satisfaction", ascending: false },
        { column: "OrganizationName", ascending: true },
      ];
    }

    // Build query with filter
    let query = supabase
      .from("clubs")
      .select(`*`, { count: "exact" })
      .or(filters.join(","));

    // Apply all sorts from config
    for (const sort of sortConfig) {
      query = query.order(sort.column, { ascending: sort.ascending, nullsFirst: false });
    }
    // Always add ID as final tiebreaker
    query = query.order("OrganizationID", { ascending: true });

    // Apply pagination
    const { data, count, error } = await query.range(startIndex, endIndex);

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: "Database query failed" }), {
        status: 500,
      });
    }

    const totalNumPages = Math.ceil(count / pageSize);

    // Batch fetch likes and saves for all clubs on this page
    let likesMap = {};
    let userSavedClubs = [];
    if (data && data.length > 0) {
      const clubIds = data.map(club => club.OrganizationID);

      // Get current user once (if authenticated)
      const authSupabase = await createAuthenticatedClient();
      const { data: { user }, error: authError } = await authSupabase.auth.getUser();

      // Fetch all likes for counting (only need club_id)
      const { data: allLikes, error: likesError } = await supabase
        .from('club_likes')
        .select('club_id')
        .in('club_id', clubIds);

      if (!likesError && allLikes) {
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

      // Fetch user's saves (only if authenticated)
      if (!authError && user) {
        const { data: userSaves, error: savesError } = await supabase
          .from('club_saves')
          .select('club_id')
          .eq('user_id', user.id)
          .in('club_id', clubIds);

        if (!savesError && userSaves) {
          userSavedClubs = userSaves.map(save => save.club_id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        orgList: data,
        currPage: pageNum,
        totalNumPages,
        likesMap,
        userSavedClubs,
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error("Fetch error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
}