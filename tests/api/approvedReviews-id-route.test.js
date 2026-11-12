/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/approvedReviews/[id]/route";
import { createAuthenticatedClient } from "@/app/lib/server-db";
import { REVIEW_MESSAGES } from "@/app/lib/server/reviewMessages";
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
  user = { id: "u1", email: "student@ucla.edu" },
  review = { id: 10, user_id: "u1", status: "approved" },
} = {}) {
  db = createSupabaseMock({
    user,
    respond: ({ calls }) => {
      if (calls.some((c) => c.method === "update")) return { data: { id: 10 } };
      return review
        ? { data: review }
        : { data: null, error: { code: "PGRST116", message: "no rows" } };
    },
  });
  clubsDb = createSupabaseMock({
    respond: () => ({
      data: [{ OrganizationID: "V3Q2-L6L95", OrganizationName: "Archery" }],
    }),
  });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/approvedReviews/[id]", () => {
  it("401 when unauthenticated", async () => {
    setup({ user: null });
    expect((await GET({}, params)).status).toBe(401);
  });

  it("404 when the review does not exist", async () => {
    setup({ review: null });
    expect((await GET({}, params)).status).toBe(404);
  });

  it("only looks for an approved review", async () => {
    setup();
    await GET({}, params);
    expect(db.queries[0].calls).toContainEqual({
      method: "eq",
      args: ["status", "approved"],
    });
  });

  it("404 when the review belongs to another user", async () => {
    setup({ review: { id: 10, user_id: "someone-else" } });
    expect((await GET({}, params)).status).toBe(404);
  });

  it("200 and returns the review to its owner", async () => {
    setup();
    const res = await GET({}, params);
    expect(res.status).toBe(200);
    expect((await res.json()).review).toEqual({
      id: 10,
      user_id: "u1",
      status: "approved",
    });
  });

  it("500 on an unexpected error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    createAuthenticatedClient.mockRejectedValueOnce(new Error("boom"));
    expect((await GET({}, params)).status).toBe(500);
    console.error.mockRestore();
  });
});

describe("POST /api/approvedReviews/[id] (edit)", () => {
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

  it("sends the same review back to pending instead of creating a new one", async () => {
    setup();

    const res = await POST(makeRequest({ body: edit }), params);

    expect(res.status).toBe(200);
    expect((await res.json()).message).toBe(REVIEW_MESSAGES.resubmitted);
    expect(db.callsTo("insert")).toHaveLength(0);
    expect(db.callsTo("delete")).toHaveLength(0);
    const [update] = db.queries.filter((q) =>
      q.calls.some((c) => c.method === "update"),
    );
    expect(update.calls).toEqual(
      expect.arrayContaining([
        { method: "eq", args: ["id", "10"] },
        { method: "eq", args: ["user_id", "u1"] },
        { method: "eq", args: ["status", "approved"] },
      ]),
    );
    expect(db.callsTo("update")[0][0]).toMatchObject({ status: "pending" });
  });
});
