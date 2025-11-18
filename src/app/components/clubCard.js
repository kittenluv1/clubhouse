import Link from "next/link";

export default function ClubCard({ club }) {
  return (
   
    <Link
      href={`/clubs/${encodeURIComponent(club.OrganizationName)}`}
      className="w-full transform space-y-4 rounded-xl bg-[#E6F4FF] px-4 py-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_13px_#1C6AB380] md:space-y-5 md:px-10 md:py-10"
    >
      <h2 className="text-xl font-bold text-black md:text-2xl">
        {club.OrganizationName}
      </h2>
      <div className="flex flex-wrap gap-2">
        {club.Category1Name &&
          <span className="rounded-full py-2 px-4 text-sm bg-[#FFCEE5] border-1 border-[#FFA1CD] hover:bg-[#FFB3D7]">
            {club.Category1Name}
          </span>}
        {club.Category2Name &&
          <span className="rounded-full py-2 px-4 text-sm bg-[#FFCEE5] border-1 border-[#FFA1CD] hover:bg-[#FFB3D7]">
            {club.Category2Name}
          </span>}
      </div>

      <p className="line-clamp-4 text-sm font-normal text-black md:text-base">
        {club.OrganizationDescription}
      </p>

      <div>
        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <label className="flex items-center text-xl font-bold text-black">
            {club.average_satisfaction ? (
              <>
                {club.average_satisfaction}
                <span className="ml-1 text-yellow-400">★</span>
              </>
            ) : (
              <>
                N/A
                <span className="ml-1 text-yellow-400">★</span>
              </>
            )}
          </label>
          <label className="text-base font-bold text-black">
            satisfaction rating
          </label>
        </div>
        <label className="text-base text-black italic">
          {club.total_num_reviews === 0
            ? "0 reviews"
            : `from ${club.total_num_reviews} trusted ${club.total_num_reviews === 1 ? "student" : "students"
            }`}
        </label>
      </div>
    </Link>
  );
}
