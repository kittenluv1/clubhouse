"use client";

import React from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/db";

import ErrorScreen from "@/app/components/ErrorScreen";
import LoadingScreen from "@/app/components/LoadingScreen";
import { AiFillStar } from "react-icons/ai";
import Tooltip from "@/app/components/tooltip";
import Button from "@/app/components/button";
import SortModal from "@/app/components/sortModal";
import ReviewCard from "@/app/components/reviewCard";

function IconImg({ media }) {
  return (                                                                                                                                                       
      <div className="inline-flex items-center justify-center w-8 h-8 border border-[#EC9304] rounded-full hover:opacity-80">                                   
        <img src={`/icons/${media}.svg`} alt={media} className="w-full h-full" />                                                                                  
      </div>                                                                                                                                                       
    );   
}

const getIconByName = (name) => {
  const key = name.toLowerCase();
  if (key.includes("instagram")) {
    return <IconImg media="instagram" />;
  }
  if (key.includes("facebook")) {
    return <IconImg media="facebook" />;
  }
  if (key.includes("linkedin")) {
    return <IconImg media="linkedin" />;
  }
  if (key.includes("youtube")) {
    return <IconImg media="youtube" />;
  }
  return null;
};

const parseSocialLinks = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const links = doc.querySelectorAll("a");

  return (
    <div className="flex items-center gap-2">
      {Array.from(links).map((link, index) => {
        const href = link.getAttribute("href");
        const text = link.textContent.trim();
        const icon = getIconByName(text || href);

        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80"
          >
            {icon}
          </a>
        );
      })}
    </div>
  );
};

// RatingBar component
function RatingBar({ title, tooltipRating, value }) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <div className="flex items-center gap-1">
          <span className="font-semibold">{title}</span>
          <Tooltip rating={tooltipRating} />
        </div>
        <span>
          {value ? value.toFixed(1) + "/5" : "N/A"}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full border border-[#D9D9D9] bg-gray-200">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value ? (value / 5) * 100 : 0}%`,
            background: value ? 'linear-gradient(to right, #FFA2CC, #FEF38C, #B8DF64)' : 'none',
            backgroundSize: value ? `${500 / value}% 100%` : 'auto',
            backgroundPosition: 'left center',
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}

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
    window.addEventListener("resize", checkClamp);
    return () => window.removeEventListener("resize", checkClamp);
  }, [description, showFull]);

  useEffect(() => {
    console.log("isClamped", isClamped);
  }, [isClamped]);
  useEffect(() => {
    console.log("showFull", showFull);
  }, [showFull]);

  if (!description) {
    return (
      <p className="text-m mb-6 italic">
        No description available for this club.
      </p>
    );
  }
  return (
    <div>
      <p
        ref={ref}
        className={`text-m italic transition-all duration-200 ${!showFull ? "line-clamp-7" : ""}`}
      >
        {description}
      </p>
      {!showFull && isClamped && (
        <>
          {" "}
          <button
            className="ml-1 inline text-sm text-blue-600 italic underline"
            type="button"
            onClick={() => setShowFull(true)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            ...see more
          </button>
        </>
      )}
      {showFull && (
        <>
          {" "}
          <button
            className="ml-1 inline text-sm text-blue-600 italic underline"
            type="button"
            onClick={() => setShowFull(false)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
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
  const [clubLikeCount, setClublikeCount] = useState(0);
  const [userLikedClub, setUserLikedClub] = useState(false);
  const [userSavedClub, setUserSavedClub] = useState(false);
  const [reviewLikesMap, setReviewLikesMap] = useState({});
  const [userLikedReviews, setUserLikedReviews] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = !isDesktop;
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortType, setSortType] = useState("mostLiked");

  useEffect(() => {
    if (!id) return;

    const fetchClubData = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/clubs/${id}`);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        if (data.orgList && data.orgList.length > 0) {
          const clubData = data.orgList[0];
          setClub(clubData);

          // Map reviews with like data
          const reviewsWithLikes = (data.reviews || []).map(review => ({
            ...review,
            likes: data.reviewLikesMap?.[review.id] || 0,
            user_has_liked: data.userLikedReviews?.includes(review.id) || false
          }));

          setReviews(reviewsWithLikes);
          setReviewLikesMap(data.reviewLikesMap || {});
          setUserLikedReviews(data.userLikedReviews || []);
          setClublikeCount(data.likeCount || 0);
          setUserLikedClub(data.currentUserLiked || false);
          setUserSavedClub(data.currentUserSaved || false);
          setCurrentUserId(data.currentUserId || null);
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
  }, [
    id
  ]);

  const sortedReviews = useMemo(() => {
    const baseReviews = [...reviews];

    if (sortType === "mostLiked") {
      return baseReviews.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    else if (sortType === "mostRecent") {
      return baseReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return baseReviews;
  }, [reviews, sortType]);

  // Listen for auth state changes to reset user-specific state on logout
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          // Reset all user-specific state when logged out
          setUserLikedClub(false);
          setUserSavedClub(false);
          setUserLikedReviews([]);
          setCurrentUserId(null);
          // Update reviews to show user hasn't liked them
          setReviews(prev => prev.map(review => ({
            ...review,
            user_has_liked: false
          })));
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }, [matches, query]);

    return matches;
  }

  // Handler functions for review actions
  const handleLike = async (reviewId, isLiked) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const currentPath = `/clubs/${encodeURIComponent(club.OrganizationName)}`;
      const returnUrl = encodeURIComponent(currentPath);
      window.location.href = `/sign-in?returnUrl=${returnUrl}`;
      return;
    }

    try {
      if (!isLiked) {
        const response = await fetch("/api/reviewLikes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review_id: reviewId }),
        });
        if (response.ok) {
          // console.log("review unliked!");
          // setUserLikedClub(false);
          // setClublikeCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Like
        const response = await fetch("/api/reviewLikes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review_id: reviewId }),
        });
        if (response.ok) {
          // console.log("review liked!");
          // setUserLikedClub(true);
          // setClublikeCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const getRatingColor = (rating) => {
    if (!rating) return "bg-gray-300 text-gray-700";

    const numRating = parseFloat(rating);
    if (numRating >= 4.0) return "bg-green-700 text-white";
    if (numRating >= 3.0) return "bg-teal-600 text-white";
    if (numRating >= 2.0) return "bg-yellow-500 text-white";
    return "bg-red-600 text-white";
  };

  if (loading) return LoadingScreen();

  if (error) return <ErrorScreen error={error} />;

  if (!club) return <p className="p-4">No club found with ID: {id}</p>;

  const attemptReview = async (href) => {
    // check if user is logged in
    // if not, redirect to sign in page
    // else, redirect to review page with params
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      console.log("GO TO REVIEWS");
      window.location.href = href;
    } else {
      console.log("GO TO SIGN IN");
      const returnUrl = encodeURIComponent(href);
      window.location.href = `/sign-in?returnUrl=${returnUrl}`;
    }
  };

  const handleLikeToggle = async () => {
    if (isProcessing) return; // Ignore clicks while processing
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const currentPath = `/clubs/${encodeURIComponent(club.OrganizationName)}`;
      const returnUrl = encodeURIComponent(currentPath);
      window.location.href = `/sign-in?returnUrl=${returnUrl}`;
      return;
    }

    setIsProcessing(true);
    try {
      if (userLikedClub) {
        // Unlike
        let response = await fetch("/api/clubLikes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ club_id: club.OrganizationID }),
        });

        if (response.ok) {
          setUserLikedClub(false);
          setClublikeCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Like
        let response = await fetch("/api/clubLikes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ club_id: club.OrganizationID }),
        });

        if (response.ok) {
          setUserLikedClub(true);
          setClublikeCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToggle = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const currentPath = `/clubs/${encodeURIComponent(club.OrganizationName)}`;
      const returnUrl = encodeURIComponent(currentPath);
      window.location.href = `/sign-in?returnUrl=${returnUrl}`;
      return;
    }

    try {
      if (userSavedClub) {
        // Unsave
        const response = await fetch("/api/clubSaves", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ club_id: club.OrganizationID }),
        });

        if (response.ok) {
          setUserSavedClub(false);
        }
      } else {
        // Save
        const response = await fetch("/api/clubSaves", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ club_id: club.OrganizationID }),
        });

        if (response.ok) {
          setUserSavedClub(true);
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  return (
    <>
      {/* Club Information */}
      <section className="relative p-6 md:p-20 bg-[url('/club-page/club-page-bg.svg')] bg-cover">
        <div className="relative mb-10 mx-auto max-w-7xl flex flex-col gap-8 rounded-3xl border-1 bg-white p-6 md:p-10 lg:flex-row border-[#9DC663] shadow-[15px_15px_0_#A3CD1B]">

          {/* left side of the box */}
          <div className="lg:pr-5 lg:w-4/6">
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold">
                {club.OrganizationName}
              </h1>

              <div className="flex items-center gap-0 md:gap-2 flex-shrink-0">
                {/* Like Button */}
                <button
                  onClick={handleLikeToggle}
                  className="flex items-center gap-0 md:gap-1 p-1 transition-all min-w-[44px] min-h-[44px]"
                  aria-label={userLikedClub ? "Unlike club" : "Like club"}
                >
                  <img src={userLikedClub ? "/likeFilled.svg" : "/likeUnfilled.svg"} alt="Like Icon" className="flex-shrink-0" />
                  <span className="text-gray-700">{clubLikeCount}</span>
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSaveToggle}
                  className="flex items-center gap-0 md:gap-2 p-1 transition-all min-w-[44px] min-h-[44px]"
                  aria-label={userSavedClub ? "Unsave club" : "Save club"}
                >
                  <img src={userSavedClub ? "/saveFilled.svg" : "/saveUnfilled.svg"} alt="Save Icon" className="flex-shrink-0" />
                </button>
              </div>
            </div>

            {/* Categories/Tags */}
            <div className="mb-3 flex flex-wrap gap-2">
              <Button
                type="tag"
                size="small"
                isSelected={true}
                onClick={() => {
                  const encoded = encodeURIComponent(club.Category1Name);
                  router.push(`/clubs?categories=${encoded}`);
                }}
              >
                {club.Category1Name}
              </Button>
              <Button
                type="tag"
                size="small"
                isSelected={true}
                onClick={() => {
                  const encoded = encodeURIComponent(club.Category2Name);
                  router.push(`/clubs?categories=${encoded}`);
                }}
              >
                {club.Category2Name}
              </Button>
            </div>

            {/* Description with clamp/expand */}
            <DescriptionWithClamp
              description={club.OrganizationDescription}
            />

            {club.OrganizationEmail && (
              <p className="mt-6 break-words">
                Email:{" "}
                <a
                  href={`mailto:${club.OrganizationEmail}`}
                  className="underline break-all"
                >
                  {club.OrganizationEmail}
                </a>
              </p>
            )}

            <div className="mt-6 mb-6">
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <span>
                    Connect:
                  </span>
                  {/* Website Icon */}
                  {club.OrganizationWebSite && (
                    <a
                      href={club.OrganizationWebSite}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconImg media="website" />
                    </a>
                  )}
                  {/* Social Icons */}
                  {parseSocialLinks(club.SocialMediaLink)}
                </div>
              </div>
            </div>
          </div>

          {/* vertical line */}
          <div className="hidden justify-center lg:flex">
            <div className="w-px bg-[#4162114D]" style={{ height: "100%" }} />
          </div>

          {/* right side */}
          <div className="lg:pl-5 lg:w-2/6">
            {/* Overall Rating */}
            <div className="mt-2 flex items-center">
              <span className="text-2xl font-bold">
                {club.average_satisfaction
                  ? club.average_satisfaction.toFixed(1)
                  : "N/A"}
              </span>
              <AiFillStar className="mr-1 ml-1 text-2xl text-yellow-400" />
              <h2 className="text-2xl font-bold text-nowrap">
                Satisfaction Rating
              </h2>
            </div>
            <p className="mb-4 text-sm text-[#6E808D]">
              From {club.total_num_reviews || reviews.length || 0} trusted students
            </p>

            <section>
              {/* Rating Bars - always show */}
              <div className="grid grid-cols-1 gap-4">
                <RatingBar
                  title="Time Commitment"
                  tooltipRating="timeCommitment"
                  value={club.average_time_commitment}
                />
                <RatingBar
                  title="Inclusivity"
                  tooltipRating="inclusivity"
                  value={club.average_inclusivity}
                />
                <RatingBar
                  title="Social Community"
                  tooltipRating="socialCommunity"
                  value={club.average_social_community}
                />
                <RatingBar
                  title="Competitiveness"
                  tooltipRating="competitiveness"
                  value={club.average_competitiveness}
                />
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* student reviews */}
      <section className="p-6 md:p-20">
        <section className="mx-auto max-w-7xl">
          <div>
            <h2 className="py-4 text-lg md:text-2xl font-bold">
              Student Reviews ({club.total_num_reviews || reviews.length || 0})
            </h2>
            <p className="mb-6 hidden md:block text-[16px] text-[#6E808D]">
              Have something to say? Share your experience...
            </p>
            <div className="mb-8 md:mb-12">
              <Button
                type="CTA"
                onClick={() =>
                  attemptReview(
                    `/review?club=${encodeURIComponent(club.OrganizationName)}&clubId=${club.OrganizationID}`,
                  )
                }
              >
                Write a Review
              </Button>
            </div>
          </div>
          <div className="flex items-end justify-end mb-12">
            {isMobile ? (
              <>
                <Button
                  type="border"
                  size="small"
                  onClick={() => setShowSortModal(true)}
                >
                   <div className="flex gap-1">
                <span className="font-font-semi text-[#6E808D]">Sort By:</span>
                <span className="font-bold text-[#6E808D]">
                  {sortType === "mostLiked" && "Most liked"}
                  {sortType === "mostRecent" && "Most recent"}
                </span>
                </div>
                </Button>
                <SortModal
                  open={showSortModal}
                  onClose={() => setShowSortModal(false)}
                  selected={sortType}
                  onSelect={(newSort) => {
                    setSortType(newSort);
                  }}
                  sortOptions={[
                    { label: "Most liked", value: "mostLiked" },
                    { label: "Most recent", value: "mostRecent" }
                  ]}
                />
              </>
            ) : (
              <div className="relative">
                <div
                  className="flex flex-shrink-0 cursor-pointer items-center gap-1 rounded-full border-1 py-2 px-4 text-sm border-[#6E808D] hover:bg-[#E5EBF1]"
                  onClick={() => setShowSortModal(!showSortModal)}
                >
                  <span className="font-semi text-[#6E808D]">Sort by:</span>
                  <span className="font-bold text-[#6E808D]">
                    {sortType === "mostLiked" && "Most liked"}
                    {sortType === "mostRecent" && "Most recent"}
                  </span>
                  <svg
                    className={`h-4 w-4 text-[#6E808D] transition-transform ml-1 ${showSortModal ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <SortModal
                  open={showSortModal}
                  onClose={() => setShowSortModal(false)}
                  selected={sortType}
                  onSelect={(newSort) => {
                    setSortType(newSort);
                  }}
                  sortOptions={[
                    { label: "Most liked", value: "mostLiked" },
                    { label: "Most recent", value: "mostRecent" }
                  ]}
                  variant="desktop"
                />
              </div>
            )}
          </div>

          {/* Reviews List */}
          {sortedReviews.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <div className="space-y-8">
              {sortedReviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  status="displayed"
                  clickable={false}
                  onLike={handleLike}
                  isCurrentUser={currentUserId && review.user_id === currentUserId}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </>
  );
}