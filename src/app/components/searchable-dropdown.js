"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SearchableDropdown = ({  
    placeholder = "Search for your club here...",
    tableName = "clubs", 
    nameColumn = "OrganizationName", 
    onSelect = () => {},
    required = true,
    placeholderColor = "#000", 
    value = "" 
    }) => {
    const [inputValue, setInputValue] = useState(value || ''); 
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [allOptions, setAllOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);

   
    useEffect(() => {
        // Update inputValue when the value prop changes
        if (value !== inputValue) {
            setInputValue(value || '');
        }
    }, [value]);

    useEffect(() => {
    const fetchClubNames = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from(tableName)
          .select(nameColumn)
          .order(nameColumn, { ascending: true });

        if (error) throw error;

        const clubNames = data.map((club) => club[nameColumn]);
        setAllOptions(clubNames);
      } catch (err) {
        console.error("Error fetching club names:", err);
        setError("Failed to load clubs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubNames();
  }, [tableName, nameColumn]);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions([]);
    } else {
      const filtered = allOptions.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()),
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option) => {
    setInputValue(option);
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
          className="font-dm-sans placeholder-custom w-full rounded-full border bg-white px-3 py-2 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required={required}
          style={{
            "--placeholder-color": placeholderColor,
          }}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
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
              className="relative cursor-pointer py-2 pr-9 pl-3 select-none hover:bg-gray-100"
            >
              {option}
            </li>
          ))}
        </ul>
      )}

      {isOpen && inputValue && filteredOptions.length === 0 && !isLoading && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white px-3 py-3 text-sm shadow-lg">
          No clubs found matching &quot;{inputValue}&quot;
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
