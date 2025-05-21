"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "./search-bar";
import LoginButton from "./login-button";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/db";

function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false); // prevents SSR mismatch
  const [authChecked, setAuthChecked] = useState(false); // ensures session is loaded
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAdmin(session?.user?.email === "clubhouseucla@gmail.com");
      setAuthChecked(true);
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
    <div className="flex items-center justify-between w-full px-8 py-6 bg-[#DFEBFF]">
      {/* Left: Logo or empty spacer */}
      {pathname !== "/" ? (
        <button onClick={() => router.push("/")} className="flex items-center">
          <img
            src="/Logo Bar 2.png"
            alt="ClubHouse Logo"
            className="object-cover"
            width="210"
          />
        </button>
      ) : (
        <div className="w-[210px]" /> // same width as logo
      )}

      {/* Middle: Search Bar or flexible spacer */}
      {pathname !== "/" ? (
        <div className="flex-1 px-8">
          <SearchBar width="w-full" height="h-13" />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right: Action buttons */}
      <div className="flex items-center gap-6">
        <button onClick={attemptReview}>Add a Review</button>

        {authChecked && isAdmin && (
          <button onClick={() => router.push("/admin")}>Admin</button>
        )}

        <LoginButton />
      </div>
    </div>
  );
}

export default Header;
