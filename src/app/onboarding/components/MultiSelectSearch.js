"use client";

import { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";

export default function MultiSelectSearch({
  label,
  placeholder = "Search...",
  options = [],
  selected = [],
  onSelect,
  onRemove,
  required = false,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const lowerQuery = query.toLowerCase();
  const filtered = query.trim() === ""
    ? []
    : options
        .filter((o) => !selected.includes(o))
        .filter((o) => o.toLowerCase().includes(lowerQuery))
        .sort((a, b) => {
          const indexA = a.toLowerCase().indexOf(lowerQuery);
          const indexB = b.toLowerCase().indexOf(lowerQuery);
          if (indexA !== indexB) return indexA - indexB;
          return a.toLowerCase().localeCompare(b.toLowerCase());
        })
        .slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-[#FFA1CD] ml-0.5">*</span>}
      </label>

      <div className="relative" ref={containerRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-full bg-[#F4F5F6] py-3 pl-5 pr-12 text-sm text-gray-700 hover:bg-[#E5EBF1] focus:bg-[#E5EBF1] focus:outline-none"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {isOpen && filtered.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg">
            {filtered.map((option) => (
              <li
                key={option}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option)}
                className="cursor-pointer truncate px-4 py-2 hover:bg-[#F4F5F6]"
              >
                {option}
              </li>
            ))}
          </ul>
        )}

        {isOpen && query.trim() && filtered.length === 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-500 shadow-lg">
            No results for &quot;{query}&quot;
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1 rounded-full border border-[#FFA1CD] bg-[#FFCEE5] px-3 py-1 text-sm text-gray-800"
            >
              {item}
              <button
                onClick={() => onRemove(item)}
                className="ml-0.5 text-gray-500 hover:text-gray-700"
                aria-label={`Remove ${item}`}
              >
                <IoClose size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
