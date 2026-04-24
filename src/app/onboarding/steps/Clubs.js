"use client";

import { useEffect, useState } from "react";
import MultiSelectSearch from "../components/MultiSelectSearch";

export default function Clubs({ formData, onUpdate, onValidChange, clubOptions = [] }) {
  const [selectedClubs, setSelectedClubs] = useState(formData.clubs ?? []);

  useEffect(() => {
    onValidChange(true); // optional step
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (club) => {
    if (selectedClubs.includes(club)) return;
    const updated = [...selectedClubs, club];
    setSelectedClubs(updated);
    onUpdate({ clubs: updated });
  };

  const handleRemove = (club) => {
    const updated = selectedClubs.filter((c) => c !== club);
    setSelectedClubs(updated);
    onUpdate({ clubs: updated });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1C350F]">Which clubs are you in?</h1>
        <p className="mt-1 text-sm text-gray-500">
          We&apos;ll be using this information to personalize club recommendations for you.
        </p>
      </div>

      <MultiSelectSearch
        label="Select your club(s)"
        placeholder="Search clubs..."
        options={clubOptions}
        selected={selectedClubs}
        onSelect={handleSelect}
        onRemove={handleRemove}
      />

      {selectedClubs.length === 0 && (
        <p className="-mt-4 text-xs text-[#1C350F]">
          Not in any clubs yet? You can skip this step.
        </p>
      )}
    </div>
  );
}
