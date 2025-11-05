import React from "react";

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

export default function ReviewCard({ review, index, isDesktop }) {
    const [liked, setLiked] = React.useState(false);
    const toggleLike = () => {
        setLiked(!liked);
        /*
        TODO: call the necessary api endpoints to update the database (hardcode it for now if endpoints have not been created yet)
        */
    };

    return (isDesktop ? (
        // desktop card
        <div
            key={index}
            className="rounded-lg border border-black bg-gray-50 p-8"
            style={{ boxShadow: "6px 6px 0px #b4d59f" }}
        >
            <div className="flex justify-between">
                <div className="mb-2 flex flex-col justify-between">
                    <h3 className="text-2xl font-bold">
                        {review.user_alias ? `${review.user_alias}` : "Anonymous"}
                    </h3>
                    <div className="text-[#303030]">
                        {formatDate(review.created_at)}
                    </div>
                </div>
                <div>
                    <button
                        onClick={toggleLike}
                    >
                        <img
                            src={`/${liked ? "heart-liked" : "heart-unliked"}.svg`}
                            alt="Heart Icon"
                            className="h-10 w-10"
                        />
                    </button>
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
            className="rounded-lg border-2 border-black bg-gray-50 p-6"
        >
            <div className="flex justify-between">
                <div className="mb-2 flex flex-col justify-between">
                    <h3 className="text-2xl font-bold">
                        {review.user_alias ? `${review.user_alias}` : "Anonymous"}
                    </h3>
                    <div className="text-[#303030]">
                        {formatDate(review.created_at)}
                    </div>
                </div>
                <div>
                    <button
                        onClick={toggleLike}
                    >
                        <img
                            src={`/${liked ? "heart-liked" : "heart-unliked"}.svg`}
                            alt="Heart Icon"
                            className="h-10 w-10"
                        />
                    </button>
                </div>
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
    ));
}
