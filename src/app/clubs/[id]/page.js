"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "@/app/components/LoadingScreen";
import ErrorScreen from "@/app/components/ErrorScreen";


function getCategories(club) {
  return [
    club.Category1Name,
    club.Category2Name,
    club.Category3Name,
    club.Category4Name,
    club.Category5Name,
  ].filter(Boolean);
}

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
    console.log("beep boop");
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

  if (loading) return (LoadingScreen());

  if (error) return <ErrorScreen error={error} />;

  if (!club) return (<p className="p-4">No club found with the name: {id}</p>);

  const categories = getCategories(club);

  return (
    <div className="bg-gray-100 rounded-x1 p-6 flex-col rounded m-10">
      <Link
        href={`/clubs/details/${encodeURIComponent(club.OrganizationID)}`}
        className="block"
      >
        <h3 className="text-2xl pb-4 font-bold">{club.OrganizationName}</h3>
      </Link>

      <div className="flex gap-2 pb-4">
        {categories.map((cat, idx) => (
          <span
            key={idx}
            className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm font-bold"
          >
            {cat}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-800 pb-">{club.OrganizationDescription}</p>
      
      {/* 
      {club.OrganizationEmail && (
        <p className="mt-1">
          Email:{" "}
          <a href={`mailto:${club.OrganizationEmail}`} className="text-blue-600 underline">
            {club.OrganizationEmail}
          </a>
        </p>
      )}

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

      {(club.Sig1Name || club.Sig2Name || club.Sig3Name) && (
        <div className="mt-3">
          <strong>Signatures:</strong>
          <ul className="list-disc list-inside">
            {club.Sig1Name && <li>{club.Sig1Name}</li>}
            {club.Sig2Name && <li>{club.Sig2Name}</li>}
            {club.Sig3Name && <li>{club.Sig3Name}</li>}
          </ul>
        </div>
      )}
    

      {club.SocialMediaLink && (
        <div className="mt-3" dangerouslySetInnerHTML={{ __html: club.SocialMediaLink }} />
      )}
      */}

      <div className="mt-4">
        <Link href="/clubs" className="text-blue-500 hover:underline">
          Back to all clubs
        </Link>
      </div>
    </div>
  );
}
