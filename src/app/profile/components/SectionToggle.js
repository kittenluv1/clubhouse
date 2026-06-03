"use client";

export default function SectionToggle({
    sectionName = "",
    iconPath = "",
    iconAlt = "",
    isExpanded = false,
    onClick = () => { },
}) {

    return (
        <button
            onClick={onClick}
            className="mb-2 flex w-full items-center justify-between text-left font-semibold"
        >
            <div className="flex items-center gap-2">
                <img
                    src={iconPath}
                    alt={iconAlt}
                    className="max-w-[20px]"
                />
                <span className="text-2xl">{sectionName}</span>
            </div>
            <svg
                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </button>
    );
}