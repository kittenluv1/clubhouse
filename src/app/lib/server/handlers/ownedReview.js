// Route handlers shared by /api/approvedReviews/[id] and /api/rejectedReviews/[id]:
// a reviewer can read, edit (resubmit for moderation) and delete their own review.

import { parseReviewInput } from "@/app/lib/reviews/schema";
import { createReviewsRepository } from "@/app/lib/server/repositories/reviews";
import { HttpError, readJson, withUser } from "@/app/lib/server/route";

/** @param {"approved" | "rejected"} status */
export function ownedReviewHandlers(status) {
  return {
    GET: withUser(async (_req, { supabase, user, params }) => {
      const review = await createReviewsRepository(supabase).getOwned(
        status,
        params.id,
        user.id,
      );
      return Response.json({ review });
    }),

    POST: withUser(async (req, { supabase, user, params }) => {
      const parsed = parseReviewInput(await readJson(req));
      if (!parsed.success) throw new HttpError(400, parsed.error);

      await createReviewsRepository(supabase).resubmit(
        status,
        params.id,
        user,
        parsed.data,
      );
      return Response.json({ message: "Review resubmitted for approval" });
    }),

    DELETE: withUser(async (_req, { supabase, user, params }) => {
      await createReviewsRepository(supabase).deleteOwned(
        status,
        params.id,
        user.id,
      );
      return Response.json({ message: "Review deleted" });
    }),
  };
}
