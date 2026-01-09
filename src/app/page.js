"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "./components/search-bar";
import Button from "./components/button";

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
    <div className="relative flex w-full flex-col items-center justify-center">
      <div className="max-w-2xl lg:p-15">
        <object
          type="image/svg+xml"
          data="/clubhouse-logo-desktop.svg"
          aria-label="ClubHouse Logo"
          className="hidden w-sm object-cover lg:block"
        />
        <object
          type="image/svg+xml"
          data="/clubhouse-logo-mobile.svg"
          aria-label="ClubHouse Logo"
          className="w-4xs object-cover lg:hidden"
        />
      </div>
      <div className="flex w-6/8 max-w-4xl flex-col items-center space-y-2">
        <SearchBar ref={searchRef} style="bg-white" />
        <div className="flex flex-wrap justify-center gap-3 py-5 px-10 md:py-10">
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
      <div className="w-full flex justify-center lg:justify-end lg:mr-100">
        <Button
          type="CTA"
          onClick={() => router.push("/clubs?showCategories")}
        >
          More Categories &gt;
        </Button>
      </div>
    </div>
  );
}

export default Home;
