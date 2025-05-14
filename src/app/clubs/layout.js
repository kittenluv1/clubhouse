'use client';
import { useState, useEffect, Suspense, cloneElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Filter from '../components/filter';

function ClubsLayoutContent({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name");

  const [showFilter, setShowFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortType, setSortType] = useState("rating");

  useEffect(() => {
    if (nameParam) {
      setSelectedTags([]);
    }
  }, [nameParam]);

  useEffect(() => {
    const initialSort = searchParams.get("sort") ?? "rating";
    setSortType(initialSort);
  }, [searchParams]);

  const handleSearch = (tags) => {
    if (!tags || tags.length === 0) return;
    const encoded = encodeURIComponent(tags.join(','));
    const params = new URLSearchParams(window.location.search);
    params.set("categories", encoded);
    router.push(`/clubs?${params.toString()}`);
    setSelectedTags(tags);
    setShowFilter(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(updatedTags);

    const params = new URLSearchParams(window.location.search);
    if (updatedTags.length > 0) {
      params.set("categories", encodeURIComponent(updatedTags.join(',')));
    } else {
      params.delete("categories");
    }
    router.push(`/clubs?${params.toString()}`);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortType(newSort);

    const params = new URLSearchParams(window.location.search);
    params.set("sort", newSort);
    router.push(`/clubs?${params.toString()}`);
  };

  return (
    <div className="relative mt-10">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center px-15 py-0 gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <button
            className="bg-[#FFD8EB] border border-pink-300 font-bold px-4 py-2 rounded-full"
            onClick={() => setShowFilter(true)}
          >
            Search by Category
          </button>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {selectedTags.map((tag) => (
                <div key={tag} className="flex items-center bg-green-100 text-black border border-green-400 px-3 py-1 rounded-full text-sm">
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 font-bold hover:text-green-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border border-black rounded-full bg-[#FFF7D6] px-4 py-2">
          <label className=" font-medium text-black">Sort by:</label>
            <select
              id="sort"
              value={sortType}
              onChange={handleSortChange}
              className="text-black font-medium"
            >
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviewed</option>
            <option value="alphabetical">A–Z</option>
          </select>
        </div>

      </div>
  

      {showFilter && (
        <div className="absolute top-20 left-1/4 transform -translate-x-1/2 bg-white rounded-xl shadow-lg z-50 w-[30%] max-w-3xl p-6">
          <Filter onSearch={handleSearch} onClose={() => setShowFilter(false)} />
        </div>
      )}

      <div className="px-6">
        {cloneElement(children)}
      </div>
    </div>
  );
}

export default function ClubsLayout({ children }) {
  return (
    <Suspense fallback={<p className="p-4">Loading...</p>}>
      <ClubsLayoutContent>{children}</ClubsLayoutContent>
    </Suspense>
  );
}
