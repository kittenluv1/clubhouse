"use client";

import { usePathname } from "next/navigation";

export default function Gradient() {
  const pathname = usePathname();

  return (
    <>
      { pathname === "/onboarding" ||
        pathname === "/sign-in" ? (
        <>
          <div className="absolute inset-0 -z-10 bg-white" />
          {/* green radial — top-left corner */}
          <div
            className="absolute -z-10 top-0 left-0 h-[55%] w-[40%] blur-[80px] opacity-30"
            style={{ background: "radial-gradient(ellipse at 0% 0%, #E5F5B1, #D1E9DD)" }}
          />
          {/* warm radial — top-right corner */}
          <div
            className="absolute -z-10 top-0 right-0 h-[55%] w-[40%] blur-[80px] opacity-40"
            style={{ background: "radial-gradient(ellipse at 100% 0%, #FFCBCA, #FEEBC8)" }}
          />
          {/* yellow/pink blob — bottom */}
          <div
            className="absolute -z-10 bottom-[-10%] left-[-5%] h-[65%] w-[80%] rounded-full opacity-45 blur-[110px]"
            style={{ background: "linear-gradient(to right, #FEFEC7, #FFA1CD)" }}
          />
          {/* blue blob — bottom-right */}
          <div
            className="absolute -z-10 bottom-0 right-0 h-[30%] w-[25%] rounded-full opacity-70 blur-[120px]"
            style={{ background: "radial-gradient(ellipse at 100% 100%, #b0d8ff, #b0d8ff)" }}
          />
          {/* dot grid — bottom-right */}
          <div
            className="absolute -z-10 bottom-0 right-0 h-[55%] w-[60%]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 4px, transparent 4px)",
              backgroundSize: "18px 18px",
              WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 100% 100%, black 30%, transparent 75%)",
              maskImage: "radial-gradient(ellipse 80% 80% at 100% 100%, black 30%, transparent 75%)",
            }}
          />
        </>
      ) : pathname === "/" ||
        pathname === "/review/thankyou" ? (
        <>
          <div className="absolute top-0 bottom-0 left-0 -z-10 w-full bg-gradient-to-t from-[#CDE5FC] to-[#FFFFFF]" />
        </>
      ) : (
        <>
          <div className="absolute top-0 bottom-0 left-0 -z-10 w-full bg-white" />
        </>
      )}
    </>
  );
}
