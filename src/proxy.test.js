/**
 * Tests for src/proxy.js
 *
 * Strategy: mock @supabase/ssr and next/server, then exercise the
 * proxy function with fake requests to verify routing logic.
 */

// --- Mocks ---

const mockGetUser = jest.fn();

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

// Minimal NextResponse mock
const mockNextCookiesSet = jest.fn();
const mockRedirect = jest.fn((url) => ({
  type: "redirect",
  url: url.toString(),
}));
const mockNext = jest.fn(() => ({
  type: "next",
  cookies: { set: mockNextCookiesSet },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    next: (...args) => mockNext(...args),
    redirect: (...args) => mockRedirect(...args),
  },
}));

// --- Import after mocks ---

const { proxy, config } = require("./proxy");

// --- Helpers ---

function makeRequest(pathname) {
  const url = new URL(`http://localhost:3000${pathname}`);
  return {
    nextUrl: {
      pathname,
      clone() {
        // Return a mutable object that acts like a URL
        return { pathname: url.pathname, search: url.search, toString: () => `${this.pathname}${this.search}` };
      },
    },
    cookies: {
      getAll: jest.fn(() => []),
      set: jest.fn(),
    },
  };
}

const ADMIN_EMAIL = "admin@test.com";

// --- Tests ---

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fake.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "fake-anon-key";
  process.env.NEXT_PUBLIC_ADMIN_EMAIL = ADMIN_EMAIL;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("proxy", () => {
  // ---- Public routes (pass through) ----

  describe("public routes", () => {
    it.each([
      "/",
      "/sign-in",
      "/clubs",
      "/clubs/some-club",
      "/community-guidelines",
    ])("passes through %s without auth check", async (path) => {
      const req = makeRequest(path);
      const result = await proxy(req);

      expect(result.type).toBe("next");
      // Should NOT have called getUser — no auth check needed
      expect(mockGetUser).not.toHaveBeenCalled();
    });
  });

  // ---- Protected routes: unauthenticated ----

  describe("protected routes — unauthenticated", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
    });

    it.each(["/profile", "/review", "/review/thankyou", "/review/edit/123", "/admin"])(
      "redirects %s to /sign-in with returnUrl",
      async (path) => {
        const req = makeRequest(path);
        await proxy(req);

        expect(mockGetUser).toHaveBeenCalled();
        expect(mockRedirect).toHaveBeenCalledTimes(1);

        const redirectArg = mockRedirect.mock.calls[0][0];
        expect(redirectArg.pathname).toBe("/sign-in");
        expect(redirectArg.search).toContain(
          `returnUrl=${encodeURIComponent(path)}`
        );
      }
    );

    it("redirects /profile/settings to /sign-in", async () => {
      const req = makeRequest("/profile/settings");
      await proxy(req);

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      const redirectArg = mockRedirect.mock.calls[0][0];
      expect(redirectArg.pathname).toBe("/sign-in");
    });
  });

  // ---- Protected routes: authenticated (non-admin) ----

  describe("protected routes — authenticated non-admin", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "u1", email: "user@test.com" } },
      });
    });

    it.each(["/profile", "/review", "/review/thankyou", "/review/edit/456"])(
      "allows %s through",
      async (path) => {
        const req = makeRequest(path);
        const result = await proxy(req);

        expect(result.type).toBe("next");
        expect(mockRedirect).not.toHaveBeenCalled();
      }
    );

    it("redirects /admin to / for non-admin user", async () => {
      const req = makeRequest("/admin");
      await proxy(req);

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      const redirectArg = mockRedirect.mock.calls[0][0];
      expect(redirectArg.pathname).toBe("/");
      expect(redirectArg.search).toBe("");
    });

    it("redirects /admin/settings to / for non-admin user", async () => {
      const req = makeRequest("/admin/settings");
      await proxy(req);

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      const redirectArg = mockRedirect.mock.calls[0][0];
      expect(redirectArg.pathname).toBe("/");
    });
  });

  // ---- Protected routes: authenticated admin ----

  describe("protected routes — authenticated admin", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "u-admin", email: ADMIN_EMAIL } },
      });
    });

    it("allows /admin through for admin user", async () => {
      const req = makeRequest("/admin");
      const result = await proxy(req);

      expect(result.type).toBe("next");
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("allows /admin/settings through for admin user", async () => {
      const req = makeRequest("/admin/settings");
      const result = await proxy(req);

      expect(result.type).toBe("next");
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  // ---- Supabase client initialization ----

  describe("supabase client", () => {
    it("creates client with env vars", async () => {
      const { createServerClient } = require("@supabase/ssr");
      mockGetUser.mockResolvedValue({
        data: { user: { id: "u1", email: "a@test.com" } },
      });

      const req = makeRequest("/profile");
      await proxy(req);

      expect(createServerClient).toHaveBeenCalledWith(
        "https://fake.supabase.co",
        "fake-anon-key",
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      );
    });
  });

  // ---- Matcher config ----

  describe("config.matcher", () => {
    it("includes profile, review, and admin paths", () => {
      expect(config.matcher).toEqual(
        expect.arrayContaining([
          "/profile/:path*",
          "/review/:path*",
          "/admin/:path*",
        ])
      );
    });
  });
});
