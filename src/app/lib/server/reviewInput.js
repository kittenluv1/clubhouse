// Request parsing shared by the routes that create or edit a review.

import { parseReviewInput } from "@/app/lib/reviews/schema";
import { supabaseServer } from "@/app/lib/server-db";
import { HttpError } from "@/app/lib/server/errors";
import { createClubsRepository } from "@/app/lib/server/repositories/clubs";

/**
 * Validate a review body, check that its club exists and take the club name
 * from the clubs table. Only reviews.club_id
 * has a foreign key to clubs, so without this check a review for a missing
 * club would wait in pending_reviews and fail when an admin approved it
 * @param {unknown} body
 * @returns {Promise<import("@/app/lib/reviews/schema").ReviewInput>}
 */
export async function validateReviewInput(body) {
  const parsed = parseReviewInput(body);
  if (!parsed.success) throw new HttpError(400, parsed.error);

  const club = await createClubsRepository(supabaseServer).findById(
    parsed.data.club_id,
  );
  if (!club) throw new HttpError(400, "club_id: no such club");

  // Store the club's real name rather than trusting the one in the request.
  return { ...parsed.data, club_name: club.OrganizationName };
}
