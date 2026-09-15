"use client";

import { useRouter } from "next/navigation";
import Button from "@/app/components/button";

export default function ThankYouPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center md:p-40">
      <object
        type="image/svg+xml"
        data="/review/review-submitted.svg"
        aria-label="ClubHouse Logo"
        className="mb-8 w-60 overflow-hidden align-middle leading-none"
      />
      <h1 className="mb-4 text-center text-5xl font-bold">Thank you!</h1>
      <p className="mb-10 font-medium text-[#6E808D]">
        Your review has been sent! <br /> You will receive an email once your
        submission has been approved.
      </p>
      <Button type="CTA" onClick={() => router.push("/clubs")}>
        Browse More Clubs
      </Button>
    </div>
  );
}
