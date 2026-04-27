"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "./components/search-bar";
import Button from "./components/button";
import ClubSlider from "./components/ClubSlider";

function useIsMobile(breakpoint = 1024) {
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
  const isMobile = useIsMobile();

  // generate random categories
  const CATEGORIES = [
    "Academic",
    "Business",
    "Career Planning",
    "Club Sports",
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
    setRandomCategories(getRandomItems(CATEGORIES, isMobile ? 5 : 12));
  }, [isMobile]);

  return (
    <div className="relative w-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-10 md:px-10 lg:px-16">
        <div className="max-w-2xl lg:p-8">
          <img
            src="/clubhouse-logo-desktop.svg"
            alt="ClubHouse Logo"
            className="hidden w-sm object-cover lg:block"
          />
          <img
            src="/clubhouse-logo-mobile.svg"
            alt="ClubHouse Logo"
            className="w-4xs object-cover lg:hidden"
          />
        </div>
        <div className="flex w-full max-w-4xl flex-col items-center space-y-2">
          <SearchBar ref={searchRef} style="bg-white" />
          <div className="flex flex-wrap justify-center gap-3 px-4 py-5 md:px-10 md:py-10">
            {randomCategories.map((category, index) => (
              <Button
                style="drop-shadow-xs"
                key={category}
                onClick={() => {
                  const encoded = encodeURIComponent(category);
                  router.push(`/clubs?categories=${encoded}`);
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex w-full max-w-4xl justify-end">
          <Button
            type="CTA"
            onClick={() => router.push("/clubs?showCategories#discover")}
          >
            More Categories &gt;
          </Button>
        </div>
        <div className="mt-30 mb-16 w-full max-w-6xl">
          <ClubSlider />
        </div>
      </div>
    </div>
  );
}

export default Home;
