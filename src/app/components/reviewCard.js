import React from "react";
import Link from "next/link";
import Button from "./button";

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

export default function ReviewCard({
    review,
    isDesktop,
    status = "displayed", // 'approved' | 'pending' | 'rejected' | 'displayed'
    clickable = true, // whether card links to club page
    onLike, // callback for like button
    onEdit, // callback for edit button
    onDelete, // callback for delete button
}) {
    const [liked, setLiked] = React.useState(false);

    // make it so like count is fetched and displayed

    const toggleLike = () => {
        if ( status === "displayed" && onLike) {
            setLiked(!liked);
            onLike(review.id, !liked);
        }
    };

    // Determine what actions are available based on status
    const canLike = status === "displayed" && onLike;
    const canEdit = status === "rejected" && onEdit;
    const canDelete = status === "rejected" && onDelete;

    const desktopCard = (
        <div className="w-full transform space-y-4 rounded-xl bg-[#E6F4FF] px-4 py-6 my-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_13px_#1C6AB380] md:space-y-5 md:px-10 md:py-10">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-black md:text-2xl m-0 leading-none">
                        {status === "displayed"
                            ? (review.user_alias || "Anonymous")
                            : review.club_name
                        }
                    </h2>
                    <span className="text-sm italic font-medium">Reviewed on {formatDate(review.created_at)}</span>
                    <span className="text-sm text-[#6E808D] font-medium">
                        Member from {review.membership_start_quarter}{" "}{review.membership_start_year} - {review.membership_end_quarter}{" "}{review.membership_end_year}
                    </span>
                </div>
                {/* Like button - only for approved reviews */}
                {canLike && (
                    <button onClick={toggleLike}>
                        <img
                            src={`/${liked ? "heart-liked" : "heart-unliked"}.svg`}
                            alt="Heart Icon"
                            className="h-10 w-10"
                        />
                    </button>
                )}
            </div>
            <p className="line-clamp-4 text-sm font-normal text-black md:text-base mt-4">
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

    const mobileCard = (
        <div className="w-full transform space-y-4 rounded-xl bg-[#E6F4FF] px-4 py-6 my-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_13px_#1C6AB380]">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-black m-0 leading-none">
                        {status === "displayed"
                            ? (review.user_alias || "Anonymous")
                            : review.club_name
                        }
                    </h2>
                    <span className="text-sm italic font-semibold">Reviewed on {formatDate(review.created_at)}</span>
                    <span className="text-sm text-[#6E808D]">
                        Member from {review.membership_start_quarter}{" "}{review.membership_start_year} - {review.membership_end_quarter}{" "}{review.membership_end_year}
                    </span>
                </div>
                {/* Like button - only for approved reviews */}
                {canLike && (
                    <button onClick={toggleLike}>
                        <img
                            src={`/${liked ? "heart-liked" : "heart-unliked"}.svg`}
                            alt="Heart Icon"
                            className="h-10 w-10"
                        />
                    </button>
                )}
            </div>
            <p className="line-clamp-4 text-sm font-normal text-black mt-4">
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

    const cardContent = isDesktop ? desktopCard : mobileCard;

    // Wrap in Link only if clickable and club_name exists
    if (clickable && review.club_name) {
        return (
            <Link href={`/clubs/${encodeURIComponent(review.club_name)}`}>
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}
