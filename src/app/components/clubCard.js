import Link from "next/link";
import Image from "next/image";

function ClubTags({category}) {
    return (
        <span className="font-[var(--font-dm-sans)] font-medium text-[16px] text-black border border-black bg-[#ACC9FA] px-[16px] py-[8px] rounded-full">
            {category}
        </span>
    );
}

export default function ClubCard({ club }) {
    return (
        <Link 
            href={`/clubs/${encodeURIComponent(club.OrganizationName)}`}
            className="p-[40px] rounded-[12px] w-full bg-[#FFFFFF] space-y-[20px] border transition-all duration-200 hover:drop-shadow-[8px_8px_0_#B1D49D]"
            >
       
            <h2 className="font-[var(--font-dm-sans)] font-bold text-[28px] text-black">
                {club.OrganizationName}
            </h2>
           
        <div className="flex flex-row flex-wrap space-x-[8px]">
            <ClubTags category={club.Category1Name} />
            <ClubTags category={club.Category2Name} />
        </div>
        <p className="font-[var(--font-dm-sans)] font-normal text-[16px] text-black">{club.OrganizationDescription}</p>
        
        
        <div>
            <div className="flex flex-row items-center space-x-[8px]">
            <label className="font-[var(--font-dm-sans)] font-bold text-[28px] text-black">{club.average_satisfaction ? (
                <>
                    {club.average_satisfaction}
                    <span className="text-yellow-400">★</span>
                </>
                ) : (
                <>
                    N/A
                    <span className="text-yellow-400">★</span>
                </>
                )}</label>
            <label className="font-[var(--font-dm-sans)] font-bold text-[20px] text-black">satisfaction rating</label>
            </div>
            <label className="font-[var(--font-dm-sans)] text-[20px] text-black italic">
                {club.total_num_reviews === 0
                ? "0 reviews"
                : `from ${club.total_num_reviews} trusted ${club.total_num_reviews === 1 ? "student" : "students"}`}
            </label>
        </div>
        </Link>
    );
}