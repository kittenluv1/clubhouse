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
    isCurrentUser = false, // whether this review belongs to the current user
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
        <div className={`w-full transform space-y-4 rounded-4xl bg-[#FAFEEE] border border-[#A3CD1B] px-5 py-6 sm:px-4 sm:py-6 my-4 transition-all duration-300 ease-out md:space-y-5 md:px-10 md:py-10`}>
            {/* Mobile Layout (stacked vertically) */}
            <div className="flex flex-col gap-3 md:hidden">
                {/* Profile image + username + like button row */}
                <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                        {status === "displayed" && (
                            <img
                                src="/profile.svg"
                                alt="Profile"
                                className="w-12 h-12 flex-shrink-0"
                            />
                        )}
                        <h2 className="text-sm sm:text-lg md:text-xl font-bold text-black m-0 leading-tight break-words">
                            {status === "displayed"
                                ? (review.user_alias || "Anonymous")
                                : review.club_name
                            }
                            {status === "displayed" && isCurrentUser && (
                                <span className="ml-1.5 text-s font-medium" style={{ color: '#FFA1CD' }}>(you)</span>
                            )}
                        </h2>
                        {status === "approved" && review.user_alias && (
                            <p className="text-sm text-[#6E808D] font-medium m-0">Displayed as: {review.user_alias}</p>
                        )}
                    </div>

                    {/* Like button on mobile */}
                    {canLike && (
                        <button
                            onClick={toggleLike}
                            className="flex items-center gap-2 p-2 -m-2 min-w-[44px] min-h-[44px] flex-shrink-0"
                            aria-label={liked ? "Unlike review" : "Like review"}
                        >
                            <img
                                src={`/${liked ? "heart_liked" : "heart_unliked"}.svg`}
                                alt="Heart Icon"
                                className="w-[18px] h-[15px]"
                            />
                            <span className="text-sm font-semibold text-gray-700 inline-block min-w-[1rem] text-left">
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
                <div className="text-sm text-[#6E808D] font-medium flex-wrap">
                    Member from {review.membership_start_quarter}{" "}{review.membership_start_year} - {review.membership_end_quarter}{" "}{review.membership_end_year}
                </div>

                {/* Stars row */}
                <div className="flex items-center gap-1">
                    {renderStars(review.overall_satisfaction, "text-sm sm:text-xl md:text-2xl")}
                </div>
            </div>

            {/* Desktop Layout (original horizontal layout) */}
            <div className="hidden md:flex justify-between items-start">
                {/* Profile image + username + like button row */}
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className="flex gap-3 items-center">
                        {status === "displayed" && (
                            <img
                                src="/profile.svg"
                                alt="Profile"
                                className="w-15 h-15 flex-shrink-0"
                            />
                        )}
                        <div className="flex flex-col gap-2 min-w-0">
                            <h2 className="text-xl font-bold text-black m-0 leading-tight break-words">
                                {status === "displayed"
                                    ? (review.user_alias || "Anonymous")
                                    : review.club_name
                                }
                                {status === "displayed" && isCurrentUser && (
                                    <span className="ml-1.5 text-s font-medium" style={{ color: '#FFA1CD' }}>(you)</span>
                                )}
                            </h2>
                            {status === "approved" && review.user_alias && (
                                <span className="text-sm text-[#6E808D] font-medium">Displayed as: {review.user_alias}</span>
                            )}
                            {status === "displayed" && (
                                <span className="text-sm font-medium">{formatDate(review.created_at)}</span>
                            )}
                        </div>
                    </div>
                    {/* Satisfaction and Membership row */}
                    <div className="flex items-center gap-2 text-sm text-[#6E808D] font-medium flex-wrap">
                        <div className="flex items-center gap-1">
                            {renderStars(review.overall_satisfaction, "text-base")}
                        </div>
                        <span className="text-[#7F7F7F]">•</span>
                        <span className="break-words">
                            Member from {review.membership_start_quarter}{" "}{review.membership_start_year} - {review.membership_end_quarter}{" "}{review.membership_end_year}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {/* Review date row */}
                    {status !== "displayed" && (
                        <span className="text-sm italic font-medium">Reviewed on {formatDate(review.created_at)}</span>
                    )}
                    {/* Like button - only for approved reviews */}
                    {canLike && (
                        <button
                            onClick={toggleLike}
                            className="flex items-center gap-2 p-2 -m-2 min-w-[44px] min-h-[44px]"
                            aria-label={liked ? "Unlike review" : "Like review"}
                        >
                            <img
                                src={`/${liked ? "heart_liked" : "heart_unliked"}.svg`}
                                alt="Heart Icon"
                                className="w-[20px] h-[17px]"
                            />
                            <span className="text-md font-semibold text-gray-700 inline-block min-w-[1rem] text-left">
                                {likeCount}
                            </span>
                        </button>
                    )}
                </div>
            </div>
            <div>
                <p
                    ref={textRef}
                    className={`text-sm font-normal text-black md:text-base transition-all duration-200 ${!showFull ? "line-clamp-4" : ""}`}
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
                <div className="w-full flex flex-col sm:flex-row justify-end gap-2 mt-4">
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
                            Edit Review
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            className="w-full sm:w-auto"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(review.id);
                            }}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            )}
        </div>
    );

    return cardContent;
}
