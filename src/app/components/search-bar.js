"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";

const ClubSearchBar = forwardRef(({ tableName = "clubs", nameColumn = "OrganizationName", width = "w-full", height = "h-10" }, ref) => {
  const [inputValue, setInputValue] = useState("");
  const [allOptions, setAllOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  //enable search by category
  const handleSearch = (overrideTerm, byCategory = false) => {
    // Use the overrideTerm if provided, otherwise fall back to the input’s value
    const term = (overrideTerm ?? localSearch).trim();
    if (!term) return;
    // Keep the input in sync
    setLocalSearch(term);
    // Encode for URL
    const encoded = encodeURIComponent(term);
    if (byCategory) {
      // Category search: /clubs?category=Term
      router.push(`/clubs?category=${encoded}`);
    } else {
      // Name search: /clubs/Term
      router.push(`/clubs/search?q=${encoded}`);

    }
  };

  useEffect(() => {
    const fetchClubNames = async () => {
      const { data, error } = await supabase.from(tableName).select(nameColumn);
      if (!error && data) {
        setAllOptions(data.map((club) => club[nameColumn]));
      }
    };
    fetchClubNames();
  }, [tableName, nameColumn]);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions([]);
    } else {
      const filtered = allOptions.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, allOptions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const encoded = encodeURIComponent(inputValue.trim());
      if (encoded !== "") {
        router.push(`/clubs/search?q=${encoded}`);
      }
    }
  };

  const handleOptionClick = (option) => {
    const encoded = encodeURIComponent(option);
    router.push(`/clubs/${encoded}`);
  };

  return (
    <div className={`relative ${width}`} ref={dropdownRef}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search for a club..."
        className={`border-2 border-blue-400 bg-white text-black rounded-3xl p-2 pl-4 ${height} w-full`}
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-md max-h-60 rounded-md overflow-auto text-sm">
          {filteredOptions.map((option, idx) => (
            <li
              key={idx}
              onClick={() => handleOptionClick(option)}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
            >
              {option}
            </li>
          ))}
        </ul>
      )}

      {isOpen && inputValue && filteredOptions.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-md rounded-md py-2 px-4 text-sm text-gray-500">
          No clubs found matching "{inputValue}"
        </div>
      )}
    </div>
  );
});

export default ClubSearchBar;