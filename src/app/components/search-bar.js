"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";
import { useSearch } from "../context/SearchContext";

const ClubSearchBar = forwardRef(
  (
    {
      tableName = "clubs",
      nameColumn = "OrganizationName",
      width = "w-full",
      height = "h-10",
    },
    ref,
  ) => {
    const { searchTerm, searchByName, setSearchTerm } = useSearch();
    const [inputValue, setInputValue] = useState(searchTerm);
    const [allOptions, setAllOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const router = useRouter();

    // Sync input value with context search term
    useEffect(() => {
      setInputValue(searchTerm);
    }, [searchTerm]);

    useImperativeHandle(ref, () => ({
      triggerSearch: (overrideTerm, byCategory = false) => {
        handleSearch(overrideTerm, byCategory);
      },
    }));

    // Updated search logic using context
    const handleSearch = (overrideTerm, byCategory = false) => {
      const term = (
        overrideTerm !== undefined ? overrideTerm : inputValue
      ).trim();

      if (byCategory) {
        // This shouldn't happen from the search bar, but keeping for compatibility
        const encoded = encodeURIComponent(term);
        router.push(`/clubs?category=${encoded}`);
      } else {
        // Use the context method which will clear categories
        searchByName(term);
      }

      // Keep the input in sync
      if (!byCategory) {
        setInputValue(term);
      }

      // Close the dropdown
      setIsOpen(false);
    };

    useEffect(() => {
      const fetchClubNames = async () => {
        const { data, error } = await supabase
          .from(tableName)
          .select(nameColumn);
        if (!error && data) {
          setAllOptions(data.map((club) => club[nameColumn]));
        }
      };
      fetchClubNames();
    }, [tableName, nameColumn]);

    useEffect(() => {
      if (inputValue.trim() === "") {
        setFilteredOptions([]);
        setSelectedIndex(-1);
      } else {

        const filtered = allOptions
          .filter((option) =>
            option.toLowerCase().includes(inputValue.toLowerCase())
          )
          .sort((a, b) => {
            const lowerA = a.toLowerCase();
            const lowerB = b.toLowerCase();
            const indexA = lowerA.indexOf(inputValue.toLowerCase());
            const indexB = lowerB.indexOf(inputValue.toLowerCase());
            if (indexA !== indexB) return indexA - indexB;
            return lowerA.localeCompare(lowerB);
          });


        setFilteredOptions(filtered);
        // Reset selection if options change
        setSelectedIndex(-1);
      }
    }, [inputValue, allOptions]);

    // Scroll along with selected item when using arrow keys
    useEffect(() => {
      if (selectedIndex >= 0 && dropdownRef.current) {
        const items = dropdownRef.current.querySelectorAll("li");
        const selectedItem = items[selectedIndex];
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: "nearest" });
        }
      }
    }, [selectedIndex]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          handleOptionClick(filteredOptions[selectedIndex]);
        } else {
          handleSearch();
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (filteredOptions.length > 0) {
          setIsOpen(true);
          setSelectedIndex(Math.min(selectedIndex + 1, filteredOptions.length - 1));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (filteredOptions.length > 0) {
          setSelectedIndex(Math.max(selectedIndex - 1, -1));
        }
      }
    };

    const handleInputChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setIsOpen(true);

      // If the user clears the input, also clear the context search term
      if (!newValue.trim()) {
        setSearchTerm('');
      }
    };

    const handleOptionClick = (option) => {
      // Close the dropdown
      setIsOpen(false);
      router.push(`/clubs/${encodeURIComponent(option)}`);
    };

    return (
      <div className={`relative ${width}`} ref={dropdownRef}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a club..."
            className={`rounded-full drop-shadow-sm bg-white p-2 pr-10 pl-4 text-sm text-black md:text-base ${height} w-full`}
          />
          <button
            className="absolute top-1/2 right-3 -translate-y-1/2 transform pr-2 text-gray-400"
            onClick={() => handleSearch()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {isOpen && filteredOptions.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-sm shadow-md">
            {filteredOptions.map((option, idx) => (
              <li
                key={idx}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setSelectedIndex(idx)}
                onMouseLeave={() => setSelectedIndex(selectedIndex === idx ? -1 : selectedIndex)}
                className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${selectedIndex === idx ? "bg-gray-100" : ""}`}
              >
                {option}
              </li>
            ))}
          </ul>
        )}

        {isOpen && inputValue && filteredOptions.length === 0 && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md bg-white px-4 py-2 text-sm text-ellipsis whitespace-nowrap text-gray-500 shadow-md">
            No clubs found matching &quot;{inputValue}&quot;
          </div>
        )}
      </div>
    );
  },
);

ClubSearchBar.displayName = "ClubSearchBar";

export default ClubSearchBar;