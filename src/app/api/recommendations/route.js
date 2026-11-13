import { supabaseServer } from "@/app/lib/server-db";
import { RecommendationService } from "@/app/lib/recommendation";
import {
  createClubsRepository,
  listMarkedClubs,
} from "@/app/lib/server/repositories/clubs";
import { createProfilesRepository } from "@/app/lib/server/repositories/profiles";
import { withUser } from "@/app/lib/server/route";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** @param {string | null} value */
function readLimit(value) {
  const limit = Number.parseInt(value ?? "", 10);
  return Number.isInteger(limit) && limit > 0
    ? Math.min(limit, MAX_LIMIT)
    : DEFAULT_LIMIT;
}

const categoriesOf = (clubs) =>
  clubs
    .flatMap((club) => [club.Category1Name, club.Category2Name])
    .filter(Boolean);
const normalizeName = (name) => (name ?? "").toLowerCase().trim();

// Clubs ranked for the signed-in user, excluding ones they already liked,
// saved or belong to.
export const GET = withUser(async (req, { supabase, user }) => {
  const limit = readLimit(new URL(req.url).searchParams.get("limit"));
  const profiles = createProfilesRepository(supabase);
  const categoryColumns = "OrganizationID, Category1Name, Category2Name";

  const [profile, interests, likedClubs, savedClubs, allClubs] =
    await Promise.all([
      profiles.getProfile(user.id, "majors, minors, current_clubs"),
      profiles.listInterests(user.id),
      listMarkedClubs(supabase, user.id, "liked", categoryColumns),
      listMarkedClubs(supabase, user.id, "saved", categoryColumns),
      createClubsRepository(supabaseServer).listAll(),
    ]);

  const userProfile = {
    majors: profile?.majors ?? [],
    minors: profile?.minors ?? [],
    interests,
  };

  const memberNames = new Set(
    (profile?.current_clubs ?? []).map(normalizeName),
  );
  const memberClubs = allClubs.filter((club) =>
    memberNames.has(normalizeName(club.OrganizationName)),
  );

  const excluded = new Set(
    [...likedClubs, ...savedClubs, ...memberClubs].map(
      (club) => club.OrganizationID,
    ),
  );
  const candidates = allClubs.filter(
    (club) => !excluded.has(club.OrganizationID),
  );

  const ranked = new RecommendationService().rankClubs(
    userProfile,
    candidates,
    {
      likedCategories: categoriesOf(likedClubs),
      savedCategories: categoriesOf(savedClubs),
      memberCategories: categoriesOf(memberClubs),
    },
  );

  const profileComplete = [
    userProfile.majors,
    userProfile.minors,
    userProfile.interests,
  ].some((list) => list.length > 0);

  return Response.json({
    recommendations: ranked
      .slice(0, limit)
      .map(({ club, score, breakdown }) => ({
        ...club,
        recommendation_score: score,
        recommendation_breakdown: breakdown,
      })),
    profileComplete,
    total: ranked.length,
    limit,
  });
});
