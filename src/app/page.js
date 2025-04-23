"use client";

import React, { useRef, useState, useEffect } from 'react';
import SearchBar from './components/search-bar';
import Button from './components/button';

function Home() {
  const searchRef = useRef();

  const handleSearchClick = () => {
    if (searchRef.current) {
      searchRef.current.triggerSearch();
    }
  };

  const handleCategoryClick = (category) => {
    if (searchRef.current) {
      searchRef.current.triggerSearch(category, true);
    }
  }

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('could not load categories')
      setCategories(await res.json())
    }
    loadCategories()
  }, [])


  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
      <div className="absolute top-0 right-0 w-full flex justify-end p-5 pr-25 space-x-5">
        <Button value="Review a Club" to="/review" />
        <Button value="Sign In" to="/sign-in" />
      </div>
      <h2 className="text-8xl font-bold text-blue-700 my-10">ClubHouse</h2>
      <div className="flex flex-col space-y-2 w-4/7 max-w-l">
        <SearchBar ref={searchRef} width="w-full" height="h-13" />
        <button
          onClick={handleSearchClick}
          className="self-end !bg-blue-700 !border-blue-600 text-white !text-lg !rounded-xl !py-1 px-4"
        >
          Search
        </button>
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className="px-6 py-3 border rounded-full text-lg shadow-md hover:bg-blue-50 transition"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Home;