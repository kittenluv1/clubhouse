
// import Link from "next/link";
// import Button from "./button";

// export default function ReviewCard({
//     review,
//     rejected = false,
// }) {
//     const date = new Date(review.created_at).toLocaleDateString("en-US", {
import React from "react";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
//     return (

//         <Link
//             href={`/clubs/${encodeURIComponent(review.club_name)}`}
//             className="w-full transform space-y-4 rounded-xl bg-[#E6F4FF] px-4 py-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_13px_#1C6AB380] md:space-y-5 md:px-10 md:py-10"
//         >
//             <div className="flex justify-between items-end mt-4 mb-2">
//                 <h2 className="text-xl font-bold text-black md:text-2xl m-0 leading-none">
//                     {review.club_name}
//                 </h2>
//                 <span className="text-sm italic font-semibold">Reviewed on {date}</span>
//             </div>
//             <span className="text-sm text-[#6E808D]">Member from {review.membership_start_quarter}{" "}{review.membership_start_year} to {review.membership_end_quarter}{" "}{review.membership_end_year}</span>
//             <p className="line-clamp-4 text-sm font-normal text-black md:text-base mt-4">
//                 {review.review_text}
//             </p>
//             {rejected && (
//                 <div className="w-full flex justify-end space-x-2">
//                     <Button
//                         type="CTA"
//                         onClick={() => { window.location.href = `/review-edit?club=${encodeURIComponent(review.club_name)}&clubId=${review.id}` }}
//                     >
//                         Edit Review
//                     </Button>
//                     <Button>
//                         Delete
//                     </Button>
//                 </div>
//             )}
//         </Link>
//     );
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
