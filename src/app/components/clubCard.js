import Link from "next/link";
import Image from "next/image";

function ClubTags({category}) {
    return (
        <span className="font-[var(--font-inter)] font-normal text-[16px] text-black border-1 border-[#272727] bg-[#7AA8F5] px-[16px] py-[8px] rounded-full">
            {category}
        </span>
    );
}

export default function ClubCard({ club }) {
    return (
        <Link 
            href={`/clubs/details/${encodeURIComponent(club.OrganizationName)}`}
            className="p-[40px] rounded-[12px] w-full bg-[#FFFFFF] space-y-[20px] hover:shadow-lg transition-all duration-200 border border-[#000000]"

        >
        <div className="flex flex-row justify-between items-center">
            <h2 className="font-[var(--font-inter)] font-medium text-[28px] text-black">
                {club.OrganizationName}
            </h2>
            <div className="relative">
            <Image
                src="/clubRating.png"
                alt="Club Icon"
                width={61.33}
                height={68.7}
                className="object-contain"
            />
            <p className="absolute top-3/5 left-1/2 transform -translate-x-1/2 -translate-y-[52%] text-black font-[var(--font-inter)] text-[28px] font-medium leading-none">
                {club.average_satisfaction ? club.average_satisfaction : "N/A"}
            </p>
            </div>
        </div>
        <div className="flex flex-row flex-wrap space-x-[8px]">
            <ClubTags category={club.Category1Name} />
            <ClubTags category={club.Category2Name} />
        </div>
        <p className="font-[var(--font-inter)] font-normal text-[16px] text-black">{club.OrganizationDescription}</p>
        </Link>
    );
}