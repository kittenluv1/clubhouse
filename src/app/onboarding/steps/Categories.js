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
    "Academic & Pre-Professional": "/academic-and-pre-professional.svg",
    "Arts & Media": "/arts-and-media.svg",
    "Community & Advocacy": "/community-and-advocacy.svg",
    "Health & Wellness": "/health-and-wellness.svg",
    "Spiritual & Religious": "/spiritual-and-religious.svg",
    "Cultural & Identity-Based": "/cultural-and-identity-based.svg",
    "Campus Life & Social": "/campus-and-social.svg",
};

export default function Interests({ formData, onUpdate, onValidChange }) {
    const [selected, setSelected] = useState(formData.interests ?? []);

    useEffect(() => {
        onValidChange(selected.length >= 2);
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
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#1C350F]">Choose some of your interests!</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        To help us provide you better club recommendations, choose at least two club categories you are interested in.
                    </p>
                </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3 sm:grid sm:grid-cols-8 sm:gap-x-0.25 sm:gap-y-10">
                {INTERESTS.map((interest, i) => {
                    const isSelected = selected.includes(interest);

                    const colSpanClass = "sm:col-span-2";
                    const colStartClass =
                        i === 4 ? "sm:col-start-2" :
                            i === 5 ? "sm:col-start-4" :
                                i === 6 ? "sm:col-start-6" : "";

                    return (
                        <button
                            key={interest}
                            onClick={() => toggle(interest)}
                            className={`
  ${colSpanClass} ${colStartClass}
  w-[90px] h-[90px] sm:w-[140px] sm:h-[140px] sm:mx-auto
  flex flex-col items-center justify-center
  gap-2 sm:gap-3 rounded-xl px-2 py-2 sm:px-3 sm:py-4
  text-[10px] sm:text-sm leading-snug text-center text-gray-900
  ${isSelected
    ? "bg-[#E2E5F0] ring-2 ring-[#C4C9DC]"
    : "bg-[#F0F2F9] ring-1 ring-[#D9D9D9] hover:bg-[#E5EBF1]"
  }
`}
                        >
                            <img src={ICONS[interest]} alt={interest} className="w-8 h-8 sm:w-12 sm:h-12 shrink-0" />
                            {interest}
                        </button>
                    );
                })}
            </div>

        </>

    );
}