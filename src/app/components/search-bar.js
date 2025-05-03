"use client";

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { useRouter } from 'next/navigation';

const SearchBar = forwardRef(({ width, height }, ref) => {
  const [localSearch, setLocalSearch] = useState('');
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
      router.push(`/clubs/${encoded}`);
    }
  }


  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  //Expose handleSearch to parent
  useImperativeHandle(ref, () => ({
    triggerSearch: handleSearch,
  }));

  return (
    <input
      type="text"
      placeholder="Search for a club"
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
      onKeyDown={handleKeyDown}
      className={`border-2 border-blue-400 bg-white text-black rounded-3xl p-1 pl-4 ${width} ${height}`}
    />
  );
});

export default SearchBar;