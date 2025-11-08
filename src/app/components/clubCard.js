import Link from "next/link";

function ClubTags({ category }) {
  return (
    <span className="rounded-full border border-black bg-[#ACC9FA] px-4 py-2 text-sm font-medium text-black md:text-base">
      {category}
    </span>
  );
}

export default function ClubCard({ club }) {
  return (
   
    <Link
      href={`/clubs/${encodeURIComponent(club.OrganizationName)}`}
      className="w-full transform space-y-4 rounded-xl border bg-white px-4 py-6 transition-all duration-100 hover:drop-shadow-[12px_12px_0_#B1D49D] md:space-y-5 md:px-10 md:py-10"
    >
      <h2 className="text-xl font-bold text-black md:text-2xl">
        {club.OrganizationName}
      </h2>
      <div className="flex flex-wrap gap-2">
        {club.Category1Name && <ClubTags category={club.Category1Name} />}
        {club.Category2Name && <ClubTags category={club.Category2Name} />}
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
            : `from ${club.total_num_reviews} trusted ${
                club.total_num_reviews === 1 ? "student" : "students"
              }`}
        </label>
      </div>
    </Link>
  );
}
