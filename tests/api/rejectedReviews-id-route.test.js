/**
 * @jest-environment node
 */
import { DELETE } from "@/app/api/rejectedReviews/[id]/route";
import { createSupabaseMock, makeRequest } from "../helpers/supabaseMock";

let db;
let clubsDb;
jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(async () => db),
  get supabaseServer() {
    return clubsDb;
  },
}));

const params = { params: Promise.resolve({ id: "10" }) };

function setup({
  user = { id: "u1" },
  review = { id: 10, user_id: "u1" },
} = {}) {
  db = createSupabaseMock({
    user,
    respond: ({ calls }) => {
      const isDelete = calls.some((c) => c.method === "delete");
      if (isDelete) return { data: [{ id: 10 }] };
      return review
        ? { data: review }
        : { data: null, error: { code: "PGRST116", message: "no rows" } };
    },
  });
}

const deleteQueries = () =>
  db.queries.filter((q) => q.calls.some((c) => c.method === "delete"));

describe("DELETE /api/rejectedReviews/[id]", () => {
  it("401 when unauthenticated, without deleting anything", async () => {
    setup({ user: null });

    expect((await DELETE(makeRequest(), params)).status).toBe(401);
    expect(deleteQueries()).toHaveLength(0);
  });

  it("404 when the review does not exist", async () => {
    setup({ review: null });

    expect((await DELETE(makeRequest(), params)).status).toBe(404);
    expect(deleteQueries()).toHaveLength(0);
  });

  it("403 when the review belongs to another user, without deleting it", async () => {
    setup({ review: { id: 10, user_id: "someone-else" } });

    expect((await DELETE(makeRequest(), params)).status).toBe(403);
    expect(deleteQueries()).toHaveLength(0);
  });

  it("deletes the owner's review, scoped to their user id", async () => {
    setup();

    expect((await DELETE(makeRequest(), params)).status).toBe(200);
    const [query] = deleteQueries();
    expect(query.table).toBe("rejected_reviews");
    const filters = query.calls
      .filter((c) => c.method === "eq")
      .map((c) => c.args);
    expect(filters).toEqual(
      expect.arrayContaining([
        ["id", "10"],
        ["user_id", "u1"],
      ]),
    );
  });
});

describe("POST /api/rejectedReviews/[id] (resubmit)", () => {
  const { POST } = require("@/app/api/rejectedReviews/[id]/route");
  const edit = {
    club_id: "V3Q2-L6L95",
    club_name: "Chess Club",
    review_text: "Edited",
    membership_start_quarter: "Fall",
    membership_start_year: 2024,
    membership_end_quarter: "Spring",
    membership_end_year: 2025,
    time_commitment_rating: 3,
    inclusivity_rating: 4,
    social_community_rating: 5,
    competitiveness_rating: 2,
    overall_satisfaction: 4,
    is_current_member: true,
  };
  const post = (body) => POST(makeRequest({ body }), params);

  const clubLookup = (exists) =>
    createSupabaseMock({
      respond: () => ({
        data: exists
          ? [{ OrganizationID: edit.club_id, OrganizationName: "Archery" }]
          : [],
      }),
    });

  beforeEach(() => {
    clubsDb = clubLookup(true);
    db = createSupabaseMock({
      user: { id: "u1", email: "student@ucla.edu" },
      respond: ({ calls }) => {
        const method = (name) => calls.some((c) => c.method === name);
        if (method("delete")) return { data: [{ id: 10 }] };
        if (method("insert")) return { data: { id: 11 } };
        return { data: { id: 10, user_id: "u1", user_alias: "@WiseOwl" } };
      },
    });
  });

  it("400 for an invalid edit, without writing", async () => {
    const res = await post({ ...edit, review_text: "" });

    expect(res.status).toBe(400);
    expect(db.callsTo("insert")).toHaveLength(0);
  });

  it("queues the edit under the original alias", async () => {
    const res = await post({ ...edit, user_alias: "@Other" });

    expect(res.status).toBe(200);
    const row = db.callsTo("insert")[0][0];
    expect(row.user_alias).toBe("@WiseOwl");
    expect(row.club_name).toBe("Archery");
    expect(row).not.toHaveProperty("is_current_member");
  });

  it("400 when the edit points at a club that does not exist", async () => {
    clubsDb = clubLookup(false);

    const res = await post(edit);

    expect(res.status).toBe(400);
    expect(db.callsTo("insert")).toHaveLength(0);
    expect(db.callsTo("delete")).toHaveLength(0);
  });
});
