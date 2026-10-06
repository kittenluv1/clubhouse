/**
 * @jest-environment node
 */
import { createReviewsRepository } from "@/app/lib/server/repositories/reviews";
import { HttpError } from "@/app/lib/server/errors";
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

/**
 * respond(table, op) → result. Defaults: selects return `existing`, writes
 * succeed and deletes report one deleted row. `deletesNothing` lists tables
 * whose deletes match no rows, which is what row-level security does to a
 * delete the user is not allowed to make.
 */
function setup({
  existing = { id: 10, user_id: "u1", user_alias: "@WiseOwl" },
  fail = {},
  deletesNothing = [],
  serviceDeletesNothing = false,
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
      if (kind === "delete") {
        return {
          data: deletesNothing.includes(query.table) ? [] : [{ id: 1 }],
        };
      }
      return { data: null };
    },
  });
  const serviceDb = createSupabaseMock({
    respond: () => ({ data: serviceDeletesNothing ? [] : [{ id: 99 }] }),
  });
  return {
    db,
    serviceDb,
    repo: createReviewsRepository(db, { serviceClient: serviceDb }),
  };
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
    const { serviceDb, repo } = setup({
      fail: { "rejected_reviews:delete": { message: "boom" } },
    });

    await expect(
      repo.resubmit("rejected", "10", user, input),
    ).rejects.toBeDefined();

    const [rollback] = serviceDb.queries;
    expect(rollback.table).toBe("pending_reviews");
    expect(op(rollback)).toBe("delete");
    expect(eqs(rollback)).toEqual([["id", 99]]);
  });

  it("fails and rolls back when row-level security blocks removing the original", async () => {
    // Prod has no owner-delete policy on reviews: the delete "succeeds" with
    // zero rows and used to leave the review in both tables.
    const { serviceDb, repo } = setup({ deletesNothing: ["reviews"] });

    await expect(repo.resubmit("approved", "10", user, input)).rejects.toThrow(
      /reviews/,
    );

    const [rollback] = serviceDb.queries;
    expect(rollback.table).toBe("pending_reviews");
    expect(eqs(rollback)).toEqual([["id", 99]]);
  });

  it("logs a review left in both tables when the rollback deletes nothing", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { repo } = setup({
      deletesNothing: ["reviews"],
      serviceDeletesNothing: true,
    });

    await expect(
      repo.resubmit("approved", "10", user, input),
    ).rejects.toBeDefined();

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("99 is now in both reviews and pending_reviews"),
      expect.anything(),
    );
    consoleError.mockRestore();
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
  it("deletes the owner's review", async () => {
    const { repo } = setup();
    await expect(
      repo.deleteOwned("rejected", "10", user.id),
    ).resolves.toBeUndefined();
  });

  it("fails instead of reporting success when nothing was deleted", async () => {
    const { repo } = setup({ deletesNothing: ["reviews"] });
    await expect(repo.deleteOwned("approved", "10", user.id)).rejects.toThrow(
      /reviews/,
    );
  });

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
    const { serviceDb, repo } = setup({
      existing: pending,
      fail: { "pending_reviews:delete": { message: "x" } },
    });

    await expect(repo.moderate("5", true)).rejects.toBeDefined();

    const [rollback] = serviceDb.queries;
    expect(rollback.table).toBe("reviews");
    expect(eqs(rollback)).toEqual([["id", 99]]);
  });

  it("fails and rolls back when the pending review could not be deleted", async () => {
    const { serviceDb, repo } = setup({
      existing: pending,
      deletesNothing: ["pending_reviews"],
    });

    await expect(repo.moderate("5", false)).rejects.toThrow(/pending_reviews/);

    const [rollback] = serviceDb.queries;
    expect(rollback.table).toBe("rejected_reviews");
    expect(eqs(rollback)).toEqual([["id", 99]]);
  });
});
