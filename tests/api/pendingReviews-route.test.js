/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/pendingReviews/route";
import { createServerClient } from "@/app/lib/server-db";

jest.mock("@/app/lib/server-db", () => ({
  createServerClient: jest.fn(),
}));

const ADMIN = "admin@ucla.edu";
beforeAll(() => {
  process.env.NEXT_PUBLIC_ADMIN_EMAIL = ADMIN;
});
beforeEach(() => jest.clearAllMocks());

function makeReq({ auth = `Bearer tok`, sort = "newest", body } = {}) {
  return {
    nextUrl: { searchParams: { get: () => sort } },
    headers: { get: () => auth },
    json: async () => body,
  };
}

// Build a supabase mock for GET (select→order) and POST flows
function mockServer({ user = { email: ADMIN, id: "u1" }, userError = null, orderResult, single, insertError = null, deleteError = null }) {
  const order = jest.fn().mockResolvedValue(orderResult || { data: [], error: null });
  const singleFn = jest.fn().mockResolvedValue(single || { data: { id: 1 }, error: null });
  const chain = {
    select: jest.fn(() => ({ order, eq: jest.fn(() => ({ single: singleFn })) })),
    insert: jest.fn().mockResolvedValue({ error: insertError }),
    delete: jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: deleteError }) })),
  };
  createServerClient.mockReturnValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user }, error: userError }) },
    from: jest.fn(() => chain),
  });
  return chain;
}

describe("GET /api/pendingReviews", () => {
  it("401 without an authorization header", async () => {
    expect((await GET(makeReq({ auth: null }))).status).toBe(401);
  });

  it("401 when the token yields no user", async () => {
    mockServer({ user: null, userError: { message: "bad" } });
    expect((await GET(makeReq())).status).toBe(401);
  });

  it("403 when the user is not the admin", async () => {
    mockServer({ user: { email: "someone@ucla.edu" } });
    expect((await GET(makeReq())).status).toBe(403);
  });

  it("200 with pending reviews for the admin", async () => {
    mockServer({ orderResult: { data: [{ id: 1 }], error: null } });
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.pendingReviews).toEqual([{ id: 1 }]);
  });

  it("500 when the query errors", async () => {
    mockServer({ orderResult: { data: null, error: { message: "db" } } });
    expect((await GET(makeReq())).status).toBe(500);
  });
});

describe("POST /api/pendingReviews", () => {
  it("401 without an auth header", async () => {
    expect((await POST(makeReq({ auth: null }))).status).toBe(401);
  });

  it("403 for a non-admin", async () => {
    mockServer({ user: { email: "nope@ucla.edu" } });
    expect((await POST(makeReq({ body: { reviewID: 1, approve: true } }))).status).toBe(403);
  });

  it("400 for an invalid body", async () => {
    mockServer({});
    expect((await POST(makeReq({ body: { reviewID: null, approve: "yes" } }))).status).toBe(400);
  });

  it("200 on approve (moves to reviews and deletes pending)", async () => {
    mockServer({ single: { data: { id: 5, review_text: "x" }, error: null } });
    const res = await POST(makeReq({ body: { reviewID: 5, approve: true } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/approved/i);
  });

  it("200 on reject (moves to rejected and deletes pending)", async () => {
    mockServer({ single: { data: { id: 5 }, error: null } });
    const res = await POST(makeReq({ body: { reviewID: 5, approve: false } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/rejected/i);
  });

  it("500 when the pending review cannot be found", async () => {
    mockServer({ single: { data: null, error: { message: "not found" } } });
    expect((await POST(makeReq({ body: { reviewID: 5, approve: true } }))).status).toBe(500);
  });
});
