import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import posthog from "posthog-js";
import ReviewForm from "../../src/app/components/ReviewForm";


const mockPush = jest.fn();

let mockSearch = "club=Chess&clubId=7";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

jest.mock("../../src/app/context/AuthContext", () => ({
  useRequireAuth: () => ({ user: { id: "owner", email: "owner@example.com" } }),
}));

jest.mock("posthog-js", () => ({ capture: jest.fn() }));

jest.mock("../../src/app/components/button", () => ({ children, onClick, disabled, type }) => (
  <button onClick={onClick} disabled={disabled} type={type}>
    {children}
  </button>
));

jest.mock("../../src/app/components/custom-slider", () => ({ value, onChange }) => (
    <input type="range" min="1" max="5" value={value} onChange={(e) => onChange(Number(e.target.value))} />
));

jest.mock("../../src/app/components/dropdowns", () => ({
    QuarterYearDropdown: ({ selectedQuarter, selectedYear, onQuarterChange, onYearChange }) => (
      <select
        value={selectedQuarter && selectedYear ? `${selectedQuarter}|${selectedYear}` : ""}
        onChange={(e) => {
          const [quarter, year] = e.target.value.split("|");
          onQuarterChange({ target: { value: quarter } });
          onYearChange({ target: { value: year } });
        }}
      >
        <option value="" disabled>Select quarter</option>
        {["Winter", "Spring", "Fall"].flatMap((q) =>
          ["2024", "2025", "2026"].map((y) => (
            <option key={`${q}|${y}`} value={`${q}|${y}`}>{q} {y}</option>
          )),
        )}
      </select>
    ),
  }));
  

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
    posthog.capture.mockClear();
    Element.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
    jest.restoreAllMocks();
});

const ok = (body = {}) => ({ ok: true, json: async () => body });
const reviewBox = () => screen.getByPlaceholderText(/Write about the recruitment/);

const firstStar = () =>
    screen.getAllByRole("button").find((button) => button.querySelector("svg"));
const sentBody = (call) => JSON.parse(global.fetch.mock.calls[call][1].body);

const clickFirstStar = (half) => {
    const star = firstStar();
    star.getBoundingClientRect = () => ({ left: 0, width: 100 });
    fireEvent.click(star, { clientX: half ? 25 : 75 });
};

const fillForm = (text = "This is a review") => {
    const dates = screen.getAllByRole("combobox");
    fireEvent.change(dates[0], {target: { value: "Fall|2024" }});
    fireEvent.change(dates[1], {target: { value: "Spring|2025" }});
    clickFirstStar(false);
    fireEvent.change(reviewBox(), { target: { value: text } });
};

test("clicking Submit on an empty form puts red boxes on the missing fields", () => {
    const { container } = render(<ReviewForm />);
    const submit = screen.getByRole("button", { name: "Submit Review" });
   
    fireEvent.click(submit); // nothing filled in yet
   
    // The club is already chosen from the URL, so four boxes turn red:
    // start date, end date, the stars, and the review text.
    expect(reviewBox()).toHaveClass("border-red-600");
    expect(container.querySelector('[tabindex="0"]')).toHaveClass("border-red-600");
    expect(container.querySelectorAll(".border-red-600")).toHaveLength(4);
    expect(global.fetch).not.toHaveBeenCalled(); // and nothing is sent
   
    // Filling a field in makes its red box go away.
    fireEvent.change(reviewBox(), { target: { value: "Great club" } });
    expect(reviewBox()).not.toHaveClass("border-red-600");
    expect(container.querySelectorAll(".border-red-600")).toHaveLength(3);
  }); 

test("reject review with only white space", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    render(<ReviewForm />);
    fillForm("   ");
    fireEvent.submit(reviewBox().closest("form"));
    expect(
      await screen.findByText("Please write a review"),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  
});

test("shows an error and disables submit when the end date is before the start", () => {
    render(<ReviewForm />);
    const dates = screen.getAllByRole("combobox");
    fireEvent.change(dates[0], { target: { value: "Spring|2025" } });
    fireEvent.change(dates[1], { target: { value: "Fall|2024" } });
    expect(
      screen.getByText("End date cannot be earlier than start date"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit Review" })).toBeDisabled();
})

test("clicking the left half of a star saves a half rating", async () => {
    global.fetch.mockResolvedValue(ok());
    render(<ReviewForm />);
    fillForm();
    clickFirstStar(true);
    fireEvent.submit(reviewBox().closest("form"));

    await waitFor(() =>
        expect(mockPush).toHaveBeenCalledWith("/review/thankyou"));
    expect(sentBody(0).overall_satisfaction).toBe(0.5);
});

test("clicking create sends review, tracks analystics and emails", async () => {
    global.fetch.mockResolvedValue(ok());
    render(<ReviewForm />);
    fillForm();
    fireEvent.submit(reviewBox().closest("form"));

    await waitFor(() =>
        expect(mockPush).toHaveBeenCalledWith("/review/thankyou"));
    expect(global.fetch.mock.calls[0][0]).toBe("/api/reviews");
    expect(sentBody(0)).toMatchObject({
        club_name: "Chess",
        review_text: "This is a review",
        membership_start_quarter: "Fall",
        membership_start_year: 2024,
        membership_end_quarter: "Spring",
        membership_end_year: 2025,
        time_commitment_rating: 3, // sliders default to 3
        overall_satisfaction: 1,
    });

    expect(posthog.capture).toHaveBeenCalledWith(
        "review_submitted",
        expect.objectContaining({
            club_name: "Chess" }),

    );

    expect(sentBody(1)).toEqual({
        club_name: "Chess",
        overall_satisfaction: 1,
        review_text: "This is a review",
        user_email: "owner@example.com",
    });

});

test("review text stops at 2500 characters", () => {
    render(<ReviewForm />);
    fireEvent.change(reviewBox(), { target: { value: "a".repeat(2500) } });
    fireEvent.change(reviewBox(), { target: { value: "a".repeat(2501) } });

    expect(reviewBox()).toHaveValue("a".repeat(2500));
});

test("a current member is sent with today's date as the end date", async () => {
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(10); // November = Fall
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2026);
    global.fetch.mockResolvedValue(ok());
    render(<ReviewForm />);
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "Fall|2024" },
    });
    fireEvent.click(screen.getByLabelText("I am currently a member."));
    clickFirstStar(false);
    fireEvent.change(reviewBox(), { target: { value: "Still here" } });
    fireEvent.submit(reviewBox().closest("form"));
   
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/review/thankyou"));
    expect(sentBody(0)).toMatchObject({
      membership_end_quarter: "Fall",
      membership_end_year: 2026,
    });
  });

   
test("edit sends the saved ratings and tracks the edit event", async () => {
    global.fetch
      .mockResolvedValueOnce(ok({ review })) // first call loads the review
      .mockResolvedValue(ok());
    render(<ReviewForm reviewId="123" source="approved" />);
    const text = await screen.findByDisplayValue("Original review");
    fireEvent.submit(text.closest("form"));
   
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/review/thankyou"));
    expect(sentBody(1)).toMatchObject({
      time_commitment_rating: 2,
      inclusivity_rating: 3,
      social_community_rating: 4,
      competitiveness_rating: 5,
      overall_satisfaction: 4.5,
    });
    expect(posthog.capture).toHaveBeenCalledWith(
      "review_edit_submitted",
      expect.objectContaining({ club_id: 7 }),
    );
  });

