"use client";

import { useRouter } from "next/navigation";

export default function OnboardingFinish() {
  const router = useRouter();

  return (
    <>
      <h1 className="mx-0 text-[1.16rem] font-bold text-[black] sm:mx-15">
        All done! Select where to explore next:
      </h1>
      <p className="mx-0 mt-1 text-xs text-black sm:mx-15">
        Your club recommendations have now been personalized based on our
        background and interests.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4 sm:mt-25">
        <button
          className="w-32 rounded-xl border border-[#B5BFC6] bg-[#F0F2F9]"
          onClick={() => {
            router.push("/clubs");
          }}
        >
          <div className="flex flex-col flex-wrap p-3 align-middle">
            <img
              className="mb-2 w-12 self-center"
              src="/onboarding/blueRecsIcon.svg"
              alt=""
            />
            <p className="text-[0.7rem]">Browse Club Recommendations</p>
          </div>
        </button>
        <button
          className="w-32 rounded-xl border border-[#B5BFC6] bg-[#F0F2F9]"
          onClick={() => {
            router.push("/profile");
          }}
        >
          <div className="flex flex-col flex-wrap p-3">
            <img
              className="mb-2 w-12 self-center"
              src="/onboarding/pinkProfileIcon.svg"
              alt=""
            />
            <p className="text-[0.7rem]">View My Profile Page</p>
          </div>
        </button>
        <button
          className="w-32 rounded-xl border border-[#B5BFC6] bg-[#F0F2F9]"
          onClick={() => {
            router.push("/clubs?showCategories");
          }}
        >
          <div className="flex flex-col flex-wrap p-3">
            <img
              className="mb-2 w-12 self-center"
              src="/onboarding/yellowReviewIcon.svg"
              alt=""
            />
            <p className="text-[0.69rem]">Write a Review for a Club</p>
          </div>
        </button>
      </div>
    </>
  );
}
