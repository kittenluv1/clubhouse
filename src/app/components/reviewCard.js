import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { redirect } from "next/navigation";
import Button from "./button";
import { supabase } from "@/app/lib/db";
import { getAvatarUrl } from "@/app/lib/avatars";

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
  const ratingDecimal = rating - Math.floor(rating);
  for (let i = 0; i < 5; i++) {
    if (i < numStars) {
      if (
        rating - ratingDecimal == i &&
        ratingDecimal < 0.8 &&
        ratingDecimal > 0.2
      ) {
        stars.push(
          <img
            key={i}
            src="/interactions/reviewStarHalf.svg"
            alt=""
            className={` ${sizeClasses}`}
          />,
        );
      } else {
        stars.push(
          <img
            key={i}
            src="/interactions/reviewStarFilled.svg"
            alt=""
            className={` ${sizeClasses}`}
          />,
        );
      }
      // stars.push(<span key={i} className={`text-yellow-400 ${sizeClasses}`}>★</span>);
    } else {
      // stars.push(<span key={i} className={`text-gray-300 ${sizeClasses}`}>★</span>);
      stars.push(
        <img
          src="/interactions/reviewStarUnfilled.svg"
          key={i}
          alt=""
          className={`text-gray-300`}
        />,
      );
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
  isCurrentUser = false, // whether this review belongs to the current user
}) {
  const [liked, setLiked] = useState(review.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(review.likes || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef(null);

  // Check if the review text is clamped (truncated)
  useLayoutEffect(() => {
    function checkClamp() {
      if (textRef.current) {
        setIsClamped(
          textRef.current.scrollHeight > textRef.current.clientHeight,
        );
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
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      redirect(`/sign-in?returnUrl=${returnUrl}`);
    }

    setIsProcessing(true);
    const newLiked = !liked;

    // Optimistic update
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await onLike(review.id, newLiked);
    } catch (error) {
      // Revert on failure
      setLiked(!newLiked);
      setLikeCount((prev) => (newLiked ? Math.max(0, prev - 1) : prev + 1));
      console.error("Failed to toggle like:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine what actions are available based on status
  const canLike = status === "displayed" && onLike;
  const canEdit = (status === "rejected" || status === "approved") && onEdit;
  const canDelete = status === "rejected" && onDelete;

  const cardContent = (
    <div
      className={`w-full transform space-y-4 rounded-4xl border border-[#A3CD1B] bg-[#FAFEEE] px-5 py-6 transition-all duration-300 ease-out sm:px-4 sm:py-6 md:space-y-5 md:px-10 md:py-10`}
    >
      {/* Header section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        {/* Left side */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Profile image + username row */}
          <div className="flex items-center justify-between gap-3 md:justify-start">
            <div className="flex min-w-0 flex-1 items-center gap-1 md:flex-initial md:gap-3">
              {status === "displayed" && (
                <img
                  src={
                    review.profiles
                      ? getAvatarUrl(review.profiles.avatar_id)
                      : "/profile.svg"
                  }
                  alt="Profile"
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover pb-2 md:h-18 md:w-18"
                />
              )}
              <div className="flex min-w-0 flex-col gap-1 md:gap-2">
                <h2 className="m-0 text-sm leading-tight font-bold break-words text-black sm:text-lg md:text-xl">
                  {status === "displayed"
                    ? review.user_alias || "Anonymous"
                    : review.club_name}
                  {status === "displayed" && isCurrentUser && (
                    <span className="text-s ml-1.5 font-bold text-[#FFA1CD]">
                      (you)
                    </span>
                  )}
                </h2>
                {status === "approved" && review.user_alias && (
                  <span className="text-sm font-medium text-[#6E808D]">
                    Displayed as: {review.user_alias}
                  </span>
                )}
                {status === "displayed" && (
                  <span className="hidden text-sm font-medium md:block">
                    {formatDate(review.created_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Like button */}
            {canLike && (
              <button
                onClick={toggleLike}
                className="-m-2 flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center gap-1 p-2 transition-all md:hidden"
                aria-label={liked ? "Unlike review" : "Like review"}
              >
                <img
                  src={`/${liked ? "interactions/likeFilled" : "interactions/likeUnfilled"}.svg`}
                  alt="Heart Icon"
                />
                <span className="inline-block min-w-[1rem] text-left text-gray-700">
                  {likeCount}
                </span>
              </button>
            )}
          </div>

          {/* Review date */}
          {status === "displayed" && (
            <div className="text-sm font-medium md:hidden">
              {formatDate(review.created_at)}
            </div>
          )}

          {/* Stars and Membership */}
          <div className="flex flex-col gap-2 text-sm font-medium text-[#6E808D] md:flex-row md:items-center md:gap-2">
            <div className="flex items-center gap-1">
              {renderStars(review.overall_satisfaction, "")}
            </div>
            <span className="mt-1 hidden text-[#7F7F7F] md:inline">•</span>
            <span className="mt-1 break-words">
              Member from {review.membership_start_quarter}{" "}
              {review.membership_start_year} - {review.membership_end_quarter}{" "}
              {review.membership_end_year}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="hidden flex-shrink-0 flex-col items-end gap-2 md:flex">
          {status !== "displayed" && (
            <span className="text-sm font-medium italic">
              Reviewed on {formatDate(review.created_at)}
            </span>
          )}
          {canLike && (
            <button
              onClick={toggleLike}
              className="-m-2 flex min-h-[44px] min-w-[44px] items-center gap-1"
              aria-label={liked ? "Unlike review" : "Like review"}
            >
              <img
                src={`/${liked ? "interactions/likeFilled" : "interactions/likeUnfilled"}.svg`}
                alt="Heart Icon"
              />
              <span className="text-md inline-block min-w-[1rem] text-left text-gray-700">
                {likeCount}
              </span>
            </button>
          )}
        </div>
      </div>
      <div>
        <p
          ref={textRef}
          className={`-mt-4 text-sm font-normal text-black transition-all duration-200 md:text-base ${!showFull ? "line-clamp-4" : ""}`}
        >
          {review.review_text}
        </p>
        {!showFull && isClamped && (
          <button
            className="mt-1 cursor-pointer border-0 bg-none p-0 text-sm text-blue-600 italic underline"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFull(true);
            }}
          >
            ...see more
          </button>
        )}
        {showFull && (
          <button
            className="mt-1 cursor-pointer border-0 bg-none p-0 text-sm text-blue-600 italic underline"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFull(false);
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
                <img src={"/profile/edit-2.svg"} alt="" className="h-6 w-6" />
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
                <img
                  src="/utility/trash.svg"
                  alt=""
                  className="block h-6 w-6 group-hover:hidden"
                />
                <img
                  src="/utility/trash-hover.svg"
                  alt=""
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
