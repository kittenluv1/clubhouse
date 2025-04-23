"use client";

import React from 'react';

export const QuarterDropdown = ({ 
  value = '', 
  onChange, 
  placeholder = 'select quarter',
  required = false
}) => {
  const quarters = ['Fall', 'Winter', 'Spring'];
  
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-full text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
  placeholder = 'select year',
  required = false,
  yearRange = 10
}) => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearRange;
  const endYear = currentYear; 
  
  // Generate array of years
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString());
  }
  
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-full text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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