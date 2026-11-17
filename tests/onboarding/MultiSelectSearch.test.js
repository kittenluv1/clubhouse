import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MultiSelectSearch from "@/app/onboarding/components/MultiSelectSearch";

function setup() {
  const onSelect = jest.fn();
  render(
    <>
      <MultiSelectSearch
        label="Majors"
        options={["Computer Science", "Computer Engineering", "History"]}
        selected={[]}
        onSelect={onSelect}
        onRemove={jest.fn()}
      />
      <MultiSelectSearch
        label="Minors"
        options={["Computer Science"]}
        selected={[]}
        onSelect={jest.fn()}
        onRemove={jest.fn()}
      />
    </>,
  );
  const [input, otherInput] = screen.getAllByRole("combobox");
  return { onSelect, input, otherInput };
}

describe("MultiSelectSearch keyboard", () => {
  test("ArrowDown + Enter adds the highlighted option", () => {
    const { onSelect, input } = setup();
    fireEvent.change(input, { target: { value: "comp" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("Computer Science");
    expect(input).toHaveValue("");
  });

  test("ArrowUp past the top clears the highlight", () => {
    const { onSelect, input } = setup();
    fireEvent.change(input, { target: { value: "comp" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).not.toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("a highlight does not survive closing and reopening the list", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "comp" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  test("typing more clears the highlight", () => {
    const { onSelect, input } = setup();
    fireEvent.change(input, { target: { value: "c" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.change(input, { target: { value: "co" } });
    expect(input).not.toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("a highlight does not survive closing by clicking outside", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "comp" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  test("Enter during IME composition does not pick an option", () => {
    const { onSelect, input } = setup();
    fireEvent.change(input, { target: { value: "comp" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("two instances get distinct listbox ids", () => {
    const { input, otherInput } = setup();
    fireEvent.change(input, { target: { value: "comp" } });
    fireEvent.change(otherInput, { target: { value: "comp" } });
    expect(input.getAttribute("aria-controls")).not.toBe(
      otherInput.getAttribute("aria-controls"),
    );
  });
});
