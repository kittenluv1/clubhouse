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
            <div className="flex flex-col gap-8 mx-15">
                <div>
                    <h1 className="text-2xl font-bold text-[#1C350F]">Choose some of your interests!</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        To help us provide you better club recommendations, choose at least two club categories you are interested in.
                    </p>
                </div>
            </div>
            <div className="mt-8 mx-auto flex max-w-[728px] flex-wrap justify-center gap-10 sm:gap-14">
                {INTERESTS.map((interest) => {
                    const isSelected = selected.includes(interest);

                    return (
                        <button
                            key={interest}
                            onClick={() => toggle(interest)}
                            className={`
  mx-0 w-[90px] h-[90px] sm:w-[140px] sm:h-[140px]
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