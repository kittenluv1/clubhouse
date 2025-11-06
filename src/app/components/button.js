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
        `${size === 'large' && 'py-2.5 px-7'}
        ${size === 'small' && 'py-2 px-4 text-sm'}
        ${(type === 'CTA' || type === 'submit') && 'bg-gradient-to-r to-[#FFB464] from-[#FFA1CD] text-white font-medium hover:from-[#B21D58] hover:to-[#D86761] border-none'}
        ${type === 'default' && 'bg-white text-black hover:bg-[#E5EBF1] border-none'}
        ${type === 'tag' && (isSelected
          ? 'bg-[#FFCEE5] border-1 border-[#FFA1CD] hover:bg-[#FFB3D7]'
          : 'border-[#6E808D] border-1 bg-white text-black hover:bg-[#E5EBF1]')}
        ${type === 'border' && 'border-1 border-[#6E808D]'}
        ${type === 'pink' && 'hover:bg-[#FFA1CD] border-none bg-[#FFCEE5]'}
        ${style}
        rounded-full text-nowrap disabled:bg-[#E5EBF1] disabled:bg-none disabled:opacity-50 disabled:text-[#6E808D] disabled:!cursor-not-allowed
        `
      }
    >
      {children}
    </button>
  );
}