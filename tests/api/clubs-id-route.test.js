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

function setup({ user = null, clubFound = true, clubLikes = [], reviewLikes = [], userData = {} } = {}) {
  serviceDb = createSupabaseMock({
    respond: ({ table }) => {
      if (table === "clubs") return { data: clubFound ? [club] : [] };
      if (table === "reviews") return { data: reviews.map((r) => ({ ...r })) };
      if (table === "club_likes") return { data: clubLikes };
      if (table === "review_likes") return { data: reviewLikes };
      return { data: [] };
    },
  });
  userDb = createSupabaseMock({ user, respond: ({ table }) => ({ data: userData[table] ?? [] }) });
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

describe("GET /api/clubs/[id] likes and saves", () => {
  it("returns an empty result for an unknown club", async () => {
    setup({ clubFound: false });
    const body = await (await call()).json();

    expect(body.orgList).toEqual([]);
    expect(body.reviews).toEqual([]);
    expect(serviceDb.queries.some((q) => q.table === "reviews")).toBe(false);
  });

  it("counts club likes and review likes for visitors", async () => {
    setup({
      clubLikes: [{ club_id: 7, user_id: "a" }, { club_id: 7, user_id: "b" }],
      reviewLikes: [{ review_id: 1 }, { review_id: 1 }, { review_id: 2 }],
    });
    const body = await (await call()).json();

    expect(body).toMatchObject({
      likeCount: 2,
      currentUserLiked: false,
      currentUserSaved: false,
      reviewLikesMap: { 1: 2, 2: 1 },
      userLikedReviews: [],
    });
  });

  it("reports the signed-in user's club like, save and review likes", async () => {
    setup({
      user: { id: "me" },
      clubLikes: [{ club_id: 7, user_id: "me" }],
      userData: {
        club_likes: [{ club_id: 7 }],
        club_saves: [{ club_id: 7 }],
        review_likes: [{ review_id: 2 }],
      },
    });
    const body = await (await call()).json();

    expect(body).toMatchObject({ currentUserLiked: true, currentUserSaved: true, userLikedReviews: [2] });
  });
});
