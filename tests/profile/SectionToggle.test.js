import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SectionToggle from "@/app/profile/components/SectionToggle";

describe("SectionToggle", () => {
  it("renders the section name", () => {
    render(<SectionToggle sectionName="Preferences" />);
    expect(screen.getByText("Preferences")).toBeInTheDocument();
  });

  it("renders the icon with the provided alt text", () => {
    render(<SectionToggle sectionName="Saved" iconAlt="saved icon" />);
    expect(screen.getByAltText("saved icon")).toBeInTheDocument();
  });

  it("calls onClick when the toggle is clicked", () => {
    const onClick = jest.fn();
    render(<SectionToggle sectionName="Saved" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("rotates the chevron when expanded", () => {
    const { container } = render(
      <SectionToggle sectionName="Saved" isExpanded={true} />
    );
    expect(container.querySelector("svg")).toHaveClass("rotate-180");
  });

  it("does not rotate the chevron when collapsed", () => {
    const { container } = render(
      <SectionToggle sectionName="Saved" isExpanded={false} />
    );
    expect(container.querySelector("svg")).not.toHaveClass("rotate-180");
  });

  it("does not throw when clicked without an onClick handler", () => {
    render(<SectionToggle sectionName="Saved" />);
    expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
  });
});
