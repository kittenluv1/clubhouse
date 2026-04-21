"use client";

import { useRouter } from "next/navigation";


export default function OnboardingFinish(formData, onUpdate, onValidChange) {

    const router = useRouter();
    return (
        <>
            <h1 className="text-[1.16rem] font-bold text-[black] ml-10">
                All done! Select where to explore next:</h1>
            <p className="text-xs mt-1 text-black ml-10">
                Your club recommendations have now been
                personalized based on your background and interests.</p>
            <div className="flex justify-center h-40 mt-25">
                <button className="mr-10 border  h-32 border-[#68AEF5] rounded-xl w-32 bg-[#C4E1FC]" onClick={() => { router.push("/") }}>
                    <div className="flex align-middle p-3 flex-wrap flex-col ">
                        <img className="self-center mb-2 w-12" src="blueRecsIcon.svg" />
                        <p className="text-[0.7rem]">Browse Club Recommendations</p>
                    </div>
                </button>

                <button
                    className="mr-10 rounded-xl h-32 w-32 border border-[#68AEF5] bg-[#C4E1FC]"
                    onClick={() => { router.push("/profile") }}>
                    <div className="flex p-3 flex-wrap flex-col">
                        <img className="self-center mb-2 w-12" src="pinkProfileIcon.svg" />
                        <p className="text-[0.7rem]">View My Profile Page</p>
                    </div>
                </button>

                <button
                    className="rounded-xl h-32 w-32 border border-[#68AEF5] bg-[#C4E1FC]"
                    onClick={() => { router.push("/clubs?showCategories") }}>
                    <div className="flex p-3 flex-wrap flex-col">
                        <img className="mb-2 w-12 self-center" src="yellowReviewIcon.svg" />
                        <p className="text-[0.69rem]">Write a Review for a Club</p>
                    </div>
                </button>

            </div>

        </>
    )
}