"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Button from "../components/button";
import { useAuth } from "../context/AuthContext";
import { handleCategoryClick, renderRatingStars } from "../lib/utils/clubCardHelpers";
import Link from "next/link";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

function ClubSlider() {
    const slider = React.useRef(null);
    const router = useRouter();
    const { user, loading } = useAuth();
    const [data, setData] = React.useState([]);
    const [fetchError, setFetchError] = React.useState(null);

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        arrows: true,
        slidesToScroll: 3,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    const getDescriptionClampClass = (clubName, description) => {
        const titleLength = (clubName || "").trim().length;
        const hasLongTitle = titleLength > 34;
        const descriptionLength = (description || "").trim().length;

        if (!descriptionLength) {
            return "line-clamp-1";
        }

        if (hasLongTitle) {
            return "line-clamp-2";
        }

        return "line-clamp-3";
    };

    React.useEffect(() => {
        if (!user) {
            setData([]);
            setFetchError(null);
            return;
        }

        let cancelled = false;

        async function fetchRecommendations() {
            try {
                setFetchError(null);
                const res = await fetch("/api/recommendations");
                if (!res.ok) {
                    throw new Error(`Failed to fetch recommendations: HTTP ${res.status}`);
                }
                const json = await res.json();
                if (!cancelled) {
                    setData(Array.isArray(json?.recommendations) ? json.recommendations : []);
                }
            } catch (error) {
                if (!cancelled) {
                    setFetchError(error.message || "Failed to load recommendations.");
                    setData([]);
                }
                console.error("Error fetching recommendations:", error);
            }
        }

        fetchRecommendations();

        return () => {
            cancelled = true;
        };
    }, [user]);

    if (loading) {
        return null;
    }

    if (!user) {
        return (
            <div className="w-3/4 m-auto">
                <h2 className="text-xl italic text-gray-500 md:text-2xl text-center">
                    Please sign in to see club recommendations.
                </h2>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="w-3/4 m-auto">
                <h2 className="text-xl font-bold text-black md:text-2xl flex-1 min-w-0 break-words">
                    Recommended Clubs
                </h2>
                <p className="mt-3 text-sm text-[#6E808D]">{fetchError}</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-56">
            <div className="flex items-center gap-3">
                <div className="flex shrink-0 items-center self-stretch">
                    <Button
                        onClick={() => slider?.current?.slickPrev()}
                        type="gray"
                        size="small"
                    >
                        &lt;
                    </Button>
                </div>
                <div className="min-w-0 flex-1 overflow-hidden py-1">
                    <Slider ref={slider} {...settings}>
                        {data.map((d) => {
                            const title = d.OrganizationName || "";
                            const description = d.OrganizationDescription || "";
                            const descriptionClampClass = getDescriptionClampClass(title, description);

                            return (
                                <Link
                                    href={`/clubs/${encodeURIComponent(title)}`}
                                    key={d.OrganizationID || title} className="h-full px-2 py-1">
                                    <div className="flex h-full min-h-56 flex-col rounded-3xl border border-[#92C7F1] bg-[#E6F4FF] px-5 py-5 text-black">
                                        <div className="flex flex-col items-start gap-2 lg:flex-row lg:justify-between lg:gap-3">
                                            <h3 className="line-clamp-2 flex-1 min-w-0 text-lg font-bold leading-tight text-black">
                                                {title}
                                            </h3>
                                            <div className="flex items-center lg:flex-shrink-0 lg:pt-0.5">
                                                {renderRatingStars(d.average_satisfaction)}
                                            </div>
                                        </div>

                                        <p className={`mt-3 ${descriptionClampClass} text-sm text-black`}>
                                            {description}
                                        </p>

                                        <div className="mt-auto flex flex-wrap gap-2 pt-4">
                                            {d.Category1Name && (
                                                <Button
                                                    onClick={(e) => handleCategoryClick(router, e, d.Category1Name)}
                                                    type="tag"
                                                    isSelected={true}
                                                    size="small"
                                                >
                                                    {d.Category1Name}
                                                </Button>
                                            )}
                                            {d.Category2Name && (
                                                <Button
                                                    onClick={(e) => handleCategoryClick(router, e, d.Category2Name)}
                                                    type="tag"
                                                    isSelected={true}
                                                    size="small"
                                                >
                                                    {d.Category2Name}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </Slider>
                </div>
                <div className="flex shrink-0 items-center self-stretch">
                    <Button
                        onClick={() => slider?.current?.slickNext()}
                        type="gray"
                        size="small"
                    >
                        &gt;
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ClubSlider;