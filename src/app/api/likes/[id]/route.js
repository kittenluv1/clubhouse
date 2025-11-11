import { supabase } from "../../../lib/db";

export async function GET(req) {
  try {

    const url = new URL(req.url);
    // Use nextUrl.searchParams to get query parameters
    const user_id = url.searchParams.get("user_id");
    const club_id = url.searchParams.get("club_id");

    // Case 1: Return clubs liked by a user
    if (user_id) {
      const { data, error } = await supabase
        .from("club_likes")
        .select("club_id")
        .eq("user_id", user_id);

      console.log ("")
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      const clubIds = data.map(row => row.club_id);

      return new Response(
        JSON.stringify({ user_id, clubsLiked: clubIds }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Case 2: Return users who liked a club
    if (club_id) {
      const { data, error } = await supabase
        .from("club_likes")
        .select("user_id")
        .eq("club_id", club_id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      const userIds = data.map(row => row.user_id);

      return new Response(
        JSON.stringify({
          club_id: club_id,
          users: userIds,
          likeCount: userIds.length
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Provide either club_id or user_id as query parameter" }),
      { status: 400 }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}