import { randomAlias } from "@/app/lib/reviews/alias";
import { parseReviewInput } from "@/app/lib/reviews/schema";
import { createReviewsRepository } from "@/app/lib/server/repositories/reviews";
import { HttpError, readJson, withUser } from "@/app/lib/server/route";

// New reviews wait in pending_reviews until an admin approves them.
export const POST = withUser(async (req, { supabase, user }) => {
  const parsed = parseReviewInput(await readJson(req));
  if (!parsed.success) throw new HttpError(400, parsed.error);

  const review = await createReviewsRepository(supabase).submit(
    user,
    parsed.data,
    randomAlias(),
  );
  return Response.json({ review }, { status: 201 });
});
