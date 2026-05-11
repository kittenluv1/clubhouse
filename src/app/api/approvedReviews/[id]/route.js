import { createAuthenticatedClient, supabaseServer } from "@/app/lib/server-db";

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const supabase = await createAuthenticatedClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", id)
      .single();

    if (reviewError || !review) {
      return new Response(JSON.stringify({ error: "Review not found" }), { status: 404 });
    }

    if (review.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    return new Response(JSON.stringify({ review }), { status: 200 });
  } catch (error) {
    console.error("Unexpected error in approved review GET:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { id } = await params;

  try {
    const supabase = await createAuthenticatedClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("user_id, user_alias")
      .eq("id", id)
      .single();

    if (fetchError || !existingReview) {
      return new Response(JSON.stringify({ error: "Review not found" }), { status: 404 });
    }

    if (existingReview.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
    }

    const {
      club_id,
      club_name,
      membership_start_quarter,
      membership_start_year,
      membership_end_quarter,
      membership_end_year,
      time_commitment_rating,
      inclusivity_rating,
      social_community_rating,
      competitiveness_rating,
      overall_satisfaction,
      review_text,
    } = body;

    const { error: insertError } = await supabase
      .from("pending_reviews")
      .insert({
        club_id,
        club_name,
        user_id: user.id,
        user_email: user.email,
        membership_start_quarter,
        membership_start_year,
        membership_end_quarter,
        membership_end_year,
        time_commitment_rating,
        inclusivity_rating,
        social_community_rating,
        competitiveness_rating,
        overall_satisfaction,
        review_text,
        user_alias: existingReview.user_alias,
      });

    if (insertError) {
      console.error("Error inserting into pending reviews:", insertError);
      return new Response(JSON.stringify({ error: "Error resubmitting review" }), { status: 500 });
    }

    const { error: deleteError } = await supabaseServer
      .from("reviews")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting from reviews:", deleteError);
      return new Response(JSON.stringify({ error: "Error removing approved review" }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Review resubmitted for approval" }), { status: 200 });
  } catch (error) {
    console.error("Unexpected error in approved review POST:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
