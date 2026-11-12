"use client";

import { useEffect, useState } from "react";

const INTERESTS = [
  "Academic & Pre-Professional",
  "Arts & Media",
  "Community & Advocacy",
  "Health & Wellness",
  "Spiritual & Religious",
  "Cultural & Identity-Based",
  "Campus Life & Social",
];

const ICONS = {
  "Academic & Pre-Professional":
    "/onboarding/academic-and-pre-professional.svg",
  "Arts & Media": "/onboarding/arts-and-media.svg",
  "Community & Advocacy": "/onboarding/community-and-advocacy.svg",
  "Health & Wellness": "/onboarding/health-and-wellness.svg",
  "Spiritual & Religious": "/onboarding/spiritual-and-religious.svg",
  "Cultural & Identity-Based": "/onboarding/cultural-and-identity-based.svg",
  "Campus Life & Social": "/onboarding/campus-and-social.svg",
};

export default function Interests({ formData, onUpdate, onValidChange }) {
  const [selected, setSelected] = useState(formData.interests ?? []);

  useEffect(() => {
    onValidChange(selected.length >= 2);
    // Report validity when the selection changes; onValidChange is a parent
    // callback intentionally excluded to avoid re-run loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const toggle = (interest) => {
    const updated = selected.includes(interest)
      ? selected.filter((i) => i !== interest)
      : [...selected, interest];
    setSelected(updated);
    onUpdate({ interests: updated });
  };

  return (
    <>
      <div className="mx-15 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1C350F]">
            Choose some of your interests!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            To help us provide you better club recommendations, choose at least
            two club categories you are interested in.
          </p>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-[728px] flex-wrap justify-center gap-10 sm:gap-14">
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest);

          return (
            <button
              key={interest}
              onClick={() => toggle(interest)}
              className={`mx-0 flex h-[90px] w-[90px] flex-col items-center justify-center gap-2 rounded-xl px-2 py-2 text-center text-[10px] leading-snug text-gray-900 sm:h-[140px] sm:w-[140px] sm:gap-3 sm:px-3 sm:py-4 sm:text-sm ${
                isSelected
                  ? "bg-[#E2E5F0] ring-2 ring-[#C4C9DC]"
                  : "bg-[#F0F2F9] ring-1 ring-[#D9D9D9] hover:bg-[#E5EBF1]"
              } `}
            >
              <img
                src={ICONS[interest]}
                alt={interest}
                className="h-8 w-8 shrink-0 sm:h-12 sm:w-12"
              />
              {interest}
            </button>
          );
        })}
      </div>
    </>
  );
}
