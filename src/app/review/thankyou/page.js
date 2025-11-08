"use client";

import Button from "@/app/components/button";

export default function ThankYouPage() {
  return (
    <div className="flex flex-col items-center justify-center p-20 md:p-10 text-center">
      <object
        type="image/svg+xml"
        data="/review-submitted.svg"
        aria-label="ClubHouse Logo"
        className="mb-8 overflow-hidden align-middle leading-none w-60"
      />
      <h1 className="mb-4 text-center text-5xl font-bold">Thank you!</h1>
      <p className="font-medium text-[#6E808D] mb-10">Your review has been sent! <br /> You will receive an email once your submission has been approved.</p>
      <Button
        type="CTA"
        onClick={() => window.location.href = '/clubs'}
      >
        Browse More Clubs
      </Button>
    </div>
  );
}
