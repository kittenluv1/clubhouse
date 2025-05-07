"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

function RatingBar({ label, value }) {
  return (
    <div className="flex flex-col items-start w-48">
      <div className="flex justify-between w-full mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-semibold text-green-700">{value.toFixed(1)}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${(value / 5) * 100}%`,
            background: "#33B864",
          }}
        />
      </div>
    </div>
  );
}

export default function ClubPage() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const decodedId = decodeURIComponent(id);
    fetch(`/api/clubs/${decodedId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.orgList && data.orgList.length > 0) {
          setClub(data.orgList[0]);
        } else {
          setError(`No club found with name containing: ${id}`);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch club data");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center py-10 px-4"
      style={{ backgroundColor: "#FEF8F8" }}
    >
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-start gap-8">

        {/*CLUB NAME + DESCRIPTION*/}
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{club.OrganizationName}</h1>
          <p className="mt-4 text-gray-700 text-base text-s">{club.OrganizationDescription}</p>
          {club.OrganizationWebSite && (
            <p className="mt-1">
              Website:{" "}

              <a href={club.OrganizationWebSite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {club.OrganizationWebSite}
              </a>
            </p>
          )}

          {/* FILTER TAGS */}
          <div className="mt-4 flex gap-2">
            <span className="bg-transparent border border-black text-gray-700 rounded-full px-4 py-2 text-l font-medium">
              {club.Category1Name}
            </span>
            {club.Category2Name && (
              <span className="bg-transparent border border-black text-gray-700 rounded-full px-4 py-2 text-l font-medium">
                {club.Category2Name}
              </span>
            )}
          </div>

        </div>
      </div>
    <div>
        <div className="justify-center">
            <h>
                Student Reviews 
            </h>
            <p>
                Have something to say? Share your experience...
            </p>
            <div className="col-span-2 flex justify-center">
			    <Button value="Review a Club" onClick={attemptReview}/>
		    </div>
        </div>
    </div>
      <div className="mt-8">
        <Link href="/clubs" className="text-blue-500 hover:underline">
          Back to all clubs
        </Link>
      </div>
    </div>
  );
}
