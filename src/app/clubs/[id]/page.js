"use client";

import React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/db";

import ErrorScreen from "@/app/components/ErrorScreen";
import LoadingScreen from "@/app/components/LoadingScreen";
import { AiFillStar } from "react-icons/ai";
import Tooltip from "@/app/components/tooltip";
import Button from "@/app/components/button";
import ReviewCard from "@/app/components/reviewCard";

const getIconByName = (name) => {
  const key = name.toLowerCase();
  if (key.includes("instagram")) {
    return <img src="/instagram.svg" alt="Instagram" className="w-6" />;
  }
  if (key.includes("facebook")) {
    return <img src="/facebook.svg" alt="Facebook" className="w-6" />;
  }
  if (key.includes("linkedin")) {
    return <img src="/linkedin.svg" alt="LinkedIn" className="w-6" />;
  }
  if (key.includes("youtube")) {
    return <img src="/youtube.svg" alt="YouTube" className="w-6" />;
  }
  return null;
};

const parseSocialLinks = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const links = doc.querySelectorAll("a");

  return (
    <div className="flex items-center gap-1">
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
  const [isClamped, setIsClamped] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = !isDesktop;
  const [ratingsOpen, setRatingsOpen] = useState(false);
  const [clubLikeCount, setClublikeCount] = useState(0);
  const [userLikedClub, setUserLikedClub] = useState(false);
  const [userSavedClub, setUserSavedClub] = useState(false);
  const [reviewLikesMap, setReviewLikesMap] = useState({});
  const [userLikedReviews, setUserLikedReviews] = useState([]);

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

  // Listen for auth state changes to reset user-specific state on logout
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          // Reset all user-specific state when logged out
          setUserLikedClub(false);
          setUserSavedClub(false);
          setUserLikedReviews([]);
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

    console.log('Like review:', reviewId, isLiked);
    try {
      if (!isLiked) {
        const response = await fetch("/api/reviewLikes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review_id: reviewId }),
        });
        if (response.ok) {
          console.log("review unliked!");
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
          console.log("review liked!");
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
      if (userLikedClub) {
        // Unlike
        const response = await fetch("/api/clubLikes", {
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
        const response = await fetch("/api/clubLikes", {
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
    <div className="mx-auto max-w-6xl p-6 md:p-20">
      {/* Club Information */}
      <section>
        {isDesktop ? (
          <div
            className="mb-10 flex flex-col gap-8 rounded-lg border-2 bg-white p-10 lg:flex-row"
            style={{ boxShadow: "6px 6px 0px #b4d59f" }}
          >
            {/* left side of the box */}
            <div className="pr-5 lg:w-4/6">
              <div className="mb-3 flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                  {club.OrganizationName}
                </h1>

                <div className="flex items-center gap-2">
                  {/* Like Button */}
                  <button
                    onClick={handleLikeToggle}
                    className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 font-bold transition-all ${userLikedClub
                      ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                      : "border-gray-300 bg-white text-gray-700 hover:border-red-500 hover:bg-red-50"
                      }`}
                  >
                    <span className="text-xl">{userLikedClub ? "❤️" : "🤍"}</span>
                    <span>{clubLikeCount}</span>
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveToggle}
                    className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 font-bold transition-all ${userSavedClub
                      ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50"
                      }`}
                    title={userSavedClub ? "Unsave club" : "Save club"}
                  >
                    <span className="text-xl">{userSavedClub ? "★" : "☆"}</span>
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

              <div className="mt-6 mb-6">
                <div className="mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold italic">
                      Contact Information:
                    </span>
                    {/* Website Icon */}
                    {club.OrganizationWebSite && (
                      <a
                        href={club.OrganizationWebSite}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src="/link.svg"
                          alt="Website Icon"
                          className="inline-block w-7 hover:opacity-80"
                        />
                      </a>
                    )}
                    {/* Social Icons */}
                    {parseSocialLinks(club.SocialMediaLink)}
                  </div>
                </div>

                {club.OrganizationEmail && (
                  <p className="font-bold italic">
                    Email:{" "}
                    <a
                      href={`mailto:${club.OrganizationEmail}`}
                      className="font-bold underline"
                    >
                      {club.OrganizationEmail}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* vertical line */}
            <div className="hidden justify-center lg:flex">
              <div className="w-px bg-gray-400" style={{ height: "100%" }} />
            </div>

            {/* right side */}
            <div className="pl-5 lg:w-2/6">
              {/* Overall Rating */}
              <div className="mt-2 mb-4 flex items-center">
                <span className="text-2xl font-bold">
                  {club.average_satisfaction
                    ? club.average_satisfaction.toFixed(1)
                    : "N/A"}
                </span>
                <AiFillStar className="mr-2 text-2xl text-yellow-400" />
                <h2 className="text-lg font-bold text-nowrap">
                  satisfaction rating
                </h2>
              </div>

              <section>
                {/* Rating Bars - always show */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="mb-1 flex justify-between">
                      <div className="flex items-center gap-1">
                        <span>Time Commitment</span>
                        <Tooltip rating="timeCommitment" />
                      </div>
                      <span>
                        {club.average_time_commitment
                          ? club.average_time_commitment.toFixed(1) + "/5"
                          : "N/A"}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-[#b4d59f]"
                        style={{
                          width: `${club.average_time_commitment ? (club.average_time_commitment / 5) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>low</span>
                      <span>high</span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between">
                      <div className="flex items-center gap-1">
                        <span>Inclusivity</span>
                        <Tooltip rating="inclusivity" />
                      </div>
                      <span>
                        {club.average_inclusivity
                          ? club.average_inclusivity.toFixed(1) + "/5"
                          : "N/A"}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-[#b4d59f]"
                        style={{
                          width: `${club.average_inclusivity ? (club.average_inclusivity / 5) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>low</span>
                      <span>high</span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between">
                      <div className="flex items-center gap-1">
                        <span>Social Community</span>
                        <Tooltip rating="socialCommunity" />
                      </div>
                      <span>
                        {club.average_social_community
                          ? club.average_social_community.toFixed(1) + "/5"
                          : "N/A"}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-[#b4d59f]"
                        style={{
                          width: `${club.average_social_community ? (club.average_social_community / 5) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>low</span>
                      <span>high</span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between">
                      <div className="flex items-center gap-1">
                        <span>Competitiveness</span>
                        <Tooltip rating="competitiveness" />
                      </div>
                      <span>
                        {club.average_competitiveness
                          ? club.average_competitiveness.toFixed(1) + "/5"
                          : "N/A"}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-[#b4d59f]"
                        style={{
                          width: `${club.average_competitiveness ? (club.average_competitiveness / 5) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>low</span>
                      <span>high</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          // mobile view of the club details
          <div className="mb-4 flex flex-col rounded-lg border-2 bg-white p-8 lg:flex-row">
            {/* left side of the box */}
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-2xl font-bold">{club.OrganizationName}</h1>

              <div className="flex items-center gap-2">
                {/* Like Button */}
                <button
                  onClick={handleLikeToggle}
                  className={`flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 font-bold transition-all ${userLikedClub
                    ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                    : "border-gray-300 bg-white text-gray-700 hover:border-red-500 hover:bg-red-50"
                    }`}
                >
                  <span className="text-lg">{userLikedClub ? "❤️" : "🤍"}</span>
                  <span>{clubLikeCount}</span>
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSaveToggle}
                  className={`flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 font-bold transition-all ${userSavedClub
                    ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                    : "border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  title={userSavedClub ? "Unsave club" : "Save club"}
                >
                  <span className="text-lg">{userSavedClub ? "★" : "☆"}</span>
                </button>
              </div>
            </div>

            <div className="mb-2 flex items-center gap-1">
              {/* Website Icon */}
              {club.OrganizationWebSite && (
                <a
                  href={club.OrganizationWebSite}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/link.svg"
                    alt="Website Icon"
                    className="inline-block w-6 hover:opacity-80"
                  />
                </a>
              )}
              {club.OrganizationEmail && (
                <a
                  href={club.OrganizationEmail}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/email.svg"
                    alt="Email Icon"
                    className="inline-block w-6 hover:opacity-80"
                  />
                </a>
              )}
              {/* Social Icons */}
              {parseSocialLinks(club.SocialMediaLink)}
            </div>
            {/* </div> */}
            {/* Description with clamp/expand */}

            <DescriptionWithClamp description={club.OrganizationDescription} />

            {/* Categories/Tags */}
            <div className="mt-4 mb-4 flex flex-wrap gap-2">
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
            {/* right side */}
            {/* Overall Rating */}
            <div className="mb-4 flex items-center">
              <span className="text-2xl font-bold">
                {club.average_satisfaction
                  ? club.average_satisfaction.toFixed(1) + "/5"
                  : "N/A"}
              </span>
              <AiFillStar className="mr-2 text-2xl text-yellow-400" />
              <p className="mt-2 mb-2 text-lg font-bold">satisfaction rating</p>
            </div>

            {/* Ratings Bars - always show */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="mb-1 flex justify-between">
                  <div className="flex items-center gap-1">
                    <span>Time Commitment</span>
                    <Tooltip rating="timeCommitment" />
                  </div>
                  <span>
                    {club.average_time_commitment
                      ? club.average_time_commitment.toFixed(1) + "/5"
                      : "N/A"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-[#b4d59f]"
                    style={{
                      width: `${club.average_time_commitment ? (club.average_time_commitment / 5) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>low</span>
                  <span>high</span>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <div className="flex items-center gap-1">
                    <span>Inclusivity</span>
                    <Tooltip rating="inclusivity" />
                  </div>
                  <span>
                    {club.average_inclusivity
                      ? club.average_inclusivity.toFixed(1) + "/5"
                      : "N/A"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-[#b4d59f]"
                    style={{
                      width: `${club.average_inclusivity ? (club.average_inclusivity / 5) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>low</span>
                  <span>high</span>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <div className="flex items-center gap-1">
                    <span>Social Community</span>
                    <Tooltip rating="socialCommunity" />
                  </div>
                  <span>
                    {club.average_social_community
                      ? club.average_social_community.toFixed(1) + "/5"
                      : "N/A"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-[#b4d59f]"
                    style={{
                      width: `${club.average_social_community ? (club.average_social_community / 5) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>low</span>
                  <span>high</span>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <div className="flex items-center gap-1">
                    <span>Competitiveness</span>
                    <Tooltip rating="competitiveness" />
                  </div>
                  <span>
                    {club.average_competitiveness
                      ? club.average_competitiveness.toFixed(1) + "/5"
                      : "N/A"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-[#b4d59f]"
                    style={{
                      width: `${club.average_competitiveness ? (club.average_competitiveness / 5) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>low</span>
                  <span>high</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
      <section>
        <section>
          {isDesktop ? (
            <div>
              <h2 className="py-4 text-2xl font-bold">
                Student Reviews ({club.total_num_reviews || reviews.length || 0}
                )
              </h2>
              <p className="mb-6">
                Have something to say? Share your experience...
              </p>
              <div className="mb-12">
                <Button
                  type="CTA"
                  onClick={() =>
                    attemptReview(
                      `/review?club=${encodeURIComponent(club.OrganizationName)}&clubId=${club.OrganizationID}`,
                    )
                  }
                >
                  Leave a Review
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="py-4 text-lg font-bold">
                Student Reviews ({club.total_num_reviews || reviews.length || 0}
                )
              </h2>
              <div className="mb-8">
                <Button
                  type="CTA"
                  onClick={() =>
                    attemptReview(
                      `/review?club=${encodeURIComponent(club.OrganizationName)}&clubId=${club.OrganizationID}`,
                    )
                  }
                >
                  Leave a Review
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No reviews yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="space-y-8">
            {reviews.map((review, index) => (
              <ReviewCard
                key={review.id}
                review={review}
                status="displayed"
                clickable={false}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}