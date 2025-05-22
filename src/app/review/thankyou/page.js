"use client";

export default function ThankYouPage() {
  return (
    <div className="flex flex-col justify-center items-center p-20">
      <img src="/empty-star-logo.svg" alt="clubhouse star logo" className="w-1/4 mb-8" />
      <h1 className="text-6xl font-bold text-center mb-4">Thank you!</h1>
      <p className="text-4x1 font-semibold m-2">Your review has been sent!</p>
      <p className="text-4x1 font-semibold m-2">You will receive an email once your submission has been reviewed. </p>
    </div>
  );
}
