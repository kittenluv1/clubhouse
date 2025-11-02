"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";

// Mock data
const mockReviews = [
    {
        id: 1,
        clubName: "Chess Club",
        overall_satisfaction: 5,
        review_text: "Great club with friendly members!",
        created_at: "2024-10-15",
    },
    {
        id: 2,
        clubName: "Photography Club",
        overall_satisfaction: 4,
        review_text: "Good learning opportunities.",
        created_at: "2024-10-10",
    },
];

const mockLikedClubs = [
    {
        OrganizationID: 1,
        OrganizationName: "Chess Club",
        Description: "A club for chess enthusiasts",
        avgRating: 4.5,
        numReviews: 23,
    },
    {
        id: 2,
        OrganizationName: "Photography Club",
        Description: "Learn and practice photography",
        avgRating: 4.2,
        numReviews: 18,
    },
];

function ReviewsTabContent({ reviews }) {
    const router = useRouter();

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No reviews yet</p>
                <button
                    onClick={() => router.push("/review")}
                    className="rounded-lg border border-black bg-[#FFB0D8] px-6 py-2 font-medium hover:bg-[#F6E18C]"
                >
                    Write a Review
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className="rounded-lg border border-gray-300 bg-white p-6"
                >
                    <div className="mb-2 flex items-start justify-between">
                        <h3 className="text-lg font-semibold">
                            {review.clubName}
                        </h3>
                        <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    {review.overall_satisfaction && (
                        <div className="mb-2 flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={`star-${i}`}
                                    className={
                                        i < review.overall_satisfaction
                                            ? "text-yellow-500"
                                            : "text-gray-300"
                                    }
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    )}
                    {review.review_text && (
                        <p className="text-gray-700">{review.review_text}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

function LikedClubsTabContent({ clubs }) {
    const router = useRouter();

    if (clubs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No liked clubs yet</p>
                <button
                    onClick={() => router.push("/clubs")}
                    className="rounded-lg border border-black bg-[#FFB0D8] px-6 py-2 font-medium hover:bg-[#F6E18C]"
                >
                    Browse Clubs
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {clubs.map((club) => (
                <div
                    key={club.OrganizationID || club.id}
                    className="rounded-lg border border-gray-300 bg-white p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/clubs/${club.OrganizationID || club.id}`)}
                >
                    <h3 className="mb-2 text-lg font-semibold">
                        {club.OrganizationName}
                    </h3>
                    {club.Description && (
                        <p className="mb-3 text-gray-700">{club.Description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                        {club.avgRating && (
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="font-medium">
                                    {club.avgRating.toFixed(1)}
                                </span>
                            </div>
                        )}
                        {club.numReviews && (
                            <span className="text-gray-500">
                                {club.numReviews} reviews
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("reviews");
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [likedClubs, setLikedClubs] = useState([]);

    // Authentication check
    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (user) {
                setCurrentUser(user);
            } else {
                console.error("Error getting user:", error);
                window.location.href = "/sign-in";
            }
        };

        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session?.user) {
                    setCurrentUser(session.user);
                } else {
                    setCurrentUser(null);
                    window.location.href = "/sign-in";
                }
            },
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Fetch user profile data
    useEffect(() => {
        if (!currentUser) return;

        const fetchUserProfile = async () => {
            // TODO: Implement database call

            // Mock data for now
            setUserProfile({
                full_name: "John Doe",
                avatar_url: null,
            });
        };

        fetchUserProfile();
    }, [currentUser]);

    // Fetch user reviews
    useEffect(() => {
        if (!currentUser) return;

        const fetchReviews = async () => {
            // TODO: Implement database call

            // Mock data for now
            setReviews(mockReviews);
        };

        fetchReviews();
    }, [currentUser]);

    // Fetch liked clubs
    useEffect(() => {
        if (!currentUser) return;

        const fetchLikedClubs = async () => {
            // TODO: Implement database call

            // Mock data for now
            setLikedClubs(mockLikedClubs);
        };

        fetchLikedClubs();
    }, [currentUser]);

    if (!currentUser) {
        return null;
    }

    const displayName = userProfile?.full_name || currentUser.email?.split("@")[0] || "User";

    return (
        <div className="min-h-screen p-6 md:p-20">
            {/* User Information Section */}
            <div className="mb-8 rounded-lg bg-white p-6">
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                    <img
                        src="/../../profile_default.svg"
                        alt="Profile"
                        className="h-32 w-32 rounded-full border-2 border-gray-300 p-4"
                    />
                    <div className="flex-1 text-center md:text-left self-center">
                        <h1 className="mb-2 text-2xl font-bold">{displayName}</h1>
                        <p className="mb-1 text-gray-600">{currentUser.email}</p>
                        {userProfile?.created_at && (
                            <p className="text-sm text-gray-500">
                                Member since {new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-4 border-b border-gray-300">
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === "reviews"
                            ? "border-b-2 border-black text-black"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Reviews
                </button>
                <button
                    onClick={() => setActiveTab("clubs")}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === "clubs"
                            ? "border-b-2 border-black text-black"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Clubs
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "reviews" && (
                    // put real reviews tab in later
                    // <Component user={} />
                    <ReviewsTabContent reviews={reviews} />
                )}

                {activeTab === "clubs" && (
                    // put liked clubs tab inn later
                    // <Component user={} />
                    <LikedClubsTabContent clubs={likedClubs} />
                )}
            </div>
        </div>
    );
}

export default ProfilePage;