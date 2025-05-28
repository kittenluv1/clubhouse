export default function PendingCard({ review, handleApprove, handleReject }) {
  return (
    <div className="w-full space-y-[20px] rounded-[12px] border bg-[#FFFFFF] px-[24px] py-[32px] md:px-[40px] md:py-[40px]">
      {/* Mobile: Buttons on top */}
      <div className="mb-4 flex justify-end gap-2 md:hidden">
        <button
          className="rounded-full border bg-[#B1D49D] px-[20px] py-[8px] text-sm font-bold hover:bg-black hover:text-white"
          onClick={() => handleApprove(review)}
        >
          Approve
        </button>
        <button
          className="rounded-full border bg-[#FFA1CD] px-[20px] py-[8px] text-sm font-bold hover:bg-black hover:text-white"
          onClick={() => handleReject(review)}
        >
          Reject
        </button>
      </div>

      <div className="flex flex-row justify-between">
        <div>
          <div className="space-y-[4px]">
            <div>
              <label>{review.created_at.split("T")[0]}</label>
            </div>
            <div className="flex flex-row items-center gap-[4px]">
              <label className="text-[24px] font-[var(--font-dm-sans)] font-bold text-black md:text-[28px]">
                {review.overall_satisfaction}
                <span className="text-yellow-400">★</span>
              </label>
            </div>
            <label className="text-sm font-[var(--font-dm-sans)] text-black md:text-base">
              {review.user_email}
            </label>
          </div>
        </div>

        {/* Desktop: Buttons stay in top-right */}
        <div className="hidden flex-row items-start gap-[8px] md:flex">
          <button
            className="rounded-full border bg-[#B1D49D] px-[32px] py-[12px] font-bold hover:bg-black hover:text-white"
            onClick={() => handleApprove(review)}
          >
            Approve
          </button>
          <button
            className="rounded-full border bg-[#FFA1CD] px-[32px] py-[12px] font-bold hover:bg-black hover:text-white"
            onClick={() => handleReject(review)}
          >
            Reject
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-[12px]">
        <div className="flex flex-row gap-[4px]">
          <label className="font-bold">Club:</label>
          <label className="font-[var(--font-dm-sans)] text-black">
            {review.club_name}
          </label>
        </div>
        <div className="flex flex-row gap-[4px]">
          <label className="font-bold">Duration:</label>
          <div className="flex flex-row gap-[4px]">
            <label>{review.membership_start_quarter}</label>
            <label>{review.membership_start_year}</label>
            {" - "}
            <label>{review.membership_end_quarter}</label>
            <label>{review.membership_end_year}</label>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="flex flex-col space-y-[4px]">
            <div className="flex flex-row gap-[4px]">
              <label className="font-bold">Time Commitment:</label>
              <label>{review.time_commitment_rating}</label>
            </div>
            <div className="flex flex-row gap-[4px]">
              <label className="font-bold">Inclusivity:</label>
              <label>{review.inclusivity_rating}</label>
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
