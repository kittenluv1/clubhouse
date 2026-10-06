import { supabaseServer } from "@/app/lib/server-db";
import { countUnreadRejected } from "@/app/lib/reviews/unread";
import {
  createClubsRepository,
  listMarkedClubs,
} from "@/app/lib/server/repositories/clubs";
import { createProfilesRepository } from "@/app/lib/server/repositories/profiles";
import { createReviewsRepository } from "@/app/lib/server/repositories/reviews";
import { withUser } from "@/app/lib/server/route";

// Everything the profile page shows for the signed-in user.
export const GET = withUser(async (_req, { supabase, user }) => {
  const profiles = createProfilesRepository(supabase);

  const [profile, reviews, likedClubs, savedClubs, userInterests] =
    await Promise.all([
      profiles.getProfile(user.id),
      createReviewsRepository(supabase).listForUser(user.id),
      listMarkedClubs(supabase, user.id, "liked"),
      listMarkedClubs(supabase, user.id, "saved"),
      profiles.listInterests(user.id),
    ]);

  // Counts span every user's likes, so they need the service-role client.
  const clubIds = [
    ...new Set(
      [...likedClubs, ...savedClubs].map((club) => club.OrganizationID),
    ),
  ];
  const likeCounts =
    await createClubsRepository(supabaseServer).likeCounts(clubIds);
  const withLikeCount = (club) => ({
    ...club,
    like_count: likeCounts.get(club.OrganizationID) ?? 0,
  });

  return Response.json({
    profile,
    approvedReviews: reviews.approved,
    pendingReviews: reviews.pending,
    rejectedReviews: reviews.rejected,
    likedClubs: likedClubs.map(withLikeCount),
    savedClubs: savedClubs.map(withLikeCount),
    unreadRejectedCount: countUnreadRejected(
      reviews.rejected,
      profile?.last_viewed_rejected_at,
    ),
    userInterests,
  });
});
