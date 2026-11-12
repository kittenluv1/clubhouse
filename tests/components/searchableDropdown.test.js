import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchableDropdown from "@/app/components/searchable-dropdown";

function Harness({ onSelect, onSubmit }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <SearchableDropdown
        value={value}
        onInputChange={setValue}
        onSelect={(option) => {
          setValue(option);
          onSelect(option);
        }}
      />
    </form>
  );
}

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      clubs: [
        { OrganizationName: "Chess Club" },
        { OrganizationName: "Chess Team" },
        { OrganizationName: "Bruin Racing" },
      ],
    }),
  });
});

async function typeQuery(query) {
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: query } });
  await screen.findByRole("listbox");
  return input;
}

describe("SearchableDropdown keyboard", () => {
  test("ArrowDown + Enter picks the highlighted option without submitting the form", async () => {
    const onSelect = jest.fn();
    const onSubmit = jest.fn();
    render(<Harness onSelect={onSelect} onSubmit={onSubmit} />);
    const input = await typeQuery("chess");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const active = document.getElementById(
      input.getAttribute("aria-activedescendant"),
    );
    expect(active).toHaveAttribute("role", "option");
    expect(active).toHaveAttribute("aria-selected", "true");
    expect(active).toHaveTextContent("Chess Club");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    const notCancelled = fireEvent.keyDown(input, { key: "Enter" });

    expect(notCancelled).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith("Chess Club");
    expect(input).toHaveValue("Chess Club");
  });

  test("Enter with nothing highlighted is left to the form", async () => {
    const onSelect = jest.fn();
    render(<Harness onSelect={onSelect} onSubmit={jest.fn()} />);
    const input = await typeQuery("chess");
    const event = fireEvent.keyDown(input, { key: "Enter" });
    expect(event).toBe(true);
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("Escape closes the list", async () => {
    render(<Harness onSelect={jest.fn()} onSubmit={jest.fn()} />);
    const input = await typeQuery("chess");
    expect(input).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
