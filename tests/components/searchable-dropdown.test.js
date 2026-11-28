import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchableDropdown from "@/app/components/searchable-dropdown";

const mockClubs = [
  { OrganizationID: 12, OrganizationName: "UCLA Chess Club" },
  { OrganizationID: 7, OrganizationName: "Chess Society" },
  { OrganizationID: 42, OrganizationName: "Robotics Club" },
];

function ControlledDropdown({ onSelect }) {
  const [value, setValue] = useState("");
  return (
    <SearchableDropdown
      value={value}
      onInputChange={setValue}
      onSelect={(selected) => {
        setValue(selected.name);
        onSelect(selected);
      }}
    />
  );
}

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ clubs: mockClubs }),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("SearchableDropdown", () => {
  it("loads clubs and preserves search filtering and sorting", async () => {
    render(<ControlledDropdown onSelect={jest.fn()} />);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/clubs/names"),
    );

    const input = screen.getByPlaceholderText("Search for your club here...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "chess" } });

    const items = await screen.findAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Chess Society",
      "UCLA Chess Club",
    ]);
  });

  it("passes both id and name to onSelect when a club is chosen", async () => {
    const onSelect = jest.fn();
    render(<ControlledDropdown onSelect={onSelect} />);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/clubs/names"),
    );

    const input = screen.getByPlaceholderText("Search for your club here...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "robo" } });

    fireEvent.click(await screen.findByText("Robotics Club"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({
      id: 42,
      name: "Robotics Club",
    });
    expect(input).toHaveValue("Robotics Club");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("shows an empty state when no clubs match the query", async () => {
    render(<ControlledDropdown onSelect={jest.fn()} />);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/clubs/names"),
    );

    const input = screen.getByPlaceholderText("Search for your club here...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "nonexistent" } });

    expect(
      await screen.findByText('No clubs found matching "nonexistent"'),
    ).toBeInTheDocument();
  });

  it("shows an error message if loading clubs fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Server error" }),
    });
    jest.spyOn(console, "error").mockImplementation(() => {});

    render(<ControlledDropdown onSelect={jest.fn()} />);

    expect(
      await screen.findByText("Failed to load clubs. Please try again later."),
    ).toBeInTheDocument();
  });
});
