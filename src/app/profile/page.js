"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";
import ClubCard from "../components/clubCard";
import Link from "next/link";
import ReviewCard from "../components/reviewCard";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmationModal from "../components/confirmationModal";
import Button from "../components/button";

function ProfilePage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState("approved");
    const [reviewsExpanded, setReviewsExpanded] = useState(true);
    const [clubsExpanded, setClubsExpanded] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [approvedReviews, setApprovedReviews] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [rejectedReviews, setRejectedReviews] = useState([]);
    const [likedClubs, setLikedClubs] = useState([]);
    const [savedClubs, setSavedClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [unreadRejectedCount, setUnreadRejectedCount] = useState(0);

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

    // Fetch all profile data from API
    useEffect(() => {
        if (!currentUser) return;

        const fetchProfileData = async () => {
            try {
                // Only show loading screen if we don't have data yet
                if (!userProfile) {
                    setLoading(true);
                }

                // No userId param needed - API gets it from session cookies
                const response = await fetch(`/api/profile`);
                const data = await response.json();

                if (response.ok) {
                    // Set user profile
                    if (data.profile) {
                        setUserProfile({
                            full_name: data.profile.display_name,
                            avatar_url: null,
                        });
                    }

                    // Set reviews
                    setApprovedReviews(data.approvedReviews || []);
                    setPendingReviews(data.pendingReviews || []);
                    setRejectedReviews(data.rejectedReviews || []);
                    setUnreadRejectedCount(data.unreadRejectedCount || 0);

                    // Set clubs
                    setLikedClubs(data.likedClubs || []);
                    setSavedClubs(data.savedClubs || []);
                } else {
                    console.error('Error fetching profile data:', data.error);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [currentUser]);

    if (!currentUser) {
        return null;
    }

    if (loading) {
        return <LoadingScreen />;
    }

    const displayName = userProfile?.full_name || "Anonymous Bruin";

    const attemptReview = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session) {
            window.location.href = "/review";
        } else {
            const returnUrl = encodeURIComponent("/review");
            window.location.href = `/sign-in?returnUrl=${returnUrl}`;
        }
    };

    // Handler functions for review actions
    const handleLike = async (reviewId, isLiked) => {
        // TODO: Implement API call to like/unlike review
        console.log('Like review:', reviewId, isLiked);
    };

    const handleEdit = (review) => {
        // Navigate to edit page
        console.log('Editing review:', review);
        router.push(`/review/edit/${review.id}`);
    };

    const handleDelete = async (reviewId) => {
        setReviewToDelete(reviewId);
        setConfirmationModalOpen(true);
    };

    const deleteReview = async () => {
        if (!reviewToDelete) return;

        // TODO: Implement API call to delete review
        const response = await fetch(`/api/rejectedReviews/${reviewToDelete}`, { method: 'DELETE' });
        if (response.ok) {
            // console.log('Deleted review: ', reviewToDelete);
            // Remove from local state
            setRejectedReviews(prev => prev.filter(r => r.id !== reviewToDelete));
        } else {
            console.error('Error deleting review');
        }

        // Reset state
        setReviewToDelete(null);
    };

    // Handler for club like/unlike
    const handleClubLike = async (clubId, isLiked) => {
        try {
            const response = await fetch('/api/clubLikes', {
                method: isLiked ? 'POST' : 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ club_id: clubId }),
            });

            if (!response.ok) {
                throw new Error('Failed to update like');
            }

            // Update local state - sync like counts across both arrays
            if (isLiked) {
                // Find the club from savedClubs if it exists there
                const clubToAdd = savedClubs.find(c => c.OrganizationID === clubId);
                if (clubToAdd && !likedClubs.some(c => c.OrganizationID === clubId)) {
                    // Increment like count and add to liked clubs
                    const updatedClub = { ...clubToAdd, like_count: (clubToAdd.like_count || 0) + 1 };
                    setLikedClubs(prev => [...prev, updatedClub]);
                    // Also update the like count in savedClubs
                    setSavedClubs(prev => prev.map(c =>
                        c.OrganizationID === clubId ? updatedClub : c
                    ));
                }
            } else {
                // Get current like count before removing
                const currentClub = likedClubs.find(c => c.OrganizationID === clubId) ||
                    savedClubs.find(c => c.OrganizationID === clubId);
                const newLikeCount = Math.max(0, (currentClub?.like_count || 0) - 1);

                // Remove from liked clubs
                setLikedClubs(prev => prev.filter(c => c.OrganizationID !== clubId));
                // Update like count in savedClubs if the club exists there
                setSavedClubs(prev => prev.map(c =>
                    c.OrganizationID === clubId
                        ? { ...c, like_count: newLikeCount }
                        : c
                ));
            }
        } catch (error) {
            console.error('Error updating club like:', error);
            throw error; // Re-throw to trigger revert in ClubCard
        }
    };

    // Handler to mark rejected reviews as viewed
    const handleViewRejected = async () => {
        if (unreadRejectedCount > 0) {
            setUnreadRejectedCount(0);
            try {
                await fetch('/api/profile/viewed-rejected', { method: 'POST' });
            } catch (error) {
                console.error('Error marking rejected reviews as viewed:', error);
            }
        }
    };

    // Handler for club save/unsave
    const handleClubSave = async (clubId, isSaved) => {
        try {
            const response = await fetch('/api/clubSaves', {
                method: isSaved ? 'POST' : 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ club_id: clubId }),
            });

            if (!response.ok) {
                throw new Error('Failed to update save');
            }

            // Update local state
            if (isSaved) {
                // Find the club from likedClubs if it exists there
                const clubToAdd = likedClubs.find(c => c.OrganizationID === clubId);
                if (clubToAdd && !savedClubs.some(c => c.OrganizationID === clubId)) {
                    // Add to saved clubs with current like count from likedClubs
                    setSavedClubs(prev => [...prev, clubToAdd]);
                }
            } else {
                // Remove from saved clubs
                setSavedClubs(prev => prev.filter(c => c.OrganizationID !== clubId));
            }
        } catch (error) {
            console.error('Error updating club save:', error);
            throw error; // Re-throw to trigger revert in ClubCard
        }
    };

    const getContentForSection = () => {
        switch (activeSection) {
            case "approved":
                return (
                    <div className="mx-8">
                        <div className="text-center mb-8">
                            <p className="text-[#000000] text-4xl font-bold mb-4">Approved Reviews</p>
                            <p className="text-[#747474] text-[20px]">These reviews have been approved and posted on the club page!</p>
                        </div>
                        <h2 className="text-[16px] text-[#747474] mb-4">Approved Reviews ({approvedReviews.length})</h2>
                        {approvedReviews.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-[#B5BEC7]">No approved reviews</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1">
                                {approvedReviews.map(review => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        status="approved"
                                        clickable={true}
                                        onLike={handleLike}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );

            case "pending":
                return (
                    <div className="mx-8">
                        <div className="text-center mb-8">
                            <p className="text-[#000000] text-4xl font-bold mb-4">Pending Reviews</p>
                            <p className="text-[#747474] text-[20px]">These reviews are currently being processed for approval.</p>
                        </div>
                        <h2 className="text-[16px] text-[#747474] mb-4">Pending Reviews ({pendingReviews.length})</h2>
                        {pendingReviews.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-[#B5BEC7] mb-4">No pending reviews</p>
                                <Button type="CTA" onClick={attemptReview}>
                                    Write a Review
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-12">
                                {pendingReviews.map(review => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        status="pending"
                                        clickable={true}
                                        onLike={handleLike}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );

            case "rejected":
                return (
                    <div className="mx-8">
                        <div className="text-center mb-8">
                            <p className="text-[#000000] text-4xl font-bold mb-4">Rejected Reviews</p>
                            <p className="text-[#747474] text-[20px]">
                                These reviews did not pass our{" "}
                                <Link href="/community-guidelines" className="underline text-[#7fbefa]">
                                    Community Guidelines
                                </Link>
                                . Please edit them and resubmit for approval.
                            </p>
                        </div>
                        <h2 className="text-[16px] text-[#747474] mb-4">Rejected Reviews ({rejectedReviews.length})</h2>
                        {rejectedReviews.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-[#B5BEC7]">No rejected reviews</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-12">
                                {rejectedReviews.map(review => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        status="rejected"
                                        clickable={true}
                                        onLike={handleLike}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );

            case "liked-clubs":
                return (
                    <div className="mx-8">
                        <div className="text-center mb-8">
                            <p className="text-[#000000] text-4xl font-bold mb-4">Liked Clubs</p>
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
                                                likeCount={club.like_count || 0}
                                                userLiked={true}
                                                userSaved={savedClubs.some(c => c.OrganizationID === club.OrganizationID)}
                                                onLike={handleClubLike}
                                                onSave={handleClubSave}
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
                            <p className="text-[#000000] text-4xl font-bold mb-4">Saved Clubs</p>
                            <p className="text-[#747474] text-[20px]">Unsave to remove club from &apos;Saved Clubs&apos; list!</p>
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
                                                likeCount={club.like_count || 0}
                                                userLiked={likedClubs.some(c => c.OrganizationID === club.OrganizationID)}
                                                userSaved={true}
                                                onLike={handleClubLike}
                                                onSave={handleClubSave}
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
        <div className="min-h-screen">
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={() => {
                    setConfirmationModalOpen(false);
                    setReviewToDelete(null);
                }}
                onConfirm={deleteReview}
                title="Confirm Deletion"
                message="Are you sure you want to delete this review?"
            />
            {/* User Information Section */}
            <div
                className="relative mb-22 rounded-lg bg-white bg-cover bg-center bg-no-repeat px-12 py-15 lg:px-26 lg:py-25 border-b border-[#E5EBF1]"
                style={{ backgroundImage: "url('/profile_background.png')" }}
            >
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-17 lg:-bottom-22 lg:left-52 flex h-35 w-35 md:h-35 md:w-35 lg:h-45 lg:w-45 items-center justify-center rounded-full border border-lime-300 bg-white">
                    <img
                        src="/bear-profile.svg"
                        alt="Profile"
                        className="h-25 lg:h-32"
                    />
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="flex flex-col gap-8 p-6 pt-0 md:p-12 md:pt-0 lg:flex-row lg:p-20 lg:pt-0">
                {/* Sidebar Navigation */}
                <div className="flex-shrink-0 lg:w-64">
                    <div className="mt-2 flex-1 self-center text-center">
                        <h1 className="mb-2 text-2xl md:text-3xl font-bold font-['DM-Sans']">{displayName}</h1>
                    </div>
                    <div className="sticky top-8 mt-8 rounded-lg bg-white p-8">
                        {/* Reviews Section */}
                        <div className="mb-4">
                            <button
                                onClick={() => setReviewsExpanded(!reviewsExpanded)}
                                className="mb-2 flex w-full items-center justify-between text-left font-semibold"
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src="profile_review.svg"
                                        alt="review icon"
                                        className="max-w-[20px]"
                                    />
                                    <span className="text-2xl">Reviews</span>
                                </div>
                                <svg
                                    className={`h-4 w-4 transition-transform ${reviewsExpanded ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {reviewsExpanded && (
                                <div className="relative ml-2 space-y-1">
                                    {/* Timeline vertical line */}
                                    <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-300"></div>

                                    {[
                                        { value: "approved", label: "Approved" },
                                        { value: "pending", label: "Pending" },
                                        { value: "rejected", label: "Rejected" },
                                        // { value: "liked-reviews", label: "Liked" },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => {
                                                setActiveSection(item.value);
                                                if (item.value === "rejected") {
                                                    handleViewRejected();
                                                }
                                            }}
                                            className={`ml-3 block w-full text-left text-[#6E808D] font-medium py-2 px-3 rounded-full relative ${activeSection === item.value ? "bg-[#F0F2F9]" : "hover:bg-[#F0F2F9]"
                                                }`}
                                        >
                                            <span className="flex items-center justify-between">
                                                {item.label}
                                                {item.value === "rejected" && unreadRejectedCount > 0 && (
                                                    <span
                                                        className="ml-2 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1"
                                                        style={{ background: 'linear-gradient(to right, #FFB464, #FFA1CD)' }}
                                                    >
                                                        {unreadRejectedCount}
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Clubs Section */}
                        <div>
                            <button
                                onClick={() => setClubsExpanded(!clubsExpanded)}
                                className="mb-2 flex w-full items-center justify-between text-left font-semibold"
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src="/profile_club.svg"
                                        alt="club icon"
                                        className="max-w-[20px]"
                                    />
                                    <span className="text-2xl">Clubs</span>
                                </div>
                                <svg
                                    className={`h-4 w-4 transition-transform ${clubsExpanded ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {clubsExpanded && (
                                <div className="relative ml-2 space-y-1">
                                    {/* Timeline vertical line */}
                                    <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-300"></div>

                                    {[
                                        { value: "liked-clubs", label: "Liked" },
                                        { value: "saved-clubs", label: "Saved" },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => setActiveSection(item.value)}
                                            className={`ml-3 block w-full text-left text-[#6E808D] font-medium py-2 px-3 rounded-full relative ${activeSection === item.value ? "bg-[#F0F2F9]" : "hover:bg-[#F0F2F9]"
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
                <div className="hidden w-px bg-gray-200 lg:block"></div>

                {/* Main Content Area */}
                <div className="min-h-[400px] flex-1">{getContentForSection()}</div>
            </div>
        </div>
    );
}

export default ProfilePage;