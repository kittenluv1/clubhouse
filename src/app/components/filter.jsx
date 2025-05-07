'use client';
import { useState } from 'react';
import TagButton from './tagButton'; // adjust path if needed

const GROUPED_TAGS = {
  "🎓 Academic & Pre-Professional": [
    "Academic", "Business", "Career Planning", "Dental", "Educational",
    "Engineering", "Honor Societies", "Journals", "Law", "Leadership",
    "Medical", "Pre-Professional", "Technology"
  ],
  "🌎 Cultural & Identity-Based": [
    "Cultural", "African American", "Asian", "Asian Pacific Islander",
    "Latino/Latina", "Ethnic", "International Students", "Out-of-state Students"
  ],
  "🌈 Community & Advocacy": [
    "Community Service", "Social Activism", "Service", "LGBTQI",
    "GSA Affiliated", "Transfer Students", "Faculty/Staff"
  ],
  "🎭 Arts & Media": [
    "Arts", "Dance", "Film", "Music", "Media", "Theater"
  ],
  "🧘 Health & Wellness": [
    "Fitness", "Health and Wellness", "Self Improvement", "Sports", "Martial Arts"
  ],
  "⛪ Spiritual & Religious": [
    "Religious", "Spiritual"
  ],
  "🏛️ Campus Life & Social": [
    "Greek Life", "Student Government", "Social", "Spirit/Booster", "Recreation"
  ]
};

export default function Filter({ onSearch, onClose }) {
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAll = () => setSelectedTags([]);

  return (
    <div className="p-4 max-h-[70vh] overflow-y-auto">
      {/* Tag Groups */}
      {Object.entries(GROUPED_TAGS).map(([group, tags]) => (
        <div key={group} className="mb-4">
          <h4 className="font-semibold mb-2">{group}</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagButton
                key={tag}
                label={tag}
                isSelected={selectedTags.includes(tag)}
                onClick={() => toggleTag(tag)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Selected Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center bg-[#6E9461] text-white px-3 py-1 rounded-full"
              >
                <span>{tag}</span>
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={clearAll}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-between">
        <button className="text-gray-600" onClick={onClose}>
          Cancel
        </button>
        <button
          className="bg-pink-300 px-4 py-1 rounded-full text-white"
          onClick={() => onSearch(selectedTags)}
        >
          Search
        </button>
      </div>
    </div>
  );
}