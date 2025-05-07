"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ClubCard from "../components/clubCard";

function AllClubsPage() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name");
  const categoryParam = searchParams.get("category");

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTotal, setPageTotal] = useState(1);
  const [currPage, setCurrPage] = useState(1);
  const [sortType, setSortType] = useState("rating");

  useEffect(() => {
    setLoading(true);
    setError(null);

    // API URL，nameParam and categoryParam
    let url;
    if (nameParam) {
      url = `/api/clubs?name=${encodeURIComponent(nameParam)}&page=${currPage}&sort=${sortType}`;
    } else if (categoryParam) {
      url = `/api/categories/${encodeURIComponent(categoryParam)}?page=${currPage}&sort=${sortType}`;
    } else {
      url = `/api/clubs?page=${currPage}&sort=${sortType}`;
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
  }, [currPage, nameParam, categoryParam, sortType]);

  const handlePreviousPage = () => {
    if (currPage > 1) setCurrPage(p => p - 1);
  };
  const handleNextPage = () => {
    if (currPage < pageTotal) setCurrPage(p => p + 1);
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
    setCurrPage(1);
  };

  // fetching
  if (loading) return <p className="p-4">Loading clubs...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (clubs.length === 0) {
    const keyword = nameParam ?? categoryParam ?? "All Clubs";
    return <p className="p-4">No clubs found for “{keyword}”</p>;
  }

  // result list
  const title = nameParam
    ? `Search results for “${nameParam}”`
    : categoryParam
      ? `Clubs in “${categoryParam}”`
      : "All Clubs";

  return (
    <div className="p-[80px] space-y-6">
      <div className="flex justify-between items-center mb-6">
      <h1 className="font-[var(--font-inter)] text-[16px] font-normal mb-4">
        {title}
      </h1>

      <div className="flex flex-row items-center gap-2">
        <label>Sort by:</label>
        <select
          id="sort"
          value={sortType}
          onChange={handleSortChange}
          className="border-1 rounded-[30px] bg-[#f9daea] px-2 py-2"
        >
          <option value="rating">Highest Rating</option>
          <option value="reviews">Most Reviewed</option>
          <option value="alphabetical">A-Z</option>
        </select>
      </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {clubs.map(club => (
          <ClubCard
            key={`${club.OrganizationID}-${club.OrganizationName}`}
            club={club}
          />
        ))}
      </div>

      {/* page control */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={handlePreviousPage}
          disabled={currPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currPage} of {pageTotal}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currPage === pageTotal}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function ClubsPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading...</p>}>
      <AllClubsPage />
    </Suspense>
  )
}