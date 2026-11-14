import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProfilePage from "@/app/profile/page";

const mockPush = jest.fn();
const mockUser = { id: "profile-test-user" };

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/app/context/AuthContext", () => ({
  useRequireAuth: () => ({ user: mockUser }),
}));

jest.mock("@/app/lib/db", () => ({ supabase: {} }));
jest.mock("posthog-js", () => ({ capture: jest.fn() }));

const originalFetch = global.fetch;

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      profile: { display_name: "Test Bruin", avatar_id: 1 },
      approvedReviews: [],
      pendingReviews: [],
      rejectedReviews: [],
      likedClubs: [],
      savedClubs: [],
    }),
  });
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("profile empty-state actions", () => {
  it.each([
    ["Approved", "No approved reviews", "Write a Review", "/review"],
    ["Pending", "No pending reviews", "Write a Review", "/review"],
    ["Rejected", "No rejected reviews", "Write a Review", "/review"],
    ["Liked", "No liked clubs yet", "Browse Clubs", "/clubs"],
    ["Saved", "No saved clubs", "Browse Clubs", "/clubs"],
  ])(
    "%s offers a working empty-state action",
    async (section, emptyMessage, action, destination) => {
      render(<ProfilePage />);
      await screen.findByRole("heading", { name: "Test Bruin" });

      if (action === "Browse Clubs") {
        fireEvent.click(screen.getByRole("button", { name: /Clubs$/ }));
      }
      fireEvent.click(screen.getByRole("button", { name: section }));

      expect(screen.getByText(emptyMessage)).toBeVisible();
      const button = screen.getByRole("button", { name: action });
      expect(button).toBeVisible();
      expect(button).toBeEnabled();
      expect(mockPush).not.toHaveBeenCalled();

      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(destination);
    },
  );
});
