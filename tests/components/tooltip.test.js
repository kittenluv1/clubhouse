import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tooltip from "@/app/components/tooltip";

describe("Tooltip", () => {
  it("renders the info trigger", () => {
    render(<Tooltip rating="inclusivity" />);
    expect(screen.getByRole("button", { name: "More information" })).toBeInTheDocument();
  });

  it("does not show the tooltip content until opened", () => {
    render(<Tooltip rating="inclusivity" />);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows the definition for the rating when clicked", () => {
    render(<Tooltip rating="competitiveness" />);
    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    const tip = screen.getByRole("tooltip");
    expect(tip).toBeInTheDocument();
    expect(tip.textContent).toMatch(/selective/i);
  });

  it("toggles closed on a second click", () => {
    render(<Tooltip rating="competitiveness" />);
    const trigger = screen.getByRole("button", { name: "More information" });
    fireEvent.click(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens via keyboard (Enter)", () => {
    render(<Tooltip rating="timeCommitment" />);
    fireEvent.keyDown(screen.getByRole("button", { name: "More information" }), {
      key: "Enter",
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
