"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/db";
import PendingCard from "../components/pendingCard";
import SortModal from "../components/sortModal";

const Page = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("newest");
  const [numPending, setNumPending] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const checkSession = async (session) => {
      const email = session?.user?.email;
      if (email !== "clubhouseucla@gmail.com") {
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
      const res = await fetch(`/api/pendingReviews?sort=${sortType}`);
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

  const handleApprove = async (record) => {
    try {
      const approveRes = await fetch("/api/pendingReviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        console.log("Sending approval email TO:", record.user_email),
      );

      if (!emailRes.ok) {
        const { error } = await emailRes.json().catch(() => ({}));
        console.error("Error sending email:", error || emailRes.statusText);
        return;
      }

      console.log("Review approved and email sent");
      fetchPendingReviews();
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleReject = async (record) => {
    try {
      const disproveRes = await fetch("/api/pendingReviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewID: record.id, approve: false }),
      });

      if (!disproveRes.ok) {
        console.error("Error disapproving review");
        return;
      }

      const emailRes = await fetch(
        `${process.env.NEXT_PUBLIC_EDGE_FUNCTION_URL}/send-user-disapprove-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            club_name: record.club_name,
            membership_start_quarter: record.membership_start_quarter,
            membership_start_year: record.membership_start_year,
            membership_end_quarter: record.membership_end_quarter,
            membership_end_year: record.membership_end_year,
            time_commitment_rating: record.time_commitment_rating,
            inclusivity_rating: record.inclusivity_rating,
            social_community_rating: record.social_community_rating,
            competitiveness_rating: record.competitiveness_rating,
            overall_satisfaction: record.overall_satisfaction,
            review_text: record.review_text,
            user_email: record.user_email,
          }),
        },
      );

      if (!emailRes.ok) {
        const { error } = await emailRes.json().catch(() => ({}));
        console.error("Error sending email:", error || emailRes.statusText);
        return;
      }

      console.log("Review disapproved and email sent");
      fetchPendingReviews();
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  if (!authChecked) return null;

  if (loading) {
    return <div className="space-y-6 p-6 md:p-[80px]">Loading reviews...</div>;
  }

  return (
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
                className="rounded-full border border-black bg-[#FFF7D6] px-4 py-2 font-bold"
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
              handleReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
