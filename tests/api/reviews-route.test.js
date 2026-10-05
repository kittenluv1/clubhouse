/**
 * @jest-environment node
 */
import { POST } from "@/app/api/reviews/route";
import { createSupabaseMock, makeRequest } from "../helpers/supabaseMock";
import { ALIAS_ADJECTIVES, ALIAS_NOUNS } from "@/app/lib/reviews/alias";

let db;
jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(async () => db),
}));

const user = { id: "u1", email: "student@ucla.edu" };
const validReview = {
  club_id: 7,
  club_name: "Chess Club",
  review_text: "Great people.",
  membership_start_quarter: "Fall",
  membership_start_year: 2024,
  membership_end_quarter: "Spring",
  membership_end_year: 2025,
  time_commitment_rating: 3,
  inclusivity_rating: 4,
  social_community_rating: 5,
  competitiveness_rating: 2,
  overall_satisfaction: 4,
  is_current_member: false,
};

function setup({ signedIn = true } = {}) {
  db = createSupabaseMock({
    user: signedIn ? user : null,
    respond: ({ calls }) => {
      const inserted = calls.find((c) => c.method === "insert")?.args[0];
      return { data: inserted ? { id: 1, ...inserted } : null };
    },
  });
}

const post = (body) =>
  POST(makeRequest({ url: "http://localhost/api/reviews", body }));
const insertedRow = () => db.callsTo("insert")[0]?.[0];

describe("POST /api/reviews", () => {
  it("401 when unauthenticated, without inserting", async () => {
    setup({ signedIn: false });

    expect((await post(validReview)).status).toBe(401);
    expect(db.callsTo("insert")).toHaveLength(0);
  });

  it("queues the review for moderation instead of publishing it", async () => {
    setup();

    expect((await post(validReview)).status).toBe(201);
    const [query] = db.queries.filter((q) =>
      q.calls.some((c) => c.method === "insert"),
    );
    expect(query.table).toBe("pending_reviews");
  });

  it("generates the alias on the server and ignores one sent by the client", async () => {
    setup();

    await post({ ...validReview, user_alias: "@TheRealAdmin" });

    const alias = insertedRow().user_alias;
    const generated = ALIAS_ADJECTIVES.some((a) =>
      ALIAS_NOUNS.some((n) => alias === `@${a}${n}`),
    );
    expect(generated).toBe(true);
  });

  it("400 with the reason for an invalid review, without inserting", async () => {
    setup();

    const res = await post({ ...validReview, overall_satisfaction: 9 });

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch("overall_satisfaction");
    expect(db.callsTo("insert")).toHaveLength(0);
  });

  it("400 for a body that is not JSON", async () => {
    setup();

    const res = await POST(
      makeRequest({ url: "http://localhost/api/reviews" }),
    );

    expect(res.status).toBe(400);
  });

  it("takes the author from the session, not the request body", async () => {
    setup();

    await post({
      ...validReview,
      user_id: "victim",
      user_email: "victim@ucla.edu",
    });

    expect(insertedRow()).toMatchObject({
      user_id: "u1",
      user_email: "student@ucla.edu",
    });
  });
});
