/**
 * @jest-environment node
 */
import { GET } from "@/app/api/categories/[category]/route";
import { createSupabaseMock, findCall, makeRequest } from "../helpers/supabaseMock";

let db;
jest.mock("@/app/lib/server-db", () => ({
  get supabaseServer() {
    return db;
  },
  createAuthenticatedClient: jest.fn(async () => db),
}));

const clubs = [{ OrganizationID: 1, OrganizationName: "Chess Club" }];

beforeEach(() => {
  db = createSupabaseMock({
    respond: ({ table }) => (table === "clubs" ? { data: clubs, count: 1 } : { data: [] }),
  });
});

const call = (category, url = "http://localhost/api/categories/x?page=1") =>
  GET(makeRequest({ url }), { params: Promise.resolve({ category }) });

describe("GET /api/categories/[category]", () => {
  it("filters clubs by the category from the awaited route params", async () => {
    const res = await call("Academic");

    expect(res.status).toBe(200);
    const clubsQuery = db.queries.find((q) => q.table === "clubs");
    const [filter] = findCall(clubsQuery, "or").args;
    expect(filter).toContain("Academic");
    expect(filter).not.toContain("undefined");
  });

  it("returns the clubs for the requested page", async () => {
    const res = await call("Academic");
    const body = await res.json();
    expect(body.orgList).toEqual(clubs);
    expect(body.totalNumPages).toBe(1);
  });
});

describe("GET /api/categories/[category] filter injection", () => {
  it("keeps a crafted category inside a single quoted condition", async () => {
    await call("x%,OrganizationID.gt.0");

    const clubsQuery = db.queries.find((q) => q.table === "clubs");
    const [filter] = findCall(clubsQuery, "or").args;
    expect(filter).toBe(
      'Category1Name.ilike."%x\\\\%,OrganizationID.gt.0%",Category2Name.ilike."%x\\\\%,OrganizationID.gt.0%"',
    );
  });
});
