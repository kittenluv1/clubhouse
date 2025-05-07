'use client';
import { useState } from 'react';
import TagButton from './tagButton'; // adjust path if needed

const TAGS = {
  Arts: ['Film', 'Music', 'Dance', 'Media', 'Theater'],
  Cultural: ['Asian', 'African American', 'Latino/Latina'],
  Professional: ['Business', 'Dental', 'Law', 'Theater'],
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
    <div className="p-4">
      {/* Tag Groups */}
      {Object.entries(TAGS).map(([group, tags]) => (
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
