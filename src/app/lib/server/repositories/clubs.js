// Data access for clubs. The clubs table keeps the UCLA API's column names
// (OrganizationID, Category1Name, ...); keep that knowledge in this file.

import { escapeLike, ilikeAnyFilter } from "@/app/lib/server/postgrest";
import {
  createUserToggleRepository,
  USER_TOGGLES,
} from "@/app/lib/server/repositories/userToggles";

/**
 * A clubs table row. Columns mirror the UCLA directory's field names.
 * @typedef {Record<string, any> & {
 *   OrganizationID: string | number,
 *   OrganizationName: string,
 *   Category1Name?: string | null,
 *   Category2Name?: string | null,
 * }} Club
 */

export const CLUBS_PAGE_SIZE = 10;

const desc = (column) => ({ column, ascending: false });
const asc = (column) => ({ column, ascending: true });

/** Sort keys accepted from clients, each with its tie-breakers. */
export const CLUB_SORTS = {
  rating: [
    desc("average_satisfaction"),
    desc("total_num_reviews"),
    asc("OrganizationName"),
    desc("like_count"),
  ],
  reviews: [
    desc("total_num_reviews"),
    desc("average_satisfaction"),
    asc("OrganizationName"),
    desc("like_count"),
  ],
  alphabetical: [
    asc("OrganizationName"),
    desc("average_satisfaction"),
    desc("total_num_reviews"),
    desc("like_count"),
  ],
  likes: [
    desc("like_count"),
    desc("average_satisfaction"),
    desc("total_num_reviews"),
    asc("OrganizationName"),
  ],
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
     * @returns {Promise<{ clubs: Club[], totalPages: number }>}
     */
    async listPage({ page, sort, name, categories }) {
      let query = supabase.from("clubs").select("*", { count: "exact" });

      if (name)
        query = query.ilike("OrganizationName", `%${escapeLike(name)}%`);
      if (categories?.length)
        query = query.or(ilikeAnyFilter(CATEGORY_COLUMNS, categories));

      for (const { column, ascending } of CLUB_SORTS[sort]) {
        query = query.order(column, { ascending, nullsFirst: false });
      }
      query = query.order("OrganizationID", { ascending: true });

      const start = (page - 1) * CLUBS_PAGE_SIZE;
      const { data, count, error } = await query.range(
        start,
        start + CLUBS_PAGE_SIZE - 1,
      );
      if (error) throw error;

      return {
        clubs: data ?? [],
        totalPages: Math.ceil((count ?? 0) / CLUBS_PAGE_SIZE),
      };
    },

    /**
     * Club ids and names, optionally filtered by a name substring.
     * @param {string} [search]
     */
    async listNames(search) {
      let query = supabase
        .from("clubs")
        .select("OrganizationID, OrganizationName")
        .order("OrganizationName", { ascending: true });
      if (search)
        query = query.ilike("OrganizationName", `%${escapeLike(search)}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },

    /**
     * Distinct, non-empty category names across clubs.
     * @returns {Promise<string[]>}
     */
    async listCategoryNames() {
      const { data, error } = await supabase
        .from("clubs")
        .select("Category1Name, Category2Name")
        .limit(1000);
      if (error) throw error;

      const names = new Set();
      for (const { Category1Name, Category2Name } of data ?? []) {
        if (Category1Name) names.add(Category1Name);
        if (Category2Name) names.add(Category2Name);
      }
      return [...names];
    },

    /**
     * Update clubs from the UCLA directory, inserting new ones. Only the
     * columns present in each row are written, so omitted fields keep their
     * stored values.
     * @param {Record<string, unknown>[]} clubs rows keyed by OrganizationID
     */
    async saveClubs(clubs) {
      for (const rows of upsertBatches(clubs)) {
        const { error } = await supabase
          .from("clubs")
          .upsert(rows, { onConflict: "OrganizationID" });
        if (error) throw error;
      }
    },

    /**
     * Every club, for ranking.
     * @returns {Promise<Club[]>}
     */
    async listAll() {
      const { data, error } = await supabase.from("clubs").select("*");
      if (error) throw error;
      return data ?? [];
    },

    /**
     * Number of likes for each club id (0 for clubs without likes).
     * @param {Array<string | number>} clubIds
     */
    likeCounts(clubIds) {
      return createUserToggleRepository(
        supabase,
        USER_TOGGLES.clubLike,
      ).countByTarget(clubIds);
    },

    /**
     * @param {string} clubId
     * @returns {Promise<Club | null>}
     */
    async findById(clubId) {
      const { data, error } = await supabase
        .from("clubs")
        .select("OrganizationID, OrganizationName")
        .eq("OrganizationID", clubId)
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },

    /**
     * @param {string} name exact club name
     * @returns {Promise<Club | null>}
     */
    async findByName(name) {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("OrganizationName", name)
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  };
}

const UPSERT_BATCH_SIZE = 500;

/**
 * Split clubs into upsert batches. A batched upsert writes every column it
 * names for every row, filling gaps with null, so only rows with the same
 * fields share a batch. Duplicate ids keep their last row, since Postgres
 * rejects an upsert that touches the same row twice.
 * @param {Record<string, unknown>[]} clubs
 * @returns {Record<string, unknown>[][]}
 */
function upsertBatches(clubs) {
  const byId = new Map();
  for (const { id: _localId, ...row } of clubs)
    byId.set(row.OrganizationID, row);

  const byFields = new Map();
  for (const row of byId.values()) {
    const fields = Object.keys(row).sort().join(",");
    if (!byFields.has(fields)) byFields.set(fields, []);
    byFields.get(fields).push(row);
  }

  const batches = [];
  for (const rows of byFields.values()) {
    for (let i = 0; i < rows.length; i += UPSERT_BATCH_SIZE)
      batches.push(rows.slice(i, i + UPSERT_BATCH_SIZE));
  }
  return batches;
}

/**
 * Which of `clubIds` the user has liked and saved.
 * @param {any} supabase client acting as the user
 * @param {string} userId
 * @param {Array<string | number>} clubIds
 */
export async function getUserClubMarks(supabase, userId, clubIds) {
  const [liked, saved] = await Promise.all([
    createUserToggleRepository(supabase, USER_TOGGLES.clubLike).listMarked(
      userId,
      clubIds,
    ),
    createUserToggleRepository(supabase, USER_TOGGLES.clubSave).listMarked(
      userId,
      clubIds,
    ),
  ]);
  return { liked, saved };
}

// Foreign keys from the like/save tables to clubs, for embedded selects.
const MARKED_CLUB_JOINS = {
  liked: { table: "club_likes", join: "clubs!club_likes_club_id_fkey" },
  saved: { table: "club_saves", join: "clubs!saved_clubs_club_id_fkey" },
};

/**
 * Clubs the user has liked or saved.
 * @param {any} supabase client acting as the user
 * @param {string} userId
 * @param {"liked" | "saved"} kind
 * @param {string} [columns] club columns to return
 * @returns {Promise<Club[]>}
 */
export async function listMarkedClubs(supabase, userId, kind, columns = "*") {
  const { table, join } = MARKED_CLUB_JOINS[kind];
  const { data, error } = await supabase
    .from(table)
    .select(`club_id, ${join}(${columns})`)
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.clubs).filter(Boolean);
}
