/**
 * @jest-environment node
 */
import { GET as listClubs } from "@/app/api/clubs/route";
import { GET as listCategory } from "@/app/api/categories/[category]/route";
import { GET as listMulti } from "@/app/api/categories/multi/route";
import { createSupabaseMock, findCall, makeRequest } from "../helpers/supabaseMock";

let serviceDb;
let userDb;
jest.mock("@/app/lib/server-db", () => ({
  get supabaseServer() {
    return serviceDb;
  },
  createAuthenticatedClient: jest.fn(async () => userDb),
}));

const clubs = [{ OrganizationID: 1 }, { OrganizationID: 2 }, { OrganizationID: "V3Q2" }];

function setup({ user = null, likes = [], userLikes = [], userSaves = [], count = 23 } = {}) {
  serviceDb = createSupabaseMock({
    respond: ({ table }) => {
      if (table === "clubs") return { data: clubs, count };
      if (table === "club_likes") return { data: likes };
      return { data: [] };
    },
  });
  userDb = createSupabaseMock({
    user,
    respond: ({ table }) => ({ data: table === "club_likes" ? userLikes : userSaves }),
  });
}

const clubsQuery = () => serviceDb.queries.find((q) => q.table === "clubs");
const get = (query = "") => listClubs(makeRequest({ url: `http://localhost/api/clubs${query}` }));

describe("GET /api/clubs", () => {
  it("returns the requested page and page count", async () => {
    setup();
    const body = await (await get("?page=2")).json();

    expect(findCall(clubsQuery(), "range").args).toEqual([10, 19]);
    expect(body).toMatchObject({ orgList: clubs, currPage: 2, totalNumPages: 3 });
  });

  it.each(["abc", "0", "-3"])("treats page=%s as the first page", async (page) => {
    setup();
    const body = await (await get(`?page=${page}`)).json();

    expect(findCall(clubsQuery(), "range").args).toEqual([0, 9]);
    expect(body.currPage).toBe(1);
  });

  it("orders by the requested sort, then by id", async () => {
    setup();
    await get("?sort=likes");

    const orders = clubsQuery().calls.filter((c) => c.method === "order").map((c) => c.args[0]);
    expect(orders).toEqual(["like_count", "average_satisfaction", "total_num_reviews", "OrganizationName", "OrganizationID"]);
  });

  it("falls back to rating order for an unknown sort", async () => {
    setup();
    await get("?sort=bogus");

    const firstOrder = findCall(clubsQuery(), "order").args;
    expect(firstOrder).toEqual(["average_satisfaction", { ascending: false, nullsFirst: false }]);
  });

  it("filters by name when one is given", async () => {
    setup();
    await get("?name=chess");

    expect(findCall(clubsQuery(), "ilike").args).toEqual(["OrganizationName", "%chess%"]);
  });

  it("counts likes per club for signed-out visitors", async () => {
    setup({ likes: [{ club_id: 1 }, { club_id: 1 }, { club_id: "V3Q2" }] });
    const body = await (await get()).json();

    expect(body.likesMap).toEqual({
      1: { count: 2, userLiked: false },
      2: { count: 0, userLiked: false },
      V3Q2: { count: 1, userLiked: false },
    });
    expect(body.userSavedClubs).toEqual([]);
  });

  it("marks the signed-in user's likes and saves", async () => {
    setup({
      user: { id: "u1" },
      likes: [{ club_id: 1 }],
      userLikes: [{ club_id: 1 }],
      userSaves: [{ club_id: 2 }],
    });
    const body = await (await get()).json();

    expect(body.likesMap[1]).toEqual({ count: 1, userLiked: true });
    expect(body.userSavedClubs).toEqual([2]);
  });
});

describe("category list routes share the club list behaviour", () => {
  it("/api/categories/[category] paginates and counts likes like /api/clubs", async () => {
    setup({ likes: [{ club_id: 2 }] });
    const res = await listCategory(makeRequest({ url: "http://localhost/api/categories/Arts?page=3" }), {
      params: Promise.resolve({ category: "Arts" }),
    });
    const body = await res.json();

    expect(findCall(clubsQuery(), "range").args).toEqual([20, 29]);
    expect(body.likesMap[2]).toEqual({ count: 1, userLiked: false });
  });

  it("/api/categories/multi paginates and counts likes like /api/clubs", async () => {
    setup({ likes: [{ club_id: 1 }] });
    const res = await listMulti(makeRequest({ url: "http://localhost/api/categories/multi?list=Arts&page=2" }));
    const body = await res.json();

    expect(findCall(clubsQuery(), "range").args).toEqual([10, 19]);
    expect(body.likesMap[1]).toEqual({ count: 1, userLiked: false });
  });
});
