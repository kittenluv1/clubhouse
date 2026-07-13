import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import OnboardingNav from "@/app/onboarding/components/OnboardingNav";

describe("OnboardingNav", () => {
  it("hides the Prev button on the first step", () => {
    render(<OnboardingNav isFirstStep onNext={jest.fn()} onBack={jest.fn()} />);
    expect(screen.queryByText("Prev")).not.toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("shows the Prev button on later steps and calls onBack", () => {
    const onBack = jest.fn();
    render(<OnboardingNav isFirstStep={false} onNext={jest.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByText("Prev"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when the next button is clicked", () => {
    const onNext = jest.fn();
    render(<OnboardingNav isFirstStep onNext={onNext} onBack={jest.fn()} />);
    fireEvent.click(screen.getByText("Next"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("renders a custom next label", () => {
    render(<OnboardingNav isFirstStep nextLabel="Finish" onNext={jest.fn()} onBack={jest.fn()} />);
    expect(screen.getByText("Finish")).toBeInTheDocument();
  });

  it("disables the next button when canAdvance is false", () => {
    const onNext = jest.fn();
    render(<OnboardingNav isFirstStep canAdvance={false} onNext={onNext} onBack={jest.fn()} />);
    const nextBtn = screen.getByText("Next").closest("button");
    expect(nextBtn).toBeDisabled();
    fireEvent.click(nextBtn);
    expect(onNext).not.toHaveBeenCalled();
  });
});
