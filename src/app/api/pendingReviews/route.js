import { supabaseServer } from "@/app/lib/server-db";
import { createReviewsRepository } from "@/app/lib/server/repositories/reviews";
import { HttpError, readJson, withAdmin } from "@/app/lib/server/route";

// withAdmin checks the admin server-side, so the queries run as the service
// role and the reviews table needs no admin policies.
export const GET = withAdmin(async (req) => {
  const newestFirst = req.nextUrl.searchParams.get("sort") === "newest";
  const pendingReviews = await createReviewsRepository(
    supabaseServer,
  ).listPending({ newestFirst });
  return Response.json({ pendingReviews });
});

export const POST = withAdmin(async (req) => {
  const { reviewID, approve } = await readJson(req);
  if (!reviewID || typeof approve !== "boolean") {
    throw new HttpError(
      400,
      "Invalid request: issue with id or approve boolean",
    );
  }

  await createReviewsRepository(supabaseServer).moderate(reviewID, approve);
  return Response.json({
    message: approve ? "Review approved" : "Review rejected",
  });
});
