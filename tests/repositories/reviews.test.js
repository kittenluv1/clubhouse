/**
 * @jest-environment node
 */
import { createReviewsRepository } from "@/app/lib/server/repositories/reviews";
import { HttpError } from "@/app/lib/server/errors";
import { createSupabaseMock } from "../helpers/supabaseMock";

const user = { id: "u1", email: "student@ucla.edu" };
const input = {
  club_id: 7,
  club_name: "Chess Club",
  review_text: "Edited text",
  membership_start_quarter: "Fall",
  membership_start_year: 2024,
  membership_end_quarter: "Spring",
  membership_end_year: 2025,
  time_commitment_rating: 3,
  inclusivity_rating: 4,
  social_community_rating: 5,
  competitiveness_rating: 2,
  overall_satisfaction: 4,
};

const WRITE_METHODS = ["insert", "update", "delete"];
const op = (query) =>
  query.calls.find((c) => WRITE_METHODS.includes(c.method))?.method ?? "select";
const eqs = (query) =>
  query.calls.filter((c) => c.method === "eq").map((c) => c.args);

/**
 * respond(table, op) → result. Defaults: selects return `existing`, writes succeed.
 */
function setup({
  existing = { id: 10, user_id: "u1", user_alias: "@WiseOwl" },
  fail = {},
} = {}) {
  const db = createSupabaseMock({
    respond: (query) => {
      const kind = op(query);
      const failure = fail[`${query.table}:${kind}`];
      if (failure) return { data: null, error: failure };
      if (kind === "select") {
        return existing
          ? { data: existing }
          : { data: null, error: { code: "PGRST116", message: "no rows" } };
      }
      if (kind === "insert") return { data: { id: 99 } };
      return { data: null };
    },
  });
  return { db, repo: createReviewsRepository(db) };
}

describe("getOwned", () => {
  it("returns the caller's review", async () => {
    const { repo } = setup();
    await expect(
      repo.getOwned("rejected", "10", user.id),
    ).resolves.toMatchObject({ id: 10 });
  });

  it("throws 404 when the review does not exist", async () => {
    const { repo } = setup({ existing: null });
    await expect(
      repo.getOwned("rejected", "10", user.id),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("throws 404 for an id that is not valid for the column", async () => {
    const { repo } = setup({
      fail: {
        "rejected_reviews:select": {
          code: "22P02",
          message: "invalid input syntax",
        },
      },
    });
    await expect(
      repo.getOwned("rejected", "abc", user.id),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("lets other database errors through as unexpected", async () => {
    const { repo } = setup({
      fail: {
        "rejected_reviews:select": {
          code: "08006",
          message: "connection failure",
        },
      },
    });
    const err = await repo.getOwned("rejected", "10", user.id).catch((e) => e);
    expect(err).not.toBeInstanceOf(HttpError);
    expect(err.code).toBe("08006");
  });

  it("throws 403 when someone else owns it", async () => {
    const { repo } = setup({ existing: { id: 10, user_id: "other" } });
    await expect(
      repo.getOwned("approved", "10", user.id),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("reads from the table for the requested status", async () => {
    const { db, repo } = setup();
    await repo.getOwned("approved", "10", user.id);
    expect(db.queries[0].table).toBe("reviews");
  });
});

describe("submit", () => {
  it("queues the review in pending_reviews under the session user", async () => {
    const { db, repo } = setup();

    await repo.submit(user, input, "@CleverOtter");

    const [insert] = db.queries.filter((q) => op(q) === "insert");
    expect(insert.table).toBe("pending_reviews");
    expect(db.callsTo("insert")[0][0]).toEqual({
      ...input,
      user_id: "u1",
      user_email: "student@ucla.edu",
      user_alias: "@CleverOtter",
    });
  });
});

describe("resubmit", () => {
  it("copies the edit into pending_reviews, keeping the original alias", async () => {
    const { db, repo } = setup();

    await repo.resubmit("rejected", "10", user, input);

    expect(db.callsTo("insert")[0][0]).toEqual({
      ...input,
      user_id: "u1",
      user_email: "student@ucla.edu",
      user_alias: "@WiseOwl",
    });
  });

  it("removes the original, scoped to the owner", async () => {
    const { db, repo } = setup();

    await repo.resubmit("approved", "10", user, input);

    const [del] = db.queries.filter(
      (q) => op(q) === "delete" && q.table === "reviews",
    );
    expect(eqs(del)).toEqual(
      expect.arrayContaining([
        ["id", "10"],
        ["user_id", "u1"],
      ]),
    );
  });

  it("rolls back the pending copy when removing the original fails", async () => {
    const { db, repo } = setup({
      fail: { "rejected_reviews:delete": { message: "rls" } },
    });

    await expect(
      repo.resubmit("rejected", "10", user, input),
    ).rejects.toBeDefined();

    const rollback = db.queries.find(
      (q) => q.table === "pending_reviews" && op(q) === "delete",
    );
    expect(rollback).toBeDefined();
    expect(eqs(rollback)).toContainEqual(["id", 99]);
  });

  it("does not touch the original when the review belongs to someone else", async () => {
    const { db, repo } = setup({ existing: { id: 10, user_id: "other" } });

    await expect(
      repo.resubmit("rejected", "10", user, input),
    ).rejects.toMatchObject({ status: 403 });
    expect(db.queries.filter((q) => op(q) !== "select")).toHaveLength(0);
  });
});

describe("deleteOwned", () => {
  it("deletes only after confirming ownership", async () => {
    const { db, repo } = setup({ existing: { id: 10, user_id: "other" } });

    await expect(
      repo.deleteOwned("rejected", "10", user.id),
    ).rejects.toMatchObject({ status: 403 });
    expect(db.queries.filter((q) => op(q) === "delete")).toHaveLength(0);
  });
});

describe("moderate", () => {
  const pending = { id: 5, user_id: "u2", review_text: "hi" };

  it("approving moves the pending review into reviews", async () => {
    const { db, repo } = setup({ existing: pending });

    await repo.moderate("5", true);

    expect(db.queries.find((q) => op(q) === "insert").table).toBe("reviews");
    expect(db.callsTo("insert")[0][0]).toEqual(pending);
    expect(db.queries.find((q) => op(q) === "delete").table).toBe(
      "pending_reviews",
    );
  });

  it("rejecting moves it into rejected_reviews with a fresh updated_at", async () => {
    const { db, repo } = setup({ existing: pending });

    await repo.moderate("5", false);

    expect(db.queries.find((q) => op(q) === "insert").table).toBe(
      "rejected_reviews",
    );
    expect(db.callsTo("insert")[0][0]).toMatchObject({
      ...pending,
      updated_at: expect.any(String),
    });
  });

  it("throws 404 for an unknown pending review", async () => {
    const { repo } = setup({ existing: null });
    await expect(repo.moderate("5", true)).rejects.toMatchObject({
      status: 404,
    });
  });

  it("rolls back the copy when deleting the pending review fails", async () => {
    const { db, repo } = setup({
      existing: pending,
      fail: { "pending_reviews:delete": { message: "x" } },
    });

    await expect(repo.moderate("5", true)).rejects.toBeDefined();

    const rollback = db.queries.find(
      (q) => q.table === "reviews" && op(q) === "delete",
    );
    expect(eqs(rollback)).toContainEqual(["id", 99]);
  });
});
