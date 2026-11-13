import { parsePreferences } from "@/app/lib/profiles/preferencesSchema";
import { createProfilesRepository } from "@/app/lib/server/repositories/profiles";
import { HttpError, readJson, withUser } from "@/app/lib/server/route";

async function readPreferences(req) {
  const parsed = parsePreferences(await readJson(req));
  if (!parsed.success) throw new HttpError(400, parsed.error);
  return parsed.data;
}

// GET /api/onboarding
// Whether the user has started/completed onboarding. Used by the onboarding
// page to block re-entry.
export const GET = withUser(async (_req, { supabase, user }) => {
  const status = await createProfilesRepository(supabase).getOnboardingStatus(
    user.id,
  );
  return Response.json(status);
});

// POST /api/onboarding
// Completes onboarding and saves the user's preferences.
// Body: { majors, minors, broadCategories, subcategories, currentClubs }
export const POST = withUser(async (req, { supabase, user }) => {
  const preferences = await readPreferences(req);
  const profiles = createProfilesRepository(supabase);

  await profiles.updatePreferences(user.id, preferences, {
    completeOnboarding: true,
  });
  // Skipping the interests step leaves any existing interests alone.
  if (preferences.interests.length > 0) {
    await profiles.replaceInterests(user.id, preferences.interests);
  }
  return Response.json({ success: true });
});

// PATCH /api/onboarding
// Updates preferences from the profile page; an empty interest list clears them.
export const PATCH = withUser(async (req, { supabase, user }) => {
  const preferences = await readPreferences(req);
  const profiles = createProfilesRepository(supabase);

  await profiles.updatePreferences(user.id, preferences);
  await profiles.replaceInterests(user.id, preferences.interests);
  return Response.json({ success: true });
});
