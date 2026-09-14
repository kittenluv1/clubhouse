/**
 * @jest-environment node
 */
import { POST } from "@/app/api/profile/viewed-rejected/route";
import { createAuthenticatedClient } from "@/app/lib/server-db";

jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(),
}));

function mockClient({ user = { id: "u1" }, authError = null, updateError = null }) {
  const eq = jest.fn().mockResolvedValue({ error: updateError });
  const update = jest.fn(() => ({ eq }));
  createAuthenticatedClient.mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user }, error: authError }) },
    from: jest.fn(() => ({ update })),
  });
}

beforeEach(() => jest.clearAllMocks());

describe("POST /api/profile/viewed-rejected", () => {
  it("returns 401 when the user is not authenticated", async () => {
    mockClient({ user: null });
    expect((await POST()).status).toBe(401);
  });

  it("returns 200 and updates the viewed timestamp on success", async () => {
    mockClient({});
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("returns 500 when the update fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockClient({ updateError: { message: "db error" } });
    expect((await POST()).status).toBe(500);
    console.error.mockRestore();
  });

  it("returns 500 on an unexpected thrown error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    createAuthenticatedClient.mockRejectedValue(new Error("boom"));
    expect((await POST()).status).toBe(500);
    console.error.mockRestore();
  });
});
