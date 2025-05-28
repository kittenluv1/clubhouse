"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "@/app/components/LoadingScreen";
import ErrorScreen from "@/app/components/ErrorScreen";

import { AiFillStar } from "react-icons/ai";

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
    <div className="flex w-48 flex-col items-start">
      <div className="mb-1 flex w-full justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-semibold text-green-700">
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
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

  if (loading) return LoadingScreen();

  if (error) return <ErrorScreen error={error} />;

  if (!club) return <p className="p-4">No club found with the name: {id}</p>;

  const categories = getCategories(club);

  return (
    <div className="m-6 m-10 flex-col rounded rounded-xl border p-8">
      <Link
        href={`/clubs/details/${encodeURIComponent(club.OrganizationID)}`}
        className="block"
      >
        <h3 className="pb-4 text-2xl font-bold">{club.OrganizationName}</h3>
      </Link>

      <div className="flex gap-2 pb-4">
        {categories.map((cat, idx) => (
          <span
            key={idx}
            className="rounded-full border bg-gray-200 px-3 py-1 text-sm font-bold text-gray-800"
          >
            {cat}
          </span>
        ))}
      </div>

      <p className="pb-6 text-sm text-gray-800">
        {club.OrganizationDescription}
      </p>

      <div className="flex items-center">
        <span className="text-xl font-semibold">
          {club.average_satisfaction
            ? club.average_satisfaction.toFixed(1)
            : "N/A"}
        </span>
        <AiFillStar className="mr-2 text-xl text-yellow-400" />
        <h2 className="text-x font-semibold">satisfaction rating</h2>
      </div>
      <p className="font-style: italic">
        from {club.total_num_reviews || reviews.length || 0} trusted students
      </p>

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

      {/* 
      <div className="mt-4">
        <Link href="/clubs" className="text-blue-500 hover:underline">
          Back to all clubs
        </Link>
      </div>
      */}
    </div>
  );
}
