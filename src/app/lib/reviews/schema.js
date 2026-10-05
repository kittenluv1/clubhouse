import { z } from "zod";

// Quarters in calendar order within a year (Winter = Jan–Mar).
export const QUARTERS = ["Winter", "Spring", "Fall"];

const MIN_YEAR = 1919; // UCLA's founding
const MAX_REVIEW_LENGTH = 5000;

/** Ratings use half-star steps. */
const rating = (min) =>
  z
    .number()
    .min(min)
    .max(5)
    .refine((n) => Number.isInteger(n * 2), "must be a multiple of 0.5");

const year = z
  .number()
  .int()
  .min(MIN_YEAR)
  .refine((y) => y <= new Date().getFullYear() + 1, "is too far in the future");

const quarterIndex = (quarter, yr) =>
  yr * QUARTERS.length + QUARTERS.indexOf(quarter);

// z.object strips unknown keys, so identity fields such as user_id or
// user_alias in a request body never reach the database. The form also sends
// is_current_member (used for analytics only); no review table stores it.
const reviewInputSchema = z
  .object({
    club_id: z.number().int().positive(),
    club_name: z.string().trim().min(1).max(200),
    review_text: z.string().trim().min(1).max(MAX_REVIEW_LENGTH),
    membership_start_quarter: z.enum(QUARTERS),
    membership_start_year: year,
    membership_end_quarter: z.enum(QUARTERS),
    membership_end_year: year,
    time_commitment_rating: rating(1),
    inclusivity_rating: rating(1),
    social_community_rating: rating(1),
    competitiveness_rating: rating(1),
    overall_satisfaction: rating(0.5),
  })
  .refine(
    (r) =>
      quarterIndex(r.membership_end_quarter, r.membership_end_year) >=
      quarterIndex(r.membership_start_quarter, r.membership_start_year),
    {
      message: "membership end must not be before its start",
      path: ["membership_end_year"],
    },
  );

/**
 * @typedef {z.infer<typeof reviewInputSchema>} ReviewInput
 */

/**
 * Validate the user-editable fields of a review.
 * @param {unknown} input
 * @returns {{ success: true, data: ReviewInput } | { success: false, error: string }}
 */
export function parseReviewInput(input) {
  const result = reviewInputSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  const error = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  return { success: false, error };
}
