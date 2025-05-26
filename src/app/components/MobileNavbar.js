"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function MobileNavbar() {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleHomeClick = () => {
    router.push("/clubs");
  };

  const handleReviewClick = () => {
    router.push("/review");
  };

  const handleSignInClick = () => {
    router.push("/sign-in");
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black z-50 lg:hidden">
      <div className="flex justify-around items-center py-3">
        <button
          onClick={handleHomeClick}
          className="flex flex-col items-center justify-center p-2 flex-1"
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={handleReviewClick}
          className="flex flex-col items-center justify-center p-2 flex-1"
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
          <span className="text-xs font-medium">Review</span>
        </button>

        <button
          onClick={handleSignInClick}
          className="flex flex-col items-center justify-center p-2 flex-1"
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span className="text-xs font-medium">Sign In</span>
        </button>
      </div>
    </div>
  );
}

export default MobileNavbar;