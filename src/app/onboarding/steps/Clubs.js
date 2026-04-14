"use client";

import { useEffect, useRef, useState } from "react";
import MultiSelectSearch from "../components/MultiSelectSearch";

export default function Clubs({ formData, onUpdate, onValidChange }) {
  const [selectedClubs, setSelectedClubs] = useState(formData.clubs ?? []);
  const [clubOptions, setClubOptions] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    onValidChange(true); // optional step
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQueryChange = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setClubOptions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/clubs?name=${encodeURIComponent(query)}&page=1&sort=alphabetical`
        );
        if (!res.ok) { setClubOptions([]); return; }
        const data = await res.json();
        setClubOptions((data.orgList || []).map((c) => c.OrganizationName));
      } catch {
        setClubOptions([]);
      }
    }, 300);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Which clubs are you in?</h1>
        <p className="mt-1 text-sm text-gray-500">
          We&apos;ll be using this information to personalize club recommendations for you.
        </p>
        <p className="mt-1 text-xs text-[#6E808D]">
          Not now? You can always fill this out later from your profile page.
        </p>
      </div>

      <MultiSelectSearch
        label="Select your club(s)"
        placeholder="Search clubs..."
        options={clubOptions}
        selected={selectedClubs}
        onSelect={handleSelect}
        onRemove={handleRemove}
        onQueryChange={handleQueryChange}
        serverSearch
      />

      {selectedClubs.length === 0 && (
        <p className="-mt-4 text-xs text-gray-400">
          Not in any clubs yet? You can skip this step.
        </p>
      )}
    </div>
  );
}
