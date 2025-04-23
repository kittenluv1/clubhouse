"use client";

import { useEffect, useState } from "react";
import ClubCard from "../components/clubCard";

export default function AllClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pageTotal, setPageTotal] = useState(1);
  const [currPage, setCurrPage] = useState(1);

  useEffect(() => {
    fetch(`/api/clubs?page=${currPage}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setClubs(data.orgList || []);
        setPageTotal(data.totalNumPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching clubs:", err);
        setError("Failed to load clubs");
        setLoading(false);
      });
  }, [currPage]); // re-run when user changes pages

  const handleNextPage = () => {
    if (currPage < pageTotal){
      setCurrPage(currPage + 1);
    }
  }

  const handlePreviousPage = () => {
    if (currPage > 1){
      setCurrPage(currPage - 1);
    }
  }

  if (loading) return <p className="p-4">Loading clubs...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (clubs.length === 0) return <p className="p-4">No clubs found</p>;

  return (
    <div className="p-[80px]">
      <h1 className="font-[var(--font-inter)] font-normal text-[16px] mb-4">Search results for 'All Clubs'</h1>
      <div className="flex flex-col justify-center items-center gap-[40px] mt-6">
      {clubs.map((club) => (
    <ClubCard key={`${club.id}-${club.OrganizationName}`} club={club} />
  ))}
      </div>

      {/* Change Pages */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
        onClick={handlePreviousPage}
        disabled={currPage === 1}
        >Previous</button>

        <label>Page {currPage} of {pageTotal}</label>
        
        <button
        onClick={handleNextPage}
        disabled={currPage === pageTotal}
        >Next</button>
      </div>
    </div>
  );
}
