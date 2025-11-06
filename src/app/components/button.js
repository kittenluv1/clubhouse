"use client";

export default function Button({
  type = "default",
  size = "large",
  isSelected = false,
  style = '',
  children,
  ...props
}) {

  return (
    <button
      {...props}
      className={
        `rounded-full
        ${size === 'large' && 'py-2.5 px-7 text-nowrap'}
        ${size === 'small' && 'py-2 px-4 text-sm'}
        ${type === 'CTA' && 'bg-gradient-to-r to-[#FFB464] from-[#FFA1CD] text-white font-medium hover:from-[#B21D58] hover:to-[#D86761] border-none'}
        ${type === 'default' && 'bg-white text-black hover:bg-[#E5EBF1] border-none'}
        ${type === 'tag' && isSelected
          ? 'bg-[#FFCEE5] border-1 border-[#FFA1CD]'
          : 'border-[#6E808D] border-1 bg-white text-black hover:bg-[#E5EBF1]'}
        ${style}
        `
      }
    >
      {children}
    </button>
  );
}