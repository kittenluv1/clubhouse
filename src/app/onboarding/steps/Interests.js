"use client";

import { useEffect, useState } from "react";
import INTERESTS from "../data/interests.json";

export default function Interests({ formData, onUpdate, onValidChange }) {
  const [selected, setSelected] = useState(formData.subcategories ?? []);
  const selectedCategories = formData.interests ?? [];

  useEffect(() => {
    onValidChange(true); // optional step — always allow advancing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prune subcategory selections that no longer belong to any selected broad category
  // (handles the case where a user goes back and deselects a category)
  useEffect(() => {
    const validSubs = selectedCategories.flatMap((cat) => INTERESTS[cat] ?? []);
    const pruned = selected.filter((s) => validSubs.includes(s));
    if (pruned.length !== selected.length) {
      setSelected(pruned);
      onUpdate({ subcategories: pruned });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories.join(",")]);

  const toggle = (subcategory) => {
    const updated = selected.includes(subcategory)
      ? selected.filter((s) => s !== subcategory)
      : [...selected, subcategory];
    setSelected(updated);
    onUpdate({ subcategories: updated });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dive deeper into your interests!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select any specific areas you&apos;re interested in. This step is optional.
        </p>
      </div>

      {selectedCategories.length === 0 ? (
        <p className="text-sm text-gray-400">
          Go back and select interest categories to see subcategories here.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {selectedCategories.map((category) => (
            <div key={category}>
              <h2 className="mb-2 text-sm font-semibold text-gray-600">{category}</h2>
              <div className="flex flex-wrap gap-2">
                {(INTERESTS[category] ?? []).map((sub) => {
                  const isSelected = selected.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => toggle(sub)}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        isSelected
                          ? "bg-[#D6EEFF] ring-2 ring-[#7BBFEE]"
                          : "bg-[#F4F5F6] hover:bg-[#E5EBF1]"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
