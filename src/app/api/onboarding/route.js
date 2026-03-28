import { createAuthenticatedClient, supabaseServer } from "@/app/lib/server-db";

// GET /api/onboarding
// Returns whether the user has already completed onboarding.
// Used by the onboarding page to block re-entry.
export async function GET() {
  try {
    const supabase = await createAuthenticatedClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabaseServer
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    if (error) {
      return Response.json({ error: "Failed to fetch onboarding status" }, { status: 500 });
    }

    return Response.json({ onboarding_completed: profile?.onboarding_completed ?? false });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/onboarding
// Marks onboarding as complete and saves the user's preferences.
// Body: { majors, minors, broadCategories, subcategories, currentClubs }
export async function POST(req) {
  try {
    const supabase = await createAuthenticatedClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { majors = [], minors = [], broadCategories = [], subcategories = [], currentClubs = [] } = await req.json();

    // Save academic info and mark onboarding complete
    const { error: profileError } = await supabaseServer
      .from("profiles")
      .update({
        onboarding_completed: true,
        majors,
        minors,
        current_clubs: currentClubs,
      })
      .eq("id", user.id);

    if (profileError) {
      return Response.json({ error: "Failed to save profile preferences" }, { status: 500 });
    }

    // Replace user's interest rows with the new selections.
    // Combines broad categories and subcategories — both are interest signals
    // for the recommendation algorithm.
    const allInterests = [...new Set([...broadCategories, ...subcategories])];

    if (allInterests.length > 0) {
      await supabaseServer
        .from("user_interests")
        .delete()
        .eq("user_id", user.id);

      const { error: interestsError } = await supabaseServer
        .from("user_interests")
        .insert(allInterests.map((category) => ({ user_id: user.id, category })));

      if (interestsError) {
        return Response.json({ error: "Failed to save interest preferences" }, { status: 500 });
      }
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
