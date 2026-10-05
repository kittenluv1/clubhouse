/**
 * @jest-environment node
 */
import { GET } from "@/app/api/clubs/names/route";
import { createSupabaseMock, findCall, makeRequest } from "../helpers/supabaseMock";

let db;
jest.mock("@/app/lib/server-db", () => ({
  get supabaseServer() {
    return db;
  },
}));

beforeEach(() => {
  db = createSupabaseMock({ respond: () => ({ data: [{ OrganizationID: 1, OrganizationName: "A" }] }) });
});

describe("GET /api/clubs/names", () => {
  it("treats LIKE wildcards in the search as literal characters", async () => {
    await GET(makeRequest({ url: "http://localhost/api/clubs/names?search=100%25_" }));

    const [, pattern] = findCall(db.queries[0], "ilike").args;
    expect(pattern).toBe("%100\\%\\_%");
  });

  it("lists every club name when there is no search", async () => {
    const res = await GET(makeRequest({ url: "http://localhost/api/clubs/names" }));

    expect(findCall(db.queries[0], "ilike")).toBeUndefined();
    expect((await res.json()).clubs).toHaveLength(1);
  });
});
