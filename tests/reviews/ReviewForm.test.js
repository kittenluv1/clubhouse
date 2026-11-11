import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReviewForm from "../../src/app/components/ReviewForm";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams("club=Chess&clubId=7"),
}));
jest.mock("../../src/app/context/AuthContext", () => ({
  useRequireAuth: () => ({ user: { id: "owner", email: "owner@example.com" } }),
}));
jest.mock("posthog-js", () => ({ capture: jest.fn() }));
jest.mock(
  "../../src/app/components/searchable-dropdown",
  () =>
    function Dropdown() {
      return <input aria-label="Club search" />;
    },
);
jest.mock(
  "../../src/app/components/LoadingScreen",
  () =>
    function Loading() {
      return <p>Loading</p>;
    },
);
jest.mock(
  "../../src/app/components/ErrorScreen",
  () =>
    function Error({ error }) {
      return <p>{error}</p>;
    },
);

const review = {
  user_id: "owner",
  club_id: 7,
  club_name: "Chess",
  membership_start_quarter: "Fall",
  membership_start_year: 2024,
  membership_end_quarter: "Spring",
  membership_end_year: 2025,
  time_commitment_rating: 2,
  inclusivity_rating: 3,
  social_community_rating: 4,
  competitiveness_rating: 5,
  overall_satisfaction: 4.5,
  review_text: "Original review",
};
beforeEach(() => {
  global.fetch = jest.fn();
  mockPush.mockClear();
});
afterEach(() => {
  jest.restoreAllMocks();
});

test("create uses the updated form and permits selecting a club", () => {
  render(<ReviewForm />);
  expect(screen.getByText("Write a Review")).toBeInTheDocument();
  expect(screen.getByLabelText("Club search")).toBeEnabled();
  expect(
    screen.getByPlaceholderText(/Write about the recruitment/),
  ).toHaveValue("");
});

test.each(["approved", "rejected"])(
  "loads and submits a %s review through its edit endpoint",
  async (source) => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ review }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Review resubmitted for approval" }),
      })
      .mockResolvedValueOnce({ ok: true });
    render(<ReviewForm reviewId="123" source={source} />);
    const text = await screen.findByDisplayValue("Original review");
    expect(screen.queryByLabelText("Club search")).not.toBeInTheDocument();
    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByLabelText("I am currently a member.")).toBeDisabled();
    expect(!!screen.queryByText(/Submitting will unpublish/)).toBe(
      source === "approved",
    );
    fireEvent.change(text, { target: { value: "Updated review" } });
    fireEvent.submit(text.closest("form"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/${source === "approved" ? "approvedReviews" : "rejectedReviews"}/123`,
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Updated review"),
        }),
      ),
    );
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/review/thankyou"),
    );
    expect(JSON.parse(global.fetch.mock.calls[2][1].body)).toEqual({
      club_name: "Chess",
      overall_satisfaction: 4.5,
      review_text: "Updated review",
      user_email: "owner@example.com",
    });
  },
);

test("blocks editing a review owned by another user", async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ review: { ...review, user_id: "other" } }),
  });
  render(<ReviewForm reviewId="123" />);
  expect(
    await screen.findByText("You are not authorized to edit this review."),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Submit Review" }),
  ).not.toBeInTheDocument();
});

test("shows a load failure without an editable form", async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    json: async () => ({ error: "Not found" }),
  });
  jest.spyOn(console, "error").mockImplementation(() => {});
  render(<ReviewForm reviewId="123" />);
  expect(
    await screen.findByText("Failed to load review for editing."),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Submit Review" }),
  ).not.toBeInTheDocument();
});

test("creates a review with the shared form values", async () => {
  global.fetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ review }) })
    .mockResolvedValueOnce({ ok: true });
  render(<ReviewForm />);
  const dates = screen.getAllByRole("combobox");
  fireEvent.change(dates[0], { target: { value: "Fall|2024" } });
  fireEvent.change(dates[1], { target: { value: "Spring|2025" } });
  fireEvent.click(
    screen.getAllByRole("button").find((button) => button.querySelector("svg")),
  );
  const text = screen.getByPlaceholderText(/Write about the recruitment/);
  fireEvent.change(text, { target: { value: "New review" } });
  fireEvent.submit(text.closest("form"));
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/reviews",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("New review"),
      }),
    ),
  );
});

test("shows API submission errors and retains the review text", async () => {
  global.fetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ review }) })
    .mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Unable to save" }),
    });
  jest.spyOn(console, "error").mockImplementation(() => {});
  render(<ReviewForm reviewId="123" />);
  const text = await screen.findByDisplayValue("Original review");
  fireEvent.submit(text.closest("form"));
  expect(await screen.findByText("Unable to save")).toBeInTheDocument();
  expect(screen.getByDisplayValue("Original review")).toBeInTheDocument();
});
