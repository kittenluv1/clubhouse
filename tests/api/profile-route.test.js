/**
 * @jest-environment node
 */
import { GET } from "@/app/api/profile/route";
import { createSupabaseMock, makeRequest } from "../helpers/supabaseMock";

let userDb;
let serviceDb;
jest.mock("@/app/lib/server-db", () => ({
  get supabaseServer() {
    return serviceDb;
  },
  createAuthenticatedClient: jest.fn(async () => userDb),
}));

const chess = { OrganizationID: 1, OrganizationName: "Chess" };
const dance = { OrganizationID: 2, OrganizationName: "Dance" };

function setup({
  user = { id: "u1" },
  profile = { id: "u1", last_viewed_rejected_at: "2026-01-02T00:00:00Z" },
} = {}) {
  const tables = {
    profiles: { data: profile },
    reviews: { data: [{ id: 1, review_text: "approved" }] },
    pending_reviews: { data: [{ id: 2 }] },
    rejected_reviews: {
      data: [
        { id: 3, updated_at: "2026-01-01T00:00:00Z" },
        { id: 4, updated_at: "2026-01-03T00:00:00Z" },
      ],
    },
    club_likes: { data: [{ club_id: 1, clubs: chess }] },
    club_saves: { data: [{ club_id: 2, clubs: dance }] },
    user_interests: { data: [{ category: "Games" }] },
  };
  userDb = createSupabaseMock({
    user,
    respond: ({ table }) => tables[table] ?? { data: [] },
  });
  serviceDb = createSupabaseMock({
    respond: ({ table }) =>
      table === "club_likes"
        ? { data: [{ club_id: 1 }, { club_id: 1 }] }
        : { data: [] },
  });
}

const get = () => GET(makeRequest({ url: "http://localhost/api/profile" }));

describe("GET /api/profile", () => {
  it("401 when nobody is signed in", async () => {
    setup({ user: null });
    expect((await get()).status).toBe(401);
  });

  it("returns the user's profile, reviews by status and interests", async () => {
    setup();
    const body = await (await get()).json();

    expect(body.profile).toMatchObject({ id: "u1" });
    expect(body.approvedReviews).toEqual([{ id: 1, review_text: "approved" }]);
    expect(body.pendingReviews).toEqual([{ id: 2 }]);
    expect(body.rejectedReviews.map((r) => r.id)).toEqual([3, 4]);
    expect(body.userInterests).toEqual(["Games"]);
  });

  it("counts rejected reviews updated since the last view", async () => {
    setup();
    expect((await (await get()).json()).unreadRejectedCount).toBe(1);
  });

  it("returns liked and saved clubs with their like counts", async () => {
    setup();
    const body = await (await get()).json();

    expect(body.likedClubs).toEqual([{ ...chess, like_count: 2 }]);
    expect(body.savedClubs).toEqual([{ ...dance, like_count: 0 }]);
  });

  it("only reads the signed-in user's rows", async () => {
    setup();
    await get();

    const userScoped = userDb.queries.filter((q) => q.table !== "profiles");
    for (const query of userScoped) {
      expect(query.calls).toContainEqual({
        method: "eq",
        args: ["user_id", "u1"],
      });
    }
  });

  it("returns a null profile when the user has no profile row", async () => {
    setup({ profile: null });
    const res = await get();

    expect(res.status).toBe(200);
    expect((await res.json()).profile).toBeNull();
  });
});
