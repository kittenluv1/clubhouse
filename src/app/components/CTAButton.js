"use client";

export default function CTAButton({ children, ...props }) {

  return (
    <button
      {...props}
      className="rounded-full py-2.5 px-7 text-nowrap bg-gradient-to-r to-[#FFB464] from-[#FFA1CD] text-white font-medium hover:from-[#B21D58] hover:to-[#D86761]"
    >
      {children}
    </button>
  );
}