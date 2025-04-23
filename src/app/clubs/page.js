"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Clubs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club) => (
          <div key={`${club.id}-${club.OrganizationName}`} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{club.OrganizationName}</h2>
            <p className="text-sm text-gray-600 mt-1">{club.Category1Name}</p>
            <Link 
              href={`/clubs/${encodeURIComponent(club.OrganizationName)}`}
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              View Details
            </Link>
          </div>
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
