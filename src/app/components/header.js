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

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email === "clubhouseucla@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    // initial check
    checkAdmin();

    // subscribe to auth changes (so that buttons work accordingly when user logs in/out)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user?.email === "clubhouseucla@gmail.com") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // cleanup on unmount
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

  return (
    <>
      <div className="grid grid-cols-18 items-center w-full gap-4 pb-3 pt-8 bg-[#DFEBFF]">
        <div className="col-span-4 flex justify-center">
          {pathname !== "/" && (
            <button
              onClick={() => router.push("/")}
              className="p-3 self-center text-nowrap flex items-center gap-2"
            >
              <img
                src={"/Logo Bar 2.png"}
                alt="ClubHouse Logo"
                className="object-cover"
                width="210"
              />
            </button>
          )}
        </div>

        <div className="col-span-9">
          {pathname !== "/" && <SearchBar width="w-full" height="h-13" />}
        </div>

        <div className="col-span-2 flex justify-center">
          <button
            onClick={attemptReview}
            className="p-3 self-center text-nowrap flex items-center gap-2"
          >
            Add a Review
          </button>
        </div>

        <div className="col-span-2 flex justify-center gap-3">
          {isAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className="p-3 self-center text-nowrap flex items-center gap-3"
            >
              Admin
            </button>
          )}
          <LoginButton />
        </div>
      </div>
    </>
  );
}

export default Header;
