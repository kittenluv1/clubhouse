"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ClubPage() {
  const { id } = useParams(); // This gets the id from the URL

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    // decode the id so it works with the DB
    const decodedId = decodeURIComponent(id);

    // Fetch the club data
    fetch(`/api/clubs/${decodedId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.orgList && data.orgList.length > 0) {
          setClub(data.orgList[0]); // Take the first matching club
        } else {
          setError(`No club found with name containing: ${id}`);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to fetch club data");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return (
    <div className="p-4">
      <p className="text-red-500">{error}</p>
      <Link href="/clubs" className="text-blue-500 hover:underline mt-4 inline-block">
        View all clubs
      </Link>
    </div>
  );
  if (!club) return <p className="p-4">No club found with the name: {id}</p>;

  return (
    <div className="border p-4 rounded shadow-md m-5">
      <Link 
              href={`/clubs/details/${encodeURIComponent(club.OrganizationID)}`}
              className="block"
      >
        <h3 className="text-2xl font-bold">{club.OrganizationName}</h3>
      </Link>
      
      <p className="mt-2">{club.OrganizationDescription}</p>
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
      <p className="mt-1">
        Category: {club.Category1Name}
        {club.Category2Name ? ` - ${club.Category2Name}` : ''}
      </p>

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

      <div className="mt-4">
        <Link href="/clubs" className="text-blue-500 hover:underline">
          Back to all clubs
        </Link>
      </div>
    </div>
  );
}
