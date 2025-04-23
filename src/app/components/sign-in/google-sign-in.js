"use client"; 

import Script from "next/script";
import { useEffect } from "react";
import { supabase } from "../../lib/db";

export default function GoogleSignIn({ userEmail }) {

  // Render the Google Sign-In button (called on render & auth state change)
  const renderGoogleButton = () => {
    console.log("RENDERING BUTTON");
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
        }
      );
    }
  }

  useEffect(() => {
    window.handleCredentialResponse = async function (response) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) {
        console.error("Error signing in with Google:", error);
      } else {
        console.log("User signed in successfully:", data);
      }
    };

    if (window.google) {
      renderGoogleButton();
    }

  }, [userEmail]); // Re-run when user signs in/out

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => { 
          if (window.google) {
            console.log("Google Sign-In script loaded");
            renderGoogleButton(); 
            // Google One Tap
            // window.google.accounts.id.prompt();
            }
          }
        }
      />
      <div id="google-button" className="flex font-mono"/>
    </>
  );
}