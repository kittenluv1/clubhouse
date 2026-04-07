"use client";

import { useEffect, useState } from "react";
import MultiSelectSearch from "../components/MultiSelectSearch";

const TEMP_CLUBS = [
  "ACM",
  "Clubhouse",
  "Refine LA",
  "CCDC",
];

export default function Clubs({ formData, onUpdate, onValidChange }) {
  const [selectedClubs, setSelectedClubs] = useState(formData.clubs ?? []);

  // mmm still working on the design for this... will ask Nancy about it !!
  useEffect(() => {
    onValidChange(true);
  }, []);

  const handleSelect = (club) => {
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
    <>
      <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Which clubs are you in?</h1>
        <p className="mt-1 text-sm text-gray-500">
          We&apos;ll be using this information to personalize club recommendations for you.
        </p>
        <p className="mt-1 text-xs text-[#6E808D]">
          Not now? You can always fill this out later from your profile page.
        </p>
      </div>

        {/* place holder search bar :3 */}
      <MultiSelectSearch
        label="Select your club(s)"
        placeholder="Search clubs..."
        options={TEMP_CLUBS}
        selected={selectedClubs}
        onSelect={handleSelect}
        onRemove={handleRemove}
      />

      {selectedClubs.length === 0 && (
        <p className="-mt-4 text-xs text-black-400">
          Not in any clubs yet? You can skip this step.
        </p>
      )}
    </div>

    </>
    
  );
}