/**
 * @jest-environment node
 */
import { GET } from "@/app/api/recommendations/route";
import { createSupabaseMock, makeRequest } from "../helpers/supabaseMock";

let userDb;
let serviceDb;
jest.mock("@/app/lib/server-db", () => ({
  get supabaseServer() {
    return serviceDb;
  },
  createAuthenticatedClient: jest.fn(async () => userDb),
}));

const club = (id, name, category) => ({
  OrganizationID: id,
  OrganizationName: name,
  Category1Name: category,
});
const allClubs = [
  club(1, "Chess", "Games"),
  club(2, "Go", "Games"),
  club(3, "Dance", "Arts"),
  club(4, "Robotics", "Engineering"),
  ...Array.from({ length: 30 }, (_, i) => club(100 + i, `Club ${i}`, "Misc")),
];

function setup({
  user = { id: "u1" },
  profile = {
    majors: ["Computer Science"],
    minors: [],
    current_clubs: ["dance "],
  },
} = {}) {
  const tables = {
    profiles: { data: profile },
    user_interests: { data: [{ category: "Games" }] },
    club_likes: { data: [{ club_id: 1, clubs: allClubs[0] }] },
    club_saves: { data: [{ club_id: 2, clubs: allClubs[1] }] },
  };
  userDb = createSupabaseMock({
    user,
    respond: ({ table }) => tables[table] ?? { data: [] },
  });
  serviceDb = createSupabaseMock({ respond: () => ({ data: allClubs }) });
}

const get = (query = "") =>
  GET(makeRequest({ url: `http://localhost/api/recommendations${query}` }));
const ids = (body) => body.recommendations.map((c) => c.OrganizationID);

describe("GET /api/recommendations", () => {
  it("401 when nobody is signed in", async () => {
    setup({ user: null });
    expect((await get()).status).toBe(401);
  });

  it("excludes clubs the user liked, saved or is a member of", async () => {
    setup();
    const body = await (await get("?limit=100")).json();

    expect(ids(body)).not.toContain(1);
    expect(ids(body)).not.toContain(2);
    expect(ids(body)).not.toContain(3);
    expect(body.total).toBe(allClubs.length - 3);
  });

  it("attaches a score and breakdown to each recommendation", async () => {
    setup();
    const [first] = (await (await get("?limit=1")).json()).recommendations;

    expect(first).toEqual(
      expect.objectContaining({ recommendation_score: expect.any(Number) }),
    );
    expect(first).toHaveProperty("recommendation_breakdown");
  });

  it("reports whether the profile has enough data", async () => {
    setup({ profile: { majors: [], minors: [], current_clubs: [] } });
    userDb = createSupabaseMock({
      user: { id: "u1" },
      respond: () => ({ data: [] }),
    });

    expect((await (await get()).json()).profileComplete).toBe(false);
  });

  it.each([
    ["", 20],
    ["?limit=5", 5],
    ["?limit=500", 31],
    ["?limit=abc", 20],
    ["?limit=-5", 20],
  ])("limit %s returns %i clubs", async (query, expected) => {
    setup();
    const body = await (await get(query)).json();
    expect(body.recommendations).toHaveLength(expected);
  });
});
