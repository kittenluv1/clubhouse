import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/db";

export default function RecommendedClubCard({
    club
}) {

    const handleCategoryClick = (e, categoryName) => {
        e.preventDefault();
        e.stopPropagation();
        const encoded = encodeURIComponent(categoryName);
        router.push(`/clubs?categories=${encoded}`);
    };

    const renderRatingStars = (rating) => {
        const ratingStars = [];
        const intRating = Math.round(rating || 0);
        const ratingDecimal = (Math.round(club.average_satisfaction * 10) / 10) - Math.floor(rating);
        for (let x = 0; x < 5; x++) {
            if (x < intRating) {
                if ((rating - ratingDecimal) == x && (ratingDecimal < 0.8) && (ratingDecimal > 0.2)) {
                    ratingStars.push(<img
                        key={x}
                        src={"reviewStarHalf.svg"}
                        className="mr-1"
                    />);
                } else {
                    ratingStars.push(<img
                        key={x}
                        src={"reviewStarFilled.svg"}
                        className="mr-1"
                    />);
                }

            } else {
                ratingStars.push(<img
                    key={x}
                    src={"reviewStarUnfilled.svg"}
                    className="mr-1"
                />);
            }

        }
        return ratingStars;
    }

    return (
        <Link
            href={`/clubs/${encodeURIComponent(club.OrganizationName)}`}
            className="w-95 h-60 transform rounded-[20px] bg-[#EEF7FE] border border-[#A4CDED] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_13px_#1C6AB380] px-5 py-5 gap-3 flex flex-col justify-between"
        >
            <div className="flex justify-center items-center mb-1 line-clamp-2">
                <h2 className="text-xl font-bold text-black md:text-2xl flex-1 min-w-0 break-words">
                    {club.OrganizationName}
                </h2>
                {club.average_satisfaction ? (
                    <>
                        {renderRatingStars(club.average_satisfaction)}
                    </>
                ) : (
                    <>
                        <img
                            src={"reviewStarFilled.svg"}
                            className="mr-[5px]"
                        />
                        N/A
                    </>
                )}
            </div>


            <p className="line-clamp-2 text-sm font-normal text-black md:text-base mb-2">
                {club.OrganizationDescription}
            </p>

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
        </Link>
    );
}
