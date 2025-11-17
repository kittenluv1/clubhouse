import { supabase } from "@/app/lib/db";

export async function GET(request, context) {
  const resolvedParams = await context.params;
  const encodedClubId = resolvedParams.id;

  if (!encodedClubId) {
    console.error("API Error: ID parameter is missing from the URL.");
    return Response.json({ error: "ID parameter is missing" }, { status: 400 });
  }

  let decodedClubName;
  try {
    decodedClubName = decodeURIComponent(encodedClubId);
  } catch (e) {
    console.error("API Error: Failed to decode ID parameter:", encodedClubId, e);
    return Response.json(
      { error: "Invalid ID parameter encoding" },
      { status: 400 },
    );
  }

  console.log("Decoded club name for search:", decodedClubName);

  try {
    // Fetch club data
    const { data: clubData, error: clubError } = await supabase
      .from("clubs")
      .select("*")
      .eq("OrganizationName", encodedClubId);

    if (clubError) {
      console.error("Supabase error:", clubError);
      return Response.json({ error: "Database query failed" }, { status: 500 });
    }

    if (!clubData || clubData.length === 0) {
      return Response.json({ orgList: [] });
    }

    const club = clubData[0];

    // Fetch reviews for this club
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select("*")
      .eq("club_id", club.OrganizationID)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("Reviews fetch error:", reviewsError);
      return Response.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    // Fetch likes for all reviews in one query
    let reviewsWithLikes = reviewsData || [];
    if (reviewsData && reviewsData.length > 0) {
      const reviewIds = reviewsData.map(r => r.id);
      
      const { data: likesData, error: likesError } = await supabase
        .from("review_likes")
        .select("review_id")
        .in('review_id', reviewIds);

      if (likesError) {
        console.error("Likes fetch error:", likesError);
        // Don't fail the whole request, just set likes to 0
      } else {
        // Count likes per review
        const likeCounts = likesData.reduce((acc, like) => {
          acc[like.review_id] = (acc[like.review_id] || 0) + 1;
          return acc;
        }, {});

        // Add likes to reviews
        reviewsWithLikes = reviewsData.map(review => ({
          ...review,
          likes: likeCounts[review.id] || 0
        }));
      }
    }

    console.log("Search results:", clubData.length, "clubs found");
    return Response.json({ 
      orgList: clubData,
      reviews: reviewsWithLikes 
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}