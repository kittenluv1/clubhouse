/**
 * @jest-environment node
 */
import { POST, DELETE } from "@/app/api/clubSaves/route";

const mockGetUser = jest.fn();
const mockChain = {
  insert: jest.fn().mockReturnThis(),
  select: jest.fn(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
};
const mockSupabase = {
  auth: { getUser: (...a) => mockGetUser(...a) },
  from: jest.fn(() => mockChain),
};

jest.mock("@/app/lib/server-db", () => ({
  createAuthenticatedClient: jest.fn(async () => mockSupabase),
}));
jest.mock("@/app/lib/posthog-server", () => ({
  getPostHogClient: () => null,
}));

const req = (body) => ({ json: async () => body });
const authed = () =>
  mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });

beforeEach(() => {
  jest.clearAllMocks();
  mockChain.insert.mockReturnThis();
  mockChain.delete.mockReturnThis();
  mockChain.eq.mockReturnThis();
});

describe("POST /api/clubSaves", () => {
  it("returns 401 when the user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(req({ club_id: 1 }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when club_id is missing", async () => {
    authed();
    const res = await POST(req({}));
    expect(res.status).toBe(400);
  });

  it("returns 201 with the created save on success", async () => {
    authed();
    mockChain.select.mockResolvedValue({ data: [{ id: 10 }], error: null });
    const res = await POST(req({ club_id: 5 }));
    expect(res.status).toBe(201);
    expect(mockSupabase.from).toHaveBeenCalledWith("club_saves");
    const body = await res.json();
    expect(body.save).toEqual({ id: 10 });
  });

  it("treats a duplicate/unique error as an idempotent 200", async () => {
    authed();
    mockChain.select.mockResolvedValue({
      data: null,
      error: { message: "duplicate key value violates unique constraint" },
    });
    const res = await POST(req({ club_id: 5 }));
    expect(res.status).toBe(200);
  });

  it("returns 500 on a generic database error", async () => {
    authed();
    mockChain.select.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });
    const res = await POST(req({ club_id: 5 }));
    expect(res.status).toBe(500);
  });

  it("returns 500 when an unexpected error is thrown", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetUser.mockRejectedValue(new Error("network"));
    const res = await POST(req({ club_id: 5 }));
    expect(res.status).toBe(500);
    console.error.mockRestore();
  });
});

describe("DELETE /api/clubSaves", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await DELETE(req({ club_id: 1 }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when club_id missing", async () => {
    authed();
    const res = await DELETE(req({}));
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful removal", async () => {
    authed();
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({
      data: [],
      error: null,
    });
    const res = await DELETE(req({ club_id: 5 }));
    expect(res.status).toBe(200);
  });

  it("returns 500 when the delete errors", async () => {
    authed();
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({
      data: null,
      error: { message: "fail" },
    });
    const res = await DELETE(req({ club_id: 5 }));
    expect(res.status).toBe(500);
  });
});
