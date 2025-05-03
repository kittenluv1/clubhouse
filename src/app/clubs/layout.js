'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SharedLayout from '../sign-in/layout'; // ✅ your outer layout
import Filter from '../components/filter'; // ✅ your filter popup

export default function ClubsLayout({ children }) {
  const router = useRouter();

  const [showFilter, setShowFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]); // ✅ new state

  const handleSearch = (tags) => {
    if (!tags || tags.length === 0) return;

    const encoded = encodeURIComponent(tags.join(','));
    setSelectedTags(tags); // ✅ update selectedTags for display
    router.push(`/clubs?categories=${encoded}`);
    setShowFilter(false); // Close the filter popup
  };

  return (
    <SharedLayout>
      <div className="relative mt-10 ">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center px-15 py-0 gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <button
              className="bg-[#FFD8EB] border border-pink-300 font-bold px-4 py-2 rounded-full"
              onClick={() => setShowFilter(true)}
            >
              Search by Category
            </button>

            {/* ✅ Show selected tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="bg-green-100 border border-green-400 text-black px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

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
