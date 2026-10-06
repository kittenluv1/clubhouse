/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/pendingReviews/route";
import { createSupabaseMock, makeRequest } from "../helpers/supabaseMock";

let db;
jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(async () => db),
}));

const ADMIN = { id: "a1", email: "admin@ucla.edu" };
const WRITES = ["insert", "update", "delete"];
const op = (q) =>
  q.calls.find((c) => WRITES.includes(c.method))?.method ?? "select";

beforeAll(() => {
  process.env.NEXT_PUBLIC_ADMIN_EMAIL = ADMIN.email;
});

function setup({
  user = ADMIN,
  pending = [{ id: 1, review_text: "hi" }],
} = {}) {
  db = createSupabaseMock({
    user,
    respond: (query) => {
      if (op(query) === "delete") return { data: [{ id: 1 }] };
      if (op(query) !== "select") return { data: { id: 1 } };
      const isSingle = query.calls.some((c) => c.method === "single");
      if (!isSingle) return { data: pending };
      return pending[0]
        ? { data: pending[0] }
        : { data: null, error: { code: "PGRST116" } };
    },
  });
}

const get = (sort = "newest") =>
  GET(makeRequest({ url: `http://localhost/api/pendingReviews?sort=${sort}` }));
const post = (body) =>
  POST(makeRequest({ url: "http://localhost/api/pendingReviews", body }));

describe("GET /api/pendingReviews", () => {
  it("401 when nobody is signed in", async () => {
    setup({ user: null });
    expect((await get()).status).toBe(401);
  });

  it("403 when the user is not the admin", async () => {
    setup({ user: { id: "u1", email: "someone@ucla.edu" } });
    expect((await get()).status).toBe(403);
  });

  it("200 with pending reviews for the admin", async () => {
    setup();
    const res = await get();
    expect(res.status).toBe(200);
    expect((await res.json()).pendingReviews).toEqual([
      { id: 1, review_text: "hi" },
    ]);
  });

  it.each([
    ["newest", false],
    ["oldest", true],
  ])("sort=%s orders by created_at ascending=%p", async (sort, ascending) => {
    setup();
    await get(sort);
    expect(db.callsTo("order")[0]).toEqual(["created_at", { ascending }]);
  });
});

describe("POST /api/pendingReviews", () => {
  it("403 for non-admins, without moderating", async () => {
    setup({ user: { id: "u1", email: "someone@ucla.edu" } });

    expect((await post({ reviewID: 1, approve: true })).status).toBe(403);
    expect(db.queries).toHaveLength(0);
  });

  it("400 when reviewID or approve is missing", async () => {
    setup();
    expect((await post({ reviewID: 1 })).status).toBe(400);
    expect((await post({ approve: true })).status).toBe(400);
  });

  it("approves into reviews", async () => {
    setup();
    const res = await post({ reviewID: 1, approve: true });

    expect(res.status).toBe(200);
    expect((await res.json()).message).toMatch(/approved/i);
    expect(db.queries.find((q) => op(q) === "insert").table).toBe("reviews");
  });

  it("rejects into rejected_reviews", async () => {
    setup();
    const res = await post({ reviewID: 1, approve: false });

    expect((await res.json()).message).toMatch(/rejected/i);
    expect(db.queries.find((q) => op(q) === "insert").table).toBe(
      "rejected_reviews",
    );
  });

  it("404 when the pending review does not exist", async () => {
    setup({ pending: [] });
    expect((await post({ reviewID: 1, approve: true })).status).toBe(404);
  });
});
