import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ClubCard from "@/app/components/clubCard";

const mockGetSession = jest.fn();
jest.mock("@/app/lib/db", () => ({
  supabase: { auth: { getSession: (...a) => mockGetSession(...a) } },
}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));

const club = {
  OrganizationID: 42,
  OrganizationName: "Robotics Club",
  OrganizationDescription: "We build robots.",
  average_satisfaction: 4.2,
  total_num_reviews: 3,
  Category1Name: "Technology",
  Category2Name: "Engineering",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } } });
});

describe("ClubCard", () => {
  it("renders the club name, description, and categories", () => {
    render(<ClubCard club={club} />);
    expect(screen.getByText("Robotics Club")).toBeInTheDocument();
    expect(screen.getByText("We build robots.")).toBeInTheDocument();
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("shows the review count and rating", () => {
    render(<ClubCard club={club} />);
    expect(screen.getByText("(3 reviews)")).toBeInTheDocument();
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  it("shows N/A when there is no satisfaction score", () => {
    render(<ClubCard club={{ ...club, average_satisfaction: null, total_num_reviews: 0 }} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.getByText("(0 reviews)")).toBeInTheDocument();
  });

  it("singularizes a single review", () => {
    render(<ClubCard club={{ ...club, total_num_reviews: 1 }} />);
    expect(screen.getByText("(1 review)")).toBeInTheDocument();
  });

  it("calls onLike with an optimistic like when authenticated", async () => {
    const onLike = jest.fn().mockResolvedValue();
    render(<ClubCard club={club} likeCount={5} onLike={onLike} />);
    fireEvent.click(screen.getByLabelText("Like club"));
    await waitFor(() => expect(onLike).toHaveBeenCalledWith(42, true));
    expect(screen.getByText("6")).toBeInTheDocument(); // optimistic increment
  });

  it("calls onSave with an optimistic save when authenticated", async () => {
    const onSave = jest.fn().mockResolvedValue();
    render(<ClubCard club={club} onSave={onSave} />);
    fireEvent.click(screen.getByLabelText("Save club"));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(42, true));
  });
});
