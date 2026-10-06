// Data access for reviews. Route handlers call these functions instead of
// building Supabase queries, so table names, column lists and the rules for
// moving a review between states live in one place.
//
// A review lives in one of three tables depending on its moderation state.
// Moving it means inserting a copy and deleting the original; PostgREST has no
// transactions, so if the delete fails the copy is removed again.
//
// Row-level security turns a forbidden delete into one that matches no rows
// and reports no error, so deletes check how many rows they removed.

import { HttpError } from "@/app/lib/server/errors";

/** @typedef {"approved" | "pending" | "rejected"} ReviewStatus */
/** @typedef {import("@/app/lib/reviews/schema").ReviewInput} ReviewInput */

/** @type {Record<ReviewStatus, string>} */
export const REVIEW_TABLES = {
  approved: "reviews",
  pending: "pending_reviews",
  rejected: "rejected_reviews",
};

// `.single()` matched no rows / the id is not valid for the column type.
const NOT_FOUND_CODES = new Set(["PGRST116", "22P02"]);

/**
 * @param {any} supabase a Supabase client; RLS applies as that client's user
 * @param {{ serviceClient?: any }} [options] service-role client used only to
 *   roll back a copy this repository just inserted. Users cannot delete
 *   pending reviews and the admin cannot delete approved or rejected ones, so
 *   a rollback through `supabase` would match no rows.
 */
export function createReviewsRepository(
  supabase,
  { serviceClient = supabase } = {},
) {
  async function findById(table, id, columns = "*") {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq("id", id)
      .single();
    if (NOT_FOUND_CODES.has(error?.code) || (!error && !data))
      throw new HttpError(404, "Review not found");
    if (error) throw error;
    return data;
  }

  /**
   * Delete matching rows from `table`, failing if none were deleted.
   * @param {any} client
   * @param {string} table
   * @param {Record<string, unknown>} filters
   */
  async function deleteRows(client, table, filters) {
    let remove = client.from(table).delete();
    for (const [column, value] of Object.entries(filters))
      remove = remove.eq(column, value);
    const { data, error } = await remove.select("id");
    if (error) throw error;
    if (!data?.length) {
      throw new Error(
        `Deleting review ${filters.id} from ${table} matched no rows (missing row-level security policy?)`,
      );
    }
  }

  /** Insert `row` into `toTable`, then delete `id` from `fromTable`. */
  async function move(fromTable, toTable, id, row, deleteFilters = {}) {
    const { data: inserted, error: insertError } = await supabase
      .from(toTable)
      .insert(row)
      .select("id")
      .single();
    if (insertError) throw insertError;

    try {
      await deleteRows(supabase, fromTable, { id, ...deleteFilters });
    } catch (deleteError) {
      try {
        await deleteRows(serviceClient, toTable, { id: inserted.id });
      } catch (rollbackError) {
        console.error(
          `Rollback failed: review ${inserted.id} is now in both ${fromTable} and ${toTable}`,
          rollbackError,
        );
      }
      throw deleteError;
    }
  }

  return {
    /**
     * @param {ReviewStatus} status
     * @param {string} id
     * @param {string} userId
     */
    async getOwned(status, id, userId) {
      const review = await findById(REVIEW_TABLES[status], id);
      if (review.user_id !== userId) throw new HttpError(403, "Forbidden");
      return review;
    },

    /**
     * Queue a new review for moderation.
     * @param {{ id: string, email?: string }} user
     * @param {ReviewInput} input
     * @param {string} alias
     */
    async submit(user, input, alias) {
      const { data, error } = await supabase
        .from(REVIEW_TABLES.pending)
        .insert({
          ...input,
          user_id: user.id,
          user_email: user.email,
          user_alias: alias,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Replace an approved or rejected review with an edited copy awaiting
     * moderation. The reviewer keeps their alias.
     * @param {"approved" | "rejected"} status
     * @param {string} id
     * @param {{ id: string, email?: string }} user
     * @param {ReviewInput} input
     */
    async resubmit(status, id, user, input) {
      const existing = await this.getOwned(status, id, user.id);
      const row = {
        ...input,
        user_id: user.id,
        user_email: user.email,
        user_alias: existing.user_alias,
      };
      await move(REVIEW_TABLES[status], REVIEW_TABLES.pending, id, row, {
        user_id: user.id,
      });
    },

    /**
     * @param {ReviewStatus} status
     * @param {string} id
     * @param {string} userId
     */
    async deleteOwned(status, id, userId) {
      await this.getOwned(status, id, userId);
      await deleteRows(supabase, REVIEW_TABLES[status], {
        id,
        user_id: userId,
      });
    },

    /**
     * The user's reviews in every moderation state.
     * @param {string} userId
     */
    async listForUser(userId) {
      const list = async (table) => {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("user_id", userId);
        if (error) throw error;
        return data ?? [];
      };
      const [approved, pending, rejected] = await Promise.all([
        list(REVIEW_TABLES.approved),
        list(REVIEW_TABLES.pending),
        list(REVIEW_TABLES.rejected),
      ]);
      return { approved, pending, rejected };
    },

    /** @param {{ newestFirst?: boolean }} [options] */
    async listPending({ newestFirst = false } = {}) {
      const { data, error } = await supabase
        .from(REVIEW_TABLES.pending)
        .select("*")
        .order("created_at", { ascending: !newestFirst });
      if (error) throw error;
      return data ?? [];
    },

    /**
     * Approve or reject a pending review (admin only; enforced by caller and RLS).
     * @param {string} id
     * @param {boolean} approve
     */
    async moderate(id, approve) {
      const review = await findById(REVIEW_TABLES.pending, id);
      if (approve) {
        await move(REVIEW_TABLES.pending, REVIEW_TABLES.approved, id, review);
      } else {
        const row = { ...review, updated_at: new Date().toISOString() };
        await move(REVIEW_TABLES.pending, REVIEW_TABLES.rejected, id, row);
      }
    },
  };
}

// Columns of the reviews, pending_reviews and rejected_reviews tables
// (rejected_reviews also has updated_at). Keep in sync with the database.
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
 * @param {any} supabase service-role client (reviews are public once approved)
 * @param {string | number} clubId
 * @param {string | null} viewerId
 */
export async function listPublicReviews(supabase, clubId, viewerId) {
  const { data, error } = await supabase
    .from(REVIEW_TABLES.approved)
    .select(REVIEW_COLUMNS)
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => toPublicReview(row, viewerId));
}
