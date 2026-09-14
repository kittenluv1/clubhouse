import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SortModal from "@/app/components/sortModal";

const options = [
  { value: "rating", label: "Rating" },
  { value: "reviews", label: "Reviews" },
  { value: "alphabetical", label: "A-Z" },
];

describe("SortModal (mobile)", () => {
  it("renders nothing when closed", () => {
    render(
      <SortModal open={false} sortOptions={options} onClose={jest.fn()} onSelect={jest.fn()} />
    );
    expect(screen.queryByText("Sort by")).not.toBeInTheDocument();
  });

  it("renders the heading and all options when open", () => {
    render(
      <SortModal open sortOptions={options} selected="rating" onClose={jest.fn()} onSelect={jest.fn()} />
    );
    expect(screen.getByText("Sort by")).toBeInTheDocument();
    options.forEach((o) => expect(screen.getByText(o.label)).toBeInTheDocument());
  });

  it("calls onSelect and onClose when an option is chosen", () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render(
      <SortModal open sortOptions={options} selected="rating" onClose={onClose} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByText("Reviews"));
    expect(onSelect).toHaveBeenCalledWith("reviews");
    expect(onClose).toHaveBeenCalled();
  });
});

describe("SortModal (desktop)", () => {
  it("renders options when open", () => {
    render(
      <SortModal open variant="desktop" sortOptions={options} selected="rating" onClose={jest.fn()} onSelect={jest.fn()} />
    );
    expect(screen.getByText("A-Z")).toBeInTheDocument();
  });

  it("selecting an option triggers onSelect + onClose", () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render(
      <SortModal open variant="desktop" sortOptions={options} selected="rating" onClose={onClose} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByText("A-Z"));
    expect(onSelect).toHaveBeenCalledWith("alphabetical");
    expect(onClose).toHaveBeenCalled();
  });
});
