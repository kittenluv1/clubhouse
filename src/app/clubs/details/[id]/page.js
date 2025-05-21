"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/db";

import ErrorScreen from "@/app/components/ErrorScreen";
import LoadingScreen from "@/app/components/LoadingScreen";
import TagButton from "@/app/components/tagButton";
import { AiFillStar } from 'react-icons/ai'; import { useMemo } from "react";

const anonymousNames = ['BaddieAtBplate', 'SunsetRecLover', 'PicnicAtJanns', 'kittenluv1', 'ILovePeony', 'DeneveDining',
  'BigYatesFan', 'WhoAtCanyonPoint'];

// shuffle for array
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ClubDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const randomAnonName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
  const shuffledNames = useMemo(
    () => shuffle(anonymousNames),
    [reviews.length] // re-shuffle if the number of reviews changes
  );



  useEffect(() => {
    if (!id) return;

    const fetchClubData = async () => {
      try {
        setLoading(true);

        const decodedId = decodeURIComponent(id);
        console.log("Decoded ID:", decodedId);
        const response = await fetch(`/api/clubs/details/${id}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        if (data.orgList && data.orgList.length > 0) {
          const clubData = data.orgList[0];
          setClub(clubData);

          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .eq('club_id', clubData.OrganizationID)
            .order('created_at', { ascending: false });

          if (reviewsError) throw reviewsError;
          setReviews(reviewsData);
        } else {
          setError(`No club found with name containing: ${id}`);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch club data");
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMembership = (review) => {
    if (!review.membership_start_quarter || !review.membership_end_quarter) {
      return '';
    }
    return `${review.membership_start_quarter} Quarter ${review.membership_start_year} - ${review.membership_end_quarter} Quarter ${review.membership_end_year}`;
  };

  const getRatingColor = (rating) => {
    if (!rating) return 'bg-gray-300 text-gray-700';

    const numRating = parseFloat(rating);
    if (numRating >= 4.0) return 'bg-green-700 text-white';
    if (numRating >= 3.0) return 'bg-teal-600 text-white';
    if (numRating >= 2.0) return 'bg-yellow-500 text-white';
    return 'bg-red-600 text-white';
  };

  if (loading) return (LoadingScreen());

  if (error) return <ErrorScreen error={error} />;

  if (!club) return <p className="p-4">No club found with ID: {id}</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Club Information */}
      <div className="border-2 rounded-lg p-10 flex flex-col md:flex-row gap-8 mb-10 bg-white"
        style={{ boxShadow: '6px 6px 0px rgba(200,221,190,255)' }}
      >
        {/* left side of the box */}
        <div className="md:w-3/5 pr-5">
          <h1 className="text-4xl font-bold mb-6">{club.OrganizationName}</h1>

          {/* Categories/Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {club.Category1Name && (
              <span className="border-1 px-4 py-1 bg-gray-200 rounded-full text-sm"
                style={{ backgroundColor: '#acc9fa' }}
              >
                {club.Category1Name}
              </span>
            )}
            {club.Category2Name && (
              <span className="border-1 px-4 py-1 bg-gray-200 rounded-full text-sm"
                style={{ backgroundColor: '#acc9fa' }}
              >
                {club.Category2Name}
              </span>
            )}
          </div>

          <p className="font-style: italic text-m mb-6">
            {club.OrganizationDescription || 'No description available for this club.'}
          </p>

          {/* Overall Rating */}
          <div className="flex items-center">
            <span className="font-semibold text-2xl">
              {club.average_satisfaction ? club.average_satisfaction.toFixed(1) : 'N/A'}
            </span>
            <AiFillStar className="text-yellow-400 text-2xl mr-2" />
            <h2 className="font-medium text-xl">satisfaction rating</h2>
          </div>
          <p className="font-style: italic">from {club.total_num_reviews || reviews.length || 0} trusted students</p>
        </div>

        {/* vertical line */}
        <div className="hidden md:flex justify-center">
          <div className="w-px bg-gray-400" style={{ height: '100%' }} />
        </div>

        {/* right side */}
        <div className="md:w-2/5 pl-5">
          <h2 className="font-bold text-2xl mt-2 mb-4">Ratings</h2>
          {/* Ratings Bars - Only show if there are reviews */}
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Time Commitment</span>
                  <span>{club.average_time_commitment ? club.average_time_commitment.toFixed(1) : 'N/A'}/5</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${club.average_time_commitment ? (club.average_time_commitment / 5) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>low</span>
                  <span>high</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Diversity</span>
                  <span>{club.average_diversity ? club.average_diversity.toFixed(1) : 'N/A'}/5</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${club.average_diversity ? (club.average_diversity / 5) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>low</span>
                  <span>high</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Social Community</span>
                  <span>{club.average_social_community ? club.average_social_community.toFixed(1) : 'N/A'}/5</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${club.average_social_community ? (club.average_social_community / 5) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>poor</span>
                  <span>great</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Competitiveness</span>
                  <span>{club.average_competitiveness ? club.average_competitiveness.toFixed(1) : 'N/A'}/5</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${club.average_competitiveness ? (club.average_competitiveness / 5) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>low</span>
                  <span>high</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 
          // Contact Information
          <div className="mb-6">
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
          </div>
          */}
      </div>

      {club.SocialMediaLink && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Social Media</h2>
          <div dangerouslySetInnerHTML={{ __html: club.SocialMediaLink }} />
        </div>
      )}
      

      {/* Reviews Section */}
      <div>
        <h2 className="text-4xl font-bold py-4">Student Reviews ({club.total_num_reviews || reviews.length || 0})</h2>
        <p className="mb-6">Have something to say? Share your experience...</p>
        <Link
          href={`/review?club=${encodeURIComponent(club.OrganizationName)}&clubId=${club.OrganizationID}`}
          className="border inline-block px-6 py-2 bg-black rounded-lg text-white mb-12"
        >
          Leave a Review
        </Link>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-gray-500 text-center py-10">
            No reviews yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="space-y-8">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-8 border border-black"
                style={{ boxShadow: '6px 6px 0px rgba(202,236,200,255)' }}

              >
                <div className="flex justify-between mb-2">
                  <h3 className="text-2xl font-bold">
                    {`Anonymous ${shuffledNames[index % shuffledNames.length]}`}
                  </h3>
                  <div className="font-bold text-[#666dbc]">
                    Reviewed on {formatDate(review.created_at)}
                  </div>
                </div>
                <div className="mb-4 font-semibold">
                  <span className="text-gray-600">
                    Member from{' '}
                    <span className="text-[#666dbc]">
                      {formatMembership(review)}
                    </span>
                  </span>
                </div>
                <p className="text-gray-800 mb-2">
                  &quot;{review.review_text}&quot;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}