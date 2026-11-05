"use client";

import Button from "../../components/button"
import { useEffect, useMemo, useState } from "react";

export default function Avocations({ formData, onUpdate, onValidChange }) {
    const [selected, setSelected] = useState([]);
    const [grouped_options, setGroupedOptions] = useState({});

    const interestsData = useMemo(() => formData?.interests ?? [], [formData?.interests]);

    
    useEffect(() => {
        onValidChange(selected.length >= 2);
        // Report validity when the selection changes; onValidChange is a parent
        // callback intentionally excluded to avoid re-run loops.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected])
    
    useEffect(() => {
        const loadInterests = async () => {
            try {
                const res = await fetch("/api/interests");
                if (!res.ok) {
                    throw new Error("Failed to fetch interests");
                }
                const data = await res.json();
                setGroupedOptions(data.groupedInterests);
            } catch (error) {
                console.error("Error loading interests:", error);
            }
        };
        
        if (interestsData.length > 0) {
            loadInterests();
        }
    }, [interestsData]);
    
    const filtered = Object.fromEntries(Object.entries(grouped_options).filter(([allowed]) => interestsData.includes(allowed)));
    
    const select = (interest) => {
        const updated = selected.includes(interest)
            ? selected.filter((t) => t !== interest)
            : [...selected, interest];
        setSelected(updated);
        onUpdate({ subcategories: updated });
    };

    return (
        <>
            <div className="mx-0 sm:mx-15">
                <h1 className="text-2xl font-bold text-[#1C350F]">Choose Your Interest</h1>
                <p className="text-[0.8rem] mt-2 text-[#6E808D] mb-10">
                    We&apos;ll be using this information to personalize club recommendations for you.
                    Please select at least 2 categories to continue.</p>
                {Object.entries(filtered).map(([group, tags]) => (
                    <div key={group} className="mb-4">
                        <h4 className="mb-2.5 font-semibold text-lg sm:text-2xl">{group}</h4>
                        <div className="flex flex-wrap gap-2 mb-5">
                            {tags.map((tag) => ( 
                                <Button
                                    type="tag"
                                    size="small"
                                    key={tag}
                                    isSelected={selected.includes(tag)}
                                    onClick={() => select(tag)}
                                >
                                    {tag}
                                </Button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
