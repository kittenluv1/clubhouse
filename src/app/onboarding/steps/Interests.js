"use client";

import Button from "../../components/button"
import { useEffect, useState } from "react";


 const grouped_options = {
        "Academic & Pre-Professional": [
            "Academic",
            "Business",
            "Career Planning",
            "Dental",
            "Educational",
            "Engineering",
            "Honor Societies",
            "Journals",
            "Law",
            "Leadership",
            "Medical",
            "Pre-Professional",
            "Technology",
        ],
        "Cultural & Identity-Based": [
            "Cultural",
            "African American",
            "Asian",
            "Asian Pacific Islander",
            "Latino/Latina",
            "Ethnic",
            "International Students",
            "Out-of-state Students",
        ],
        "Community & Advocacy": [
            "Community Service",
            "Social Activism",
            "Service",
            "LGBTQI",
            "GSA Affiliated",
            "Transfer Students",
            "Faculty/Staff",
        ],
        "Arts & Media": ["Arts", "Dance", "Film", "Music", "Media", "Theater"],
        "Health & Wellness": [
            "Club Sports",
            "Fitness",
            "Health and Wellness",
            "Self Improvement",
            "Sports",
            "Martial Arts",
        ],
        "Spiritual & Religious": ["Religious", "Spiritual"],
        "Campus Life & Social": [
            "Greek Life",
            "Student Government",
            "Social",
            "Spirit/Booster",
            "Recreation",
        ],
    };

export default function Avocations({ formData, onUpdate, onValidChange }) {
   
    const [selected, setSelected] = useState([]);

    const interestsData = formData.interests;

    const filtered = Object.fromEntries(Object.entries(grouped_options).filter(([allowed]) => interestsData.includes(allowed)));

    useEffect(() => {
        onValidChange(selected.length >= 2);
    }, [selected])

    const select = (interest) => {
        setSelected((prev) =>
            prev.includes(interest) ? prev.filter((t) => t !== interest) : [...prev, interest],);
    };

    return (
        <>
            <div className="mx-15">
                <h1 className="text-2xl font-bold text-[#1C350F]">Choose Your Interest</h1>
                <p className="text-[0.8rem] mt-2 text-[#6E808D] mb-10">
                    We'll be using this information to personalize club recommendations for you.
                    Please select at least 2 categories to continue.</p>
                {Object.entries(filtered).map(([group, tags]) => (
                    <div key={group} className="mb-4">
                        <h4 className="mb-2.5 font-semibold text-2xl">{group}</h4>
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
