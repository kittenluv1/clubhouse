import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/db";

export default function ClubCard({
  club,
  likeCount = 0,
  userLiked = false,
  userSaved = false,
  onLike,
  onSave
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
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/sign-in?returnUrl=${returnUrl}`;
      return;
    }

    setIsProcessing(true);
    const newLiked = !liked;

    // Optimistic update
    setLiked(newLiked);
    setClubLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      await onLike(club.OrganizationID, newLiked);
    } catch (error) {
      // Revert on failure
      setLiked(!newLiked);
      setClubLikeCount(prev => newLiked ? Math.max(0, prev - 1) : prev + 1);
      console.error('Failed to toggle like:', error);
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
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/sign-in?returnUrl=${returnUrl}`;
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
      console.error('Failed to toggle save:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCategoryClick = (e, categoryName) => {
    e.preventDefault();
    e.stopPropagation();
    const encoded = encodeURIComponent(categoryName);
    router.push(`/clubs?categories=${encoded}`);
  };
  
  return (
    <Link
      href={`/clubs/${encodeURIComponent(club.OrganizationName)}`}
      className="w-full transform space-y-4 rounded-xl bg-[#E6F4FF] px-4 py-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_13px_#1C6AB380] md:space-y-5 md:px-10 md:py-10"
    >
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-black md:text-2xl">
          {club.OrganizationName}
        </h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Like button */}
          <button
            onClick={toggleLike}
            className="flex items-center gap-1"
            disabled={isProcessing}
          >
            <img
              src={`/${liked ? "heart_liked" : "heart_unliked"}.svg`}
              alt="Heart Icon"
              className="min-h-[15px] min-w-[18px]"
            />
            <span className="text-lg font-semibold text-gray-700 inline-block min-w-[1rem] text-left">
              {clubLikeCount}
            </span>
          </button>
          {/* Save button */}
          <button
            onClick={toggleSave}
            className="flex items-center"
            disabled={isProcessing}
          >
            <img
              src={`/${saved ? "saveFilled" : "saveUnfilled"}.svg`}
              alt="Save Icon"
              className="min-h-[18px] min-w-[18px]"
            />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {club.Category1Name &&
          <button
            onClick={(e) => handleCategoryClick(e, club.Category1Name)}
            className="rounded-full py-2 px-4 text-sm bg-[#FFCEE5] border-1 border-[#FFA1CD] hover:bg-[#FFB3D7] cursor-pointer"
          >
            {club.Category1Name}
          </button>}
        {club.Category2Name &&
          <button
            onClick={(e) => handleCategoryClick(e, club.Category2Name)}
            className="rounded-full py-2 px-4 text-sm bg-[#FFCEE5] border-1 border-[#FFA1CD] hover:bg-[#FFB3D7] cursor-pointer"
          >
            {club.Category2Name}
          </button>}
      </div>

      <p className="line-clamp-4 text-sm font-normal text-black md:text-base">
        {club.OrganizationDescription}
      </p>

      <div>
        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <label className="flex items-center text-xl font-bold text-black">
            {club.average_satisfaction ? (
              <>
                {club.average_satisfaction}
                <span className="ml-1 text-yellow-400">★</span>
              </>
            ) : (
              <>
                N/A
                <span className="ml-1 text-yellow-400">★</span>
              </>
            )}
          </label>
          <label className="text-base font-bold text-black">
            satisfaction rating
          </label>
        </div>
        <label className="text-base text-black italic">
          {club.total_num_reviews === 0
            ? "0 reviews"
            : `from ${club.total_num_reviews} trusted ${club.total_num_reviews === 1 ? "student" : "students"
            }`}
        </label>
      </div>
    </Link>
  );
}
