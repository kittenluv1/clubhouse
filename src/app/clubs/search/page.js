'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ClubCard from '@/app/components/clubCard';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pageTotal, setPageTotal] = useState(1);
  const [currPage, setCurrPage] = useState(1);

  const [sortType, setSortType] = useState("highRating");

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    fetch(`/api/clubs/search?q=${encodeURIComponent(query)}&page=${currPage}&sort=${sortType}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setClubs(data.orgList || []);
        setPageTotal(data.totalNumPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results');
        setLoading(false);
      });
  }, [query, currPage, sortType]);

  const handleNextPage = () => {
    if (currPage < pageTotal) {
      setCurrPage(currPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currPage > 1) {
      setCurrPage(currPage - 1);
    }
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
    setCurrPage(1);
  };

  if (loading) return <p className="p-4">Loading search results...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (clubs.length === 0) return <p className="p-4">No clubs found for "{query}"</p>;

  return (
    <div className="p-[80px]">

      <div className="flex justify-between items-center mb-6">
      <h1 className="font-[var(--font-inter)] font-normal text-[16px] mb-4">
        Search results for '{query}'
      </h1>

      <div className="flex flex-row items-center gap-2">
        <label>Sort by:</label>
        <select
          id="sortResults"
          value={sortType}
          onChange={handleSortChange}
          className="border rounded px-2 py-1"
        >
          <option value="highRating">Highest Rating</option>
          <option value="mostReviewed">Most Reviewed</option>
          <option value="alpha">A-Z</option>
        </select>
      </div>
      </div>

      <div className="flex flex-col justify-center items-center gap-[40px] mt-6">
        {clubs.map((club) => (
          <ClubCard key={`${club.OrganizationID}-${club.OrganizationName}`} club={club} />
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-6">
        <button onClick={handlePreviousPage} disabled={currPage === 1}>
          Previous
        </button>
        <label>Page {currPage} of {pageTotal}</label>
        <button onClick={handleNextPage} disabled={currPage === pageTotal}>
          Next
        </button>
      </div>
    </div>
  );
}