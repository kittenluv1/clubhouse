'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Filter from '../components/filter'; // ✅ your filter popup

function ClubsLayoutContent({ children }) {
  const router = useRouter();

  const [showFilter, setShowFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]); // ✅ new state

  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name");

  useEffect(() => {
    if (nameParam) {
      setSelectedTags([]); // ✅ clear selected tags if searching by name
    }
  }, [nameParam]);


  const handleSearch = (tags) => {
    if (!tags || tags.length === 0) return;

    const encoded = encodeURIComponent(tags.join(','));
    setSelectedTags(tags); // ✅ update selectedTags for display
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
      router.push('/clubs'); // fallback to all clubs
    }
  };


  return (
    <>
      <div className="relative mt-10 ">
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