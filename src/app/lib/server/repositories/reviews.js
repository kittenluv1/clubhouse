// Data access for reviews. Every review is one row in `reviews` whose
// `status` is its moderation state; each state change is one conditional
// update, so there is nothing to roll back.

import { HttpError } from "@/app/lib/server/errors";

/** @typedef {"approved" | "pending" | "rejected"} ReviewStatus */
/** @typedef {import("@/app/lib/reviews/schema").ReviewInput} ReviewInput */

const TABLE = "reviews";

// `.single()` matched no rows / the id is not valid for the column type.
const NOT_FOUND_CODES = new Set(["PGRST116", "22P02"]);

const notFound = () => new HttpError(404, "Review not found");
const conflict = (message) => new HttpError(409, message);

/**
 * @param {any} supabase owner actions use the user's client (RLS applies);
 *   moderation and the pending queue use the service-role client.
 */
export function createReviewsRepository(supabase) {
  /**
   * @param {Record<string, unknown>} filters
   * @param {Record<string, unknown>} changes
   * @returns {Promise<{ id: string } | null>} null when no row matched
   */
  async function updateWhere(filters, changes) {
    let query = supabase.from(TABLE).update(changes);
    for (const [column, value] of Object.entries(filters))
      query = query.eq(column, value);
    const { data, error } = await query.select("id").maybeSingle();
    if (NOT_FOUND_CODES.has(error?.code)) throw notFound();
    if (error) throw error;
    return data;
  }

  /** @param {string} id */
  async function exists(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  return {
    /**
     * @param {ReviewStatus} status
     * @param {string} id
     * @param {string} userId
     */
    async getOwned(status, id, userId) {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("id", id)
        .eq("status", status)
        .single();
      if (NOT_FOUND_CODES.has(error?.code) || (!error && !data))
        throw notFound();
      if (error) throw error;
      if (data.user_id !== userId) throw new HttpError(403, "Forbidden");
      return data;
    },

    /**
     * Queue a new review for moderation.
     * @param {{ id: string, email?: string }} user
     * @param {ReviewInput} input
     * @param {string} alias
     */
    async submit(user, input, alias) {
      const { data, error } = await supabase
        .from(TABLE)
        .insert({
          ...input,
          user_id: user.id,
          user_email: user.email,
          user_alias: alias,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Replace an approved or rejected review's content and send it back to
     * moderation, keeping its id, owner, alias and created_at.
     * @param {"approved" | "rejected"} status
     * @param {string} id
     * @param {{ id: string }} user
     * @param {ReviewInput} input
     */
    async resubmit(status, id, user, input) {
      await this.getOwned(status, id, user.id);
      const updated = await updateWhere(
        { id, user_id: user.id, status },
        { ...input, status: "pending" },
      );
      if (!updated) throw conflict("Review changed; reload and try again");
    },

    /**
     * Only rejected reviews can be deleted (enforced by RLS).
     * @param {"approved" | "rejected"} status
     * @param {string} id
     * @param {string} userId
     */
    async deleteOwned(status, id, userId) {
      await this.getOwned(status, id, userId);
      const { data, error } = await supabase
        .from(TABLE)
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .eq("status", status)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw conflict("Review changed; reload and try again");
    },

    /**
     * The user's reviews grouped by moderation state.
     * @param {string} userId
     */
    async listForUser(userId) {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      /** @type {Record<ReviewStatus, any[]>} */
      const groups = { approved: [], pending: [], rejected: [] };
      for (const review of data ?? []) groups[review.status]?.push(review);
      return groups;
    },

    /**
     * Pending reviews ordered by when they were (re)submitted.
     * @param {{ newestFirst?: boolean }} [options]
     */
    async listPending({ newestFirst = false } = {}) {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("status", "pending")
        .order("updated_at", { ascending: !newestFirst });
      if (error) throw error;
      return data ?? [];
    },

    /**
     * Approve or reject a pending review. Admin only; the caller checks.
     * @param {string} id
     * @param {boolean} approve
     */
    async moderate(id, approve) {
      const status = approve ? "approved" : "rejected";
      if (await updateWhere({ id, status: "pending" }, { status })) return;
      if (!(await exists(id))) throw notFound();
      throw conflict("Review is no longer pending");
    },
  };
}

// Columns of the reviews table. Keep in sync with the database.
export const REVIEW_TABLE_COLUMNS = [
  "id",
  "club_id",
  "club_name",
  "review_text",
  "membership_start_quarter",
  "membership_start_year",
  "membership_end_quarter",
  "membership_end_year",
  "time_commitment_rating",
  "inclusivity_rating",
  "social_community_rating",
  "competitiveness_rating",
  "overall_satisfaction",
  "user_alias",
  "user_id",
  "user_email",
  "status",
  "created_at",
  "updated_at",
];

// Reviews are anonymous: only these fields ever leave the server. user_id is
// read separately to flag the viewer's own reviews and is never returned.
export const PUBLIC_REVIEW_FIELDS = [
  "id",
  "club_id",
  "club_name",
  "review_text",
  "membership_start_quarter",
  "membership_start_year",
  "membership_end_quarter",
  "membership_end_year",
  "time_commitment_rating",
  "inclusivity_rating",
  "social_community_rating",
  "competitiveness_rating",
  "overall_satisfaction",
  "user_alias",
  "created_at",
  "profiles",
];

const REVIEW_COLUMNS = [
  ...PUBLIC_REVIEW_FIELDS.filter((field) => field !== "profiles"),
  "user_id",
  "profiles:user_id ( avatar_id )",
].join(", ");

function toPublicReview(row, viewerId) {
  const review = Object.fromEntries(
    PUBLIC_REVIEW_FIELDS.filter((field) => field in row).map((field) => [
      field,
      row[field],
    ]),
  );
  return {
    ...review,
    is_own_review: viewerId != null && row.user_id === viewerId,
  };
}

/**
 * Approved reviews for a club, safe to show to anyone. `is_own_review` marks
 * the viewer's own reviews.
 * @param {any} supabase service-role client
 * @param {string | number} clubId
 * @param {string | null} viewerId
 */
export async function listPublicReviews(supabase, clubId, viewerId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(REVIEW_COLUMNS)
    .eq("club_id", clubId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => toPublicReview(row, viewerId));
}
