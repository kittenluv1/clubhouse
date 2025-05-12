'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Filter from '../components/filter'; // ✅ your filter popup

function ClubsLayoutContent({ children }) {
  const router = useRouter();

  const [showFilter, setShowFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]); 

  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name");

  useEffect(() => {
    if (nameParam) {
      setSelectedTags([]); 
    }
  }, [nameParam]);


  const handleSearch = (tags) => {
    if (!tags || tags.length === 0) return;

    const encoded = encodeURIComponent(tags.join(','));
    setSelectedTags(tags); 
    router.push(`/clubs?categories=${encoded}`);
    setShowFilter(false); // Close the filter popup
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(updatedTags);

    if (updatedTags.length > 0) {
      const encoded = encodeURIComponent(updatedTags.join(','));
      router.push(`/clubs?categories=${encoded}`);
    } else {
      router.push('/clubs'); 
    }
  };


  return (
    <>
      <div className="relative mt-10 ">
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
                  <div
                    key={tag}
                    className="flex items-center bg-green-100 text-black border border-green-400 px-3 py-1 rounded-full text-sm"
                  >
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
    </>
  );
}

export default function ClubsLayout({ children }) {
  return (
    <Suspense fallback={<p className="p-4">Loading...</p>}>
      <ClubsLayoutContent>{children}</ClubsLayoutContent>
    </Suspense>
  );
}