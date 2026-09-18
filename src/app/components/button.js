"use client";

export default function Button({
  type = "default",
  size = "large",
  isSelected = false,
  style = "",
  children,
  ...props
}) {
  return (
    <button
      {...props}
      className={`${size === "large" && "px-7 py-2.5"} ${size === "small" && "px-4 py-2 text-sm"} ${(type === "CTA" || type === "submit") && "border-none bg-linear-to-r from-[#FFA1CD] to-[#FFB464] font-medium text-white hover:from-[#B21D58] hover:to-[#D86761]"} ${type === "default" && "border-none bg-white text-black hover:bg-[#E5EBF1]"} ${
        type === "tag" &&
        (isSelected
          ? "border border-[#FFA1CD] bg-[#FFCEE5] hover:bg-[#FFB3D7]"
          : "border border-[#6E808D] bg-white text-black hover:bg-[#E5EBF1]")
      } ${type === "border" && "border border-[#6E808D] text-[#6E808D] hover:bg-[#E5EBF1]"} ${type === "border-light" && "border border-[#D9D9D9] text-[#6E808D] hover:bg-[#E5EBF1]"} ${type === "pink" && "border-none bg-[#FFCEE5] hover:bg-[#FBB2D4]"} ${type === "gradient" && "border-none bg-[linear-gradient(275deg,#FFB464_-21.2%,#FFA1CD_95.86%)] text-black transition-none! hover:bg-[#FBB2D4] hover:bg-none active:bg-[#FBB2D4] active:bg-none"} ${type === "gradient-border" && "border border-transparent transition-none! [background:linear-gradient(white,white)_padding-box,linear-gradient(275deg,#FFB464_-21.2%,#FFA1CD_95.86%)_border-box] hover:[background:#FBB2D4] active:[background:#FBB2D4]"} ${type === "delete" && "border-none bg-[#FFC0C0] font-medium text-[#EB4A4D] hover:bg-[#FF9090] hover:text-[#D54143]"} ${type === "gray" && "border-none bg-[#E5EBF1] hover:bg-[#B5BFC6]"} ${style} rounded-full text-nowrap transition-colors duration-300 disabled:cursor-not-allowed! disabled:bg-[#E5EBF1] disabled:bg-none disabled:text-[#6E808D] disabled:opacity-50`}
    >
      {children}
    </button>
  );
}
