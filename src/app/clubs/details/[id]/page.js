"use client";

import React, { useRef, useState, useLayoutEffect } from "react";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/db";

import ErrorScreen from "@/app/components/ErrorScreen";
import LoadingScreen from "@/app/components/LoadingScreen";
import TagButton from "@/app/components/tagButton";
import { AiFillStar } from 'react-icons/ai'; 

const anonymousNames = [
  'Panda', 'Koala', 'Otter', 'Bunny', 'Duckling', 'Squirrel', 'Hedgehog', 'Fox', 'Penguin', 'Dolphin',
  'Shark', 'Spider', 'Unicorn', 'Lemur', 'Platypus', 'Axolotl', 'Capybara', 'Narwhal', 'Sloth', 'SugarGlider',
  'Newt', 'Hummingbird', 'Firefly', 'Mermaid', 'Saola', 'Quokka', 'Pangolin', 'Kitten', 'Student', 'Pencil',
  'Crayon', 'Stapler', 'Ruler', 'Bruin', 'Fountain', 'Doodle', 'Notebook', 'Highlighter', 'Backpack',
  'JoeBruin', 'Scribble', 'Origami', 'Flower', 'Acorn', 'Pebble', 'Dewdrop', 'Cloud', 'Sunbeam', 'Raindrop',
  'Pinecone', 'Nymph', 'Faerie', 'Jackalope', 'Fern', 'Rose', 'Ivy', 'Clover', 'Twilight', 'Frost', 'Sprite',
  'Seashell', 'Moss', 'Matcha', 'Sandwich', 'Bagel', 'Noodle', 'Cupcake', 'Marshmallow', 'Donut', 'Macaron',
  'Cookie', 'Peach', 'Mochi', 'Taffy', 'Toast', 'Muffin', 'Taco', 'Dumpling', 'Rice', 'Omelet', 'Naan', 'Pizza',
  'Boba', 'Latte', 'Lemonade', 'Smoothie', 'Espresso', 'Sushi', 'Acai', 'Panini', 'Salad', 'Dessert', 'Churro'
];

// // shuffle for array
// function shuffle(array) {
//   const arr = array.slice();
//   for (let i = arr.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [arr[i], arr[j]] = [arr[j], arr[i]];
//   }
//   return arr;
// }

// DescriptionWithClamp component
function DescriptionWithClamp({ description }) {
  const [showFull, setShowFull] = useState(false);
  const [isClamped, setIsClamped] = useState(true);
  const ref = useRef(null);

  useLayoutEffect(() => {
    function checkClamp() {
      if (ref.current) {
        setIsClamped(ref.current.scrollHeight > ref.current.clientHeight);
      }
    }
    checkClamp();
    window.addEventListener('resize', checkClamp);
    return () => window.removeEventListener('resize', checkClamp);
  }, [description, showFull]);

  useEffect(() => {
    console.log("isClamped", isClamped);
  }, [isClamped]);
    useEffect(() => {
    console.log("showFull", showFull);
  }, [showFull]);

  if (!description) {
    return <p className="italic text-m mb-6">No description available for this club.</p>;
  }
  return (
    <div>
      <p
        ref={ref}
        className={`italic text-m transition-all duration-200 ${!showFull ? 'line-clamp-7' : ''}`}
      >
      {description}
      </p>
      {(!showFull && isClamped) && (
        <>
          {' '}
          <button
            className="text-blue-600 italic underline text-sm inline ml-1"
            type="button"
            onClick={() => setShowFull(true)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            ...see more
          </button>
        </>
      )}
      {(showFull) && (
        <>
          {' '}
          <button
            className="text-blue-600 italic underline text-sm inline ml-1"
            type="button"
            onClick={() => setShowFull(false)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            ...see less
          </button>
        </>
      )}
    </div>
  );
}

export default function ClubDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionRef = useRef(null);
  const [isClamped, setIsClamped] = useState(false);

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

  const attemptReview = async (href) => {
    // check if user is logged in
    // if not, redirect to sign in page
    // else, redirect to review page with params
    const { data: { session} } = await supabase.auth.getSession();
  
    if (session) {
      console.log("GO TO REVIEWS", session);
      window.location.href = href;
    } else {
      console.log("GO TO SIGN IN", session);
      window.location.href = "/sign-in"; 
    }
  }

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
            <TagButton 
              label={club.Category1Name} 
              isSelected={true} 
              onClick={() => {
                const encoded = encodeURIComponent(club.Category1Name);
                router.push(`/clubs?categories=${encoded}`);
              }} 
            />
            <TagButton 
              label={club.Category2Name} 
              isSelected={true} 
              onClick={() => {
                const encoded = encodeURIComponent(club.Category2Name);
                router.push(`/clubs?categories=${encoded}`);
              }} 
            />
          </div>

          {/* Description with clamp/expand */}
          <DescriptionWithClamp description={club.OrganizationDescription} />

          {/* // Contact Information */}
          <div className="mt-6 mb-6">
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
        {/* 'Leave a Review'  button automatically redirects to sign in page if not signed in, */}
        {/* instead of flashing Reviews page first */}
        <button
          onClick={() => attemptReview(`/review?club=${encodeURIComponent(club.OrganizationName)}&clubId=${club.OrganizationID}`)}
          className="border inline-block px-6 py-2 bg-black rounded-lg text-white mb-12"
          >
          Leave a Review
        </button>

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
                    {`Anonymous ${anonymousNames[Math.floor(Math.random() * anonymousNames.length)]}`}
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