/**
 * @jest-environment node
 */
import {
  createReviewsRepository,
  listPublicReviews,
} from "@/app/lib/server/repositories/reviews";
import { HttpError } from "@/app/lib/server/errors";
import { REVIEW_MESSAGES } from "@/app/lib/server/reviewMessages";
import { createSupabaseMock } from "../helpers/supabaseMock";

const user = { id: "u1", email: "student@ucla.edu" };
const input = {
  club_id: "V3Q2-L6L95",
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
const writes = (db) => db.queries.filter((q) => op(q) !== "select");

/**
 * Selects return `existing`; updates and deletes match a row unless listed in
 * `matchesNothing`, which is what a stale status filter or row-level security
 * does to a write.
 */
function setup({
  existing = { id: 10, user_id: "u1", user_alias: "@WiseOwl" },
  fail = {},
  matchesNothing = [],
} = {}) {
  const db = createSupabaseMock({
    respond: (query) => {
      const kind = op(query);
      const failure = fail[kind];
      if (failure) return { data: null, error: failure };
      if (kind === "select") {
        if (existing) return { data: existing };
        const isSingle = query.calls.some((c) => c.method === "single");
        return isSingle
          ? { data: null, error: { code: "PGRST116", message: "no rows" } }
          : { data: null };
      }
      if (kind === "insert") return { data: { id: 99 } };
      if (kind === "update")
        return { data: matchesNothing.includes("update") ? null : { id: 10 } };
      return { data: matchesNothing.includes("delete") ? [] : [{ id: 10 }] };
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

  it("reads the review only in the requested status", async () => {
    const { db, repo } = setup();
    await repo.getOwned("approved", "10", user.id);

    expect(db.queries[0].table).toBe("reviews");
    expect(eqs(db.queries[0])).toEqual([
      ["id", "10"],
      ["status", "approved"],
    ]);
  });

  it("throws 404 when the review does not exist in that status", async () => {
    const { repo } = setup({ existing: null });
    await expect(
      repo.getOwned("rejected", "10", user.id),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("throws 404 for an id that is not valid for the column", async () => {
    const { repo } = setup({
      fail: { select: { code: "22P02", message: "invalid input syntax" } },
    });
    await expect(
      repo.getOwned("rejected", "abc", user.id),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("lets other database errors through as unexpected", async () => {
    const { repo } = setup({
      fail: { select: { code: "08006", message: "connection failure" } },
    });
    const err = await repo.getOwned("rejected", "10", user.id).catch((e) => e);
    expect(err).not.toBeInstanceOf(HttpError);
    expect(err.code).toBe("08006");
  });

  it("throws the same 404 when someone else owns it, so ids do not leak", async () => {
    const { repo } = setup({ existing: { id: 10, user_id: "other" } });
    await expect(
      repo.getOwned("approved", "10", user.id),
    ).rejects.toMatchObject({ status: 404, message: REVIEW_MESSAGES.notFound });
  });
});

describe("submit", () => {
  it("inserts a pending review under the session user", async () => {
    const { db, repo } = setup();

    await repo.submit(user, input, "@CleverOtter");

    const [insert] = writes(db);
    expect(insert.table).toBe("reviews");
    expect(db.callsTo("insert")[0][0]).toEqual({
      ...input,
      user_id: "u1",
      user_email: "student@ucla.edu",
      user_alias: "@CleverOtter",
      status: "pending",
    });
  });
});

describe("resubmit", () => {
  it.each(["approved", "rejected"])(
    "updates the %s review in place and sends it back to pending",
    async (status) => {
      const { db, repo } = setup();

      await repo.resubmit(status, "10", user.id, input);

      const [update] = writes(db);
      expect(op(update)).toBe("update");
      expect(update.table).toBe("reviews");
      expect(db.callsTo("update")[0][0]).toEqual({
        ...input,
        status: "pending",
      });
      expect(eqs(update)).toEqual([
        ["id", "10"],
        ["user_id", "u1"],
        ["status", status],
      ]);
    },
  );

  it("does not write when the review belongs to someone else", async () => {
    const { db, repo } = setup({ existing: { id: 10, user_id: "other" } });

    await expect(
      repo.resubmit("rejected", "10", user.id, input),
    ).rejects.toMatchObject({ status: 404 });
    expect(writes(db)).toHaveLength(0);
  });

  it("does not write when the review is not in that status", async () => {
    const { db, repo } = setup({ existing: null });

    await expect(
      repo.resubmit("approved", "10", user.id, input),
    ).rejects.toMatchObject({ status: 404 });
    expect(writes(db)).toHaveLength(0);
  });

  it("409 when the review changed between the read and the update", async () => {
    const { repo } = setup({ matchesNothing: ["update"] });

    await expect(
      repo.resubmit("approved", "10", user.id, input),
    ).rejects.toMatchObject({ status: 409, message: REVIEW_MESSAGES.changed });
  });

  it("lets update errors through as unexpected", async () => {
    const { repo } = setup({ fail: { update: { message: "boom" } } });

    const err = await repo
      .resubmit("approved", "10", user.id, input)
      .catch((e) => e);
    expect(err).not.toBeInstanceOf(HttpError);
  });
});

describe("deleteOwned", () => {
  it("deletes the owner's review, scoped to owner and status", async () => {
    const { db, repo } = setup();

    await expect(
      repo.deleteOwned("rejected", "10", user.id),
    ).resolves.toBeUndefined();

    const [del] = writes(db);
    expect(op(del)).toBe("delete");
    expect(eqs(del)).toEqual([
      ["id", "10"],
      ["user_id", "u1"],
      ["status", "rejected"],
    ]);
  });

  it("fails instead of reporting success when nothing was deleted", async () => {
    const { repo } = setup({ matchesNothing: ["delete"] });
    await expect(
      repo.deleteOwned("rejected", "10", user.id),
    ).rejects.toMatchObject({ status: 409, message: REVIEW_MESSAGES.changed });
  });

  it("lets delete errors through as unexpected", async () => {
    const { repo } = setup({ fail: { delete: { message: "boom" } } });
    const err = await repo
      .deleteOwned("rejected", "10", user.id)
      .catch((e) => e);
    expect(err).not.toBeInstanceOf(HttpError);
  });

  it("deletes only after confirming ownership", async () => {
    const { db, repo } = setup({ existing: { id: 10, user_id: "other" } });

    await expect(
      repo.deleteOwned("rejected", "10", user.id),
    ).rejects.toMatchObject({ status: 404 });
    expect(writes(db)).toHaveLength(0);
  });
});

describe("listForUser", () => {
  it("reads the user's reviews once and groups them by status", async () => {
    const rows = [
      { id: 1, status: "approved" },
      { id: 2, status: "pending" },
      { id: 3, status: "rejected" },
      { id: 4, status: "approved" },
    ];
    const db = createSupabaseMock({ respond: () => ({ data: rows }) });

    const grouped = await createReviewsRepository(db).listForUser("u1");

    expect(db.queries).toHaveLength(1);
    expect(eqs(db.queries[0])).toEqual([["user_id", "u1"]]);
    expect(grouped).toEqual({
      approved: [rows[0], rows[3]],
      pending: [rows[1]],
      rejected: [rows[2]],
    });
  });

  it("returns empty groups when the user has no reviews", async () => {
    const db = createSupabaseMock({ respond: () => ({ data: null }) });
    await expect(
      createReviewsRepository(db).listForUser("u1"),
    ).resolves.toEqual({ approved: [], pending: [], rejected: [] });
  });

  it("lets database errors through", async () => {
    const db = createSupabaseMock({
      respond: () => ({ error: { message: "boom" } }),
    });
    await expect(
      createReviewsRepository(db).listForUser("u1"),
    ).rejects.toMatchObject({ message: "boom" });
  });
});

describe("listPending", () => {
  it.each([
    [false, true],
    [true, false],
  ])(
    "lists pending reviews by last submission (newestFirst=%p)",
    async (newestFirst, ascending) => {
      const db = createSupabaseMock({ respond: () => ({ data: [{ id: 1 }] }) });

      const pending = await createReviewsRepository(db).listPending({
        newestFirst,
      });

      expect(pending).toEqual([{ id: 1 }]);
      expect(eqs(db.queries[0])).toEqual([["status", "pending"]]);
      expect(db.callsTo("order")[0]).toEqual(["updated_at", { ascending }]);
    },
  );
});

describe("moderate", () => {
  it("approving updates the review only while it is pending", async () => {
    const { db, repo } = setup();

    await repo.moderate("5", true);

    const [update] = writes(db);
    expect(op(update)).toBe("update");
    expect(db.callsTo("update")[0][0]).toEqual({ status: "approved" });
    expect(eqs(update)).toEqual([
      ["id", "5"],
      ["status", "pending"],
    ]);
  });

  it("rejecting only changes the status (the database sets updated_at)", async () => {
    const { db, repo } = setup();

    await repo.moderate("5", false);

    expect(db.callsTo("update")[0][0]).toEqual({ status: "rejected" });
  });

  it("404 when the review does not exist", async () => {
    const { repo } = setup({ existing: null, matchesNothing: ["update"] });
    await expect(repo.moderate("5", true)).rejects.toMatchObject({
      status: 404,
    });
  });

  it("404 for an id that is not a valid uuid", async () => {
    const { repo } = setup({ fail: { update: { code: "22P02" } } });
    await expect(repo.moderate("abc", true)).rejects.toMatchObject({
      status: 404,
    });
  });

  it("409 when the review is no longer pending", async () => {
    const { repo } = setup({ matchesNothing: ["update"] });
    await expect(repo.moderate("5", false)).rejects.toMatchObject({
      status: 409,
      message: REVIEW_MESSAGES.notPending,
    });
  });

  it("lets errors from the existence check through", async () => {
    const { repo } = setup({
      matchesNothing: ["update"],
      fail: { select: { code: "08006" } },
    });
    const err = await repo.moderate("5", true).catch((e) => e);
    expect(err).not.toBeInstanceOf(HttpError);
  });
});

describe("listPublicReviews", () => {
  it("lists only approved reviews for the club", async () => {
    const db = createSupabaseMock({ respond: () => ({ data: [] }) });

    await listPublicReviews(db, "V3Q2-L6L95", null);

    expect(eqs(db.queries[0])).toEqual([
      ["club_id", "V3Q2-L6L95"],
      ["status", "approved"],
    ]);
  });
});
