"use client";

import { useEffect, useState } from "react";

const INTERESTS = [
    "Academic & Pre-Professional",
    "Cultural & Identity-Based",
    "Community & Advocacy",
    "Arts & Media",
    "Health & Wellness",
    "Spiritual & Religious",
    "Campus Life & Social",
];
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
                    <h1 className="text-2xl font-bold text-gray-900">Choose some of your interests!</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        To help us provide you better club recommendations, choose at least two club categories you are interested in.
                    </p>
                </div>
            </div>
            <div className="mt-8 grid grid-cols-8 gap-3">
                {INTERESTS.map((interest, i) => {
                    const isSelected = selected.includes(interest);

                    const colSpanClass = "col-span-2";
                    const colStartClass =
                        i === 4 ? "col-start-2" :
                            i === 5 ? "col-start-4" :
                                i === 6 ? "col-start-6" : "";

                    return (
                        <button
                            key={interest}
                            onClick={() => toggle(interest)}
                            className={`
                ${colSpanClass} ${colStartClass}
                h-28 flex flex-col items-center justify-center gap-2 rounded-xl p-1 text-xs font-medium text-center text-gray-900
                ${isSelected
                                    ? "bg-[#E2E5F0] ring-2 ring-[#C4C9DC]"
                                    : "bg-[#F0F2F9] ring-1 ring-[#D9D9D9] hover:bg-[#E5EBF1]"
                                }
              `}
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-300 shrink-0" />
                            {interest}
                        </button>
                    );
                })}
            </div>

        </>

    );
}