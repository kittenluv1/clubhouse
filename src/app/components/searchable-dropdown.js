"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SearchableDropdown = ({  
    placeholder = "search for your club here...",
    tableName = "clubs", 
    nameColumn = "OrganizationName", 
    onSelect = () => {},
    required = true
    }) => {
    const [inputValue, setInputValue] = useState('');
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [allOptions, setAllOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);

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
        
        const clubNames = data.map(club => club[nameColumn]);
        setAllOptions(clubNames);
        } catch (err) {
        console.error('Error fetching club names:', err);
        setError('Failed to load clubs. Please try again later.');
        } finally {
        setIsLoading(false);
        }
    };

    fetchClubNames();
    }, [tableName, nameColumn]);

    useEffect(() => {
    if (inputValue.trim() === '') {
        setFilteredOptions([]);
    } else {
        const filtered = allOptions.filter(option => 
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
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
          className="w-full px-3 py-2 border border-gray-300 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      {isLoading && (
        <div className="mt-2 text-sm text-gray-500">Loading clubs...</div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-500">{error}</div>
      )}
      
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(option)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-700"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && inputValue && filteredOptions.length === 0 && !isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-3 px-3 text-sm text-gray-700">
          No clubs found matching &quot;{inputValue}&quot;
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;