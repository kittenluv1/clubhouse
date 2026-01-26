import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import Button from "./button";
import { supabase } from "@/app/lib/db";

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

const renderStars = (rating, sizeClasses = "") => {
  const stars = [];
  const numStars = Math.round(rating || 0);
  for (let i = 0; i < 5; i++) {
    if (i < numStars) {
      stars.push(<span key={i} className={`text-yellow-400 ${sizeClasses}`}>★</span>);
    } else {
      stars.push(<span key={i} className={`text-gray-300 ${sizeClasses}`}>★</span>);
    }
  }
  return stars;
};

export default function ReviewCard({
  review,
  status = "displayed", // 'approved' | 'pending' | 'rejected' | 'displayed'
  onLike, // callback for like button
  onEdit, // callback for edit button
  onDelete, // callback for delete button
}) {
  const [liked, setLiked] = useState(review.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(review.likes || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef(null);

  // Sync internal state with props when they change (e.g., after logout)
  useEffect(() => {
    setLiked(review.user_has_liked || false);
  }, [review.user_has_liked]);

  useEffect(() => {
    setLikeCount(review.likes || 0);
  }, [review.likes]);

  // Check if the review text is clamped (truncated)
  useLayoutEffect(() => {
    function checkClamp() {
      if (textRef.current) {
        setIsClamped(textRef.current.scrollHeight > textRef.current.clientHeight);
      }
    }
    checkClamp();
    window.addEventListener("resize", checkClamp);
    return () => window.removeEventListener("resize", checkClamp);
  }, [review.review_text, showFull]);

  const toggleLike = async () => {
    if (isProcessing) return; // Ignore clicks while processing
    if (status !== "displayed" || !onLike) return;

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/sign-in?returnUrl=${returnUrl}`;
      return;
    }

    setIsProcessing(true);
    const newLiked = !liked;

    // Optimistic update
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      await onLike(review.id, newLiked);
    } catch (error) {
      // Revert on failure
      setLiked(!newLiked);
      setLikeCount(prev => newLiked ? Math.max(0, prev - 1) : prev + 1);
      console.error('Failed to toggle like:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine what actions are available based on status
  const canLike = status === "displayed" && onLike;
  const canEdit = status === "rejected" && onEdit;
  const canDelete = status === "rejected" && onDelete;

  const cardContent = (
    <div
      className={`my-4 w-full transform space-y-4 rounded-4xl border border-[#A3CD1B] bg-[#FAFEEE] px-5 py-6 transition-all duration-300 ease-out sm:px-4 sm:py-6 md:space-y-5 md:px-10 md:py-10`}
    >
      {/* Mobile Layout (stacked vertically) */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Profile image + username + like button row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            {status === "displayed" && (
              <img
                src="/profile.svg"
                alt="Profile"
                className="h-12 w-12 flex-shrink-0"
              />
            )}
            <h2 className="m-0 text-sm leading-tight font-bold break-words text-black sm:text-lg md:text-xl">
              {status === "displayed"
                ? review.user_alias || "Anonymous"
                : review.club_name}
            </h2>
          </div>

          {/* Like button on mobile */}
          {canLike && (
            <button
              onClick={toggleLike}
              className="-m-2 flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center gap-2 p-2"
              aria-label={liked ? "Unlike review" : "Like review"}
            >
              <img
                src={`/${liked ? "heart_liked" : "heart_unliked"}.svg`}
                alt="Heart Icon"
                className="h-[15px] w-[18px]"
              />
              <span className="inline-block min-w-[1rem] text-left text-sm font-semibold text-gray-700">
                {likeCount}
              </span>
            </button>
          )}
        </div>

        {/* Review date row */}
        <div className="text-sm font-medium">
          {formatDate(review.created_at)}
        </div>

        {/* Membership date row */}
        <div className="flex-wrap text-sm font-medium text-[#6E808D]">
          Member from {review.membership_start_quarter}{" "}
          {review.membership_start_year} - {review.membership_end_quarter}{" "}
          {review.membership_end_year}
        </div>

        {/* Stars row */}
        <div className="flex items-center gap-1">
          {renderStars(
            review.overall_satisfaction,
            "text-sm sm:text-xl md:text-2xl",
          )}
        </div>
      </div>

      {/* Desktop Layout (original horizontal layout) */}
      <div className="hidden items-start justify-between md:flex">
        {/* Profile image + username + like button row */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-3">
            {status === "displayed" && (
              <img
                src="/profile.svg"
                alt="Profile"
                className="h-15 w-15 flex-shrink-0"
              />
            )}
            <div className="flex min-w-0 flex-col gap-2">
              <h2 className="m-0 text-xl leading-tight font-bold break-words text-black">
                {status === "displayed"
                  ? review.user_alias || "Anonymous"
                  : review.club_name}
              </h2>
              {status === "displayed" && (
                <span className="text-sm font-medium">
                  {formatDate(review.created_at)}
                </span>
              )}
            </div>
          </div>
          {/* Satisfaction and Membership row */}
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#6E808D]">
            <div className="flex items-center gap-1">
              {renderStars(review.overall_satisfaction, "text-base")}
            </div>
            <span className="text-[#7F7F7F]">•</span>
            <span className="break-words">
              Member from {review.membership_start_quarter}{" "}
              {review.membership_start_year} - {review.membership_end_quarter}{" "}
              {review.membership_end_year}
            </span>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          {/* Review date row */}
          {status !== "displayed" && (
            <span className="text-sm font-medium italic">
              Reviewed on {formatDate(review.created_at)}
            </span>
          )}
          {/* Like button - only for approved reviews */}
          {canLike && (
            <button
              onClick={toggleLike}
              className="-m-2 flex min-h-[44px] min-w-[44px] items-center gap-2 p-2"
              aria-label={liked ? "Unlike review" : "Like review"}
            >
              <img
                src={`/${liked ? "heart_liked" : "heart_unliked"}.svg`}
                alt="Heart Icon"
                className="h-[17px] w-[20px]"
              />
              <span className="text-md inline-block min-w-[1rem] text-left font-semibold text-gray-700">
                {likeCount}
              </span>
            </button>
          )}
        </div>
      </div>
      <div>
        <p
          ref={textRef}
          className={`text-sm font-normal text-black transition-all duration-200 md:text-base ${!showFull ? "line-clamp-4" : ""}`}
        >
          {review.review_text}
        </p>
        {!showFull && isClamped && (
          <button
            className="mt-1 text-sm text-blue-600 italic underline"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFull(true);
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            ...see more
          </button>
        )}
        {showFull && (
          <button
            className="mt-1 text-sm text-blue-600 italic underline"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFull(false);
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            ...see less
          </button>
        )}
      </div>

      {/* Edit/Delete buttons - only for rejected reviews */}
      {(canEdit || canDelete) && (
        <div className="mt-4 flex w-full flex-col justify-end gap-2 sm:flex-row">
          {canEdit && (
            <Button
              type="CTA"
              className="w-full sm:w-auto"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(review);
              }}
            >
              <div className="flex items-center gap-3">
                <img src={"/edit-2.svg"}
                  className="h-6 w-6"
                />
                Edit Review
              </div>
            </Button>
          )}
          {canDelete && (
            <Button
              type="delete"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(review.id);
              }}
              style="group"
            >
              <div className="flex items-center gap-3">
                <img src="/trash.svg"
                  className="h-6 w-6 block group-hover:hidden"
                />
                <img src="/trash-hover.svg"
                  className="hidden h-6 w-6 group-hover:block"
                />
                Delete
              </div>
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return cardContent;
}
