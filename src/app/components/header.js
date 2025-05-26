"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "./search-bar";
import Button from "./button";
import { useRouter, usePathname } from "next/navigation";
import LoginButton from "./login-button";
import { supabase } from "../lib/db";

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
    <div className="flex w-full items-center justify-between overflow-hidden bg-[#DFEBFF] p-5 lg:px-20 lg:py-6">
      {/* Left: Logo or placeholder */}
      {pathname !== "/" ? (
        <button onClick={() => router.push("/")} className="flex items-center">
          <img
            src="/clubhouse-logo-text.svg"
            alt="ClubHouse Logo"
            className="hidden md:block md:w-3xs md:object-cover"
          />
          <img
            src="/clubhouse-star-logo.svg"
            alt="ClubHouse Logo"
            className="w-18 object-cover lg:hidden"
          />
        </button>
      ) : (
        <div className="w-3xs" /> // placeholder to preserve spacing
      )}

      {/* Center: Search Bar or spacer */}
      {pathname !== "/" ? (
        <div className="flex-1 px-4 lg:px-8">
          <SearchBar width="w-full" height="h-13" />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right: Buttons */}
      <div className="hidden lg:flex lg:items-center lg:gap-4">
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
      <button>
        <img
          src="/hamburger-menu.svg"
          alt="Menu"
          className="w-10 object-fill lg:hidden"
          // onClick={() => router.push("/menu")}
        />
        {/* toggle between 'nav' (default) and 'menu options' */}
      </button>
    </div>
  );
}

export default Header;
