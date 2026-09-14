import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PendingCard from "@/app/components/pendingCard";

const review = {
  created_at: "2025-01-15T10:00:00Z",
  overall_satisfaction: 4,
  user_email: "student@ucla.edu",
  club_name: "Chess Club",
  membership_start_quarter: "Fall",
  membership_start_year: 2023,
  membership_end_quarter: "Spring",
  membership_end_year: 2024,
  time_commitment_rating: 3,
  inclusivity_rating: 5,
  social_community_rating: 4,
  competitiveness_rating: 2,
  review_text: "Great club with welcoming people.",
};

describe("PendingCard", () => {
  it("renders review metadata and text", () => {
    render(<PendingCard review={review} handleApprove={jest.fn()} handleReject={jest.fn()} />);
    expect(screen.getByText("2025-01-15")).toBeInTheDocument();
    expect(screen.getByText("student@ucla.edu")).toBeInTheDocument();
    expect(screen.getByText("Chess Club")).toBeInTheDocument();
    expect(screen.getByText("Great club with welcoming people.")).toBeInTheDocument();
  });

  it("calls handleApprove with the review (buttons rendered for both layouts)", () => {
    const handleApprove = jest.fn();
    render(<PendingCard review={review} handleApprove={handleApprove} handleReject={jest.fn()} />);
    fireEvent.click(screen.getAllByText("Approve")[0]);
    expect(handleApprove).toHaveBeenCalledWith(review);
  });

  it("calls handleReject with the review", () => {
    const handleReject = jest.fn();
    render(<PendingCard review={review} handleApprove={jest.fn()} handleReject={handleReject} />);
    fireEvent.click(screen.getAllByText("Reject")[0]);
    expect(handleReject).toHaveBeenCalledWith(review);
  });

  it("renders both mobile and desktop button sets", () => {
    render(<PendingCard review={review} handleApprove={jest.fn()} handleReject={jest.fn()} />);
    expect(screen.getAllByText("Approve")).toHaveLength(2);
    expect(screen.getAllByText("Reject")).toHaveLength(2);
  });
});
