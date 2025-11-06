"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "../context/SearchContext";
import Button from "./button";

const GROUPED_TAGS = {
  "Academic & Pre-Professional": [
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
  ],
  "Cultural & Identity-Based": [
    "Cultural",
    "African American",
    "Asian",
    "Asian Pacific Islander",
    "Latino/Latina",
    "Ethnic",
    "International Students",
    "Out-of-state Students",
  ],
  "Community & Advocacy": [
    "Community Service",
    "Social Activism",
    "Service",
    "LGBTQI",
    "GSA Affiliated",
    "Transfer Students",
    "Faculty/Staff",
  ],
  "Arts & Media": ["Arts", "Dance", "Film", "Music", "Media", "Theater"],
  "Health & Wellness": [
    "Fitness",
    "Health and Wellness",
    "Self Improvement",
    "Sports",
    "Martial Arts",
  ],
  "Spiritual & Religious": ["Religious", "Spiritual"],
  "Campus Life & Social": [
    "Greek Life",
    "Student Government",
    "Social",
    "Spirit/Booster",
    "Recreation",
  ],
};

export default function Filter({
  initialSelectedTags = [],
  show = false,
  onInteraction = () => { },
}) {
  const { selectedCategories, searchByCategories } = useSearch();
  const [showFilter, setShowFilter] = useState(show);
  const [tempSelectedTags, setTempSelectedTags] = useState(selectedCategories);
  const [isMobile, setIsMobile] = useState(false);
  const filterRef = useRef(null);
  const buttonRef = useRef(null);
  const router = useRouter();

  // Sync with context state
  useEffect(() => {
    setTempSelectedTags(selectedCategories);
  }, [selectedCategories]);

  // detect mobile screen
  useEffect(() => {
    const updateSize = () => setIsMobile(window.innerWidth < 1024);
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const toggleFilter = (e) => {
    e.stopPropagation();
    onInteraction();
    setShowFilter((prev) => !prev);
    if (showFilter) setTempSelectedTags(selectedCategories);
  };

  useEffect(() => {
    if (!showFilter || isMobile) return;

    const handleClickOutside = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowFilter(false);
        setTempSelectedTags(selectedCategories);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilter, selectedCategories, isMobile]);

  useEffect(() => {
    if (isMobile && showFilter) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, showFilter]);

  useEffect(() => {
    if (isMobile && showFilter) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, showFilter]);

  const toggleTag = (tag) => {
    setTempSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearAll = () => setTempSelectedTags([]);
  const handleClose = () => {
    setShowFilter(false);
    setTempSelectedTags(selectedCategories);
  };

  const handleSearch = () => {
    onInteraction();

    // Use the context method which will clear name search
    searchByCategories(tempSelectedTags);
    setShowFilter(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = selectedCategories.filter((tag) => tag !== tagToRemove);

    // Use the context method to update and clear name search
    searchByCategories(updatedTags);
  };

  return (
    <div className="relative max-w-[75%]">
      <div className="flex items-start gap-2">
        <Button
          ref={buttonRef}
          className="flex-shrink-0 rounded-full border border-black bg-[#FFF7D6] px-4 py-2 font-bold whitespace-nowrap text-black"
          onClick={toggleFilter}
        >
          Search by Category
        </Button>

        {!isMobile && selectedCategories.length > 0 && (
          <div className="flex-grow overflow-x-auto pb-2">
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center rounded-full border border-[#272727] bg-[#5086E1] px-3 py-2 text-white shadow-md"
                >
                  <span>{tag}</span>
                  <button onClick={() => handleRemoveTag(tag)} className="ml-2">
                    <img src="/Close X.png" alt="x" width="20" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showFilter && isMobile && (
          <>
            {/* Backdrop to detect outside clicks */}
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={handleClose}
            />

            <motion.div
              key="mobile-filter"
              className="fixed inset-x-0 bottom-0 z-50 flex h-[80vh] flex-col rounded-t-2xl bg-white shadow-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                className="flex-shrink-0 bg-white px-10 pt-6 pb-2"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.05, bottom: 0 }}
                onDragEnd={(event, info) => {
                  if (info.offset.y > 100) {
                    setShowFilter(false);
                    setTempSelectedTags(selectedCategories);
                  }
                }}
              >
                <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" />
              </motion.div>

              <div className="flex-1 overflow-y-auto px-10">
                <div className="pb-24">
                  {tempSelectedTags.length > 0 && (
                    <div className="mb-6">
                      <h4 className="mb-2 font-semibold">Selected Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tempSelectedTags.map((tag) => (
                          <div
                            key={tag}
                            className="flex flex-shrink-0 items-center rounded-full border border-[#272727] bg-[#5086E1] px-3 py-2 text-sm text-white"
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => toggleTag(tag)}
                              className="ml-2"
                            >
                              <img src="/Close X.png" alt="x" width="20" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={clearAll}
                        className="mt-2 text-sm font-bold text-blue-600 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                  )}

                  {Object.entries(GROUPED_TAGS).map(([group, tags]) => (
                    <div key={group} className="mb-6">
                      <h4 className="mb-2 font-semibold">{group}</h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Button
                            type="tag"
                            size="small"
                            key={tag}
                            isSelected={tempSelectedTags.includes(tag)}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fixed bottom-0 left-0 flex w-full justify-between border-t bg-white px-6 py-4">
                  <button
                    className="text-md px-4 py-2 font-semibold"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="text-md rounded-xl bg-[#5086E1] px-4 py-2 text-white"
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {showFilter && !isMobile && (
          <div
            ref={filterRef}
            className="absolute top-12 left-0 z-50 w-lg rounded-xl bg-white p-6 shadow-lg lg:w-3xl"
          >
            <div className="max-h-[50vh] overflow-y-auto p-4">
              {tempSelectedTags.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 font-semibold">Selected Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedTags.map((tag) => (
                      <div
                        key={tag}
                        className="rounded-full py-2 px-4 text-sm bg-[#FFCEE5] border-1 border-[#FFA1CD] flex items-center"
                      >
                        <span>{tag}</span>
                        <button onClick={() => toggleTag(tag)} className="ml-1">
                          <img src="/X.png" alt="remove tag" width="19" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={clearAll}
                    className="mt-2 text-sm font-bold text-blue-600 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {Object.entries(GROUPED_TAGS).map(([group, tags]) => (
                <div key={group} className="mb-4">
                  <h4 className="mb-2 font-semibold">{group}</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Button
                        type="tag"
                        size="small"
                        key={tag}
                        isSelected={tempSelectedTags.includes(tag)}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 pb-2">
              <Button
                style='font-bold'
                className="text-md px-4 py-2 font-semibold"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="CTA"
                className="text-md ml-2 rounded-xl bg-[#5086E1] px-4 py-2 text-white"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
