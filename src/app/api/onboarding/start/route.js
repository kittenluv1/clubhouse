import { createProfilesRepository } from "@/app/lib/server/repositories/profiles";
import { withUser } from "@/app/lib/server/route";

export const POST = withUser(async (_req, { supabase, user }) => {
  await createProfilesRepository(supabase).markOnboardingStarted(user.id);
  return Response.json({ success: true });
});
