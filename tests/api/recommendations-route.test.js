/**
 * @jest-environment node
 */
import { GET } from "@/app/api/recommendations/route";
import { createAuthenticatedClient } from "@/app/lib/server-db";

jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(),
  supabaseServer: { from: jest.fn() },
}));

const request = () => ({ url: "http://localhost/api/recommendations?limit=5" });

beforeEach(() => jest.clearAllMocks());

describe("GET /api/recommendations", () => {
  it("returns 401 when the user is not authenticated", async () => {
    createAuthenticatedClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });
    const res = await GET(request());
    expect(res.status).toBe(401);
  });

  it("returns 401 when auth returns an error", async () => {
    createAuthenticatedClient.mockResolvedValue({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: null }, error: { message: "bad token" } }),
      },
    });
    expect((await GET(request())).status).toBe(401);
  });

  it("returns 500 on an unexpected thrown error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    createAuthenticatedClient.mockRejectedValue(new Error("boom"));
    expect((await GET(request())).status).toBe(500);
    console.error.mockRestore();
  });
});
