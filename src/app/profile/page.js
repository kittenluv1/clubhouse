"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";
import ClubCard from "../components/clubCard";

function ProfilePage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState("approved");
    const [reviewsExpanded, setReviewsExpanded] = useState(true);
    const [clubsExpanded, setClubsExpanded] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
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

        const fetchReviews = async () => {
            // TODO: Implement database call
            // Mock data for now
            setReviews([]);
        };

        fetchReviews();
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
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    const pendingReviews = reviews.filter(r => r.status === 'pending');
    const rejectedReviews = reviews.filter(r => r.status === 'rejected');
    const likedReviews = reviews.filter(r => r.liked);

    const getContentForSection = () => {
        switch(activeSection) {
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
                    <div className="space-y-6">
                        {
                            //TODO CARD
                        }
                    </div>
                );
            
            case "pending":
                return pendingReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#B5BEC7]">No pending reviews</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {
                            //TODO CARD
                        }
                    </div>
                );
            
            case "rejected":
                return rejectedReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#B5BEC7]">No rejected reviews</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {
                            //TODO CARD
                        }
                    </div>
                );
            
            case "liked-reviews":
                return likedReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#B5BEC7]">No liked reviews</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {
                            //TODO CARD
                        }
                    </div>
                );
            
            case "liked-clubs":
                return likedClubs.length === 0 ? (
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
                    <div className="grid grid-cols-1 gap-12">
                        {likedClubs.map((club) => (
                            <ClubCard
                                key={`${club.OrganizationID}-${club.OrganizationName}`}
                                club={club}
                            />
                        ))}
                    </div>
                );
            
            case "saved-clubs":
                return savedClubs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#B5BEC7]">No saved clubs</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-12">
                        {savedClubs.map((club) => (
                            <ClubCard
                                key={`${club.OrganizationID}-${club.OrganizationName}`}
                                club={club}
                            />
                        ))}
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
                    <div className="bg-white rounded-lg p-4 sticky top-4">
                        {/* Reviews Section */}
                        <div className="mb-4">
                            <button
                                onClick={() => setReviewsExpanded(!reviewsExpanded)}
                                className="flex items-center justify-between w-full text-left font-medium mb-2"
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`w-4 h-4 rounded-full border-2 ${activeSection.includes('review') || activeSection === 'approved' || activeSection === 'pending' || activeSection === 'rejected' || activeSection === 'liked-reviews' ? 'border-black' : 'border-gray-300'}`}>
                                        {(activeSection.includes('review') || activeSection === 'approved' || activeSection === 'pending' || activeSection === 'rejected' || activeSection === 'liked-reviews') && (
                                            <span className="block w-2 h-2 bg-black rounded-full m-0.5"></span>
                                        )}
                                    </span>
                                    <span>Reviews</span>
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
                                    
                                    <button
                                        onClick={() => setActiveSection("approved")}
                                        className={`ml-3 block w-full text-left py-2 px-3 rounded rounded-full relative ${
                                            activeSection === "approved" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        Approved
                                    </button>
                                    <button
                                        onClick={() => setActiveSection("pending")}
                                        className={`ml-3 block w-full text-left py-2 px-3 rounded rounded-full relative ${
                                            activeSection === "pending" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => setActiveSection("rejected")}
                                        className={`ml-3 block w-full text-left py-2 px-3 rounded rounded-full relative ${
                                            activeSection === "rejected" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        Rejected
                                    </button>
                                    <button
                                        onClick={() => setActiveSection("liked-reviews")}
                                        className={`ml-3 block w-full text-left py-2 px-3 rounded rounded-full relative ${
                                            activeSection === "liked-reviews" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        Liked
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Clubs Section */}
                        <div>
                            <button
                                onClick={() => setClubsExpanded(!clubsExpanded)}
                                className="flex items-center justify-between w-full text-left font-medium mb-2"
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`w-4 h-4 rounded-full border-2 ${activeSection.includes('club') ? 'border-black' : 'border-gray-300'}`}>
                                        {activeSection.includes('club') && (
                                            <span className="block w-2 h-2 bg-black rounded-full m-0.5"></span>
                                        )}
                                    </span>
                                    <span>Clubs</span>
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
                                    
                                    <button
                                        onClick={() => setActiveSection("liked-clubs")}
                                        className={`ml-3 block w-full text-left py-2 px-3 rounded rounded-full relative ${
                                            activeSection === "liked-clubs" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        Liked
                                    </button>
                                    <button
                                        onClick={() => setActiveSection("saved-clubs")}
                                        className={`ml-3 block w-full text-left py-2 px-3 rounded rounded-full relative ${
                                            activeSection === "saved-clubs" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        Saved
                                    </button>
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