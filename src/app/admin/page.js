"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function PendingCard({ review, handleApprove, handleReject }) {
  return (
    <div className="px-[40px] py-[40px] rounded-[12px] w-full bg-[#FFFFFF] space-y-[20px] border">
      <div className="flex flex-row justify-between">
        <div>
          <div className="space-y-[4px]">
            <div>
              <label>{review.created_at.split("T")[0]}</label>
            </div>
            <div className="flex flex-row gap-[4px] items-center">
              <label className="font-[var(--font-dm-sans)] font-bold text-[28px] text-black">
                {review.overall_satisfaction}
                <span className="text-yellow-400">★</span>
              </label>
            </div>
            <div className="flex flex-row gap-[4px]">
              <label>{review.membership_start_quarter}</label>
              <label>{review.membership_start_year}</label>
              {" - "}
              <label>{review.membership_end_quarter}</label>
              <label>{review.membership_end_year}</label>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-start gap-[8px]">
          <button
            className="py-[12px] px-[32px] rounded-full font-bold hover:bg-[#B1D49D] bg-[#6E9461]"
            onClick={() => handleApprove(review.id)}
          >
            Approve
          </button>
          <button
            className="py-[12px] px-[32px]  rounded-full font-bold bg-[#FD81BF] hover:bg-[#FFD8EB]"
            onClick={() => handleReject(review.id)}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-[12px]">
        <div className="grid grid-cols-2">
          <div className="flex flex-col space-y-[4px]">
            <div className="flex flex-row gap-[4px]">
              <label className="font-bold">Time Commitment:</label>
              <label>{review.time_commitment_rating}</label>
            </div>
            <div className="flex flex-row gap-[4px]">
              <label className="font-bold">Diversity:</label>
              <label>{review.diversity_rating}</label>
            </div>
          </div>

          <div className="flex flex-col space-y-[4px]">
            <div className="flex flex-row gap-[4px]">
              <label className="font-bold">Social Community:</label>
              <label>{review.social_community_rating}</label>
            </div>
            <div className="flex flex-row gap-[4px]">
              <label className="font-bold">Competitiveness:</label>
              <label>{review.competitiveness_rating}</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <label>{review.review_text}</label>
      </div>
    </div>
  );
}

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

  const handleApprove = async (id) => {
    const response = await fetch("/api/pendingReviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewID: id, approve: true }),
    });

    if (response.ok) {
      console.log("Review approved");
      fetchPendingReviews();
    } else {
      console.error("Error approving review");
    }
  };

  const handleReject = async (id) => {
    const response = await fetch("/api/pendingReviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewID: id, approve: false }),
    });

    if (response.ok) {
      console.log("Review rejected");
      fetchPendingReviews();
    } else {
      console.error("Error rejecting review");
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
