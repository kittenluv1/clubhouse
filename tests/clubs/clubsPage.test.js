import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AllClubsPage from "@/app/clubs/page";

let mockSearch = "";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));
jest.mock("@/app/context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));
jest.mock("posthog-js", () => ({ capture: jest.fn() }));
jest.mock("@/app/components/clubCard", () => {
  const MockClubCard = ({ club }) => <div>{club.OrganizationName}</div>;
  return MockClubCard;
});
jest.mock("@/app/components/filter", () => {
  const MockFilter = () => null;
  return MockFilter;
});
jest.mock("@/app/components/ClubCarousel", () => {
  const MockClubCarousel = () => null;
  return MockClubCarousel;
});
jest.mock("@/app/components/sortModal", () => {
  const MockSortModal = () => null;
  return MockSortModal;
});

const page = (name, totalNumPages = 6) => ({
  ok: true,
  json: async () => ({
    orgList: [{ OrganizationID: name, OrganizationName: name }],
    totalNumPages,
  }),
});

beforeEach(() => {
  mockSearch = "";
  window.scrollTo = jest.fn();
  global.fetch = jest.fn();
});

const clubFetches = () =>
  global.fetch.mock.calls
    .map(([url]) => url)
    .filter((url) => url !== "/api/onboarding");

test("a new search starts from page 1", async () => {
  global.fetch.mockImplementation(async (url) =>
    url.includes("name=chess") ? page("Chess Club", 1) : page("Any Club"),
  );
  const { rerender } = render(<AllClubsPage />);
  await screen.findByText("Any Club");

  fireEvent.click(screen.getByRole("button", { name: /next/i }));
  await screen.findByText("Page 2 of 6");

  mockSearch = "name=chess";
  rerender(<AllClubsPage />);

  await screen.findByText("Chess Club");
  expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  const chessFetches = clubFetches().filter((url) =>
    url.includes("name=chess"),
  );
  expect(chessFetches).toEqual(["/api/clubs?name=chess&page=1&sort=rating"]);
});

test("a failed load stops showing the error once a later load succeeds", async () => {
  global.fetch.mockImplementation(async (url) =>
    url.includes("name=chess")
      ? page("Chess Club", 1)
      : { ok: false, status: 500 },
  );
  const { rerender } = render(<AllClubsPage />);
  await screen.findByText(/Failed to load clubs/);

  mockSearch = "name=chess";
  rerender(<AllClubsPage />);

  await screen.findByText("Chess Club");
  expect(screen.queryByText(/Failed to load clubs/)).not.toBeInTheDocument();
});
