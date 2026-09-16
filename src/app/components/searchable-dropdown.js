"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

const SearchableDropdown = ({
  placeholder = "Search for your club here...",
  onSelect = () => {},
  onInputChange = () => {},
  required = true,
  placeholderColor = "#000",
  value = "",
  ref,
  className = "",
}) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const [allOptions, setAllOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const inputValue = value !== undefined ? value : internalValue;

  useEffect(() => {
    const fetchClubNames = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/clubs/names");
        const { clubs } = await response.json();
        if (!response.ok) throw new Error("Failed to fetch clubs");

        const clubNames = clubs.map((club) => club.OrganizationName);
        setAllOptions(clubNames);
      } catch (err) {
        console.error("Error fetching club names:", err);
        setError("Failed to load clubs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubNames();
  }, []);

  const filteredOptions = useMemo(() => {
    if (inputValue.trim() === "") {
      return [];
    }

    return allOptions
      .filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()),
      )
      .sort((a, b) => {
        const lowerA = a.toLowerCase();
        const lowerB = b.toLowerCase();
        const indexA = lowerA.indexOf(inputValue.toLowerCase());
        const indexB = lowerB.indexOf(inputValue.toLowerCase());
        if (indexA !== indexB) return indexA - indexB;
        return lowerA.localeCompare(lowerB);
      });
  }, [inputValue, allOptions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const nextValue = e.target.value;
    setInternalValue(nextValue);
    setIsOpen(true);
    onInputChange(nextValue);
  };

  const handleOptionClick = (option) => {
    setInternalValue(option);
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="placeholder-custom w-full overflow-hidden rounded-full bg-[#F4F5F6] py-3 pr-12 pl-5 text-base text-ellipsis text-gray-700 hover:bg-[#E5EBF1] focus:bg-[#B5BFC6] focus:outline-none active:bg-[#B5BFC6]"
          required={required}
          style={{
            "--placeholder-color": placeholderColor,
          }}
          ref={ref}
        />
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center pr-3">
          <svg
            className="h-5 w-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {isLoading && (
        <div className="mt-2 text-sm text-gray-500">Loading clubs...</div>
      )}

      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(option)}
              className="relative cursor-pointer truncate py-2 pr-3 pl-3 select-none hover:bg-gray-100"
              title={option}
            >
              {option}
            </li>
          ))}
        </ul>
      )}

      {isOpen && inputValue && filteredOptions.length === 0 && !isLoading && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md bg-white px-3 py-3 text-sm shadow-lg">
          <span className="block truncate">
            No clubs found matching &quot;{inputValue}&quot;
          </span>
        </div>
      )}

      {/* Add the CSS for the placeholder color */}
      <style jsx>{`
        .placeholder-custom::placeholder {
          color: var(--placeholder-color) !important;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default SearchableDropdown;
