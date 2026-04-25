import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AuthProvider, useAuth, useRequireAuth } from "./AuthContext";

// --- Supabase mock wiring ---

let authChangeCallback; // captured from onAuthStateChange
const mockUnsubscribe = jest.fn();
const mockGetSession = jest.fn();
const mockSignOut = jest.fn();
const mockProfileSingle = jest.fn();

jest.mock("../lib/db", () => ({
  supabase: {
    auth: {
      getSession: (...args) => mockGetSession(...args),
      onAuthStateChange: (cb) => {
        authChangeCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      },
      signOut: (...args) => mockSignOut(...args),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: (...args) => mockProfileSingle(...args),
        }),
      }),
    }),
  },
}));

// --- next/navigation mock ---

let mockPathname = "/profile";

const mockRouter = { replace: jest.fn(), push: jest.fn() };

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => mockRouter,
}));

// --- Helpers ---

function TestConsumer() {
  const { user, session, isAdmin, loading, signOut } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? JSON.stringify(user) : "null"}</span>
      <span data-testid="session">{session ? "has-session" : "null"}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <button data-testid="sign-out" onClick={signOut} />
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

const ADMIN_EMAIL = "admin@test.com";

// --- Tests ---

beforeAll(() => {
  process.env.NEXT_PUBLIC_ADMIN_EMAIL = ADMIN_EMAIL;
});

beforeEach(() => {
  jest.clearAllMocks();
  authChangeCallback = undefined;
  // Default: no session
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockSignOut.mockResolvedValue({ error: null });
  mockProfileSingle.mockResolvedValue({
    data: { avatar_id: 1, onboarding_completed: true },
    error: null,
  });
});

describe("AuthContext", () => {
  // ---- Initialization ----

  describe("initialization", () => {
    it("starts in loading state", () => {
      // Never resolve getSession so we stay in loading
      mockGetSession.mockReturnValue(new Promise(() => {}));
      renderWithProvider();

      expect(screen.getByTestId("loading").textContent).toBe("true");
      expect(screen.getByTestId("user").textContent).toBe("null");
      expect(screen.getByTestId("session").textContent).toBe("null");
    });

    it("resolves with user and session when a session exists", async () => {
      const fakeSession = {
        access_token: "tok-1",
        user: { id: "u1", email: "alice@test.com" },
      };
      mockGetSession.mockResolvedValue({ data: { session: fakeSession } });

      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });
      expect(screen.getByTestId("user").textContent).toContain("u1");
      expect(screen.getByTestId("session").textContent).toBe("has-session");
    });

    it("resolves with null user when no session exists", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });
      expect(screen.getByTestId("user").textContent).toBe("null");
      expect(screen.getByTestId("session").textContent).toBe("null");
    });
  });

  // ---- isAdmin ----

  describe("isAdmin", () => {
    it("is true when user email matches NEXT_PUBLIC_ADMIN_EMAIL", async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: "tok",
            user: { id: "u1", email: ADMIN_EMAIL },
          },
        },
      });

      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("isAdmin").textContent).toBe("true");
      });
    });

    it("is false when user email does not match", async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: "tok",
            user: { id: "u1", email: "other@test.com" },
          },
        },
      });

      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });
      expect(screen.getByTestId("isAdmin").textContent).toBe("false");
    });

    it("is false when no user is logged in", async () => {
      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });
      expect(screen.getByTestId("isAdmin").textContent).toBe("false");
    });
  });

  // ---- signOut ----

  describe("signOut", () => {
    it("calls supabase.auth.signOut", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      await act(async () => {
        screen.getByTestId("sign-out").click();
      });

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it("logs error when signOut fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockSignOut.mockResolvedValue({ error: { message: "network error" } });
      mockGetSession.mockResolvedValue({ data: { session: null } });

      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      await act(async () => {
        screen.getByTestId("sign-out").click();
      });

      expect(consoleSpy).toHaveBeenCalledWith("Sign out error:", "network error");
      consoleSpy.mockRestore();
    });
  });

  // ---- onAuthStateChange identity checks ----

  describe("onAuthStateChange identity checks", () => {
    it("updates user and session when a new user signs in", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });
      expect(screen.getByTestId("user").textContent).toBe("null");

      // Simulate sign-in event
      const newSession = {
        access_token: "tok-new",
        user: { id: "u2", email: "bob@test.com" },
      };
      act(() => {
        authChangeCallback("SIGNED_IN", newSession);
      });

      expect(screen.getByTestId("user").textContent).toContain("u2");
      expect(screen.getByTestId("session").textContent).toBe("has-session");
    });

    it("preserves session reference when access_token is unchanged (token refresh)", async () => {
      const session = {
        access_token: "tok-same",
        user: { id: "u1", email: "a@test.com" },
      };
      mockGetSession.mockResolvedValue({ data: { session } });

      let capturedSessions = [];
      function SessionTracker() {
        const { session: s } = useAuth();
        capturedSessions.push(s);
        return null;
      }

      render(
        <AuthProvider>
          <SessionTracker />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(capturedSessions.some((s) => s !== null)).toBe(true);
      });

      const sessionAfterInit = capturedSessions[capturedSessions.length - 1];

      // Fire auth change with same access_token — identity check should return prev
      act(() => {
        authChangeCallback("TOKEN_REFRESHED", {
          access_token: "tok-same",
          user: { id: "u1", email: "a@test.com" },
        });
      });

      const sessionAfterRefresh = capturedSessions[capturedSessions.length - 1];
      // Same reference means the identity check prevented a new object
      expect(sessionAfterRefresh).toBe(sessionAfterInit);
    });

    it("does not update user when user id is unchanged", async () => {
      const session = {
        access_token: "tok-1",
        user: { id: "u1", email: "a@test.com" },
      };
      mockGetSession.mockResolvedValue({ data: { session } });

      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      // Fire auth change with new token but same user
      act(() => {
        authChangeCallback("TOKEN_REFRESHED", {
          access_token: "tok-2",
          user: { id: "u1", email: "a@test.com" },
        });
      });

      // Session should update (different token), but user content stays same
      expect(screen.getByTestId("user").textContent).toContain("u1");
      expect(screen.getByTestId("session").textContent).toBe("has-session");
    });

    it("clears user and session on sign-out event", async () => {
      const session = {
        access_token: "tok-1",
        user: { id: "u1", email: "a@test.com" },
      };
      mockGetSession.mockResolvedValue({ data: { session } });

      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toContain("u1");
      });

      // Simulate sign-out (session becomes null)
      act(() => {
        authChangeCallback("SIGNED_OUT", null);
      });

      expect(screen.getByTestId("user").textContent).toBe("null");
      expect(screen.getByTestId("session").textContent).toBe("null");
    });
  });

  // ---- Cleanup ----

  describe("cleanup", () => {
    it("unsubscribes from auth listener on unmount", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      const { unmount } = renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      unmount();
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  // ---- useAuth outside provider ----

  describe("useAuth outside provider", () => {
    it("throws when used without AuthProvider", () => {
      // Suppress React error boundary noise
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });
  });

  // ---- useRequireAuth ----

  describe("useRequireAuth", () => {
    beforeEach(() => {
      mockPathname = "/profile";
    });

    function RequireAuthConsumer() {
      const { user, loading } = useRequireAuth();
      return (
        <div>
          <span data-testid="ra-loading">{String(loading)}</span>
          <span data-testid="ra-user">{user ? user.id : "null"}</span>
        </div>
      );
    }

    function renderRequireAuth() {
      return render(
        <AuthProvider>
          <RequireAuthConsumer />
        </AuthProvider>
      );
    }

    it("redirects to /sign-in with returnUrl when user is null and not loading", async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      renderRequireAuth();

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/sign-in?returnUrl=%2Fprofile");
      });
    });

    it("includes the current pathname in returnUrl", async () => {
      mockPathname = "/review/edit/42";
      mockGetSession.mockResolvedValue({ data: { session: null } });
      renderRequireAuth();

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/sign-in?returnUrl=%2Freview%2Fedit%2F42");
      });
    });

    it("does not redirect while loading", () => {
      mockGetSession.mockReturnValue(new Promise(() => {}));
      renderRequireAuth();

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("does not redirect when user exists", async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: "tok",
            user: { id: "u1", email: "a@test.com" },
          },
        },
      });
      renderRequireAuth();

      await waitFor(() => {
        expect(screen.getByTestId("ra-user").textContent).toBe("u1");
      });
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("redirects when user signs out", async () => {
      const session = {
        access_token: "tok",
        user: { id: "u1", email: "a@test.com" },
      };
      mockGetSession.mockResolvedValue({ data: { session } });
      renderRequireAuth();

      await waitFor(() => {
        expect(screen.getByTestId("ra-user").textContent).toBe("u1");
      });
      expect(mockRouter.replace).not.toHaveBeenCalled();

      // Simulate sign-out
      act(() => {
        authChangeCallback("SIGNED_OUT", null);
      });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/sign-in?returnUrl=%2Fprofile");
      });
    });

    it("returns the same auth context values as useAuth", async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: "tok",
            user: { id: "u1", email: ADMIN_EMAIL },
          },
        },
      });

      let capturedAuth;
      function Capturer() {
        capturedAuth = useRequireAuth();
        return null;
      }

      render(
        <AuthProvider>
          <Capturer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(capturedAuth.loading).toBe(false);
      });

      expect(capturedAuth.user.id).toBe("u1");
      expect(capturedAuth.session.access_token).toBe("tok");
      expect(capturedAuth.isAdmin).toBe(true);
      expect(typeof capturedAuth.signOut).toBe("function");
    });
  });
});
