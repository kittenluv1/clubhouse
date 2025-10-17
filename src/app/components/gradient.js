"use client";

import { usePathname } from "next/navigation";

export default function Gradient() {
  const pathname = usePathname();

  return (
    <>
      {pathname === "/" ||
      pathname === "/sign-in" ||
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
