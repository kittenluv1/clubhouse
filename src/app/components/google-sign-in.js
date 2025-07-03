"use client";

import Script from "next/script";
import { useState, useEffect } from "react";
import { supabase } from "../lib/db";

export default function GoogleSignIn() {
  // null (logged out), string (logged in), or INVALID (invalid email)
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      const email = data.user.email;

      // if valid email, sign in and set user email
      if (
        email.endsWith("@ucla.edu") ||
        email.endsWith("@g.ucla.edu") ||
        email === "clubhouseucla@gmail.com"
      ) {
        setUserEmail(email);
        setLoading(false);
      }
      // if invalid email, set userEmail to "INVALID" and delete user from auth table
      else {
        console.log("NOT A UCLA EMAIL");
        try {
          const response = await fetch("/api/components", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: data.user.id }), // send user ID to delete
          });

          const result = await response.json();

          if (!response.ok) {
            console.error("Error deleting user:", result.error);
          } else {
            console.log("User deleted successfully:", result.message);
            await supabase.auth.signOut(); // sign out the user
            setUserEmail("INVALID"); // display invalid email message
          }
        } catch (error) {
          console.error("Error deleting user:", error.message);
        }
        setLoading(false);
      }
    };

    if (window.google) {
      renderGoogleButton();
    }
  });

  // listen to auth state changes to dynamically display the right option for user to sign in/out
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // setLoading(true);
        setUserEmail(session.user.email); // Update email when signed in
        console.log("Auth state changed:", event, session.user.email);
      } else {
        // setLoading(true);
        setUserEmail(null); // Clear email when signed out
        console.log("Auth state changed:", event);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  if (error) console.error("Error:", error.message);

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
