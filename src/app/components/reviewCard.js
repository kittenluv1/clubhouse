import { useState } from "react";
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

const renderStars = (rating) => {
    const stars = [];
    const numStars = Math.round(rating || 0);
    for (let i = 0; i < 5; i++) {
        if (i < numStars) {
            stars.push(<span key={i} className="text-yellow-400">★</span>);
        } else {
            stars.push(<span key={i} className="text-gray-300">★</span>);
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
    // TODO: Initialize liked state from review.user_has_liked when user-specific likes are implemented
    const [liked, setLiked] = useState(review.user_has_liked || false);
    const [likeCount, setLikeCount] = useState(review.likes || 0);
    const [isProcessing, setIsProcessing] = useState(false);

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
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            await onLike(review.id, newLiked);
        } catch (error) {
            // Revert on failure
            setLiked(!newLiked);
            setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
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
        <div className={`w-full transform space-y-4 rounded-4xl bg-[#FAFEEE] border border-[#A3CD1B] px-4 py-6 my-4 transition-all duration-300 ease-out md:space-y-5 md:px-10 md:py-10`}>
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2 min-w-[150px] md:min-w-[200px]">
                    <div className="flex gap-3 items-center">
                        {status === "displayed" && (
                            <img
                                src="/profile.svg"
                                alt="Profile"
                                className="w-15 h-15 flex-shrink-0"
                            />
                        )}
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-bold text-black md:text-xl m-0 leading-none">
                                {status === "displayed"
                                    ? (review.user_alias || "Anonymous")
                                    : review.club_name
                                }
                            </h2>
                            {status === "displayed" && (
                                <span className="text-sm font-medium">{formatDate(review.created_at)}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6E808D] font-medium">
                        <div className="flex items-center gap-1">
                            {renderStars(review.overall_satisfaction)}
                        </div>
                        <span className="text-[#7F7F7F]">•</span>
                        <span>
                            Member from {review.membership_start_quarter}{" "}{review.membership_start_year} - {review.membership_end_quarter}{" "}{review.membership_end_year}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {status !== "displayed" && (
                        <span className="text-sm italic font-medium">Reviewed on {formatDate(review.created_at)}</span>
                    )}
                    {/* Like button - only for approved reviews */}
                    {canLike && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={toggleLike}>
                                <img
                                    src={`/${liked ? "heart_liked" : "heart_unliked"}.svg`}
                                    alt="Heart Icon"
                                    className="minh-[15px] min-w[18px]"
                                />
                            </button>
                            <span className="text-md font-semibold text-gray-700 inline-block min-w-[1rem] text-left">
                                {likeCount}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <p className="line-clamp-4 text-sm font-normal text-black md:text-base">
                {review.review_text}
            </p>

            {/* Edit/Delete buttons - only for rejected reviews */}
            {(canEdit || canDelete) && (
                <div className="w-full flex justify-end space-x-2 mt-4">
                    {canEdit && (
                        <Button
                            type="CTA"
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
