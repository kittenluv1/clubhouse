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
      }
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
    <div className="flex items-center justify-between w-full px-20 py-6 bg-[#DFEBFF]">
      {/* Left: Logo or placeholder */}
      {pathname !== "/" ? (
        <button onClick={() => router.push("/")} className="flex items-center">
          <img
            src="/clubhouse-logo-text.svg"
            alt="ClubHouse Logo"
            className="object-cover"
            width="210"
          />
        </button>
      ) : (
        <div className="w-[210px]" /> // placeholder to preserve spacing
      )}

      {/* Center: Search Bar or spacer */}
      {pathname !== "/" ? (
        <div className="flex-1 px-8">
          <SearchBar width="w-full" height="h-13" />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right: Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={attemptReview}
          className="p-3 text-nowrap flex items-center gap-2"
        >
          Add a Review
        </button>

        {isAdmin && (
          <button
            onClick={() => router.push("/admin")}
            className="p-3 text-nowrap flex items-center gap-2"
          >
            Admin
          </button>
        )}

        <LoginButton />
      </div>
    </div>
  );
}

export default Header;
