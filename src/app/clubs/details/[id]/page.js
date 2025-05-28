"use client";

import React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/db";

import ErrorScreen from "@/app/components/ErrorScreen";
import LoadingScreen from "@/app/components/LoadingScreen";
import TagButton from "@/app/components/tagButton";
import { AiFillStar } from "react-icons/ai";
import { useMemo } from "react";
import MobileRatingsDropdown from "../../../components/MobileRatingsDropdown";
import Tooltip from "@/app/components/tooltip";

const getIconByName = (name) => {
  const key = name.toLowerCase();
  if (key.includes("instagram")) {
    return <img src="/instagram2.svg" alt="Instagram" className="w-6" />;
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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionRef = useRef(null);
  const [isClamped, setIsClamped] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = !isDesktop;
  const [ratingsOpen, setRatingsOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchClubData = async () => {
      try {
        setLoading(true);

        const decodedId = decodeURIComponent(id);
        console.log("Decoded ID:", decodedId);
        const response = await fetch(`/api/clubs/details/${id}`);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        if (data.orgList && data.orgList.length > 0) {
          const clubData = data.orgList[0];
          setClub(clubData);

          const { data: reviewsData, error: reviewsError } = await supabase
            .from("reviews")
            .select("*")
            .eq("club_id", clubData.OrganizationID)
            .order("created_at", { ascending: false });

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatMembership = (review) => {
    if (!review.membership_start_quarter || !review.membership_end_quarter) {
      return "";
    }
    return `${review.membership_start_quarter} Quarter ${review.membership_start_year} - ${review.membership_end_quarter} Quarter ${review.membership_end_year}`;
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
      console.log("GO TO REVIEWS", session);
      window.location.href = href;
    } else {
      console.log("GO TO SIGN IN", session);
      window.location.href = "/sign-in";
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
              <h1 className="mb-3 text-3xl font-bold">
                {club.OrganizationName}
              </h1>

              {/* Categories/Tags */}
              <div className="mb-3 flex flex-wrap gap-2">
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
                          className="inline-block w-6 hover:opacity-80"
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
                {isDesktop ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="mb-1 flex justify-between">
                        <div className="flex items-center gap-1">
                          <span>Time Commitment</span>
                          <Tooltip rating="timeCommitment" />
                        </div>
                        <span>
                          {club.average_time_commitment
                            ? club.average_time_commitment.toFixed(1)
                            : "N/A"}
                          /5
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
                          <span>inclusivity</span>
                          <Tooltip rating="inclusivity" />
                        </div>
                        <span>
                          {club.average_inclusivity
                            ? club.average_inclusivity.toFixed(1)
                            : "N/A"}
                          /5
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
                            ? club.average_social_community.toFixed(1)
                            : "N/A"}
                          /5
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
                            ? club.average_competitiveness.toFixed(1)
                            : "N/A"}
                          /5
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
                ) : (
                  <div className="mb-4">
                    <MobileRatingsDropdown club={club} />
                  </div>
                )}
              </section>
            </div>
          </div>
        ) : (
          // mobile view of the club details
          <div className="mb-4 flex flex-col rounded-lg border-2 bg-white p-8 lg:flex-row">
            {/* left side of the box */}
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-2xl font-bold">{club.OrganizationName}</h1>
              <div className="flex items-center gap-1">
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
            </div>
            {/* Description with clamp/expand */}

            <DescriptionWithClamp description={club.OrganizationDescription} />

            {/* Categories/Tags */}
            <div className="mt-4 mb-4 flex flex-wrap gap-2">
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
            {/* right side */}
            {/* Overall Rating */}
            <div className="mb-4 flex items-center">
              <span className="text-2xl font-bold">
                {club.average_satisfaction
                  ? club.average_satisfaction.toFixed(1)
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
                      ? club.average_time_commitment.toFixed(1)
                      : "N/A"}
                    /5
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
                      ? club.average_inclusivity.toFixed(1)
                      : "N/A"}
                    /5
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
                      ? club.average_social_community.toFixed(1)
                      : "N/A"}
                    /5
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
                      ? club.average_competitiveness.toFixed(1)
                      : "N/A"}
                    /5
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
              <button
                onClick={() =>
                  attemptReview(
                    `/review?club=${encodeURIComponent(club.OrganizationName)}&clubId=${club.OrganizationID}`,
                  )
                }
                className="mb-12 inline-block rounded-lg border bg-black px-6 py-2 text-white"
              >
                Leave a Review
              </button>
            </div>
          ) : (
            <div>
              <h2 className="py-4 text-lg font-bold">
                Student Reviews ({club.total_num_reviews || reviews.length || 0}
                )
              </h2>
              <button
                onClick={() =>
                  attemptReview(
                    `/review?club=${encodeURIComponent(club.OrganizationName)}&clubId=${club.OrganizationID}`,
                  )
                }
                className="mb-8 inline-block rounded-lg border bg-black px-6 py-2 text-white"
              >
                Leave a Review
              </button>
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
            {reviews.map((review, index) =>
              isDesktop ? (
                // desktop card
                <div
                  key={index}
                  className="rounded-lg border border-black bg-gray-50 p-8"
                  style={{ boxShadow: "6px 6px 0px #b4d59f" }}
                >
                  <div className="mb-2 flex justify-between">
                    <h3 className="text-2xl font-bold">
                      {review.user_alias ? `${review.user_alias}` : "Anonymous"}
                    </h3>
                    <div className="font-bold text-[#666dbc]">
                      Reviewed on {formatDate(review.created_at)}
                    </div>
                  </div>
                  <div className="mb-4 font-semibold">
                    <span className="text-gray-600">
                      Member from{" "}
                      <span className="text-[#5058B2]">
                        {formatMembership(review)}
                      </span>
                    </span>
                  </div>
                  <p className="mb-2 text-gray-800">
                    &quot;{review.review_text}&quot;
                  </p>
                </div>
              ) : (
                // mobile card
                <div
                  key={index}
                  className="rounded-lg border border-2 border-black bg-gray-50 p-6"
                >
                  <div className="mb-2 text-lg font-bold">
                    {review.user_alias ? `${review.user_alias}` : "Anonymous"}
                  </div>
                  <div>
                    <span className="text-black">
                      Member from{" "}
                      <span className="font-semibold text-[#5058B2]">
                        {formatMembership(review)}
                      </span>
                    </span>
                  </div>
                  <div className="mb-3 text-sm font-semibold">
                    <div>Reviewed on {formatDate(review.created_at)}</div>
                  </div>
                  <div className="text-base">
                    &quot;{review.review_text}&quot;
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}
