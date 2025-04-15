"use client"

import React, { useState } from 'react';
import SearchBar from './components/search-bar';
import Button from './components/button';
import { useRouter } from 'next/navigation';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      // Properly encode the search term for URL
      const encodedSearch = encodeURIComponent(searchTerm.trim());
      router.push(`/clubs/${encodedSearch}`);
    }
  };

  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
      <div className="absolute top-0 right-0 w-full flex justify-end p-5 pr-25 space-x-5">
        <Button value="Review a Club" to="/"/>
        <Button value="Sign In" to="/"/>
      </div>
      <h2 className="text-8xl font-bold text-blue-700 my-10">BruinSphere</h2>
      <div className="flex flex-col space-y-3 w-1/2 justify-end items-end">
        <SearchBar 
          width="w-full" 
          height="h-13" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
        <button
          onClick={handleSearch}
          className="!bg-blue-700 !border-blue-600 text-white !text-lg !rounded-xl !py-1 px-4"
        >
          Search
        </button>
      </div>
    </div>
  )
}

export default Home