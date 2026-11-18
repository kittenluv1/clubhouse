import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import OnboardingGuard from "@/app/components/OnboardingGuard";

// --- Mocks ---

const mockRouter = { push: jest.fn(), replace: jest.fn() };
let mockPathname = "/";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => mockRouter,
}));

let mockAuth = { user: null, loading: false };

jest.mock("@/app/context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

const mockFetch = jest.fn();

function jsonResponse(body, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(body) });
}

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch;
  mockPathname = "/";
  mockAuth = { user: null, loading: false };
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("OnboardingGuard", () => {
  it("renders nothing (returns null)", () => {
    const { container } = render(<OnboardingGuard />);
    expect(container.innerHTML).toBe("");
  });

  it("does nothing while auth is loading", async () => {
    mockAuth = { user: { id: "u1" }, loading: true };
    render(<OnboardingGuard />);
    // Give any async effects a chance to run
    await waitFor(() => {});
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("does nothing when user is not logged in", async () => {
    mockAuth = { user: null, loading: false };
    render(<OnboardingGuard />);
    await waitFor(() => {});
    expect(mockFetch).not.toHaveBeenCalled();
  });

  describe("excluded paths", () => {
    it.each([
      "/sign-in",
      "/sign-in/callback",
      "/onboarding",
      "/onboarding/step2",
    ])("skips onboarding check on %s", async (path) => {
      mockPathname = path;
      mockAuth = { user: { id: "u1" }, loading: false };
      render(<OnboardingGuard />);
      await waitFor(() => {});
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("when user is logged in on a protected path", () => {
    beforeEach(() => {
      mockPathname = "/clubs";
      mockAuth = { user: { id: "user-123" }, loading: false };
    });

    it("does nothing when onboarding is already started", async () => {
      mockFetch.mockReturnValueOnce(jsonResponse({ onboarding_started: true }));

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/onboarding");
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("handles a successful response whose JSON cannot be parsed", async () => {
      const parseError = new SyntaxError("Invalid JSON");
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(parseError),
      });

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to check onboarding:",
          parseError,
        );
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("does not parse JSON from a non-OK response", async () => {
      const json = jest.fn().mockRejectedValue(new SyntaxError("Not JSON"));
      mockFetch.mockResolvedValueOnce({ ok: false, json });

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/onboarding");
      });
      expect(json).not.toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("handles a rejected initial fetch", async () => {
      const fetchError = new Error("Network error");
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(fetchError);

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to check onboarding:",
          fetchError,
        );
      });
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("marks onboarding_started and redirects when onboarding has not started", async () => {
      mockFetch
        .mockReturnValueOnce(jsonResponse({ onboarding_started: false }))
        .mockReturnValueOnce(jsonResponse({ success: true }));

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/onboarding");
      });

      expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/onboarding/start", {
        method: "POST",
      });
    });

    it("marks onboarding_started when profile field is null", async () => {
      mockFetch
        .mockReturnValueOnce(jsonResponse({ onboarding_started: null }))
        .mockReturnValueOnce(jsonResponse({ success: true }));

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/onboarding/start", {
          method: "POST",
        });
      });
    });

    it("marks onboarding_started when profile is null (no row)", async () => {
      mockFetch
        .mockReturnValueOnce(jsonResponse({ onboarding_started: false }))
        .mockReturnValueOnce(jsonResponse({ success: true }));

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/onboarding/start", {
          method: "POST",
        });
      });
    });

    it("queries the correct user id", async () => {
      mockAuth = { user: { id: "different-user" }, loading: false };
      mockFetch.mockReturnValueOnce(jsonResponse({ onboarding_started: true }));

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/onboarding");
      });
    });
  });
});
