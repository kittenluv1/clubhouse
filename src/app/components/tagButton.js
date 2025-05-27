// TagButton.jsx
export default function TagButton({ label, isSelected, onClick }) {
  return (
    <button
      className={`rounded-full border px-3 py-1 ${
        isSelected
          ? "border-black bg-[#5086E1] text-white"
          : "border-[#BEBEBE] bg-[#EEF4FF] text-black"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
