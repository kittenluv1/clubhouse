"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from './components/search-bar';

function Home() {
  const router = useRouter();
  const searchRef = useRef();
  const [categories, setCategories] = useState([]);

  const GROUP_CATEGORY_MAP = {
    "Academic": [
      "Academic", "Business", "Career Planning", "Dental", "Educational",
      "Engineering", "Honor Societies", "Journals", "Law", "Leadership",
      "Medical", "Pre-Professional", "Technology"
    ],
    "Cultural": [
      "Cultural", "African American", "Asian", "Asian Pacific Islander",
      "Latino/Latina", "Ethnic", "International Students", "Out-of-state Students"
    ],
    "Community": [
      "Community Service", "Social Activism", "Service", "LGBTQI",
      "GSA Affiliated", "Transfer Students", "Faculty/Staff"
    ],
    "Arts": [
      "Arts", "Dance", "Film", "Music", "Media", "Theater"
    ],
    "Health": [
      "Fitness", "Health and Wellness", "Self Improvement", "Sports", "Martial Arts"
    ],
    "Spiritual": [
      "Religious", "Spiritual"
    ],
    "Social": [
      "Greek Life", "Student Government", "Social", "Spirit/Booster", "Recreation"
    ]
  }


  const handleSearchClick = () => {
    if (searchRef.current) {
      searchRef.current.triggerSearch();
    }
  };

  const handleCategoryClick = (byCategory) => {
    if (searchRef.current) {
      searchRef.current.triggerSearch(byCategory, true);
    }
  }

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories')
        if (!res.ok) throw new Error('could not load categories')
        setCategories(await res.json())
      } catch (err) {
        console.error('Error loading categories:', error);
      }
    }
    loadCategories()
  }, [])

//<div className="absolute top-0 left-0 h-1/6 w-full bg-gradient-to-b from-[#DFEBFF] via-[#DFF1F1] to-[#FFFFFF] -z-10"></div>
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 h-3/4 w-full bg-gradient-to-b from-[#DFEBFF] to-[#FFFFFF] -z-10"/>
      {/* <div className="absolute top-2/3 h-1/3 w-full bg-gradient-to-b from-[#FFFFFF] to-[#DFF1F1] -z-10"/> */}

      <div className="flex flex-col w-full h-full justify-center items-center">
        <h2 className="text-8xl font-bold text-blue-700 my-10 text-center">
          <img 
          src={"/Logo Big 2.png"}
          alt="ClubHouse Logo"
          className="object-cover"
          />
        </h2>
        <div className="flex flex-col space-y-2 w-5/8 max-w-l items-center">
          <SearchBar ref={searchRef} width="w-1/2" height="h-13"/>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {Object.entries(GROUP_CATEGORY_MAP).map(([group, categoryList]) => (
              <button
                key={group}
                onClick={() => {
                  const encoded = encodeURIComponent(categoryList.join(','));
                  router.push(`/clubs?categories=${encoded}`);
                }}
                className="px-6 py-3 border-1 rounded-full text-lg shadow-lg hover:bg-[#B1D49D] transition"
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;