"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "./search-bar";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { getAvatarUrl } from "../lib/avatars";
import Button from "./button";
import posthog from "posthog-js";

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = React.useRef(null);

  const attemptReview = () => {
    if (user) {
      router.push("/review");
    } else {
      router.push("/sign-in?returnUrl=%2Freview");
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

  return (
    <div
      className={`fixed top-0 left-0 z-50 flex min-h-[52px] w-full items-center justify-between bg-[#FFFFFF] p-2 md:px-20 lg:px-30 lg:py-4 ${pathname === "/" ? "shadow-[0_4px_8px_0_rgba(0,0,0,0.03)]" : "shadow-[0_4px_8px_0_rgba(0,0,0,0.07)]"}`}
    >
      {/* Header is separated into 3 parts: LEFT, CENTER, RIGHT */}

      {/* LEFT: Logo =======================================================*/}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="flex items-center"
      >
        <img
          src="/clubhouse-logo-desktop.svg"
          alt="ClubHouse Logo"
          className="pointer-events-none mr-7 hidden object-cover lg:block lg:w-[178px]"
        />
        <img
          src="/clubhouse-logo-mobile.svg"
          alt="ClubHouse Logo"
          className="pointer-events-none w-18 shrink-0 object-cover lg:hidden"
        />
      </button>

      {/* =============================CENTER: Search Bar============================ */}
      {pathname !== "/" ? (
        <div className="mr-2 flex-1">
          <SearchBar />
        </div>
      ) : (
        // placeholder for homepage /
        <div className="w-3xs" />
      )}

      {/* =========================================================RIGHT: Buttons */}
      <div className="relative h-full">
        <div className="flex items-center justify-center gap-2">
          {
            // show this button in the header on desktop only
            isAdmin ? (
              <Button
                type="CTA"
                onClick={() => router.push("/admin")}
                style="hidden md:flex"
              >
                Admin
              </Button>
            ) : (
              <Button onClick={attemptReview} style="hidden md:flex">
                Write a Review
              </Button>
            )
          }

          {
            // Profile button
            user?.email && (
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
                  <img
                    src={
                      profile ? getAvatarUrl(profile.avatar_id) : "/profile.svg"
                    }
                    className="h-12 rounded-full transition hover:ring-2 hover:ring-gray-200"
                    alt="Profile"
                  />
                </button>

                {/* profile menu */}
                {showProfileMenu && (
                  <div className="absolute top-full right-0 z-20 mt-1 w-max max-w-[200px] rounded-lg bg-white shadow-[0_0_15px_#262B6A26] md:max-w-none">
                    <button
                      className="flex w-full items-center rounded-t-lg px-2 py-2 hover:bg-[#F0F2F9]"
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push("/profile");
                      }}
                    >
                      <img
                        src={
                          profile
                            ? getAvatarUrl(profile.avatar_id)
                            : "/profile.svg"
                        }
                        className="mx-2 h-10 w-10 shrink-0 rounded-full"
                        alt="Profile"
                      />
                      <div className="mr-2 flex min-w-0 flex-col items-start">
                        <p className="m-0 leading-tight">View Profile</p>
                        <p className="m-0 max-w-[120px] truncate text-sm leading-tight text-[#A6B0B8] md:max-w-none">
                          {user?.email}
                        </p>
                      </div>
                    </button>

                    {
                      // these options only displayed here on mobile
                      isAdmin ? (
                        <div className="md:hidden">
                          <hr className="w-full bg-gray-300" />
                          <button
                            className="flex w-full items-center px-2 py-2 hover:bg-[#F0F2F9]"
                            onClick={() => {
                              setShowProfileMenu(false);
                              router.push("/admin");
                            }}
                          >
                            <img
                              src="/review/review_1.svg"
                              className="mx-5 h-4 w-4"
                              alt="Admin"
                            />
                            <div className="flex flex-col items-start">
                              <p className="m-0 leading-tight">Admin</p>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div className="md:hidden">
                          <hr className="w-full bg-gray-300" />
                          <button
                            className="flex w-full items-center px-2 py-2 hover:bg-[#F0F2F9]"
                            onClick={attemptReview}
                          >
                            <img
                              src="/review/edit-review.svg"
                              className="mx-5 h-4 w-4"
                              alt="Sign Out"
                            />
                            <div className="flex flex-col items-start">
                              <p className="m-0">Write a Review</p>
                            </div>
                          </button>
                        </div>
                      )
                    }

                    <hr className="w-full bg-gray-300" />
                    <button
                      className="flex w-full items-center rounded-b-lg px-2 py-2 hover:bg-[#F0F2F9]"
                      onClick={signOut}
                    >
                      <img
                        src="/profile/sign-out.svg"
                        className="mx-5 h-4 w-4 shrink-0"
                        alt="Sign Out"
                      />
                      <div className="flex flex-col items-start">
                        <p className="m-0 whitespace-nowrap">Sign Out</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )
          }

          {!user?.email && (
            <Button
              type="CTA"
              onClick={() => {
                router.push("/sign-in");
              }}
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
