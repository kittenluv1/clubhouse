import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoadingScreen from "@/app/components/LoadingScreen";
import ErrorScreen from "@/app/components/ErrorScreen";

describe("LoadingScreen", () => {
  it("shows the loading message", () => {
    render(<LoadingScreen />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});

describe("ErrorScreen", () => {
  it("renders the provided error message", () => {
    render(<ErrorScreen error="Something broke" />);
    expect(screen.getByText("Error: Something broke")).toBeInTheDocument();
  });

  it("renders the Error prefix even without a message", () => {
    render(<ErrorScreen />);
    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });
});
