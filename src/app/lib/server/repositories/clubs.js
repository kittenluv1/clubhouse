// Data access for clubs. The clubs table keeps the UCLA API's column names
// (OrganizationID, Category1Name, ...); keep that knowledge in this file.

import { escapeLike, ilikeAnyFilter } from "@/app/lib/server/postgrest";
import { createUserToggleRepository, USER_TOGGLES } from "@/app/lib/server/repositories/userToggles";

export const CLUBS_PAGE_SIZE = 10;

const desc = (column) => ({ column, ascending: false });
const asc = (column) => ({ column, ascending: true });

/** Sort keys accepted from clients, each with its tie-breakers. */
export const CLUB_SORTS = {
  rating: [desc("average_satisfaction"), desc("total_num_reviews"), asc("OrganizationName"), desc("like_count")],
  reviews: [desc("total_num_reviews"), desc("average_satisfaction"), asc("OrganizationName"), desc("like_count")],
  alphabetical: [asc("OrganizationName"), desc("average_satisfaction"), desc("total_num_reviews"), desc("like_count")],
  likes: [desc("like_count"), desc("average_satisfaction"), desc("total_num_reviews"), asc("OrganizationName")],
};

const CATEGORY_COLUMNS = ["Category1Name", "Category2Name"];

/**
 * @typedef {object} ClubListQuery
 * @property {number} page 1-based
 * @property {keyof typeof CLUB_SORTS} sort
 * @property {string} [name] substring of the club name
 * @property {string[]} [categories] match clubs in any of these categories
 */

/**
 * @param {any} supabase service-role client; club data is public
 */
export function createClubsRepository(supabase) {
  return {
    /**
     * @param {ClubListQuery} query
     * @returns {Promise<{ clubs: object[], totalPages: number }>}
     */
    async listPage({ page, sort, name, categories }) {
      let query = supabase.from("clubs").select("*", { count: "exact" });

      if (name) query = query.ilike("OrganizationName", `%${escapeLike(name)}%`);
      if (categories?.length) query = query.or(ilikeAnyFilter(CATEGORY_COLUMNS, categories));

      for (const { column, ascending } of CLUB_SORTS[sort]) {
        query = query.order(column, { ascending, nullsFirst: false });
      }
      query = query.order("OrganizationID", { ascending: true });

      const start = (page - 1) * CLUBS_PAGE_SIZE;
      const { data, count, error } = await query.range(start, start + CLUBS_PAGE_SIZE - 1);
      if (error) throw error;

      return { clubs: data ?? [], totalPages: Math.ceil((count ?? 0) / CLUBS_PAGE_SIZE) };
    },

    /**
     * Number of likes for each club id (0 for clubs without likes).
     * @param {Array<string | number>} clubIds
     */
    likeCounts(clubIds) {
      return createUserToggleRepository(supabase, USER_TOGGLES.clubLike).countByTarget(clubIds);
    },

    /**
     * @param {string} name exact club name
     * @returns {Promise<object | null>}
     */
    async findByName(name) {
      const { data, error } = await supabase.from("clubs").select("*").eq("OrganizationName", name).limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  };
}

/**
 * Which of `clubIds` the user has liked and saved.
 * @param {any} supabase client acting as the user
 * @param {string} userId
 * @param {Array<string | number>} clubIds
 */
export async function getUserClubMarks(supabase, userId, clubIds) {
  const [liked, saved] = await Promise.all([
    createUserToggleRepository(supabase, USER_TOGGLES.clubLike).listMarked(userId, clubIds),
    createUserToggleRepository(supabase, USER_TOGGLES.clubSave).listMarked(userId, clubIds),
  ]);
  return { liked, saved };
}
