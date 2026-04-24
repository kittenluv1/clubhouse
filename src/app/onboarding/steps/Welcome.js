"use client";

import Image from "next/image";

export default function Welcome() {
  return (
    <div className="flex min-h-[440px] flex-col items-center justify-center px-6 pb-8 pt-2 text-center">
      <div className="max-w-[576px]">
        <h1 className="text-[24px] font-semibold leading-none text-[#1C350F]">
          Welcome to Clubhouse!
        </h1>
        <p className="mt-5 text-[16px] font-normal leading-none text-[#6E808D]">
          Set up your personalized club recommendations—you can edit them anytime.
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <Image
          src="/welcomebear.svg"
          alt="Welcome bear illustration"
          width={220}
          height={220}
          priority
          className="h-auto w-[220px] max-w-full"
        />
      </div>
    </div>
  );
}
