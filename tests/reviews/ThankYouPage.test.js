import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ThankYouPage from "@/app/review/thankyou/page";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  mockPush.mockClear();
});

test("renders the thank-you message", () => {
  render(<ThankYouPage />);

  expect(
    screen.getByRole("heading", { name: "Thank you!" }),
  ).toBeInTheDocument();
});

test("shows the illustration and browse clubs button", () => {
  render(<ThankYouPage />);

  expect(screen.getByAltText("Thank you illustration")).toHaveAttribute(
    "src",
    "/review/review-submitted.svg",
  );
  expect(
    screen.getByRole("button", { name: "Browse More Clubs" }),
  ).toBeInTheDocument();
});

test("browse clubs button redirects to the clubs page", () => {
  render(<ThankYouPage />);

  fireEvent.click(screen.getByRole("button", { name: "Browse More Clubs" }));

  expect(mockPush).toHaveBeenCalledWith("/clubs");
});
