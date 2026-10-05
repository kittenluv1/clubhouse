import { createAuthenticatedClient } from "@/app/lib/server-db";
import { randomAlias } from "@/app/lib/reviews/alias";

// New reviews wait in pending_reviews until an admin approves them.

export async function POST(req) {
  try {
    const supabase = await createAuthenticatedClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
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
      is_current_member,
    } = body;

    const { data, error } = await supabase
      .from("pending_reviews")
      .insert({
        club_id,
        user_id: user.id,
        user_email: user.email,
        club_name,
        review_text,
        membership_start_quarter,
        membership_start_year,
        membership_end_quarter,
        membership_end_year,
        time_commitment_rating,
        inclusivity_rating,
        social_community_rating,
        competitiveness_rating,
        overall_satisfaction,
        is_current_member,
        user_alias: randomAlias(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      return Response.json(
        { error: "Failed to submit review" },
        { status: 500 },
      );
    }

    return Response.json({ review: data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error creating review:", error);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
