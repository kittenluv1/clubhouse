"use client";

import Button from "../../components/button"
import { useEffect, useState } from "react";

export default function Interests({ formData, onUpdate, onValidChange }) {

    const exampleCategories = ["Arts", "Dance", "Film", "Theater", "Poetry", "Something"];

    const [clicked, setClicked] = useState(0);

    const isClicked = false;

    useEffect(() => {
        // onValidChange(clicked>=2);

    }, [clicked])
    const select = (interest) => {

    }
    return (
        <>
            <div className="ml-15">


                <h1 className="text-2xl font-bold text-[#1C350F]">Choose Your Interest</h1>
                <p className="text-[0.8rem] mt-1 text-black">
                    We'll be using this information to personalize club recommendations for you.
                    Please select at least 2 categories to continue.</p>
                <h1 className="text-2xl mt-15 font-bold text-[#1C350F]">Main Category 1</h1>
                <div className="flex flex-wrap gap-2 mt-3">
                    {exampleCategories.map((interest) => (
                        <Button
                            key={interest}
                            type="tag"
                            size="small"
                            style="drop-shadow-xs"
                            isSelected={isClicked}
                            onClick={() => { }}
                        >
                            {interest}
                        </Button>
                    ))}
                    <Button
                        type="tag"
                        size="small"
                        style="drop-shadow-xs"
                    >
                        somethingg
                    </Button>
                    <Button
                        type="tag"
                        size="small"
                        style="drop-shadow-xs"
                    >
                        something
                    </Button>

                    {exampleCategories.map((interest) => (
                        <Button
                            key={interest}
                            type="tag"
                            size="small"
                            style="drop-shadow-xs"
                        >
                            {interest}
                        </Button>
                    ))}
                    <Button
                        type="tag"
                        size="small"
                        style="drop-shadow-xs"
                    >
                        somethingg
                    </Button>
                    <Button
                        type="tag"
                        size="small"
                        style="drop-shadow-xs"
                    >
                        something
                    </Button>

                </div>

                <h1 className="text-2xl mt-5 font-bold text-[#1C350F]">Main Category 1</h1>
                <div className="flex flex-wrap gap-2 mt-3 ">
                    {exampleCategories.map((interest) => (
                        <Button
                            key={interest}
                            type="tag"
                            size="small"
                            style=""
                            onClick={select(interest)}
                        // className="drop-shadow-xs py-2 px-4 text-sm"
                        >
                            {interest}
                        </Button>
                    ))}
                    <Button
                        type="tag"
                        size="small"
                        style="drop-shadow-xs"
                    >
                        somethingg
                    </Button>
                    <Button
                        type="tag"
                        size="small"
                        style="drop-shadow-xs"
                    >
                        something
                    </Button>
                    {exampleCategories.map((interest) => (
                        <Button
                            key={interest}
                            type="tag"
                            size="small"
                            style="drop-shadow-xs"
                        >
                            {interest}
                        </Button>
                    ))}
                    <Button
                        type="tag"
                        size="small"
                        style="drop-shadow-xs"
                    >
                        somethingg
                    </Button>
                    <Button
                        type="tag"
                        size="small"
                        style="drop-shadow-xs"
                    >
                        something
                    </Button>

                </div>
            </div>
        </>
    )
}
