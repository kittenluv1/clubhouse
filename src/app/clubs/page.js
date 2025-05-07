"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ClubCard from "../components/clubCard";

function AllClubsPage() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name") ?? null;
  const singleCategoryParam = searchParams.get("category") ?? null;
  const multiCategoriesParam = searchParams.get("categories") ?? null;

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTotal, setPageTotal] = useState(1);
  const [currPage, setCurrPage] = useState(1);
  const [sortType, setSortType] = useState("rating");

  useEffect(() => {
    setLoading(true);
    setError(null);

    // 1) Build URL based on param
    let url = `/api/clubs?page=${currPage}`;

    if (nameParam) {
      url = `/api/clubs?name=${encodeURIComponent(nameParam)}&page=${currPage}`;
    } else if (multiCategoriesParam) {
      url = `/api/categories/multi?list=${encodeURIComponent(multiCategoriesParam)}&page=${currPage}`;
    } else if (singleCategoryParam) {
      url = `/api/categories/${encodeURIComponent(singleCategoryParam)}?page=${currPage}`;
    }

    // 2) Fetch and update state
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
  }, [currPage, nameParam, singleCategoryParam, multiCategoriesParam]);

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
    return <p className="p-4">No clubs found for “{keyword}”</p>;
  }

  const title = nameParam
    ? `Search results for “${nameParam}”`
    : multiCategoriesParam
      ? `Clubs in “${multiCategoriesParam.replaceAll(",", ", ")}”`
      : singleCategoryParam
        ? `Clubs in “${singleCategoryParam}”`
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
            className="border rounded px-2 py-1"
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

function ClubsPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading...</p>}>
      <AllClubsPage />
    </Suspense>
  )
}

export default ClubsPage;