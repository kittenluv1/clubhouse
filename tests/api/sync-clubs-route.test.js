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

    const [[rows]] = db.callsTo("upsert");
    expect(rows).toEqual([{ OrganizationID: 1, OrganizationName: "A" }]);
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
    expect(
      upserts.flatMap(([rows]) => rows.map((row) => row.OrganizationID)),
    ).toEqual(["1", "V3Q2-L6L95"]);
    for (const [rows, options] of upserts) {
      for (const row of rows) expect(row).not.toHaveProperty("id");
      expect(options).toEqual({ onConflict: "OrganizationID" });
    }
  });

  const syncOrgs = async (orgList) => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ orgList, clubSportsOrgList: [] }),
    }));
    const res = await call({ authorization: `Bearer ${SECRET}` });
    expect(res.status).toBe(200);
    return db.callsTo("upsert").map(([rows]) => rows);
  };

  it("batches clubs that have the same fields into one upsert", async () => {
    // A batched upsert writes every column it names for every row, so rows
    // missing a field would have it set to null. Only rows with identical
    // fields share a batch.
    const batches = await syncOrgs([
      { OrganizationID: "1", OrganizationName: "A" },
      {
        OrganizationID: "2",
        OrganizationName: "B",
        OrganizationDescription: "d",
      },
      { OrganizationID: "3", OrganizationName: "C" },
    ]);

    expect(batches).toHaveLength(2);
    for (const rows of batches) {
      const fields = Object.keys(rows[0]).sort();
      for (const row of rows) expect(Object.keys(row).sort()).toEqual(fields);
    }
    expect(
      batches
        .flat()
        .map((row) => row.OrganizationID)
        .sort(),
    ).toEqual(["1", "2", "3"]);
  });

  it("splits large batches", async () => {
    const orgs = Array.from({ length: 1201 }, (_, i) => ({
      OrganizationID: String(i),
      OrganizationName: `Club ${i}`,
    }));

    const batches = await syncOrgs(orgs);

    expect(batches.map((rows) => rows.length)).toEqual([500, 500, 201]);
  });

  it("keeps the last copy of a club listed twice", async () => {
    // Postgres rejects an upsert that touches the same row twice.
    const batches = await syncOrgs([
      { OrganizationID: "1", OrganizationName: "Old" },
      { OrganizationID: "1", OrganizationName: "New" },
    ]);

    expect(batches.flat()).toEqual([
      { OrganizationID: "1", OrganizationName: "New" },
    ]);
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
