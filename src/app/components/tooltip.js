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
  const tooltipRef = useRef(null);
  const isHovering = useRef(false);
  const wasClicked = useRef(false);

  // Close tooltip when clicking/touching outside
  useEffect(() => {
    if (!open) return;
    
    function handleOutsideInteraction(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setOpen(false);
        wasClicked.current = false; // Reset click state when closing
      }
    }
    
    // Listen for both click and touchstart to handle all devices
    document.addEventListener("click", handleOutsideInteraction);
    document.addEventListener("touchstart", handleOutsideInteraction);
    
    return () => {
      document.removeEventListener("click", handleOutsideInteraction);
      document.removeEventListener("touchstart", handleOutsideInteraction);
    };
  }, [open]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (open) {
      // If closing via click, reset the click state
      wasClicked.current = false;
      setOpen(false);
    } else {
      // If opening via click, set click state
      wasClicked.current = true;
      setOpen(true);
    }
  };

  const handleMouseEnter = () => {
    // Don't show on hover if it was opened by click
    if (wasClicked.current) return;
    
    isHovering.current = true;
    // Small delay to avoid flickering on quick mouse movements
    setTimeout(() => {
      if (isHovering.current && !wasClicked.current) {
        setOpen(true);
      }
    }, 100);
  };

  const handleMouseLeave = () => {
    // Don't close on mouse leave if it was opened by click
    if (wasClicked.current) return;
    
    isHovering.current = false;
    // Delay closing to allow moving to tooltip content
    setTimeout(() => {
      if (!isHovering.current && !wasClicked.current) {
        setOpen(false);
      }
    }, 150);
  };

  // Handle tooltip content hover to keep it open
  const handleTooltipMouseEnter = () => {
    if (wasClicked.current) return;
    isHovering.current = true;
  };

  const handleTooltipMouseLeave = () => {
    if (wasClicked.current) return;
    isHovering.current = false;
    setTimeout(() => {
      if (!isHovering.current && !wasClicked.current) {
        setOpen(false);
      }
    }, 150);
  };

  return (
    <div
      className="group relative inline-block align-middle"
      ref={tooltipRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="mx-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-gray-400 text-xs font-semibold text-white select-none hover:bg-gray-500 transition-colors"
        onClick={handleClick}
        aria-label="More information"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(prev => !prev);
          }
        }}
      >
        i
      </div>
      {open && (
        <div 
          className="pointer-events-auto absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 transform rounded-lg bg-gray-800 px-3 py-2 text-center text-xs whitespace-pre-line text-white opacity-100 transition-opacity duration-200 shadow-lg"
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          role="tooltip"
        >
          {tooltipDefinitions[rating]}
          <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}