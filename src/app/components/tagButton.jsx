// TagButton.jsx
export default function TagButton({ label, isSelected, onClick }) {
  return (
    <button
      className={`rounded-full px-3 py-1 border ${isSelected ? 'bg-[#6E9461] text-white' : 'bg-[#CBDDC5]'
        }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
