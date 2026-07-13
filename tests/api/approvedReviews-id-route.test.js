/**
 * @jest-environment node
 */
import { GET } from "@/app/api/approvedReviews/[id]/route";
import { createAuthenticatedClient } from "@/app/lib/server-db";

jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(),
}));

const params = { params: Promise.resolve({ id: "10" }) };

function mockClient({ user = { id: "u1" }, authError = null, review = { id: 10, user_id: "u1" }, reviewError = null }) {
  const single = jest.fn().mockResolvedValue({ data: review, error: reviewError });
  createAuthenticatedClient.mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user }, error: authError }) },
    from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single })) })) })),
  });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/approvedReviews/[id]", () => {
  it("401 when unauthenticated", async () => {
    mockClient({ user: null });
    expect((await GET({}, params)).status).toBe(401);
  });

  it("404 when the review does not exist", async () => {
    mockClient({ review: null, reviewError: { message: "none" } });
    expect((await GET({}, params)).status).toBe(404);
  });

  it("403 when the review belongs to another user", async () => {
    mockClient({ review: { id: 10, user_id: "someone-else" } });
    expect((await GET({}, params)).status).toBe(403);
  });

  it("200 and returns the review to its owner", async () => {
    mockClient({ review: { id: 10, user_id: "u1" } });
    const res = await GET({}, params);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.review).toEqual({ id: 10, user_id: "u1" });
  });

  it("500 on an unexpected error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    createAuthenticatedClient.mockRejectedValue(new Error("boom"));
    expect((await GET({}, params)).status).toBe(500);
    console.error.mockRestore();
  });
});
