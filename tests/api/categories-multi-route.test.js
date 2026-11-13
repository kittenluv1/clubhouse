/**
 * @jest-environment node
 */
import { GET } from "@/app/api/categories/multi/route";
import {
  createSupabaseMock,
  findCall,
  makeRequest,
} from "../helpers/supabaseMock";

let db;
jest.mock("@/app/lib/server-db", () => ({
  get supabaseServer() {
    return db;
  },
  createAuthenticatedClient: jest.fn(async () => db),
}));

beforeEach(() => {
  db = createSupabaseMock({
    respond: ({ table }) =>
      table === "clubs" ? { data: [], count: 0 } : { data: [] },
  });
});

const call = (list) =>
  GET(
    makeRequest({
      url: `http://localhost/api/categories/multi?list=${encodeURIComponent(list)}`,
    }),
  );

describe("GET /api/categories/multi", () => {
  it("matches clubs in any of the listed categories", async () => {
    await call("Arts,Sports");

    const [filter] = findCall(db.queries[0], "or").args;
    expect(filter).toBe(
      'Category1Name.ilike."%Arts%",Category2Name.ilike."%Arts%",' +
        'Category1Name.ilike."%Sports%",Category2Name.ilike."%Sports%"',
    );
  });

  it("keeps reserved characters in a category inside its quoted value", async () => {
    await call("Arts.gt.(0)");

    const [filter] = findCall(db.queries[0], "or").args;
    expect(filter).toBe(
      'Category1Name.ilike."%Arts.gt.(0)%",Category2Name.ilike."%Arts.gt.(0)%"',
    );
  });

  it("accepts a literal % in a category (query params arrive decoded)", async () => {
    const res = await call("100% Fun");

    expect(res.status).toBe(200);
    const [filter] = findCall(db.queries[0], "or").args;
    expect(filter).toContain("%100\\\\% Fun%");
  });

  it("returns an empty page without querying when no list is given", async () => {
    const res = await GET(
      makeRequest({ url: "http://localhost/api/categories/multi" }),
    );
    expect((await res.json()).orgList).toEqual([]);
    expect(db.queries).toHaveLength(0);
  });
});
