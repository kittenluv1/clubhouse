export default function PendingCard({ review, handleApprove, handleReject }) {
  return (
    <div className="px-[24px] md:px-[40px] py-[32px] md:py-[40px] rounded-[12px] w-full bg-[#FFFFFF] space-y-[20px] border">
      {/* Mobile: Buttons on top */}
      <div className="flex justify-end gap-2 mb-4 md:hidden">
        <button
          className="py-[8px] px-[20px] rounded-full font-bold hover:bg-black border hover:text-white bg-[#B1D49D] text-sm"
          onClick={() => handleApprove(review)}
        >
          Approve
        </button>
        <button
          className="py-[8px] px-[20px] rounded-full font-bold bg-[#FFA1CD] border hover:text-white hover:bg-black text-sm"
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
            <div className="flex flex-row gap-[4px] items-center">
              <label className="font-[var(--font-dm-sans)] font-bold text-[24px] md:text-[28px] text-black">
                {review.overall_satisfaction}
                <span className="text-yellow-400">★</span>
              </label>
            </div>
            <label className="font-[var(--font-dm-sans)] text-black text-sm md:text-base">
              {review.user_email}
            </label>
          </div>
        </div>

        {/* Desktop: Buttons stay in top-right */}
        <div className="hidden md:flex flex-row items-start gap-[8px]">
          <button
            className="py-[12px] px-[32px] rounded-full font-bold hover:bg-black border hover:text-white bg-[#B1D49D]"
            onClick={() => handleApprove(review)}
          >
            Approve
          </button>
          <button
            className="py-[12px] px-[32px] rounded-full font-bold bg-[#FFA1CD] border hover:text-white hover:bg-black"
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
