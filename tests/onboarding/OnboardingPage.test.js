import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import OnboardingPage from "@/app/onboarding/page";

// Stable objects, like the real AuthContext and router; new ones each render
// would re-run the pages' [user] / [user, router] effects in a loop.
const mockRouter = { push: jest.fn() };
const mockAuth = { user: { id: "u1" }, loading: false };
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));
jest.mock("@/app/context/AuthContext", () => ({
  useRequireAuth: () => mockAuth,
}));

function mockStep(name) {
  const MockStep = () => <p>{name} step</p>;
  return MockStep;
}
jest.mock("@/app/onboarding/steps/Welcome", () => mockStep("Welcome"));
jest.mock("@/app/onboarding/steps/Majors", () => mockStep("Majors"));
jest.mock("@/app/onboarding/steps/Clubs", () => mockStep("Clubs"));
jest.mock("@/app/onboarding/steps/Categories", () => mockStep("Categories"));
jest.mock("@/app/onboarding/steps/Interests", () => mockStep("Interests"));
jest.mock("@/app/onboarding/steps/OnboardingFinish", () => mockStep("Finish"));

let postResponse;

beforeEach(() => {
  postResponse = { ok: true, json: async () => ({}) };
  global.fetch = jest.fn(async (url, options) => {
    if (options?.method === "POST") return postResponse;
    if (url === "/api/clubs/names")
      return { ok: true, json: async () => ({ clubs: [] }) };
    return { ok: true, json: async () => ({ onboarding_completed: false }) };
  });
});

const posts = () =>
  global.fetch.mock.calls.filter(([, options]) => options?.method === "POST");

function goToFinishButton() {
  render(<OnboardingPage />);
  for (let i = 0; i < 4; i++) {
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
  }
  expect(screen.getByText("Interests step")).toBeInTheDocument();
  return screen.getByRole("button", { name: /finish/i });
}

test("double-clicking Finish sends one POST and shows the finish screen", async () => {
  const finish = goToFinishButton();
  fireEvent.click(finish);
  fireEvent.click(finish);
  expect(await screen.findByText("Finish step")).toBeInTheDocument();
  expect(posts()).toHaveLength(1);
});

test("a failed save shows an error and lets the user retry", async () => {
  postResponse = { ok: false, status: 500, json: async () => ({}) };
  const finish = goToFinishButton();
  fireEvent.click(finish);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not save your answers. Please try again.",
  );
  await waitFor(() => expect(finish).toBeEnabled());

  postResponse = { ok: true, json: async () => ({}) };
  fireEvent.click(finish);
  expect(await screen.findByText("Finish step")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("Finish and Prev are ignored while the save is in flight", async () => {
  let resolvePost;
  postResponse = new Promise((r) => (resolvePost = r));
  const finish = goToFinishButton();
  fireEvent.click(finish);
  expect(finish).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: /prev/i }));
  expect(screen.getByText("Interests step")).toBeInTheDocument();

  resolvePost({ ok: true, json: async () => ({}) });
  expect(await screen.findByText("Finish step")).toBeInTheDocument();
  expect(posts()).toHaveLength(1);
});

test("a network error shows the error message", async () => {
  postResponse = Promise.reject(new Error("offline"));
  postResponse.catch(() => {});
  const finish = goToFinishButton();
  fireEvent.click(finish);
  expect(await screen.findByRole("alert")).toBeInTheDocument();
});
