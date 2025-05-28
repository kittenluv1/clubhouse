import { useState, useEffect, useRef } from "react";

// Definitions for each rating category
const tooltipDefinitions = {
  timeCommitment:
    "Estimated weekly time required for meetings, events, or responsibilities.\n1 = Minimal\n5 = Very High",
  inclusivity:
    "How welcoming the club is to people of diverse identities (race, gender, sexuality, ability, etc.).\n1 = Not inclusive\n5 = Actively promoting diversity through leadership and programming",
  socialCommunity:
    "Strength of the club's social environment, including club culture, events, mentorship, and overall sense of belonging.\n1 = Minimal connection\n5 = Strong, supportive community",
  competitiveness:
    "How selective and challenging the club is to join and stay involved in.\n1 = Open to all\n5 = Highly selective and rigorous",
};

export default function Tooltip({ rating }) {
  const [open, setOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const ignoreMouse = useRef(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  // On touch, close tooltip when tapping outside
  useEffect(() => {
    if (!open || !isTouch) return;
    function handleTouch(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("touchstart", handleTouch);
    return () => document.removeEventListener("touchstart", handleTouch);
  }, [open, isTouch]);

  // Suppress mouse events right after touch
  const handleClick = (e) => {
    if (isTouch) {
      setOpen((v) => !v);
      ignoreMouse.current = true;
      setTimeout(() => {
        ignoreMouse.current = false;
      }, 500);
    }
  };

  const handleMouseEnter = () => {
    if (ignoreMouse.current) return;
    setOpen(true);
  };
  const handleMouseLeave = () => {
    if (ignoreMouse.current) return;
    setOpen(false);
  };

  return (
    <div
      className="group relative inline-block align-middle"
      ref={tooltipRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="mx-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-400 bg-white text-xs text-gray-500 select-none"
        onClick={handleClick}
      >
        ?
      </div>
      {open && (
        <div className="pointer-events-auto absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 transform rounded-lg bg-gray-800 px-3 py-2 text-center text-xs whitespace-pre-line text-white opacity-100 transition-opacity duration-200">
          {tooltipDefinitions[rating]}
          <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}
