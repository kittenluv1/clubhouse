// Data access for per-user on/off markers: liking a club, saving a club and
// liking a review. Each is a row of (user_id, target id) in its own table.

/** @typedef {{ table: string, target: string }} UserToggle */

/** @satisfies {Record<string, UserToggle>} */
export const USER_TOGGLES = {
  clubLike: { table: "club_likes", target: "club_id" },
  clubSave: { table: "club_saves", target: "club_id" },
  reviewLike: { table: "review_likes", target: "review_id" },
};

// Postgres unique_violation: the user already has this row.
const UNIQUE_VIOLATION = "23505";

/**
 * @param {any} supabase client acting as the user (RLS applies)
 * @param {UserToggle} toggle
 */
export function createUserToggleRepository(supabase, { table, target }) {
  return {
    /**
     * @param {string} userId
     * @param {string | number} targetId
     * @returns {Promise<{ created: boolean, row: object | null }>}
     */
    async add(userId, targetId) {
      const { data, error } = await supabase
        .from(table)
        .insert([{ [target]: targetId, user_id: userId }])
        .select();
      if (error?.code === UNIQUE_VIOLATION) return { created: false, row: null };
      if (error) throw error;
      return { created: true, row: data?.[0] ?? null };
    },

    /**
     * @param {string} userId
     * @param {string | number} targetId
     */
    async remove(userId, targetId) {
      const { error } = await supabase.from(table).delete().eq(target, targetId).eq("user_id", userId);
      if (error) throw error;
    },

    /**
     * Number of rows for each target (0 for targets without any).
     * Needs a client that can read every user's rows (service role).
     * @param {Array<string | number>} targetIds
     * @returns {Promise<Map<string | number, number>>}
     */
    async countByTarget(targetIds) {
      const counts = new Map(targetIds.map((id) => [id, 0]));
      if (targetIds.length === 0) return counts;

      const { data, error } = await supabase.from(table).select(target).in(target, targetIds);
      if (error) throw error;

      for (const row of data ?? []) counts.set(row[target], (counts.get(row[target]) ?? 0) + 1);
      return counts;
    },

    /**
     * Which of `targetIds` the user has marked.
     * @param {string} userId
     * @param {Array<string | number>} targetIds
     * @returns {Promise<Set<string | number>>}
     */
    async listMarked(userId, targetIds) {
      if (targetIds.length === 0) return new Set();

      const { data, error } = await supabase.from(table).select(target).eq("user_id", userId).in(target, targetIds);
      if (error) throw error;

      return new Set((data ?? []).map((row) => row[target]));
    },
  };
}
