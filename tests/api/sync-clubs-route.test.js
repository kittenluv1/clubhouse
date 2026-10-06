/**
 * @jest-environment node
 */
import { GET } from "@/app/api/route";
import { createSupabaseMock, makeRequest } from "./../helpers/supabaseMock";

let db;
jest.mock("@/app/lib/server-db", () => ({
  get supabaseServer() {
    return db;
  },
}));

const SECRET = "test-cron-secret";
const call = (headers) =>
  GET(makeRequest({ url: "http://localhost/api", headers }));

beforeEach(() => {
  process.env.CRON_SECRET = SECRET;
  db = createSupabaseMock();
  global.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => ({
      orgList: [{ OrganizationID: 1, OrganizationName: "A" }],
      clubSportsOrgList: [],
    }),
  }));
});

afterEach(() => {
  delete process.env.CRON_SECRET;
  delete global.fetch;
});

describe("GET /api (club sync cron)", () => {
  it("rejects requests without the cron secret", async () => {
    const res = await call({});

    expect(res.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(db.queries).toHaveLength(0);
  });

  it("rejects requests with the wrong secret", async () => {
    const res = await call({ authorization: "Bearer nope" });

    expect(res.status).toBe(401);
    expect(db.queries).toHaveLength(0);
  });

  it("fails closed when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await call({ authorization: "Bearer undefined" });

    expect(res.status).toBe(500);
    expect(db.queries).toHaveLength(0);
    console.error.mockRestore();
  });

  it("syncs clubs and reports counts when the secret matches", async () => {
    const res = await call({ authorization: `Bearer ${SECRET}` });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ totalClubs: 1, regularClubs: 1, clubSports: 0 });
    expect(db.queries.some((q) => q.table === "clubs")).toBe(true);
  });

  it("returns 500 when the UCLA API request fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = jest.fn(async () => ({ ok: false, status: 503 }));

    const res = await call({ authorization: `Bearer ${SECRET}` });

    expect(res.status).toBe(500);
    console.error.mockRestore();
  });

  it("drops null fields instead of overwriting stored values with null", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        orgList: [
          {
            OrganizationID: 1,
            OrganizationName: "A",
            OrganizationDescription: null,
          },
        ],
        clubSportsOrgList: [],
      }),
    }));

    await call({ authorization: `Bearer ${SECRET}` });

    const [[row]] = db.callsTo("upsert");
    expect(row).toEqual({ OrganizationID: 1, OrganizationName: "A" });
  });

  it("upserts each club on OrganizationID instead of inserting it", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        orgList: [{ OrganizationID: "1", OrganizationName: "A", id: 99 }],
        clubSportsOrgList: [{ id: "V3Q2-L6L95", name: "Archery" }],
      }),
    }));

    const res = await call({ authorization: `Bearer ${SECRET}` });

    expect(res.status).toBe(200);
    expect(db.callsTo("insert")).toHaveLength(0);
    const upserts = db.callsTo("upsert");
    expect(upserts.map(([row]) => row.OrganizationID)).toEqual([
      "1",
      "V3Q2-L6L95",
    ]);
    for (const [row, options] of upserts) {
      expect(row).not.toHaveProperty("id");
      expect(options).toEqual({ onConflict: "OrganizationID" });
    }
  });

  it("returns 500 when saving a club fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    db = createSupabaseMock({
      respond: () => ({ error: { code: "XX000", message: "boom" } }),
    });

    const res = await call({ authorization: `Bearer ${SECRET}` });

    expect(res.status).toBe(500);
    console.error.mockRestore();
  });
});
