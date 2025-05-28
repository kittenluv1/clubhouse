"use client";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white">
      {/* gradient??? */}
      <div className="m-20 flex flex-col items-center justify-center space-y-10 text-center lg:space-y-20">
        <p className="z-10 mt-10 text-3xl lg:mt-30">404 - Not Found</p>
        <p className="z-10 text-xl">
          Sorry! We couldn't find the page you're looking for.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="z-10 text-base underline transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
