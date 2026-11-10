import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

let mockSearch = "";
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));
jest.mock("@/app/context/AuthContext", () => ({
  useRequireAuth: () => ({ user: { id: "u1" } }),
}));
jest.mock("@/app/lib/db", () => ({ supabase: {} }));
jest.mock("posthog-js", () => ({ capture: jest.fn() }));
jest.mock("@/app/profile/components/PreferencesSection", () => ({
  __esModule: true,
  default: () => <div>preferences-section</div>,
}));

import ProfilePage from "@/app/profile/page";
import OnboardingFinish from "@/app/onboarding/steps/OnboardingFinish";

beforeEach(() => {
  mockPush.mockClear();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ profile: { display_name: "Joe", avatar_id: 1 } }),
  });
});

describe("ProfilePage ?section param", () => {
  it("opens Preferences with Settings expanded when section=preferences", async () => {
    mockSearch = "section=preferences";
    render(<ProfilePage />);
    expect(await screen.findByText("preferences-section")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preferences" })).toBeInTheDocument();
    expect(screen.queryByText("Approved Reviews")).not.toBeInTheDocument();
  });

  it("defaults to Approved with Settings collapsed when no section", async () => {
    mockSearch = "";
    render(<ProfilePage />);
    expect(await screen.findByText("Approved Reviews")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Preferences" })).not.toBeInTheDocument();
  });

  it("ignores unknown section values", async () => {
    mockSearch = "section=rejected";
    render(<ProfilePage />);
    expect(await screen.findByText("Approved Reviews")).toBeInTheDocument();
  });
});

describe("OnboardingFinish", () => {
  it("routes 'View My Profile Page' to the preferences section", () => {
    render(<OnboardingFinish />);
    fireEvent.click(screen.getByText("View My Profile Page"));
    expect(mockPush).toHaveBeenCalledWith("/profile?section=preferences");
  });
});
