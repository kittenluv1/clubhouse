'use client';
import { useState } from 'react';
import TagButton from './tagButton'; // or wherever it's defined

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

  return (
    <div>
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
