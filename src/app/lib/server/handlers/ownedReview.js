// Route handlers shared by /api/approvedReviews/[id] and /api/rejectedReviews/[id]:
// a reviewer can read, edit (resubmit for moderation) and delete their own review.

import { supabaseServer } from "@/app/lib/server-db";
import { createReviewsRepository } from "@/app/lib/server/repositories/reviews";
import { validateReviewInput } from "@/app/lib/server/reviewInput";
import { readJson, withUser } from "@/app/lib/server/route";

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
      const input = await validateReviewInput(await readJson(req));

      await createReviewsRepository(supabase, {
        serviceClient: supabaseServer,
      }).resubmit(status, params.id, user, input);
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
