"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PendingCard from "../components/pendingCard";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Page = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("newest");
  const [numPending, setNumPending] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);

  // Check admin access before rendering
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const email = session?.user?.email;
      if (email !== "clubhouseucla@gmail.com") {
        window.location.href = "./sign-in";
      } else {
        setAuthChecked(true);
      }
    };

    checkSession();
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

  // Fetch reviews when sortType changes
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
      // Step 1: Approve the review
      const approveRes = await fetch("/api/pendingReviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewID: record.id, approve: true }),
      });

      if (!approveRes.ok) {
        console.error("Error approving review");
        return;
      }

      // Step 2: Send the email
      const emailRes = await fetch(
        "https://tmvimczmnplaucwwnstn.supabase.co/functions/v1/send-user-approval-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            club_name: record.club_name,
            user_email: record.user_email,
          }),
        }
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
      // Step 1: Disapprove the review in Supabase
      const disproveRes = await fetch("/api/pendingReviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewID: record.id, approve: false }),
      });

      if (!disproveRes.ok) {
        console.error("Error disapproving review");
        return;
      }

      // Step 2: Send disapproval email via Supabase Function
      const emailRes = await fetch(
        "https://tmvimczmnplaucwwnstn.supabase.co/functions/v1/send-user-disapprove-email",
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
            diversity_rating: record.diversity_rating,
            social_community_rating: record.social_community_rating,
            competitiveness_rating: record.competitiveness_rating,
            overall_satisfaction: record.overall_satisfaction,
            review_text: record.review_text,
            user_email: record.user_email,
          }),
        }
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
    return <div className="p-[80px] space-y-6">Loading reviews...</div>;
  }

  return (
    <div className="p-[80px] space-y-6">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row space-x-[4px]">
          <h1 className="font-[var(--font-dm-sans)] font-bold text-[28px] text-black">
            Pending Reviews
          </h1>
          <h1 className="font-[var(--font-dm-sans)] font-bold text-[28px] text-black">
            ({numPending})
          </h1>
        </div>

        <div className="flex items-center gap-2 border border-black rounded-full bg-[#FFF7D6] px-4 py-2">
          <label className="font-medium text-black">Sort by:</label>
          <select
            id="sort"
            value={sortType}
            onChange={handleSortChange}
            className="text-black font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
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
