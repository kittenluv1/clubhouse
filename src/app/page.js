"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "./components/search-bar";

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

function Home() {
  const router = useRouter();
  const searchRef = useRef();
  const [randomCategories, setRandomCategories] = useState([]);
  const isMobile = useIsMobile(640);

  // generate random categories
  const CATEGORIES = [
    "Academic",
    "Business",
    "Career Planning",
    "Dental",
    "Educational",
    "Engineering",
    "Honor Societies",
    "Journals",
    "Law",
    "Leadership",
    "Medical",
    "Pre-Professional",
    "Technology",
    "Cultural",
    "African American",
    "Asian",
    "Asian Pacific Islander",
    "Latino/Latina",
    "Ethnic",
    "International Students",
    "Out-of-state Students",
    "Community Service",
    "Social Activism",
    "Service",
    "LGBTQI",
    "GSA Affiliated",
    "Transfer Students",
    "Faculty/Staff",
    "Arts",
    "Dance",
    "Film",
    "Music",
    "Media",
    "Theater",
    "Fitness",
    "Health and Wellness",
    "Self Improvement",
    "Sports",
    "Martial Arts",
    "Religious",
    "Spiritual",
    "Greek Life",
    "Student Government",
    "Social",
    "Spirit/Booster",
    "Recreation",
  ];

  function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  useEffect(() => {
    setRandomCategories(getRandomItems(CATEGORIES, isMobile ? 5 : 10));
  }, [isMobile]);

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
    <div className="relative flex w-full flex-col items-center justify-center">
      <div className="max-w-2xl lg:pb-10">
        <object
          type="image/svg+xml"
          data="/clubhouse-logo-text.svg"
          aria-label="ClubHouse Logo"
          className="hidden w-2xl object-cover lg:block"
        />
        <object
          type="image/svg+xml"
          data="/clubhouse-star-logo.svg"
          aria-label="ClubHouse Logo"
          className="w-3xs object-cover lg:hidden"
        />
      </div>
      <div className="flex w-6/8 max-w-3xl flex-col items-center space-y-2">
        <SearchBar ref={searchRef} width="w-full" height="h-13" />
        <div className="mt-4 flex flex-wrap justify-center gap-3 py-5 md:py-10">
          {randomCategories.map((category, index) => (
            <button
              key={category}
              onClick={() => {
                const encoded = encodeURIComponent(category);
                router.push(`/clubs?categories=${encoded}`);
              }}
              className="rounded-full border-1 px-6 py-3 text-base shadow-lg transition-colors duration-300 hover:bg-[#B1D49D] lg:text-lg"
            >
              {category}
            </button>
          ))}
          <button
            onClick={() => router.push("/clubs?showCategories")}
            className="ml-4 rounded-full border-1 border-black bg-black px-6 py-3 text-nowrap text-white transition-colors duration-300 hover:bg-white hover:text-black"
          >
            More Categories &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
