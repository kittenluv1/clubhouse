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

  return (
    <div className="relative w-full flex flex-col justify-center items-center">
      <h2 className="max-w-2xl p-10">
        <img
        src={"/clubhouse-logo-text.svg"}
        alt="ClubHouse Logo"
        className="object-cover"
        />
      </h2>
      <div className="flex flex-col space-y-2 w-6/8 max-w-3xl items-center">
        <SearchBar ref={searchRef} width="w-full" height="h-13"/>
        <div className="flex flex-wrap gap-3 justify-center mt-4 px-20 p-10">
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
          <button
            onClick={() => router.push('/clubs?showCategories')}
            className="bg-black text-white rounded-full px-6 py-3 ml-4 text-nowrap border-1 border-black
              hover:bg-white transition hover:text-black"
            >More Categories &gt;
          </button>
          </div>
        </div>
    </div>
  );
}

export default Home;