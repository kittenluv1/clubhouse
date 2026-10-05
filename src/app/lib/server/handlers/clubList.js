// Shared response for the paginated club list routes (/api/clubs and the
// category filters). Anyone can list clubs; signed-in users also get their
// own likes and saves marked.

import { createAuthenticatedClient, supabaseServer } from "@/app/lib/server-db";
import { CLUB_SORTS, createClubsRepository, getUserClubMarks } from "@/app/lib/server/repositories/clubs";
import { errorResponse } from "@/app/lib/server/route";

/**
 * @param {string | null} value
 * @returns {value is keyof typeof CLUB_SORTS}
 */
function isClubSort(value) {
  return value !== null && Object.hasOwn(CLUB_SORTS, value);
}

/** @param {URLSearchParams} searchParams */
export function readPageAndSort(searchParams) {
  const page = Number.parseInt(searchParams.get("page") ?? "", 10);
  const sort = searchParams.get("sort");
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    sort: isClubSort(sort) ? sort : "rating",
  };
}

/**
 * @param {Request} req
 * @param {{ name?: string, categories?: string[] }} filter
 */
export async function clubListResponse(req, filter) {
  try {
    const { page, sort } = readPageAndSort(new URL(req.url).searchParams);
    const clubsRepo = createClubsRepository(supabaseServer);
    const { clubs, totalPages } = await clubsRepo.listPage({ ...filter, page, sort });

    const clubIds = clubs.map((club) => club.OrganizationID);
    const [counts, marks] = await Promise.all([clubsRepo.likeCounts(clubIds), userMarks(clubIds)]);

    const likesMap = Object.fromEntries(
      clubIds.map((id) => [id, { count: counts.get(id) ?? 0, userLiked: marks.liked.has(id) }]),
    );

    return Response.json({
      orgList: clubs,
      currPage: page,
      totalNumPages: totalPages,
      likesMap,
      userSavedClubs: clubIds.filter((id) => marks.saved.has(id)),
    });
  } catch (err) {
    return errorResponse(req, err);
  }
}

async function userMarks(clubIds) {
  const none = { liked: new Set(), saved: new Set() };
  if (clubIds.length === 0) return none;

  const supabase = await createAuthenticatedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? getUserClubMarks(supabase, user.id, clubIds) : none;
}
