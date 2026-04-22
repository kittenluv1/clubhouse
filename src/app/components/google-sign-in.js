"use client";

import Button from "./button";
import Script from "next/script";
import { useState, useEffect, useRef} from "react";
import { supabase } from "../lib/db";
import { useSearchParams } from "next/navigation";
import { isValidReturnUrl } from "../utils/redirect";


export default function GoogleSignIn() {
  // userEmail is either:
  // null (logged out), string (logged in), or INVALID (invalid email)
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const club = searchParams.get('club');
  const clubId = searchParams.get('clubId');
  const [hovered, setHovered] = useState(false);
  const hoverTimeout = useRef(null);


  // Render the Google Sign-In button (called on render & auth state change)
  const renderGoogleButton = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: window.handleCredentialResponse,
        ux_mode: "popup",
        use_fedcm_for_prompt: true,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-button"),
        {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          logo_alignment: "left",
        },
      );
    }
  };

  useEffect(() => {
    // global function to handle credential response, mounted on component load
    window.handleCredentialResponse = async function (response) {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      // if signin fails profiles email constraint, supabase will return a database error
      if (error) {
        await supabase.auth.signOut(); // Clear any partial/corrupted session
        setUserEmail("INVALID");
        setLoading(false);
        return;
      }

      const email = data.user.email;
      setUserEmail(email);
      setLoading(false);
    };

    if (window.google) {
      renderGoogleButton();
    }
  });

  // listen to auth state changes to dynamically display the right option for user to sign in/out
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserEmail(session.user.email); // Update email when signed in

        // Check for returnUrl parameter first
        const returnUrl = searchParams.get('returnUrl');
        if (returnUrl && isValidReturnUrl(returnUrl)) {
          window.location.href = returnUrl;
          return;
        }

        // Fallback: Keep backward compatibility with club/clubId params
        if (club != null) {
          if (clubId != null) { // redirect to review page
            window.location.href = `/review?club=${club}&clubId=${clubId}`;
          } else { //redirect to club general page
            window.location.href = `/clubs/${club}`;
          }
        } else {
          window.location.href = `/profile`;
        }
      } else {
        setUserEmail(null); // Clear email when signed out
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const SignInButton = () => (
    <div
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* default gradient */}
      <Button type="CTA" size="large" style="pointer-events-none">
        <span className="flex items-center gap-2">
          <img src="/google.svg" alt="" className="w-5 h-5" />
          Sign in with Google
        </span>
      </Button>

      {/* hover gradient — fades in on top */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-[#B21D58] to-[#D86761] flex items-center justify-center pointer-events-none"
        style={{ opacity: hovered ? 1 : 0, transition: "opacity 3000ms ease-in-out" }}>
        <span className="flex items-center gap-2 text-white font-medium py-2.5 px-7">
          <img src="/google.svg" alt="" className="w-5 h-5" />
          Sign in with Google
        </span>
      </div>

      <div
        id="google-button"
        className="hide-google-loading absolute inset-0 overflow-hidden rounded-full"
        style={{ opacity: 0.001 }}
      />
    </div>
  );

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.google) {
            renderGoogleButton();
            setLoading(false);
          }
        }}
      />
      <div>
        {loading ? (
          <p>LOADING...</p>
        ) : userEmail === "INVALID" ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <p>Please sign in with a valid UCLA email.</p>
            <SignInButton />
          </div>
        ) : userEmail ? (
          <p>You are signed in as <b>{userEmail}</b></p>
        ) : (
          <SignInButton />
        )}
      </div>
    </>
  );
}
