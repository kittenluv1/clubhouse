import { createAuthenticatedClient } from "@/app/lib/server-db";

export async function POST() {
  try {
    const supabase = await createAuthenticatedClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_started: true })
      .eq("id", user.id);

    if (error) {
      return Response.json(
        { error: "Failed to update onboarding state" },
        { status: 500 },
      );
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
