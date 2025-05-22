'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TagButton from './tagButton';

const GROUPED_TAGS = {
  "Academic & Pre-Professional": [
    "Academic", "Business", "Career Planning", "Dental", "Educational",
    "Engineering", "Honor Societies", "Journals", "Law", "Leadership",
    "Medical", "Pre-Professional", "Technology"
  ],
  "Cultural & Identity-Based": [
    "Cultural", "African American", "Asian", "Asian Pacific Islander",
    "Latino/Latina", "Ethnic", "International Students", "Out-of-state Students"
  ],
  "Community & Advocacy": [
    "Community Service", "Social Activism", "Service", "LGBTQI",
    "GSA Affiliated", "Transfer Students", "Faculty/Staff"
  ],
  "Arts & Media": [
    "Arts", "Dance", "Film", "Music", "Media", "Theater"
  ],
  "Health & Wellness": [
    "Fitness", "Health and Wellness", "Self Improvement", "Sports", "Martial Arts"
  ],
  "Spiritual & Religious": [
    "Religious", "Spiritual"
  ],
  "Campus Life & Social": [
    "Greek Life", "Student Government", "Social", "Spirit/Booster", "Recreation"
  ]
};

export default function Filter({ initialSelectedTags = [], show=false }) {
const [showFilter, setShowFilter] = useState(show);
const [selectedTags, setSelectedTags] = useState(initialSelectedTags);
const [tempSelectedTags, setTempSelectedTags] = useState(initialSelectedTags);
const filterRef = useRef(null);
const buttonRef = useRef(null);
const router = useRouter();

// Toggle filter visibility function
const toggleFilter = (e) => {
  e.stopPropagation(); // Prevent event bubbling
  setShowFilter(prevState => !prevState);
  if (showFilter) {
    // If we're closing, reset temp tags
    setTempSelectedTags(selectedTags);
  }
};

// Use effect to close menu if clicking outside it
useEffect(() => {
  if (!showFilter) return;

  const handleClickOutside = (event) => {
    // Check if click is outside both filter and button
    if (
      filterRef.current && 
      !filterRef.current.contains(event.target) && 
      buttonRef.current && 
      !buttonRef.current.contains(event.target)
    ) {
      setShowFilter(false);
      // Temp tags stored before you confirm the search
      setTempSelectedTags(selectedTags);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showFilter, selectedTags]);

// Toggle a tag selection in the temporary selection state
const toggleTag = (tag) => {
  setTempSelectedTags((prev) =>
    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
  );
};

// Clear all temporary selections
const clearAll = () => setTempSelectedTags([]);

// Close the filter popup
const handleClose = () => {
  setShowFilter(false);
  setTempSelectedTags(selectedTags);
};

// Apply the search with selected tags
const handleSearch = () => {
  if (!tempSelectedTags || tempSelectedTags.length === 0) {
    router.push('/clubs'); // Return to all clubs if no tags
  } else {
    const encoded = encodeURIComponent(tempSelectedTags.join(','));
    router.push(`/clubs?categories=${encoded}`);
  }

  setSelectedTags(tempSelectedTags); // Update the real selected tags
  setShowFilter(false); // Close the filter popup
};

// Remove a single tag
const handleRemoveTag = (tagToRemove) => {
  const updatedTags = selectedTags.filter((tag) => tag !== tagToRemove);
  setSelectedTags(updatedTags);
  setTempSelectedTags(updatedTags);

  if (updatedTags.length > 0) {
    const encoded = encodeURIComponent(updatedTags.join(','));
    router.push(`/clubs?categories=${encoded}`);
  } else {
    router.push('/clubs');
  }
};

return (
  <div className="relative max-w-[75%]">
    <div className="flex items-start gap-2">
      {/* Filter Button */}
        <button
          ref={buttonRef}
          className="flex-shrink-0 bg-[#FFF7D6] text-black border border-black rounded-full font-bold px-4 py-2 whitespace-nowrap"
          onClick={toggleFilter}
        >
          Search by Category
        </button>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex-grow overflow-x-auto pb-2">
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <div
                    key={tag}
                    className="flex items-center bg-[#5086E1] text-white border border-[#272727] px-3 py-2 rounded-full shadow-md"
                >
                  <span>{tag}</span>
                  <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2"
                  >
                      <img
                      src={"/Close X.png"}
                      alt="x"
                      className="object-cover"
                      width="20"
                      />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>

    {/* Filter Popup */}
    {showFilter && (
      <div 
        ref={filterRef} 
        className="absolute top-12 left-0 bg-white rounded-xl shadow-lg z-50 w-lg lg:w-3xl p-6"
      >
        <div className="p-4 max-h-[50vh] overflow-y-auto">

          {/* Selected Tags */}
          {tempSelectedTags.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Selected Tags:</h4>
              <div className="flex flex-wrap gap-2">
                  {tempSelectedTags.map((tag) => (
                    <div
                        key={tag}
                        className="flex-shrink-0 flex items-center bg-[#5086E1] text-white border border-[#272727] px-3 py-2 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                          onClick={() => toggleTag(tag)}
                          className="ml-2"
                      >
                        <img
                        src={"/Close X.png"}
                        alt="x"
                        className="object-cover"
                        width="20"
                        />
                      </button>
                    </div>
                  ))}
              </div>
              <button
                onClick={clearAll}
                className="mt-2 text-sm text-blue-600 font-bold hover:underline"
              >
                Clear All
              </button>
            </div>
          )}
          
          {/* Tag Groups */}
          {Object.entries(GROUPED_TAGS).map(([group, tags]) => (
            <div key={group} className="mb-4">
              <h4 className="font-semibold mb-2">{group}</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagButton
                    key={tag}
                    label={tag}
                    isSelected={tempSelectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex pb-2 pt-4 justify-end">
            <button className="text-md font-semibold px-4 py-2 self-center text-nowrap" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="bg-[#5086E1] text-white text-md px-4 py-2 rounded-xl ml-2"
              onClick={handleSearch}
            >
              Search
            </button>
        </div>
      </div>
    )}
  </div>
);
}