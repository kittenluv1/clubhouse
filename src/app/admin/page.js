"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/db";
import PendingCard from "../components/pendingCard";
import SortModal from "../components/sortModal";
import Button from "../components/button";
import posthog from "posthog-js";

const PRESET_REASONS = [
  "The review is too brief, vague, or off-topic",
  "The review names specific individuals or has discriminatory/harassing/hateful language.",
  "The review content is not relevant to the club or organization being reviewed",
];

const Page = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("newest");
  const [numPending, setNumPending] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [customMessage, setCustomMessage] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const checkSession = async (session) => {
      const email = session?.user?.email;
      if (email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        window.location.href = "./sign-in";
      } else {
        setAuthChecked(true);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        checkSession(session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error('No session found');
        window.location.href = "./sign-in";
        return;
      }

      const res = await fetch(`/api/pendingReviews?sort=${sortType}`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        }
      });
      if (!res.ok) throw new Error("Failed to load");

      const { pendingReviews } = await res.json();
      setReviews(pendingReviews);
      setNumPending(pendingReviews.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) {
      fetchPendingReviews();
    }
  }, [sortType, authChecked]);

  const handleSortChange = (e) => {
    setSortType(e.target.value);
  };

  const openRejectModal = (record) => {
    setSelectedReview(record);
    setSelectedReasons([]);
    setCustomMessage("");
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    if (isRejecting) {
      return;
    }

    setShowRejectModal(false);
    setSelectedReview(null);
    setSelectedReasons([]);
    setCustomMessage("");
  };

  const toggleReason = (reason) => {
    setSelectedReasons((currentReasons) =>
      currentReasons.includes(reason)
        ? currentReasons.filter((item) => item !== reason)
        : [...currentReasons, reason],
    );
  };

  const handleApprove = async (record) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error('No session found');
        window.location.href = "./sign-in";
        return;
      }

      const approveRes = await fetch("/api/pendingReviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ reviewID: record.id, approve: true }),
      });

      if (!approveRes.ok) {
        console.error("Error approving review");
        return;
      }

      const emailRes = await fetch(
        `${process.env.NEXT_PUBLIC_EDGE_FUNCTION_URL}/send-user-approval-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            club_name: record.club_name,
            user_email: record.user_email,
          }),
        },
      );

      if (!emailRes.ok) {
        const { error } = await emailRes.json().catch(() => ({}));
        console.error("Error sending email:", error || emailRes.statusText);
        return;
      }

      posthog.capture("review_approved", { review_id: record.id, club_name: record.club_name });
      fetchPendingReviews();
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const confirmReject = async () => {
    if (!selectedReview) {
      return;
    }

    setIsRejecting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error('No session found');
        window.location.href = "./sign-in";
        return;
      }

      const rejectionFeedback = {
        preset_reasons: selectedReasons,
        custom_message: customMessage.trim(),
      };

      const disproveRes = await fetch("/api/pendingReviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reviewID: selectedReview.id,
          approve: false,
        }),
      });

      if (!disproveRes.ok) {
        const errorData = await disproveRes.json().catch(() => ({}));
        console.error("Error disapproving review:", errorData);
        return;
      }

      const emailRes = await fetch(
        `${process.env.NEXT_PUBLIC_EDGE_FUNCTION_URL}/send-user-disapprove-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            club_name: selectedReview.club_name,
            membership_start_quarter: selectedReview.membership_start_quarter,
            membership_start_year: selectedReview.membership_start_year,
            membership_end_quarter: selectedReview.membership_end_quarter,
            membership_end_year: selectedReview.membership_end_year,
            time_commitment_rating: selectedReview.time_commitment_rating,
            inclusivity_rating: selectedReview.inclusivity_rating,
            social_community_rating: selectedReview.social_community_rating,
            competitiveness_rating: selectedReview.competitiveness_rating,
            overall_satisfaction: selectedReview.overall_satisfaction,
            review_text: selectedReview.review_text,
            user_email: selectedReview.user_email,
            rejection_reasons: selectedReasons,
            custom_message: customMessage.trim(),
          }),
        },
      );

      if (!emailRes.ok) {
        const { error } = await emailRes.json().catch(() => ({}));
        console.error("Error sending email:", error || emailRes.statusText);
        return;
      }

      posthog.capture("review_rejected", {
        review_id: selectedReview.id,
        club_name: selectedReview.club_name,
        rejection_reasons: rejectionFeedback.preset_reasons,
        has_custom_message: Boolean(rejectionFeedback.custom_message),
      });

      closeRejectModal();
      fetchPendingReviews();
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  if (!authChecked) return null;

  if (loading) {
    return <div className="space-y-6 p-6 md:p-[80px]">Loading reviews...</div>;
  }

  return (
    <>
      <div className="space-y-6 p-6 md:p-[80px]">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center space-x-[4px]">
            <h1 className="text-[20px] font-bold text-black md:text-[28px]">
              Pending Reviews
            </h1>
            <h1 className="text-[20px] font-bold text-black md:text-[28px]">
              ({numPending})
            </h1>
          </div>

          <div className="flex w-auto items-center gap-2">
            {isMobile ? (
              <>
                <button
                  onClick={() => setShowSortModal(true)}
                  className="rounded-full border bg-[#FFF7D6] py-2 px-4 text-sm font-bold"
                >
                  Sort by
                </button>
                <SortModal
                  open={showSortModal}
                  onClose={() => setShowSortModal(false)}
                  selected={sortType}
                  onSelect={(newSort) => setSortType(newSort)}
                  sortOptions={[
                    { label: "Newest First", value: "newest" },
                    { label: "Oldest First", value: "oldest" },
                  ]}
                />
              </>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-black bg-[#FFF7D6] px-4 py-2">
                <label className="font-medium text-black">Sort by:</label>
                <select
                  id="sort"
                  value={sortType}
                  onChange={handleSortChange}
                  className="font-medium text-black"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {reviews.length === 0 ? (
          <p>No pending reviews.</p>
        ) : (
          <div className="space-y-[24px]">
            {reviews.map((review) => (
              <PendingCard
                key={review.id}
                review={review}
                handleApprove={handleApprove}
                handleReject={openRejectModal}
              />
            ))}
          </div>
        )}
      </div>

      {showRejectModal && selectedReview && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center px-4">
          <div
            onClick={closeRejectModal}
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
          />

          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Reject review</h3>
                <p className="mt-1 text-sm">
                  Select or write a reason for rejecting the review.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold">Preset reasons</p>
                <div className="mt-3 grid gap-3">
                  {PRESET_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 border-gray-300`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedReasons.includes(reason)}
                        onChange={() => toggleReason(reason)}
                        className="mt-1 h-4 w-4"
                      />
                      <span className="text-sm"> {reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="custom-message" className="text-sm font-semibold">
                  Optional Custom message
                </label>
                <textarea
                  id="custom-message"
                  value={customMessage}
                  onChange={(event) => setCustomMessage(event.target.value)}
                  placeholder="Add a short note for the reviewer..."
                  className="mt-3 min-h-[120px] w-full rounded-xl text-sm outline-none"
                  disabled={isRejecting}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="default"
                  onClick={closeRejectModal}
                  disabled={isRejecting}
                >
                  Cancel
                </Button>
                <Button
                  type="delete"
                  onClick={confirmReject}
                  disabled={isRejecting}
                >
                  {isRejecting ? "Rejecting..." : "Reject review"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
