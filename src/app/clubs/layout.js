'use client';
import { useState } from 'react';
import SharedLayout from '../sign-in/layout'; // ✅ your outer layout
import Filter from '../components/filter'; // ✅ your filter popup

export default function ClubsLayout({ children }) {
  const [showFilter, setShowFilter] = useState(false);

  const handleSearch = (selectedTags) => {
    if (!selectedTags || selectedTags.length === 0) return;

    const encoded = encodeURIComponent(selectedTags.join(','));
    router.push(`/clubs?categories=${encoded}`);
    setShowFilter(false); // Close the filter popup
  };


  return (
    <SharedLayout>
      {/* Section-specific header controls */}
      <div className="relative mt-10 ">
        <div className="flex justify-between items-center px-25 py-4">
          <button
            className="bg-[#FFD8EB] border border-pink-300 px-4 py-2 rounded-full"
            onClick={() => setShowFilter(true)}
          >
            Search by Category
          </button>

          <div>
            <label className="mr-2 font-medium">Replace the sort by here</label>
            <select className="border rounded px-2 py-1">
              <option>Highest Rated</option>
              <option>Most Popular</option>
            </select>
          </div>
        </div>

        {/* Floating popup filter */}
        {showFilter && (
          <div className="absolute top-20 left-1/4 transform -translate-x-1/2 bg-white rounded-xl shadow-lg z-50 w-[30%] max-w-3xl p-6">
            <Filter onSearch={handleSearch} onClose={() => setShowFilter(false)} />
          </div>
        )}

        {/* Main club page content */}
        <div className="px-6">{children}</div>
      </div>
    </SharedLayout>
  );
}
