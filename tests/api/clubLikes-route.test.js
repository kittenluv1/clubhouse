/**
 * @jest-environment node
 */
import { POST, DELETE } from "@/app/api/clubLikes/route";

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

describe("POST /api/clubLikes", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await POST(req({ club_id: 1 }))).status).toBe(401);
  });

  it("returns 400 when club_id is missing", async () => {
    authed();
    expect((await POST(req({}))).status).toBe(400);
  });

  it("returns 201 and targets the club_likes table on success", async () => {
    authed();
    mockChain.select.mockResolvedValue({ data: [{ id: 1 }], error: null });
    const res = await POST(req({ club_id: 9 }));
    expect(res.status).toBe(201);
    expect(mockSupabase.from).toHaveBeenCalledWith("club_likes");
  });

  it("treats a duplicate error as an idempotent 200", async () => {
    authed();
    mockChain.select.mockResolvedValue({
      data: null,
      error: { message: "duplicate" },
    });
    expect((await POST(req({ club_id: 9 }))).status).toBe(200);
  });

  it("returns 500 on a generic error", async () => {
    authed();
    mockChain.select.mockResolvedValue({ data: null, error: { message: "x" } });
    expect((await POST(req({ club_id: 9 }))).status).toBe(500);
  });
});

describe("DELETE /api/clubLikes", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await DELETE(req({ club_id: 1 }))).status).toBe(401);
  });

  it("returns 400 when club_id missing", async () => {
    authed();
    expect((await DELETE(req({}))).status).toBe(400);
  });

  it("returns 200 on successful removal", async () => {
    authed();
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({
      data: [],
      error: null,
    });
    expect((await DELETE(req({ club_id: 9 }))).status).toBe(200);
  });

  it("returns 500 when the delete errors", async () => {
    authed();
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({
      data: null,
      error: { message: "fail" },
    });
    expect((await DELETE(req({ club_id: 9 }))).status).toBe(500);
  });
});
