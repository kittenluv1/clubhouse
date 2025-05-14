"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/db";

export default function ClubDetailsPage() {
  const { id } = useParams();
  
  const [club, setClub] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  if (error) return (
    <div className="p-4">
      <p className="text-red-500">{error}</p>
      <Link href="/clubs" className="text-blue-500 hover:underline mt-4 inline-block">
        View all clubs
      </Link>
    </div>
  );
  
  if (!club) return <p className="p-4">No club found with ID: {id}</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Club Information */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex-grow">
          <h1 className="text-4xl font-bold mb-6">{club.OrganizationName}</h1>
          <p className="text-lg mb-6">
            {club.OrganizationDescription || 'No description available for this club.'}
          </p>
          
          {/* Contact Information */}
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
          
          {/* Categories/Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {club.Category1Name && (
              <span className="px-4 py-1 bg-gray-200 rounded-full text-sm">
                {club.Category1Name}
              </span>
            )}
            {club.Category2Name && (
              <span className="px-4 py-1 bg-gray-200 rounded-full text-sm">
                {club.Category2Name}
              </span>
            )}
          </div>
        </div>
        
        {/* Overall Rating */}
        <div className="w-40 h-40 flex-shrink-0">
          <div className={`w-full h-full flex items-center justify-center ${getRatingColor(club.average_satisfaction)}`}>
            <div className="text-center">
              <div className="text-5xl font-bold">
                {club.average_satisfaction ? club.average_satisfaction.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm mt-1">satisfaction rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Bars - Only show if there are reviews */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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


      {club.SocialMediaLink && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Social Media</h2>
          <div dangerouslySetInnerHTML={{ __html: club.SocialMediaLink }} />
        </div>
      )}

      {/* Reviews Section */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Student Reviews ({club.total_num_reviews || reviews.length || 0})</h2>
        <p className="mb-6">Have something to say? Share your experience...</p>
        <Link 
          href={`/review?club=${encodeURIComponent(club.OrganizationName)}&clubId=${club.OrganizationID}`}
          className="inline-block px-6 py-2 bg-gray-200 rounded-full text-gray-800 mb-12"
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
                className="bg-gray-50 rounded-lg p-8 border border-gray-200"
              >
                <div className="flex justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    {review.is_anon ? 'Anonymous' : 'Student'} 
                  </h3>
                  <div className="text-green-700">
                    Reviewed on {formatDate(review.created_at)}
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-gray-600">
                    Member from {formatMembership(review)}
                  </span>
                </div>
                <p className="text-gray-800 mb-4">
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