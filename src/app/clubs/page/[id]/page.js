"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "@/app/components/LoadingScreen";
import ErrorScreen from "@/app/components/ErrorScreen";

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

  return (
    <div
      className="flex min-h-screen flex-col items-center px-4 py-10"
      style={{ backgroundColor: "#FEF8F8" }}
    >
      <div className="flex w-full max-w-4xl flex-col items-start gap-8 md:flex-row">
        {/*CLUB NAME + DESCRIPTION*/}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            {club.OrganizationName}
          </h1>
          <p className="text-s mt-4 text-base text-gray-700">
            {club.OrganizationDescription}
          </p>
          {club.OrganizationWebSite && (
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
          )}

          {/* FILTER TAGS */}
          <div className="mt-4 flex gap-2">
            <span className="text-l rounded-full border border-black bg-transparent px-4 py-2 font-medium text-gray-700">
              {club.Category1Name}
            </span>
            {club.Category2Name && (
              <span className="text-l rounded-full border border-black bg-transparent px-4 py-2 font-medium text-gray-700">
                {club.Category2Name}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex w-full max-w-4xl flex-col items-start gap-8 md:flex-row">
        {/* CLUB NAME + DESCRIPTION */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            {club.OrganizationName}
          </h1>
          <p className="text-s mt-4 text-base text-gray-700">
            {club.OrganizationDescription}
          </p>
          {club.OrganizationWebSite && (
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
          )}
          <div className="mt-4 flex gap-2">
            <span className="text-l rounded-full border border-black bg-transparent px-4 py-2 font-medium text-gray-700">
              {club.Category1Name}
            </span>
            {club.Category2Name && (
              <span className="text-l rounded-full border border-black bg-transparent px-4 py-2 font-medium text-gray-700">
                {club.Category2Name}
              </span>
            )}
          </div>
        </div>
        <div className="mt-8">
          <Link href="/clubs" className="text-blue-500 hover:underline">
            Back to all clubs
          </Link>
        </div>
      </div>
    </div>
  );
}
