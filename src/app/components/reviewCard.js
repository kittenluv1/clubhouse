import Link from "next/link";

export default function ReviewCard({ review }) {
    const date = new Date(review.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    return (

        <Link
            href={`/clubs/${encodeURIComponent(review.club_name)}`}
            className="w-full transform space-y-4 rounded-xl bg-[#E6F4FF] px-4 py-6 transition-all duration-100 hover:shadow-[0_0_13px_#1C6AB380] md:space-y-5 md:px-10 md:py-10"
        >
            <div className="flex justify-between items-end mt-4 mb-2">
                <h2 className="text-xl font-bold text-black md:text-2xl m-0 leading-none">
                    {review.club_name}
                </h2>
                <span className="text-sm italic font-semibold">Reviewed on {date}</span>
            </div>
            <span className="text-sm text-[#6E808D]">Member from {review.membership_start_quarter}{" "}{review.membership_start_year} to {review.membership_end_quarter}{" "}{review.membership_end_year}</span>
            <p className="line-clamp-4 text-sm font-normal text-black md:text-base mt-4">
                {review.review_text}
            </p>
        </Link>
    );
}
