import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/db";
import Button from "./button";
import {
  handleCategoryClick,
  renderRatingStars,
} from "../lib/utils/clubCardHelpers";

export default function ClubCard({
  club,
  likeCount = 0,
  userLiked = false,
  userSaved = false,
  onLike,
  onSave,
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(userLiked);
  const [saved, setSaved] = useState(userSaved);
  const [clubLikeCount, setClubLikeCount] = useState(likeCount);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing || !onLike) return;

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      router.push(`/sign-in?returnUrl=${returnUrl}`);
      return;
    }

    setIsProcessing(true);
    const newLiked = !liked;

    // Optimistic update
    setLiked(newLiked);
    setClubLikeCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await onLike(club.OrganizationID, newLiked);
    } catch (error) {
      // Revert on failure
      setLiked(!newLiked);
      setClubLikeCount((prev) => (newLiked ? Math.max(0, prev - 1) : prev + 1));
      console.error("Failed to toggle like:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing || !onSave) return;

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      router.push(`/sign-in?returnUrl=${returnUrl}`);
      return;
    }

    setIsProcessing(true);
    const newSaved = !saved;

    // Optimistic update
    setSaved(newSaved);

    try {
      await onSave(club.OrganizationID, newSaved);
    } catch (error) {
      // Revert on failure
      setSaved(!newSaved);
      console.error("Failed to toggle save:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Link
      href={`/clubs/${encodeURIComponent(club.OrganizationName)}`}
      className="w-full transform space-y-4 rounded-4xl border border-[#92C7F1] bg-[#E6F4FF] px-7 py-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_13px_#1C6AB380] sm:px-6 sm:py-8 md:space-y-5 md:px-10 md:py-10"
    >
      <div className="flex items-start justify-between">
        <h2 className="min-w-0 flex-1 text-xl font-bold wrap-break-word text-black md:text-2xl">
          {club.OrganizationName}
        </h2>
        <div className="flex shrink-0 items-center gap-1">
          {/* Like button */}
          <button
            onClick={toggleLike}
            className="-m-2 flex min-h-11 min-w-11 items-center gap-1 p-2 transition-all"
            disabled={isProcessing}
            aria-label={liked ? "Unlike club" : "Like club"}
          >
            <img
              src={`/${liked ? "interactions/likeFilled" : "interactions/likeUnfilled"}.svg`}
              alt="Heart Icon"
            />
            <span className="text-gray-700">{clubLikeCount}</span>
          </button>
          {/* Save button */}
          <button
            onClick={toggleSave}
            className="-m-2 flex min-h-11 min-w-11 items-center p-2"
            disabled={isProcessing}
            aria-label={saved ? "Unsave club" : "Save club"}
          >
            <img
              src={`/${saved ? "interactions/saveFilled" : "interactions/saveUnfilled"}.svg`}
              alt="Save Icon"
            />
          </button>
        </div>
      </div>

      <div>
        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <label className="flex items-center text-xl font-bold text-black">
            {club.average_satisfaction ? (
              <>{renderRatingStars(club.average_satisfaction)}</>
            ) : (
              <>
                <img
                  src={"interactions/reviewStarFilled.svg"}
                  alt=""
                  className="mr-1.25"
                />
                N/A
              </>
            )}
          </label>
          <label className="text-base text-[#303030]">
            <span className="mr-1 ml-1 font-bold">
              {club.average_satisfaction
                ? club.average_satisfaction.toFixed(1)
                : ""}
            </span>
            {/* Reviews */}
            {club.total_num_reviews === 0
              ? "(0 reviews)"
              : `(${club.total_num_reviews} ${club.total_num_reviews === 1 ? "review" : "reviews"})`}
          </label>
        </div>
      </div>

      <p className="line-clamp-4 text-sm font-normal text-black md:text-base">
        {club.OrganizationDescription}
      </p>

      <div className="flex flex-wrap gap-2">
        {club.Category1Name && (
          <Button
            onClick={(e) => handleCategoryClick(router, e, club.Category1Name)}
            type="tag"
            isSelected={true}
            size="small"
          >
            {club.Category1Name}
          </Button>
        )}
        {club.Category2Name && (
          <Button
            onClick={(e) => handleCategoryClick(router, e, club.Category2Name)}
            type="tag"
            isSelected={true}
            size="small"
          >
            {club.Category2Name}
          </Button>
        )}
      </div>
    </Link>
  );
}
