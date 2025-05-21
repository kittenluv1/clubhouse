// TagButton.jsx
export default function TagButton({ label, isSelected, onClick }) {
  return (
    <button
      className={`rounded-full px-3 py-1 border ${isSelected ? 'bg-[#5086E1] text-white border-black' : 'bg-[#EEF4FF] text-black border-[#BEBEBE]'
        }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}