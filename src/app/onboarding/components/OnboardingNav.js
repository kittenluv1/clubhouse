"use client";

import Button from "@/app/components/button";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function OnboardingNav({ onNext, onBack, isFirstStep, canAdvance = true, nextLabel = "Next" }) {
  return (
    <div className="mt-auto flex justify-end gap-3 pt-8">
      {!isFirstStep && (
        <Button type="gradient-border" size="small" onClick={onBack}>
          <span className="flex items-center gap-1">
            <IoChevronBack size={15} />
            Prev
          </span>
        </Button>
      )}
      <Button type="gradient" size="small" onClick={onNext} disabled={!canAdvance}>
        <span className="flex items-center gap-1 text-white">
          {nextLabel}
          <IoChevronForward size={15} />
        </span>
      </Button>
    </div>
  );
}
