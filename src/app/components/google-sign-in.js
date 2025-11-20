"use client";

import Script from "next/script";
import { useState, useEffect } from "react";
import { supabase } from "../lib/db";
import { useSearchParams } from "next/navigation";

export default function GoogleSignIn() {
  // userEmail is either:
  // null (logged out), string (logged in), or INVALID (invalid email)
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const club = searchParams.get('club');
  const clubId = searchParams.get('clubId');

  // Render the Google Sign-In button (called on render & auth state change)
  const renderGoogleButton = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: window.handleCredentialResponse,
        ux_mode: "popup",
        use_fedcm_for_prompt: true,
      });

      console.log("RENDERING BUTTON");
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
        console.log("NOT A UCLA EMAIL");
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
        console.log("Auth state changed:", event, session.user.email);
        if (club != null) {
          console.log("redirect to:" + club);
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
        console.log("Auth state changed:", event);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.google) {
            console.log("Google Sign-In script loaded");
            renderGoogleButton();
            setLoading(false);
            // Google One Tap
            // window.google.accounts.id.prompt();
          }
        }}
      />
      {/* BUG: BUTTON RENDERS A BIT SLOW */}
      <div>
        {loading ? (
          <p>LOADING...</p>
        ) : userEmail === "INVALID" ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <p>Please sign in with a valid UCLA email.</p>
            <div id="google-button" className="hide-google-loading" />
          </div>
        ) : userEmail ? (
          <p>
            You are signed in as <b>{userEmail}</b>
          </p>
        ) : (
          <div id="google-button" className="hide-google-loading" />
        )}
      </div>
    </>
  );
}
