"use client";

import React, { useEffect } from 'react';

export const QuarterYearDropdown = ({ 
  selectedQuarter = '',
  selectedYear = '',
  onQuarterChange,
  onYearChange,
  placeholder = 'Select quarter',
  required = false,
  yearRange = 5,
  className = ''
}) => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearRange;
  const endYear = currentYear; 
  const quarters = ['Fall', 'Spring', 'Winter'];
  
  // Generate array of combined quarter-year options
  const options = [];
  for (let year = endYear; year >= startYear; year--) {
    for (const quarter of quarters) {
      options.push({ quarter, year: year.toString() });
    }
  }
  
  const handleChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    
    const [quarter, year] = value.split('|');
    onQuarterChange({ target: { value: quarter } });
    onYearChange({ target: { value: year } });
  };
  
  const selectedValue = selectedQuarter && selectedYear 
    ? `${selectedQuarter}|${selectedYear}` 
    : '';
  
  return (
    <div className="relative">
      <select
        value={selectedValue}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-full text-gray-700 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${className}`}
        required={required}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(({ quarter, year }) => (
          <option key={`${quarter}-${year}`} value={`${quarter}|${year}`}>
            {quarter} {year}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.4752 4.975L0.850195 1.35C0.800195 1.3 0.762862 1.246 0.738195 1.188C0.713529 1.13 0.700862 1.06733 0.700195 1C0.700195 0.866667 0.746195 0.75 0.838195 0.65C0.930195 0.55 1.05086 0.5 1.2002 0.5H8.8002C8.9502 0.5 9.0712 0.55 9.1632 0.65C9.2552 0.75 9.30086 0.866667 9.30019 1C9.30019 1.03333 9.2502 1.15 9.1502 1.35L5.5252 4.975C5.44186 5.05833 5.35853 5.11667 5.2752 5.15C5.19186 5.18333 5.1002 5.2 5.0002 5.2C4.9002 5.2 4.80853 5.18333 4.7252 5.15C4.64186 5.11667 4.55853 5.05833 4.4752 4.975Z" fill="black"/>
        </svg>
      </div>
    </div>
  );
};

// Original components kept for backward compatibility
export const QuarterDropdown = ({ 
  value = '', 
  onChange, 
  placeholder = 'Select quarter',
  required = false,
  className = ''
}) => {
  const quarters = ['Fall', 'Winter', 'Spring'];
  
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-full text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${className}`}
        required={required}
      >
        <option value="" disabled>{placeholder}</option>
        {quarters.map(quarter => (
          <option key={quarter} value={quarter}>{quarter}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
};

// Year Dropdown Component
export const YearDropdown = ({ 
  value = '', 
  onChange, 
  placeholder = 'Select year',
  required = false,
  yearRange = 5,
  className = ''
}) => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearRange;
  const endYear = currentYear; // Including next year
  
  // Generate array of years
  const years = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year.toString());
  }
  
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${className}`}
        required={required}
      >
        <option value="" disabled>{placeholder}</option>
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
};