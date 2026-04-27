"use client";

import Button from "@/app/components/button";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function OnboardingNav({
  onNext,
  onBack,
  isFirstStep,
  canAdvance = true,
  nextLabel = "Next",
  nextButtonStyle = "",
  nextContentClassName = "",
}) {
  return (
    <div className="mt-auto flex justify-end gap-3 pt-8">
      {!isFirstStep && (
        <Button type="border-light" size="small" onClick={onBack}>
          <span className="flex items-center gap-1">
            <IoChevronBack size={15} />
            Prev
          </span>
        </Button>
      )}
      <Button
        type="CTA"
        size="small"
        style={nextButtonStyle}
        onClick={onNext}
        disabled={!canAdvance}
      >
        <span className={`flex items-center gap-[5px] ${nextContentClassName}`}>
          {nextLabel}
          <IoChevronForward size={15} />
        </span>
      </Button>
    </div>
  );
}