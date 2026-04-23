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
    const [isFetchingRecommendations, setIsFetchingRecommendations] = React.useState(true);
    const [onboardingCompleted, setOnboardingCompleted] = React.useState(null);

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

    const renderSkeletonCards = () => (
        <div className="w-full min-h-56">
            <div className="flex items-center gap-3">
                <div className="flex shrink-0 items-center self-stretch">
                    <Button type="gray" size="small" disabled aria-hidden="true">
                        &lt;
                    </Button>
                </div>

                <div className="min-w-0 flex-1 overflow-hidden py-1">
                    <div className="flex gap-4 overflow-hidden">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="min-w-0 flex-1 px-2">
                                <div className="flex h-full min-h-56 flex-col rounded-3xl border border-[#D9E8F5] bg-[#EEF4FA] px-5 py-5 text-black">
                                    <div className="animate-pulse flex h-full flex-col">
                                        <div className="flex flex-col items-start gap-2 lg:flex-row lg:justify-between lg:gap-3">
                                            <div className="h-6 w-3/4 rounded-full bg-gray-300" />
                                            <div className="flex items-center gap-1 lg:flex-shrink-0 lg:pt-0.5">
                                                {Array.from({ length: 5 }).map((__, starIndex) => (
                                                    <div key={starIndex} className="h-4 w-4 rounded-sm bg-gray-300" />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <div className="h-3 w-full rounded-full bg-gray-300" />
                                            <div className="h-3 w-11/12 rounded-full bg-gray-300" />
                                            <div className="h-3 w-5/6 rounded-full bg-gray-300" />
                                        </div>

                                        <div className="mt-auto flex flex-wrap gap-2 pt-4">
                                            <div className="h-8 w-20 rounded-full bg-gray-300" />
                                            <div className="h-8 w-24 rounded-full bg-gray-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex shrink-0 items-center self-stretch">
                    <Button type="gray" size="small" disabled aria-hidden="true">
                        &gt;
                    </Button>
                </div>
            </div>
        </div>
    );

    React.useEffect(() => {
        if (loading) {
            setIsFetchingRecommendations(true);
            return;
        }

        if (!user) {
            setData([]);
            setFetchError(null);
            setIsFetchingRecommendations(false);
            return;
        }

        let cancelled = false;

        setIsFetchingRecommendations(true);

        async function fetchRecommendations() {
            try {
                setFetchError(null);
                const onboardingRes = await fetch("/api/onboarding");
                const { onboarding_completed } = await onboardingRes.json().catch(() => ({}));
                if (!cancelled) setOnboardingCompleted(!!onboarding_completed);
                if (!cancelled && !onboarding_completed) {
                    setIsFetchingRecommendations(false);
                    return;
                }

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
            } finally {
                if (!cancelled) {
                    setIsFetchingRecommendations(false);
                }
            }
        }

        fetchRecommendations();

        return () => {
            cancelled = true;
        };
    }, [user, loading]);

    if (loading) {
        return renderSkeletonCards();
    }

    if (isFetchingRecommendations) {
        return renderSkeletonCards();
    }

    if (!user || onboardingCompleted === false) {
        return (
            <div className="relative w-full min-h-56 overflow-hidden rounded-2xl bg-[url('/recommendations-background.svg')] bg-cover bg-center px-6 pt-8 pb-36 md:px-10 md:py-10 md:pr-80 lg:pr-96">
                <div className="relative z-10 flex max-w-3xl flex-col gap-4">
                    <div>
                        <p className="mb-2 text-2xl font-semibold md:text-3xl">Get Personalized Club Recommendations</p>
                        <p className="mb-4 text-sm md:text-base">Discover clubs tailored to your interests, goals, and vibe. Find your community faster with recommendations made just for you.</p>
                        <Button onClick={() => router.push("/onboarding")} type="CTA">
                            Try It Now
                        </Button>
                    </div>
                </div>
                <img
                    src="/recommendations-decal.svg"
                    alt="Recommendations decal"
                    className="pointer-events-none absolute bottom-0 w-[170px] right-0 left-auto md:w-[280px] lg:w-[340px]"
                />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="w-full">
                <p className="mt-3 text-sm text-[#6E808D]">Fetch Error: {fetchError}</p>
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
                                <div
                                    key={d.OrganizationID || title} className="h-full px-2">
                                    <Link href={`/clubs/${encodeURIComponent(title)}`} className="flex h-full min-h-56 flex-col rounded-3xl border border-[#92C7F1] bg-[#E6F4FF] px-5 py-5 text-black">
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
                                    </Link>
                                </div>
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