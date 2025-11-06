// GET (fetch like count for a club)
import { supabase } from "../../../lib/db";

export async function GET(request, { params }) {
  const { clubid } = await params;
  
  const { data, error, count } = await supabase
    .from("club_likes")
    .select("*", { count: "exact", head: true })
    .eq("club_id", clubid);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ likeCount: count }), { status: 200 });
}