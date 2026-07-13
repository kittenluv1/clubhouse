import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomSlider from "@/app/components/custom-slider";
import MobileRatingsDropdown from "@/app/components/MobileRatingsDropdown";

describe("CustomSlider", () => {
  it("renders the current value to one decimal place", () => {
    render(<CustomSlider value={3} onChange={jest.fn()} />);
    expect(screen.getByText("3.0")).toBeInTheDocument();
  });

  it("renders the low and high labels at the ends", () => {
    render(
      <CustomSlider value={2} onChange={jest.fn()} lowLabel="Easy" highLabel="Hard" />
    );
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });

  it("calls onChange with the parsed numeric value when moved", () => {
    const onChange = jest.fn();
    render(<CustomSlider value={2} onChange={onChange} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "4.5" } });
    expect(onChange).toHaveBeenCalledWith(4.5);
  });

  it("updates the displayed value after a change", () => {
    render(<CustomSlider value={1} onChange={jest.fn()} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "5" } });
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });
});

describe("MobileRatingsDropdown", () => {
  it("renders without crashing when collapsed", () => {
    const { container } = render(
      <MobileRatingsDropdown club={{ average_time_commitment: 3 }} />
    );
    // Collapsed by default — the ratings menu is not shown
    expect(container.querySelector("#rating-bars-menu")).not.toBeInTheDocument();
  });
});
