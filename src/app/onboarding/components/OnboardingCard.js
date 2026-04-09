"use client";

import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";

export default function OnboardingCard({ step, totalSteps, children }) {
  const router = useRouter();
  const progressPct = ((step + 1) / totalSteps) * 100;

  return (
    <div className="w-full rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-[#E5EBF1]">
        <div
          className="h-full bg-gradient-to-r from-[#FFA2CC] via-[#FEF38C] to-[#B8DF64] transition-[width] duration-300 ease-in-out"
          style={{ clipPath: `inset(0 ${100 - progressPct}% 0 0)` }}
        />
      </div>

      {/* Content */}
      <div className="relative flex min-h-[520px] flex-col px-12 py-10">
        <button
          onClick={() => router.push("/")}
          className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full border border-[#6E808D] text-[black] transition-colors duration-200 hover:bg-[#E5EBF1]"
          aria-label="Exit onboarding"
        >
          <IoClose size={18} />
        </button>

        {children}
      </div>
    </div>
  );
}
