import { z } from "zod";
import {
  MAX_REJECTION_MESSAGE_LENGTH,
  PRESET_REJECTION_REASONS,
} from "@/app/lib/reviews/rejection";
import {
  sendReviewApprovedEmail,
  sendReviewRejectedEmail,
} from "@/app/lib/server/email/reviewEmails";
import { createReviewsRepository } from "@/app/lib/server/repositories/reviews";
import { REVIEW_MESSAGES } from "@/app/lib/server/reviewMessages";
import { HttpError, readJson, withAdmin } from "@/app/lib/server/route";

const reviewID = z.string().trim().min(1).max(64);

const moderationSchema = z.discriminatedUnion("approve", [
  z.object({ reviewID, approve: z.literal(true) }),
  z.object({
    reviewID,
    approve: z.literal(false),
    reasons: z
      .array(z.enum(PRESET_REJECTION_REASONS))
      .max(PRESET_REJECTION_REASONS.length)
      .default([]),
    message: z.string().trim().max(MAX_REJECTION_MESSAGE_LENGTH).default(""),
  }),
]);

export const GET = withAdmin(async (req, { supabase }) => {
  const newestFirst = req.nextUrl.searchParams.get("sort") === "newest";
  const pendingReviews = await createReviewsRepository(supabase).listPending({
    newestFirst,
  });
  return Response.json({ pendingReviews });
});

// Rejection feedback is only emailed, never stored, so the response reports
// whether the email went out.
export const POST = withAdmin(async (req, { supabase }) => {
  const parsed = moderationSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    throw new HttpError(400, REVIEW_MESSAGES.invalidModeration);
  }
  const body = parsed.data;

  const review = await createReviewsRepository(supabase).moderate(
    body.reviewID,
    body.approve,
  );
  const emailSent = body.approve
    ? await sendReviewApprovedEmail(review)
    : await sendReviewRejectedEmail(review, body);

  return Response.json({
    message: body.approve ? REVIEW_MESSAGES.approved : REVIEW_MESSAGES.rejected,
    emailSent,
  });
});
