"use client";

import React, { useRef } from 'react';
import SearchBar from './components/search-bar';
import Button from './components/button';

function Home() {
  const searchRef = useRef();

  const handleSearchClick = () => {
    if (searchRef.current) {
      searchRef.current.triggerSearch();
    }
  };

  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
      <div className="absolute top-0 right-0 w-full flex justify-end p-5 pr-25 space-x-5">
        <Button value="Review a Club" to="/" />
        <Button value="Sign In" to="/" />
      </div>
      <h2 className="text-8xl font-bold text-blue-700 my-10">BruinSphere</h2>
      <div className="flex flex-col space-y-2 w-2/5 max-w-l">
        <SearchBar ref={searchRef} width="w-full" height="h-13" />
        <button
          onClick={handleSearchClick}
          className="self-end !bg-blue-700 !border-blue-600 text-white !text-lg !rounded-xl !py-1 px-4"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default Home;