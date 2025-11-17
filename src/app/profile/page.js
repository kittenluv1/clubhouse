"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";
import ClubCard from "../components/clubCard";
import Link from "next/link";
import ReviewCard from "../components/reviewCard";

function ProfilePage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState("approved");
    const [reviewsExpanded, setReviewsExpanded] = useState(true);
    const [clubsExpanded, setClubsExpanded] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [approvedReviews, setApprovedReviews] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [rejectedReviews, setRejectedReviews] = useState([]);
    const [likedClubs, setLikedClubs] = useState([]);
    const [savedClubs, setSavedClubs] = useState([]);

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
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (data) {
                setUserProfile({
                    full_name: data.display_name,
                    avatar_url: null,
                });
            }
        };
        fetchUserProfile();
    }, [currentUser]);

    // Fetch user reviews
    useEffect(() => {
        if (!currentUser) return;

        const fetchApprovedReviews = async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('user_id', currentUser.id);

            if (error) {
                console.error('Error fetching approved reviews:', error);
                return;
            }
            if (data) {
                setApprovedReviews(data);
            }
        };

        const fetchPendingReviews = async () => {
            const { data, error } = await supabase
                .from('pending_reviews')
                .select('*')
                .eq('user_id', currentUser.id)

            if (error) {
                console.error('Error fetching pending reviews:', error);
                return;
            }
            if (data) {
                setPendingReviews(data);
            }
        };

        const fetchRejectedReviews = async () => {
            const { data, error } = await supabase
                .from('rejected_reviews')
                .select('*')
                .eq('user_id', currentUser.id);

            if (error) {
                console.error('Error fetching rejected reviews:', error);
                return;
            }
            if (data) {
                setRejectedReviews(data);
            }
        };

        fetchApprovedReviews();
        fetchPendingReviews();
        fetchRejectedReviews();
    }, [currentUser]);

    // Fetch liked clubs
    useEffect(() => {
        if (!currentUser) return;

        const fetchLikedClubs = async () => {
            const { data, error } = await supabase
                .from('club_likes')
                .select(`
                club_id,
                clubs!club_likes_club_id_fkey(*)
            `)
                .eq('user_id', currentUser.id);

            if (error) {
                console.error('Error fetching liked clubs:', error);
                return;
            }

            if (data) {
                setLikedClubs(data.map(item => item.clubs));
            }
        };

        fetchLikedClubs();
    }, [currentUser]);

    // TODO: Fetch saved clubs when implemented
    useEffect(() => {
        if (!currentUser) return;
        // Placeholder for saved clubs functionality
        setSavedClubs([]);
    }, [currentUser]);

    if (!currentUser) {
        return null;
    }

    const displayName = userProfile?.full_name || "Anonymous Bruin";

    // Filter reviews based on active section
    // const pendingReviews = reviews.filter(r => r.status === 'pending');
    // const rejectedReviews = reviews.filter(r => r.status === 'rejected');

    const getContentForSection = () => {
        switch (activeSection) {
            case "approved":
                return approvedReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#B5BEC7] mb-4">No approved reviews yet</p>
                        <button
                            onClick={() => router.push("/review")}
                            className="rounded-lg border border-black bg-[#FFB0D8] px-6 py-2 font-medium hover:bg-[#F6E18C]"
                        >
                            Write a Review
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mx-8">
                            <div className="text-center mb-8">
                                <p className="text-[#000000] text-4xl font-bold">Approved Reviews</p>
                                <p className="text-[#747474] text-[20px]">These reviews have been approved and posted on the club page!</p>
                            </div>
                            <h2 className="text-[16px] text-[#747474] mb-4">Approved Reviews ({approvedReviews.length})</h2>
                            <div className="grid grid-cols-1 gap-12">
                                {
                                    approvedReviews.map(review => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))
                                }
                            </div>
                        </div>
                    </>
                );

            case "pending":
                return pendingReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#B5BEC7] mb-4">No pending reviews</p>
                        <button
                            onClick={() => router.push("/review")}
                            className="rounded-lg border border-black bg-[#FFB0D8] px-6 py-2 font-medium hover:bg-[#F6E18C]"
                        >
                            Write a Review
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mx-8">
                            <div className="text-center mb-8">
                                <p className="text-[#000000] text-4xl font-bold">Pending Reviews</p>
                                <p className="text-[#747474] text-[20px]">These reviews are currently being processed for approval.</p>
                            </div>
                            <h2 className="text-[16px] text-[#747474] mb-4">Pending Reviews ({pendingReviews.length})</h2>
                            <div className="grid grid-cols-1 gap-12">
                                {
                                    pendingReviews.map(review => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))
                                }
                            </div>
                        </div>
                    </>
                );

            case "rejected":
                return rejectedReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#B5BEC7]">
                            These reviews did not pass our{" "}
                            <Link href="/community-guidelines" className="underline text-[#5058B2]">
                                Community Guidelines
                            </Link>
                            . Please edit them and resubmit for approval.
                        </p>
                        <p className="text-[#B5BEC7]">No rejected reviews</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <p className="text-[#000000] text-4xl font-bold">Rejected Reviews</p>
                            <p className="text-[#B5BEC7]">
                                These reviews did not pass our{" "}
                                <Link href="/community-guidelines" className="underline text-[#5058B2]">
                                    Community Guidelines
                                </Link>
                                . Please edit them and resubmit for approval.
                            </p>                            </div>
                        <h2 className="text-[16px] text-[#747474] mb-4">Rejected Reviews ({rejectedReviews.length})</h2>
                        <div className="grid grid-cols-1 gap-12">
                            {
                                rejectedReviews.map(review => (
                                    <ReviewCard key={review.id} review={review} rejected />
                                ))
                            }
                        </div>
                    </>

                );

            // case "liked-reviews":
            //     return likedReviews.length === 0 ? (
            //         <div className="text-center">
            //             <p className="text-[#B5BEC7]">No liked reviews</p>
            //         </div>
            //     ) : (
            //         <>
            //             <h2 className="text-[16px] text-[#747474] mb-6">Liked Reviews ({likedReviews.length})</h2>
            //             <div className="space-y-6">
            //                 {
            //                     //TODO CARD
            //                 }
            //             </div>
            //         </>
            //     );

            case "liked-clubs":
                return (
                    <div className="mx-8">
                        <div className="text-center mb-8">
                            <p className="text-[#000000] text-4xl font-bold">Liked Clubs</p>
                            <p className="text-[#747474] text-[20px]">Unlike to remove club from &apos;Liked Clubs&apos; list!</p>
                        </div>
                        <h2 className="text-[16px] text-[#747474] mb-4">Liked Clubs ({likedClubs.length})</h2>
                        {
                            likedClubs.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-[#B5BEC7] mb-4">No liked clubs yet</p>
                                    <button
                                        onClick={() => router.push("/clubs")}
                                        className="rounded-lg border border-black bg-[#FFB0D8] px-6 py-2 font-medium hover:bg-[#F6E18C]"
                                    >
                                        Browse Clubs
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-12">
                                        {likedClubs.map((club) => (
                                            <ClubCard
                                                key={`${club.OrganizationID}-${club.OrganizationName}`}
                                                club={club}
                                            />
                                        ))}
                                    </div>
                                </>

                            )
                        }
                    </div>

                );

            case "saved-clubs":
                return (
                    <div className="mx-8">
                        <div className="text-center mb-8">
                            <p className="text-[#000000] text-4xl font-bold">Saved Clubs</p>
                            <p className="text-[#747474] text-[20px]">Unsaved to remove club from &apos;Saved Clubs&apos; list!</p>
                        </div>
                        <h2 className="text-[16px] text-[#747474] mb-6">Saved Clubs ({savedClubs.length})</h2>
                        {
                            savedClubs.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-[#B5BEC7]">No saved clubs</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-12">
                                        {savedClubs.map((club) => (
                                            <ClubCard
                                                key={`${club.OrganizationID}-${club.OrganizationName}`}
                                                club={club}
                                            />
                                        ))}
                                    </div>
                                </>
                            )
                        }
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 lg:p-20">
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
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg p-8 mt-8 sticky top-8">
                        {/* Reviews Section */}
                        <div className="mb-4">
                            <button
                                onClick={() => setReviewsExpanded(!reviewsExpanded)}
                                className="flex items-center justify-between w-full text-left font-semibold mb-2"
                            >
                                <div className="flex items-center gap-2">
                                    <img src="profile_review.svg" alt="review icon" className="max-w-[20px]"/>
                                    <span className="text-2xl">Reviews</span>
                                </div>
                                <svg
                                    className={`w-4 h-4 transition-transform ${reviewsExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {reviewsExpanded && (
                                <div className="ml-2 space-y-1 relative">
                                    {/* Timeline vertical line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>

                                    {[
                                        { value: "approved", label: "Approved" },
                                        { value: "pending", label: "Pending" },
                                        { value: "rejected", label: "Rejected" },
                                        // { value: "liked-reviews", label: "Liked" },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => setActiveSection(item.value)}
                                            className={`ml-3 block w-full text-left text-[#6E808D] font-medium py-2 px-3 rounded-full relative ${activeSection === item.value ? "bg-[#E6F4FF]" : "hover:bg-[#F5FAFF]"
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Clubs Section */}
                        <div>
                            <button
                                onClick={() => setClubsExpanded(!clubsExpanded)}
                                className="flex items-center justify-between w-full text-left font-semibold mb-2"
                            >
                                <div className="flex items-center gap-2">
                                    <img src="/profile_club.svg" alt="club icon" className="max-w-[20px]"/>
                                    <span className="text-2xl">Clubs</span>
                                </div>
                                <svg
                                    className={`w-4 h-4 transition-transform ${clubsExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {clubsExpanded && (
                                <div className="ml-2 space-y-1 relative">
                                    {/* Timeline vertical line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>

                                    {[
                                        { value: "liked-clubs", label: "Liked" },
                                        { value: "saved-clubs", label: "Saved" },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => setActiveSection(item.value)}
                                            className={`ml-3 block w-full text-left text-[#6E808D] font-medium py-2 px-3 rounded-full relative ${activeSection === item.value ? "bg-[#E6F4FF]" : "hover:bg-[#F5FAFF]"
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden lg:block w-px bg-gray-200"></div>

                {/* Main Content Area */}
                <div className="flex-1 min-h-[400px]">
                    {getContentForSection()}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;