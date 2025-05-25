import Link from "next/link";

function ClubTags({ category }) {
  return (
    <span className="font-medium text-sm md:text-base text-black border border-black bg-[#ACC9FA] px-4 py-2 rounded-full">
      {category}
    </span>
  );
}

export default function ClubCard({ club }) {
  return (
    <Link
      href={`/clubs/details/${encodeURIComponent(club.OrganizationName)}`}
      className="w-full rounded-xl bg-white border px-4 py-6 md:px-10 md:py-10 space-y-4 md:space-y-5 transition-all duration-100 transform hover:drop-shadow-[12px_12px_0_#B1D49D]"
    >
      <h2 className="font-bold text-xl md:text-2xl text-black">
        {club.OrganizationName}
      </h2>

      <div className="flex flex-wrap gap-2">
        {club.Category1Name && <ClubTags category={club.Category1Name} />}
        {club.Category2Name && <ClubTags category={club.Category2Name} />}
      </div>

      <p className="font-normal text-sm md:text-base text-black line-clamp-4">
        {club.OrganizationDescription}
      </p>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
          <label className="font-bold text-xl text-black flex items-center">
            {club.average_satisfaction ? (
              <>
                {club.average_satisfaction}
                <span className="text-yellow-400 ml-1">★</span>
              </>
            ) : (
              <>
                N/A
                <span className="text-yellow-400 ml-1">★</span>
              </>
            )}
          </label>
          <label className="font-bold text-base text-black">
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
