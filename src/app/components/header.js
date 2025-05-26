"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "./search-bar";
import { useRouter, usePathname } from "next/navigation";
import LoginButton from "./login-button";
import { supabase } from "../lib/db";

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    setIsMounted(true);

    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAdmin(session?.user?.email === "clubhouseucla@gmail.com");
    };

    checkAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAdmin(session?.user?.email === "clubhouseucla@gmail.com");
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  console.log("Header rendered at", pathname);

  const attemptReview = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      window.location.href = "/review";
    } else {
      window.location.href = "/sign-in";
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex w-full items-center justify-between overflow-hidden bg-[#DFEBFF] p-5 md:px-20 lg:py-6">
      {/* Left: Logo or placeholder */}
      {pathname !== "/" ? (
        <button onClick={() => router.push("/")} className="flex items-center">
          <img
            src="/clubhouse-logo-text.svg"
            alt="ClubHouse Logo"
            className="hidden md:w-3xs md:object-cover lg:block"
          />
          <img
            src="/clubhouse-star-logo.svg"
            alt="ClubHouse Logo"
            className="w-18 shrink-0 object-cover lg:hidden"
          />
        </button>
      ) : (
        <div className="w-3xs" /> // placeholder to preserve spacing
      )}

      {/* Center: Search Bar or spacer */}
      {pathname !== "/" ? (
        // show search bar when menu buttons are not open, or whenever not on mobile
        !showMobileMenu || !isMobile ? (
          <div className="flex-1 px-4 lg:px-8">
            <SearchBar width="w-full" height="h-13" />
          </div>
        ) : (
          <div className="flex-1" />
        )
      ) : (
        // Placeholder for search bar on homepage
        <div className="w-3xs" />
      )}

      {/* Right: Buttons */}
      <div
        className={`hidden items-center gap-2 p-0 md:gap-4 ${showMobileMenu || !isMobile ? "!flex" : ""} lg:flex`}
      >
        <button
          onClick={attemptReview}
          className="flex items-center gap-2 p-3 text-nowrap"
        >
          Add a Review
        </button>

        {isAdmin && (
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 p-3 text-nowrap"
          >
            Admin
          </button>
        )}

        <LoginButton />
      </div>

      {/* Mobile Hamburger Menu */}
      <button
        onClick={() => setShowMobileMenu((prev) => !prev)}
        className="shrink-0 p-2 md:hidden"
      >
        <img
          src="/hamburger-menu.svg"
          alt="Menu"
          className="w-10 shrink-0 object-fill md:hidden"
        />
      </button>
    </div>
  );
}

export default Header;
