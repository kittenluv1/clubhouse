"use client";

import { usePathname } from "next/navigation";

export default function Gradient() {
  const pathname = usePathname();

  return (
    <>
      {pathname === "/clubs" || pathname === "/review" ? (
        <>
          <div className="absolute top-0 left-0 -z-10 h-1/6 w-full bg-gradient-to-b from-[#DFEBFF] via-[#DFF1F1] to-[#FFFFFF]" />
          <div className="absolute top-1/3 -z-10 h-1/3 w-full bg-gradient-to-b from-[#FFFFFF] via-[#F1FFE8] to-[#FFFFFF]" />
          <div className="absolute top-2/3 -z-10 h-1/3 w-full bg-gradient-to-b from-[#FFFFFF] to-[#DFF1F1]" />
        </>
      ) : (
        <>
          <div className="absolute top-0 left-0 -z-10 h-3/5 w-full bg-gradient-to-b from-[#DFEBFF] to-[#FFFFFF]" />
          <div className="absolute bottom-0 -z-10 h-1/5 w-full bg-gradient-to-t from-[#DFF1F1] to-[#FFFFFF]" />
        </>
      )}
    </>
  );
}
