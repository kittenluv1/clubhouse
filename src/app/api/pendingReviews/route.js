import { createReviewsRepository } from "@/app/lib/server/repositories/reviews";
import { HttpError, readJson, withAdmin } from "@/app/lib/server/route";

export const GET = withAdmin(async (req, { supabase }) => {
  const newestFirst = req.nextUrl.searchParams.get("sort") === "newest";
  const pendingReviews = await createReviewsRepository(supabase).listPending({ newestFirst });
  return Response.json({ pendingReviews });
});

export const POST = withAdmin(async (req, { supabase }) => {
  const { reviewID, approve } = await readJson(req);
  if (!reviewID || typeof approve !== "boolean") {
    throw new HttpError(400, "Invalid request: issue with id or approve boolean");
  }

  await createReviewsRepository(supabase).moderate(reviewID, approve);
  return Response.json({
    message: approve
      ? "Review approved and moved to reviews table"
      : "Review rejected and moved to rejected reviews table",
  });
});
