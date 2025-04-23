import Link from "next/link";
import Image from "next/image";

function ClubTags({category}) {
    return (
        <span className="font-[var(--font-inter)] font-normal text-[16px] text-black bg-[#E0E0E0] px-[16px] py-[8px] rounded-full">
            {category}
        </span>
    );
}

export default function ClubCard({ club }) {
    return (
        <Link 
            href={`/clubs/${encodeURIComponent(club.OrganizationName)}`}
            className="p-[40px] justify-center items-center rounded-[12px] w-full bg-[#F2F2F2] space-y-[20px] hover:bg-[#D1D1D1] transition-colors duration-200"
        >
        <div className="flex flex-row justify-between items-center">
            <h2 className="font-[var(--font-inter)] font-medium text-[28px] text-black">
                {club.name}
            </h2>
            <div className="relative w-[61.33px] h-[68.7px]">
            <Image
                src="/clubRating.png"
                alt="Club Icon"
                fill
                className="object-contain"
            />
            <p className="absolute top-3/5 left-1/2 transform -translate-x-1/2 -translate-y-[52%] text-black font-[var(--font-inter)] text-[28px] font-medium leading-none">
                4.8
            </p>
            </div>
        </div>
        <div className="flex flex-row flex-wrap space-x-[8px]">
            <ClubTags category={club.Category1Name} />
            <ClubTags category={club.Category2Name} />
        </div>
        <p className="font-[var(--font-inter)] font-normal text-[16px] text-black">{club.description}</p>

        <p className="font-[var(--font-inter)] font-normal text-[16px] text-black">Reviewed by ... students</p>
        </Link>
    );
}