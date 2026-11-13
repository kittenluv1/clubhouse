/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/pendingReviews/route";
import { REVIEW_MESSAGES } from "@/app/lib/server/reviewMessages";
import { createSupabaseMock, makeRequest } from "../helpers/supabaseMock";

let userDb;
let serviceDb;
jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(async () => userDb),
  get supabaseServer() {
    return serviceDb;
  },
}));

const ADMIN = { id: "a1", email: "admin@ucla.edu" };
const isUpdate = (q) => q.calls.some((c) => c.method === "update");

beforeAll(() => {
  process.env.NEXT_PUBLIC_ADMIN_EMAIL = ADMIN.email;
});

/**
 * `review` is the row the admin's client finds: pending, in another status
 * (the conditional update matches nothing) or missing.
 */
function setup({
  user = ADMIN,
  pending = [{ id: 1, review_text: "hi" }],
  review = { id: 1, status: "pending" },
} = {}) {
  userDb = createSupabaseMock({
    user,
    respond: (query) => {
      if (isUpdate(query))
        return { data: review?.status === "pending" ? { id: 1 } : null };
      const isLookup = query.calls.some((c) => c.method === "maybeSingle");
      if (isLookup) return { data: review ? { id: 1 } : null };
      return { data: pending };
    },
  });
  serviceDb = createSupabaseMock();
}

const get = (sort = "newest") =>
  GET(makeRequest({ url: `http://localhost/api/pendingReviews?sort=${sort}` }));
const post = (body) =>
  POST(makeRequest({ url: "http://localhost/api/pendingReviews", body }));

describe("GET /api/pendingReviews", () => {
  it("401 when nobody is signed in", async () => {
    setup({ user: null });
    expect((await get()).status).toBe(401);
    expect(userDb.queries).toHaveLength(0);
  });

  it("403 when the user is not the admin", async () => {
    setup({ user: { id: "u1", email: "someone@ucla.edu" } });
    expect((await get()).status).toBe(403);
    expect(userDb.queries).toHaveLength(0);
  });

  it("200 with pending reviews, read with the admin's own client", async () => {
    setup();
    const res = await get();

    expect(res.status).toBe(200);
    expect((await res.json()).pendingReviews).toEqual([
      { id: 1, review_text: "hi" },
    ]);
    expect(serviceDb.queries).toHaveLength(0);
    expect(userDb.queries[0].calls).toContainEqual({
      method: "eq",
      args: ["status", "pending"],
    });
  });

  it.each([
    ["newest", false],
    ["oldest", true],
  ])("sort=%s orders by updated_at ascending=%p", async (sort, ascending) => {
    setup();
    await get(sort);
    expect(userDb.callsTo("order")[0]).toEqual(["updated_at", { ascending }]);
  });
});

describe("POST /api/pendingReviews", () => {
  it("403 for non-admins, without moderating", async () => {
    setup({ user: { id: "u1", email: "someone@ucla.edu" } });

    expect((await post({ reviewID: 1, approve: true })).status).toBe(403);
    expect(userDb.queries).toHaveLength(0);
  });

  it("400 when reviewID or approve is missing", async () => {
    setup();
    const res = await post({ reviewID: 1 });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(REVIEW_MESSAGES.invalidModeration);
    expect((await post({ approve: true })).status).toBe(400);
  });

  it("approves the review with the admin's own client", async () => {
    setup();
    const res = await post({ reviewID: 1, approve: true });

    expect(res.status).toBe(200);
    expect((await res.json()).message).toBe(REVIEW_MESSAGES.approved);
    expect(serviceDb.queries).toHaveLength(0);
    expect(userDb.callsTo("update")[0][0]).toEqual({ status: "approved" });
  });

  it("rejects the review", async () => {
    setup();
    const res = await post({ reviewID: 1, approve: false });

    expect((await res.json()).message).toBe(REVIEW_MESSAGES.rejected);
    expect(userDb.callsTo("update")[0][0]).toEqual({ status: "rejected" });
  });

  it("404 when the review does not exist", async () => {
    setup({ review: null });
    expect((await post({ reviewID: 1, approve: true })).status).toBe(404);
  });

  it("409 when the review was already moderated", async () => {
    setup({ review: { id: 1, status: "approved" } });
    expect((await post({ reviewID: 1, approve: false })).status).toBe(409);
  });
});
