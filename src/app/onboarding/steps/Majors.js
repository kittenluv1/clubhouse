"use client";

import { useEffect, useState } from "react";
import MultiSelectSearch from "../components/MultiSelectSearch";
import MAJORS from "../data/majors.json";
import MINORS from "../data/minors.json";

export default function Majors({ formData, onUpdate, onValidChange }) {
  const [majors, setMajors] = useState(formData.majors ?? []);
  const [minors, setMinors] = useState(formData.minors ?? []);

  // Set initial validity on mount (handles back-navigation with pre-filled data)
  useEffect(() => {
    onValidChange(majors.length > 0);
  }, []); 

  const addMajor = (major) => {
    const updated = [...majors, major];
    setMajors(updated);
    onUpdate({ majors: updated, minors });
    onValidChange(updated.length > 0);
  };

  const removeMajor = (major) => {
    const updated = majors.filter((m) => m !== major);
    setMajors(updated);
    onUpdate({ majors: updated, minors });
    onValidChange(updated.length > 0);
  };

  const addMinor = (minor) => {
    const updated = [...minors, minor];
    setMinors(updated);
    onUpdate({ majors, minors: updated });
  };

  const removeMinor = (minor) => {
    const updated = minors.filter((m) => m !== minor);
    setMinors(updated);
    onUpdate({ majors, minors: updated });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tell us about yourself!</h1>
        <p className="mt-1 text-sm text-gray-500">
          We&apos;ll be using this information to personalize club recommendations for you.
        </p>
        <p className="mt-1 text-xs text-[#6E808D]">
          Not now? You can always fill this out later from your profile page.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <MultiSelectSearch
          label="Select your major(s)"
          placeholder="Search majors..."
          options={MAJORS}
          selected={majors}
          onSelect={addMajor}
          onRemove={removeMajor}
          required
        />
        <MultiSelectSearch
          label="Select your minor(s)"
          placeholder="Search minors..."
          options={MINORS}
          selected={minors}
          onSelect={addMinor}
          onRemove={removeMinor}
        />
      </div>
    </div>
  );
}
