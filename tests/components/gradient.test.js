import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Gradient from "@/app/components/gradient";

let mockPathname = "/";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("Gradient", () => {
  it("renders without crashing on the onboarding route", () => {
    mockPathname = "/onboarding";
    const { container } = render(<Gradient />);
    // onboarding/sign-in branch renders multiple decorative blobs
    expect(container.querySelectorAll("div").length).toBeGreaterThan(1);
  });

  it("renders the sign-in decorative variant", () => {
    mockPathname = "/sign-in";
    const { container } = render(<Gradient />);
    expect(container.querySelectorAll("div").length).toBeGreaterThan(1);
  });

  it("renders the simple gradient variant for the home route", () => {
    mockPathname = "/";
    const { container } = render(<Gradient />);
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("renders the plain white fallback for other routes", () => {
    mockPathname = "/clubs";
    const { container } = render(<Gradient />);
    const div = container.querySelector("div");
    expect(div).toHaveClass("bg-white");
  });
});
