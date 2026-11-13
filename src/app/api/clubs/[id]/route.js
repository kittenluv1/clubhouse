import { createAuthenticatedClient, supabaseServer } from "@/app/lib/server-db";
import {
  createClubsRepository,
  getUserClubMarks,
} from "@/app/lib/server/repositories/clubs";
import { listPublicReviews } from "@/app/lib/server/repositories/reviews";
import {
  createUserToggleRepository,
  USER_TOGGLES,
} from "@/app/lib/server/repositories/userToggles";
import { errorResponse, jsonError } from "@/app/lib/server/route";

const EMPTY = {
  orgList: [],
  reviews: [],
  likeCount: 0,
  currentUserLiked: false,
  currentUserSaved: false,
  reviewLikesMap: {},
  userLikedReviews: [],
};

// Club detail page data. Public; signed-in users also get their own likes
// and saves. The [id] segment is the club name.
export async function GET(req, { params }) {
  try {
    // Next.js already URL-decodes route params
    const { id: clubName } = await params;
    if (!clubName) return jsonError(400, "ID parameter is missing");

    const club =
      await createClubsRepository(supabaseServer).findByName(clubName);
    if (!club) return Response.json(EMPTY);
    const clubId = club.OrganizationID;

    const userClient = await createAuthenticatedClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();
    const viewerId = user?.id ?? null;

    const reviews = await listPublicReviews(supabaseServer, clubId, viewerId);
    const reviewIds = reviews.map((review) => review.id);
    const reviewLikes = createUserToggleRepository(
      supabaseServer,
      USER_TOGGLES.reviewLike,
    );

    const [clubLikeCounts, reviewLikeCounts, clubMarks, likedReviews] =
      await Promise.all([
        createClubsRepository(supabaseServer).likeCounts([clubId]),
        reviewLikes.countByTarget(reviewIds),
        viewerId ? getUserClubMarks(userClient, viewerId, [clubId]) : null,
        viewerId
          ? createUserToggleRepository(
              userClient,
              USER_TOGGLES.reviewLike,
            ).listMarked(viewerId, reviewIds)
          : new Set(),
      ]);

    return Response.json({
      orgList: [club],
      reviews,
      likeCount: clubLikeCounts.get(clubId) ?? 0,
      currentUserLiked: clubMarks?.liked.has(clubId) ?? false,
      currentUserSaved: clubMarks?.saved.has(clubId) ?? false,
      reviewLikesMap: Object.fromEntries(reviewLikeCounts),
      userLikedReviews: [...likedReviews],
    });
  } catch (err) {
    return errorResponse(req, err);
  }
}
