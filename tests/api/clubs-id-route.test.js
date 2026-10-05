/**
 * @jest-environment node
 */
import { GET } from "@/app/api/clubs/[id]/route";
import { createSupabaseMock, findCall, makeRequest } from "../helpers/supabaseMock";

let serviceDb;
let userDb;
jest.mock("@/app/lib/server-db", () => ({
  get supabaseServer() {
    return serviceDb;
  },
  createAuthenticatedClient: jest.fn(async () => userDb),
}));

const club = { OrganizationID: 7, OrganizationName: "Chess Club" };
const reviews = [
  { id: 1, user_id: "me", user_email: "me@ucla.edu", user_alias: "@WiseOwl", review_text: "great" },
  { id: 2, user_id: "other", user_email: "other@ucla.edu", user_alias: "@BraveFox", review_text: "ok" },
];

function setup({ user = null } = {}) {
  serviceDb = createSupabaseMock({
    respond: ({ table }) => {
      if (table === "clubs") return { data: [club] };
      if (table === "reviews") return { data: reviews.map((r) => ({ ...r })) };
      return { data: [] };
    },
  });
  userDb = createSupabaseMock({ user, respond: () => ({ data: [] }) });
}

const call = (id = club.OrganizationName) =>
  GET(makeRequest({ url: "http://localhost/api/clubs/x" }), { params: Promise.resolve({ id }) });

describe("GET /api/clubs/[id] reviewer privacy", () => {
  it("never returns reviewer emails or user ids", async () => {
    setup();
    const body = await (await call()).json();

    expect(body.reviews).toHaveLength(2);
    for (const review of body.reviews) {
      expect(review).not.toHaveProperty("user_email");
      expect(review).not.toHaveProperty("user_id");
    }
    expect(body).not.toHaveProperty("currentUserId");
  });

  it("selects an explicit column list that excludes user_email", async () => {
    setup();
    await call();

    const reviewsQuery = serviceDb.queries.find((q) => q.table === "reviews");
    const [columns] = findCall(reviewsQuery, "select").args;
    expect(columns).not.toMatch(/\*/);
    expect(columns).not.toMatch(/user_email/);
  });

  it("flags only the signed-in user's own reviews", async () => {
    setup({ user: { id: "me" } });
    const body = await (await call()).json();

    expect(body.reviews.map((r) => [r.id, r.is_own_review])).toEqual([
      [1, true],
      [2, false],
    ]);
  });

  it("flags no reviews for signed-out visitors", async () => {
    setup();
    const body = await (await call()).json();

    expect(body.reviews.every((r) => r.is_own_review === false)).toBe(true);
  });
});

describe("GET /api/clubs/[id] club lookup", () => {
  it("finds clubs whose name contains % (params arrive decoded)", async () => {
    setup();
    const res = await call("100% Chess");

    expect(res.status).toBe(200);
    expect((await res.json()).orgList).toEqual([club]);
  });
});
