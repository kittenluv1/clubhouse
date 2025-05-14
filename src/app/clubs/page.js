'use client';

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ClubCard from "../components/clubCard";
import Filter from "../components/filter";

function AllClubsPage() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name") ?? null;
  const singleCategoryParam = searchParams.get("category") ?? null;
  const multiCategoriesParam = searchParams.get("categories") ?? null;
  // const sortType = searchParams.get("sort") ?? "rating";

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTotal, setPageTotal] = useState(1);
  const [currPage, setCurrPage] = useState(1);
  const [sortType, setSortType] = useState('rating');

  const router = useRouter();
  
  // Get initial selected tags from URL if any
  const initialSelectedTags = multiCategoriesParam 
    ? multiCategoriesParam.split(',') 
    : [];

  useEffect(() => {
    setLoading(true);
    setError(null);

    let url = `/api/clubs?page=${currPage}&sort=${sortType}`;

    if (nameParam) {
      url = `/api/clubs?name=${encodeURIComponent(nameParam)}&page=${currPage}&sort=${sortType}`;
    } else if (multiCategoriesParam) {
      url = `/api/categories/multi?list=${encodeURIComponent(multiCategoriesParam)}&page=${currPage}&sort=${sortType}`;
    } else if (singleCategoryParam) {
      url = `/api/categories/${encodeURIComponent(singleCategoryParam)}?page=${currPage}&sort=${sortType}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setClubs(data.orgList || []);
        setPageTotal(data.totalNumPages || 1);
      })
      .catch(err => {
        console.error("Error fetching clubs:", err);
        setError("Failed to load clubs");
      })
      .finally(() => setLoading(false));
  }, [currPage, sortType, nameParam, singleCategoryParam, multiCategoriesParam]);

  const handlePreviousPage = () => {
    if (currPage > 1) setCurrPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (currPage < pageTotal) setCurrPage(p => p + 1);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortType(newSort);
  }

  if (loading) {
    return (
      <div className="p-[80px] space-y-6">
        <div className="flex justify-center items-center gap-4 mt-6 text-[16px]">
          <p className="p-4">Loading clubs...</p>
        </div>
      </div>
    );
  }

  if (error) return <p className="p-4 text-red-500">{error}</p>;

  if (clubs.length === 0) {
    const keyword = nameParam ?? singleCategoryParam ?? multiCategoriesParam ?? "All Clubs";
    return <p className="p-4">No clubs found for &quot;{keyword}&quot;</p>;
  }

  const title = nameParam
    ? `Search results for "${nameParam}"`
    : multiCategoriesParam
      ? `Clubs in "${multiCategoriesParam.replaceAll(",", ", ")}"`
      : singleCategoryParam
        ? `Clubs in "${singleCategoryParam}"`
        : "All Clubs";

  return (
    <div className="p-[80px] space-y-6">
      {/* Improved layout with better spacing */}
      <div className="flex justify-between items-center mb-6">
        {/* Use the enhanced self-contained Filter component */}
        <Filter initialSelectedTags={initialSelectedTags}/>

        {/* Sort selector with more space and no text wrapping */}
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

      <h1 className="font-[var(--font-inter)] text-[16px] font-normal mb-4">
        {title}
      </h1>


      <div className="grid grid-cols-1 gap-12">
        {clubs.map(club => (
          <ClubCard
            key={`${club.OrganizationID}-${club.OrganizationName}`}
            club={club}
          />
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-16">
        <button
          onClick={handlePreviousPage}
          disabled={currPage === 1}
          className="px-4 py-2 bg-[#FFB0D8] hover:bg-[#F6E18C] rounded-xl border border-black text-black font-medium disabled:opacity-50 transition-colors duration-200"
        >
          Previous
        </button>
        <span>
          Page {currPage} of {pageTotal}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currPage === pageTotal}
          className="px-4 py-2 bg-[#FFB0D8] hover:bg-[#F6E18C] rounded-xl border border-black text-black font-medium disabled:opacity-50 transition-colors duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AllClubsPage;
