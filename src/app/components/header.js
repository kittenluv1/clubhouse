"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "./search-bar";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/db";
import Button from "./button";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = React.useRef(null);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    setIsMounted(true);

    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      const s = data?.session ?? null;
      setIsLoggedIn(!!s);
      setIsAdmin(s?.user?.email === "clubhouseucla@gmail.com");
    };

    checkAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const current = session ?? null;
        setIsLoggedIn(!!current);
        setIsAdmin(current?.user?.email === "clubhouseucla@gmail.com");
      },
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      setIsLoggedIn(false);
      console.log("User signed out successfully");
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex w-full items-center justify-between bg-[#FFFFFF] p-3 lg:px-30 lg:py-6 min-h-[52px]">
      {/* Header is separated into 3 parts: LEFT, CENTER, RIGHT */}

      {/* LEFT: Logo =======================================================*/}
      {pathname !== "/" && (
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center"
        >
          <object
            type="image/svg+xml"
            data="/clubhouse-logo-desktop.svg"
            aria-label="ClubHouse Logo"
            className="pointer-events-none hidden object-cover lg:block lg:w-[200px] mr-7"
          />
          <object
            type="image/svg+xml"
            data="/clubhouse-logo-mobile.svg"
            aria-label="ClubHouse Logo"
            className="pointer-events-none w-18 shrink-0 object-cover lg:hidden"
          />
        </button>
      )}

      {/* =============================CENTER: Search Bar============================ */}
      {pathname !== "/" ? (
        <div className="flex-1 mr-2">
          <SearchBar />
        </div>
      ) : (
        // placeholder for homepage /
        <div className="w-3xs" />
      )}

      {/* =========================================================RIGHT: Buttons */}
      <div className="relative h-full">
        <div className="flex justify-center items-center gap-2">
          {// show this button in the header on desktop only
            isAdmin ? (
              <Button
                type="CTA"
                onClick={() => router.push("/admin")}
                style="hidden md:flex"
              >
                Admin
              </Button >
            ) : (
              <Button
                onClick={attemptReview}
                style="hidden md:flex"
              >
                Write a Review
              </Button>
            )
          }

          {// Profile button 
            isLoggedIn && (
              <div ref={profileRef}>

                {/* profile button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu((prev) => !prev);
                  }}
                  className="relative flex items-center"
                  aria-label="Sign out"
                >
                  <img src="/profile.svg" className="h-12" alt="Profile" />
                </button>

                {/* profile menu */}
                {showProfileMenu && (
                  <div className="absolute top-full right-1 mt-1 w-50 shadow-[0_0_15px_#262B6A26] rounded-lg z-20 bg-white">
                    <button
                      className="flex items-center w-full px-2 py-2 hover:bg-[#F0F2F9]"
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push("/profile");
                      }}
                    >
                      <img src="/profile.svg" className="w-10 h-10 mx-2" alt="Profile" />
                      <div className="flex flex-col items-start">
                        <p className="m-0 leading-tight">View Profile</p>
                        <p className="text-[#A6B0B8] text-sm m-0 leading-tight">@FluffyBruin</p>
                      </div>
                    </button>

                    { // these options only displayed here on mobile
                      isAdmin ? (
                        <div className="md:hidden">
                          <hr className="w-full bg-gray-300" />
                          <button
                            className="flex items-center w-full px-2 py-2 hover:bg-[#F0F2F9]"
                            onClick={() => {
                              setShowProfileMenu(false);
                              router.push("/admin");
                            }}
                          >
                            <img src="/review_1.svg" className="w-4 h-4 mx-5" alt="Admin" />
                            <div className="flex flex-col items-start">
                              <p className="m-0 leading-tight">Admin</p>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div className="md:hidden">
                          <hr className="w-full bg-gray-300" />
                          <button
                            className="flex items-center w-full px-2 py-2 hover:bg-[#F0F2F9]"
                            onClick={attemptReview}
                          >
                            <img src="/edit-review.svg" className="w-4 h-4 mx-5" alt="Sign Out" />
                            <div className="flex flex-col items-start">
                              <p className="m-0">Write a Review</p>
                            </div>
                          </button>
                        </div>
                      )}

                    <hr className="w-full bg-gray-300" />
                    <button
                      className="flex items-center w-full px-2 py-2 hover:bg-[#F0F2F9]"
                      onClick={handleSignOut}
                    >
                      <img src="/sign-out.svg" className="w-4 h-4 mx-5" alt="Sign Out" />
                      <div className="flex flex-col items-start">
                        <p className="m-0">Sign Out</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

          {!isLoggedIn && (
            <Button
              type="CTA"
              onClick={() => router.push("/sign-in")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
