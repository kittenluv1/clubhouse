import { randomAlias } from "@/app/lib/reviews/alias";
import { createReviewsRepository } from "@/app/lib/server/repositories/reviews";
import { validateReviewInput } from "@/app/lib/server/reviewInput";
import { readJson, withUser } from "@/app/lib/server/route";

// New reviews wait in pending_reviews until an admin approves them.
export const POST = withUser(async (req, { supabase, user }) => {
  const input = await validateReviewInput(await readJson(req));

  const review = await createReviewsRepository(supabase).submit(
    user,
    input,
    randomAlias(),
  );
  return Response.json({ review }, { status: 201 });
});
