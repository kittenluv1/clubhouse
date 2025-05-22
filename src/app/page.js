"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from './components/search-bar';

function Home() {
  const router = useRouter();
  const searchRef = useRef();
  const [randomCategories, setRandomCategories] = useState([]);

  // generate random categories
  const CATEGORIES = [
      "Academic", "Business", "Career Planning", "Dental", "Educational",
      "Engineering", "Honor Societies", "Journals", "Law", "Leadership",
      "Medical", "Pre-Professional", "Technology", "Cultural", "African American", "Asian", "Asian Pacific Islander",
      "Latino/Latina", "Ethnic", "International Students", "Out-of-state Students", 
      "Community Service", "Social Activism", "Service", "LGBTQI",
      "GSA Affiliated", "Transfer Students", "Faculty/Staff", 
      "Arts", "Dance", "Film", "Music", "Media", "Theater", 
      "Fitness", "Health and Wellness", "Self Improvement", "Sports", "Martial Arts", 
      "Religious", "Spiritual", "Greek Life", "Student Government", "Social", "Spirit/Booster", "Recreation"
  ]
  function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  useEffect(() => {
    setRandomCategories(getRandomItems(CATEGORIES, 10));
  }, [])

  // useEffect(() => {
  //   async function loadCategories() {
  //     try {
  //       const res = await fetch('/api/categories')
  //       if (!res.ok) throw new Error('could not load categories')
  //       setCategories(await res.json())
  //     } catch (err) {
  //       console.error('Error loading categories:', error);
  //     }
  //   }
  //   loadCategories()
  // }, [])

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
        <div className="flex flex-wrap gap-3 justify-center mt-4 py-10">
          {randomCategories.map((category, index) => (
            <button
              key={category}
              onClick={() => {
                const encoded = encodeURIComponent(category);
                router.push(`/clubs?categories=${encoded}`);
              }}
              className="px-6 py-3 border-1 rounded-full text-lg shadow-lg hover:bg-[#B1D49D] transition"
            >
              {category}
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