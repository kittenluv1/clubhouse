"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";

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
            setReviews(null);
        };

        fetchReviews();
    }, [currentUser]);

    // Fetch liked clubs
    useEffect(() => {
        if (!currentUser) return;

        const fetchLikedClubs = async () => {
            // TODO: Implement database call

            // Mock data for now
            setLikedClubs(null);
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
                        src="/default_profile.svg"
                        alt="Profile"
                        className="h-32 w-32 rounded-full"
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
            <div className="mb-6 flex gap-4 border-b border-[#B5BFC6]">
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`group pb-3 px-4 font-medium flex items-center ${activeTab === "reviews"
                            ? "border-b-2 border-black text-black"
                            : "text-gray-500 hover:text-black"
                        }`}
                >
                    <img 
                        src="/review_2.svg"
                        alt="review_symbol"
                        className={`${activeTab === "reviews" ? "hidden" : "group-hover:hidden"}`}
                    />
                    <img 
                        src="/review_1.svg"
                        alt="review_symbol"
                        className={`${activeTab === "reviews" ? "block" : "hidden group-hover:block"}`}
                    />
                    <p className="pl-1">
                        Reviews
                    </p>
                </button>
                <button
                    onClick={() => setActiveTab("clubs")}
                    className={`group pb-3 px-4 font-medium flex items-center ${activeTab === "clubs"
                            ? "border-b-2 border-black text-black"
                            : "text-gray-500 hover:text-black"
                        }`}
                >
                    <img 
                        src="/club_2.svg"
                        alt="review_symbol"
                        className={`${activeTab === "clubs" ? "hidden" : "group-hover:hidden"}`}
                    />
                    <img 
                        src="/club_1.svg"
                        alt="review_symbol"
                        className={`${activeTab === "clubs" ? "block" : "hidden group-hover:block"}`}
                    />
                    <p className="pl-1">
                        Clubs
                    </p>
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "reviews" && (
                    // put real reviews tab 
                    // <Component user={} />

                    <div className="text-center py-12">
                        <p className="text-[#B5BEC7] mb-4">No reviews yet</p>
                        <button
                            onClick={() => router.push("/review")}
                            className="rounded-lg border border-black bg-[#FFB0D8] px-6 py-2 font-medium hover:bg-[#F6E18C]"
                        >
                            Write a Review
                        </button>
                    </div>
                )}

                {activeTab === "clubs" && (
                    // put liked clubs tab 
                    // <Component user={} />

                    <div className="text-center py-12">
                        <p className="text-[#B5BEC7] mb-4">No liked clubs yet</p>
                        <button
                            onClick={() => router.push("/clubs")}
                            className="rounded-lg border border-black bg-[#FFB0D8] px-6 py-2 font-medium hover:bg-[#F6E18C]"
                        >
                            Browse Clubs
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;