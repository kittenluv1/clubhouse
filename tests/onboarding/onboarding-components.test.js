import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Welcome from "@/app/onboarding/steps/Welcome";
import OnboardingCard from "@/app/onboarding/components/OnboardingCard";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => mockPush.mockClear());

describe("Welcome", () => {
  it("renders the welcome heading and illustration", () => {
    render(<Welcome />);
    expect(screen.getByText("Welcome to Clubhouse!")).toBeInTheDocument();
    expect(
      screen.getByAltText("Welcome bear illustration")
    ).toBeInTheDocument();
  });
});

describe("OnboardingCard", () => {
  it("renders its children", () => {
    render(
      <OnboardingCard progressStep={0} totalSteps={5}>
        <p>step content</p>
      </OnboardingCard>
    );
    expect(screen.getByText("step content")).toBeInTheDocument();
  });

  it("shows an exit button that opens the confirmation modal", () => {
    render(
      <OnboardingCard progressStep={1} totalSteps={5}>
        <p>content</p>
      </OnboardingCard>
    );
    fireEvent.click(screen.getByLabelText("Exit onboarding"));
    expect(
      screen.getByText("Are you sure you want to exit?")
    ).toBeInTheDocument();
  });

  it("hides the exit button on the final step (step 4)", () => {
    render(
      <OnboardingCard progressStep={4} totalSteps={5}>
        <p>content</p>
      </OnboardingCard>
    );
    expect(screen.queryByLabelText("Exit onboarding")).not.toBeInTheDocument();
  });

  it("navigates to /clubs when the user confirms exit", () => {
    render(
      <OnboardingCard progressStep={1} totalSteps={5}>
        <p>content</p>
      </OnboardingCard>
    );
    fireEvent.click(screen.getByLabelText("Exit onboarding"));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(mockPush).toHaveBeenCalledWith("/clubs");
  });
});
