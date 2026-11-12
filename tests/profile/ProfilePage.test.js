import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProfilePage from "@/app/profile/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("@/app/context/AuthContext", () => ({
  useRequireAuth: () => ({ user: { id: "u1" } }),
}));
jest.mock("posthog-js", () => ({ capture: jest.fn() }));
jest.mock("@/app/components/clubCard", () => {
  const MockClubCard = () => null;
  return MockClubCard;
});
jest.mock("@/app/components/reviewCard", () => {
  const MockReviewCard = () => null;
  return MockReviewCard;
});
jest.mock("@/app/profile/components/PreferencesSection", () => {
  const MockPreferencesSection = ({ majors, onSaved }) => (
    <div>
      <p>Majors: {majors.join(", ")}</p>
      <button
        onClick={() =>
          onSaved({
            majors: ["History"],
            minors: [],
            currentClubs: [],
            userInterests: [],
          })
        }
      >
        mock save
      </button>
    </div>
  );
  return MockPreferencesSection;
});

const profileResponse = (body, ok = true) => ({
  ok,
  json: async () => body,
});

beforeEach(() => {
  global.fetch = jest.fn();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

test("shows an error instead of crashing when /api/profile fails", async () => {
  global.fetch.mockResolvedValue(profileResponse({ error: "boom" }, false));
  render(<ProfilePage />);
  expect(await screen.findByText(/Failed to load profile/)).toBeInTheDocument();
});

test("renders with the default avatar when the user has no profile row", async () => {
  global.fetch.mockResolvedValue(profileResponse({ profile: null }));
  render(<ProfilePage />);
  expect(await screen.findByText("Anonymous Bruin")).toBeInTheDocument();
  expect(screen.getByAltText("Profile")).toBeInTheDocument();
});

test("saved preferences survive switching sections", async () => {
  global.fetch.mockResolvedValue(
    profileResponse({
      profile: { display_name: "Joe", avatar_id: 1, majors: ["Math"] },
    }),
  );
  render(<ProfilePage />);
  await screen.findByText("Joe");

  fireEvent.click(screen.getByText("Settings"));
  fireEvent.click(screen.getByRole("button", { name: "Preferences" }));
  expect(screen.getByText("Majors: Math")).toBeInTheDocument();
  fireEvent.click(screen.getByText("mock save"));

  fireEvent.click(screen.getByRole("button", { name: "Approved" }));
  fireEvent.click(screen.getByRole("button", { name: "Preferences" }));
  expect(screen.getByText("Majors: History")).toBeInTheDocument();
});
