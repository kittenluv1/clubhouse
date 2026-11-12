import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PreferencesSection from "@/app/profile/components/PreferencesSection";

function mockFetch(patchOk) {
  global.fetch = jest.fn(async (url, options) => {
    if (options?.method === "PATCH")
      return { ok: patchOk, json: async () => ({}) };
    return { ok: true, json: async () => ({ clubs: [] }) };
  });
}

function renderAndSave() {
  const onSaved = jest.fn();
  render(
    <PreferencesSection
      majors={["Math"]}
      userInterests={["Academic", "Business", "Cultural"]}
      onSaved={onSaved}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Business" }));
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
  return onSaved;
}

test("reports the saved preferences to the parent after a successful save", async () => {
  mockFetch(true);
  const onSaved = renderAndSave();
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  expect(onSaved).toHaveBeenCalledWith({
    majors: ["Math"],
    minors: [],
    currentClubs: [],
    userInterests: [
      "Academic & Pre-Professional",
      "Cultural & Identity-Based",
      "Academic",
      "Cultural",
    ],
  });
});

test("does not report preferences when the save fails", async () => {
  mockFetch(false);
  const onSaved = renderAndSave();
  await screen.findByText("Failed to save. Please try again.");
  expect(onSaved).not.toHaveBeenCalled();
});
