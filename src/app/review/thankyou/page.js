"use client";

export default function ThankYouPage() {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center">
      <object
        type="image/svg+xml"
        data="/empty-star-logo.svg"
        aria-label="ClubHouse Logo"
        className="mb-8 w-40 md:w-1/4"
      />
      <h1 className="mb-4 text-center text-6xl font-bold">Thank you!</h1>
      <p className="text-4x1 m-2 font-semibold">Your review has been sent!</p>
      <p className="text-4x1 m-2 font-semibold">
        You will receive an email once your submission has been approved.{" "}
      </p>
    </div>
  );
}
