import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import OnboardingGuard from "./OnboardingGuard";

// --- Mocks ---

const mockRouter = { push: jest.fn(), replace: jest.fn() };
let mockPathname = "/";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => mockRouter,
}));

let mockAuth = { user: null, loading: false };

jest.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  update: mockUpdate,
}));

jest.mock("../lib/db", () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

// Helper to wire the chained query builder for `select`
function mockProfileSelect(result) {
  const chain = {
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
  };
  mockSelect.mockReturnValue(chain);
  return chain;
}

// Helper to wire the chained query builder for `update`
function mockProfileUpdate() {
  const chain = { eq: jest.fn().mockResolvedValue({}) };
  mockUpdate.mockReturnValue(chain);
  return chain;
}

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
  mockPathname = "/";
  mockAuth = { user: null, loading: false };
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
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("does nothing when user is not logged in", async () => {
    mockAuth = { user: null, loading: false };
    render(<OnboardingGuard />);
    await waitFor(() => {});
    expect(mockFrom).not.toHaveBeenCalled();
  });

  describe("excluded paths", () => {
    it.each(["/sign-in", "/sign-in/callback", "/onboarding", "/onboarding/step2"])(
      "skips onboarding check on %s",
      async (path) => {
        mockPathname = path;
        mockAuth = { user: { id: "u1" }, loading: false };
        render(<OnboardingGuard />);
        await waitFor(() => {});
        expect(mockFrom).not.toHaveBeenCalled();
      }
    );
  });

  describe("when user is logged in on a protected path", () => {
    beforeEach(() => {
      mockPathname = "/clubs";
      mockAuth = { user: { id: "user-123" }, loading: false };
    });

    it("does nothing when onboarding is already started", async () => {
      mockProfileSelect({ data: { onboarding_started: true } });
      mockProfileUpdate();

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith("profiles");
        expect(mockSelect).toHaveBeenCalledWith("onboarding_started");
      });

      // update should NOT have been called
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("marks onboarding_started and logs when onboarding has not started", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      mockProfileSelect({ data: { onboarding_started: false } });
      const updateChain = mockProfileUpdate();

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({ onboarding_started: true });
        expect(updateChain.eq).toHaveBeenCalledWith("id", "user-123");
      });

      expect(consoleSpy).toHaveBeenCalledWith("pushing to onboarding");
      consoleSpy.mockRestore();
    });

    it("marks onboarding_started when profile field is null", async () => {
      mockProfileSelect({ data: { onboarding_started: null } });
      mockProfileUpdate();

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({ onboarding_started: true });
      });
    });

    it("marks onboarding_started when profile is null (no row)", async () => {
      mockProfileSelect({ data: null });
      mockProfileUpdate();

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({ onboarding_started: true });
      });
    });

    it("queries the correct user id", async () => {
      mockAuth = { user: { id: "different-user" }, loading: false };
      const selectChain = mockProfileSelect({ data: { onboarding_started: true } });

      render(<OnboardingGuard />);

      await waitFor(() => {
        expect(selectChain.eq).toHaveBeenCalledWith("id", "different-user");
      });
    });
  });
});
