import { supabase } from "@/app/lib/db";
import { createAuthenticatedClient } from "@/app/lib/server-db";

export async function GET(request, context) {
  // await context params before using
  const resolvedParams = await context.params;
  const encodedClubId = resolvedParams.id;

  if (!encodedClubId) {
    console.error("API Error: ID parameter is missing from the URL.");
    return Response.json({ error: "ID parameter is missing" }, { status: 400 });
  }

  let decodedClubName;
  try {
    // Assuming the 'id' parameter from the URL is the club name that needs decoding
    decodedClubName = decodeURIComponent(encodedClubId);
  } catch (e) {
    console.error(
      "API Error: Failed to decode ID parameter:",
      encodedClubId,
      e,
    );
    return Response.json(
      { error: "Invalid ID parameter encoding" },
      { status: 400 },
    );
  }

  console.log("Decoded club name for search:", decodedClubName);

  try {
    // Search for clubs with a name that partially matches the search term
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("OrganizationName", encodedClubId);

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: "Database query failed" }, { status: 500 });
    }

    console.log("Search results:", data.length, "clubs found");

    // Fetch reviews and likes if we found a club
    let reviews = [];
    let likeCount = 0;
    let currentUserLiked = false;
    let currentUserSaved = false;

    if (data && data.length > 0) {
      const clubData = data[0];

      // Get current user once (if authenticated)
      const authSupabase = await createAuthenticatedClient();
      const { data: { user }, error: authError } = await authSupabase.auth.getUser();

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("club_id", clubData.OrganizationID)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        console.error("Reviews fetch error:", reviewsError);
        // Don't fail the whole request if reviews fail, just return empty array
      } else {
        reviews = reviewsData || [];
      }

      // Fetch club likes
      const { data: likesData, error: likesError } = await supabase
        .from("club_likes")
        .select("user_id")
        .eq("club_id", clubData.OrganizationID);

      if (likesError) {
        console.error("Likes fetch error:", likesError);
      } else if (Array.isArray(likesData)) {
        likeCount = likesData.length;

        // Check if current user has liked (only if authenticated)
        if (!authError && user) {
          currentUserLiked = likesData.some(like => like.user_id === user.id);
        }
      }

      // Check if current user has saved (only if authenticated)
      if (!authError && user) {
        const { data: saveData, error: saveError } = await supabase
          .from("club_saves")
          .select("club_id")
          .eq("user_id", user.id)
          .eq("club_id", clubData.OrganizationID)
          .maybeSingle();

        if (!saveError && saveData) {
          currentUserSaved = true;
        }
      }
    }

    return Response.json({
      orgList: data,
      reviews,
      likeCount,
      currentUserLiked,
      currentUserSaved
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}