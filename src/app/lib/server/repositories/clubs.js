// Data access for clubs. The clubs table keeps the UCLA API's column names
// (OrganizationID, Category1Name, ...); keep that knowledge in this file.

import { escapeLike, ilikeAnyFilter } from "@/app/lib/server/postgrest";

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
     * @returns {Promise<Map<string | number, number>>}
     */
    async likeCounts(clubIds) {
      const counts = new Map(clubIds.map((id) => [id, 0]));
      if (clubIds.length === 0) return counts;

      const { data, error } = await supabase.from("club_likes").select("club_id").in("club_id", clubIds);
      if (error) throw error;

      for (const { club_id } of data ?? []) counts.set(club_id, (counts.get(club_id) ?? 0) + 1);
      return counts;
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
  const idsIn = async (table) => {
    const { data, error } = await supabase.from(table).select("club_id").eq("user_id", userId).in("club_id", clubIds);
    if (error) throw error;
    return new Set((data ?? []).map((row) => row.club_id));
  };
  const [liked, saved] = await Promise.all([idsIn("club_likes"), idsIn("club_saves")]);
  return { liked, saved };
}
