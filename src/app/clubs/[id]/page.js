"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ClubPage() {
  const { name } = useParams();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clubs/${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((json) => {
        setClub(json.orgList[0]); // we assume the first result is the intended one
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [name]);

  if (loading) return <p>Loading...</p>;
  if (!club) return <p>No club found with the name: {name}</p>;

  return (
    <div className="border p-4 rounded shadow-md m-5">
      <h3 className="text-2xl font-bold">{club.OrganizationName}</h3>
      <p className="mt-2">{club.OrganizationDescription}</p>
      <p className="mt-1">
        Email:{" "}
        <a href={`mailto:${club.OrganizationEmail}`} className="text-blue-600 underline">
          {club.OrganizationEmail}
        </a>
      </p>
      <p className="mt-1">
        Website:{" "}
        <a
          href={club.OrganizationWebSite}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {club.OrganizationWebSite}
        </a>
      </p>
      <p className="mt-1">
        Category: {club.Category1Name} - {club.Category2Name}
      </p>
      <div className="mt-3">
        <strong>Signatures:</strong>
        <ul className="list-disc list-inside">
          <li>{club.Sig1Name}</li>
          <li>{club.Sig2Name}</li>
          <li>{club.Sig3Name}</li>
        </ul>
      </div>
      <div className="mt-3" dangerouslySetInnerHTML={{ __html: club.SocialMediaLink }} />
    </div>
  );
}




// export default async function ClubPage({ params }) {
// 	const { id } = await params;
  
// 	return (
// 	  <div className="border p-4 mb-4 rounded shadow-md">
// 		<h1 className="text-4xl font-bold mb-4">Club Details</h1>
// 		<p className="text-lg">Details for club with ID: {id}</p>
// 	  </div>
// 	);
//   }