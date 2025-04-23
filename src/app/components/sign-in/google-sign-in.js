"use client"; 

import Script from "next/script";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/db";

export default function GoogleSignIn({ userEmail }) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

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
    console.log("Google Sign-In effect triggered");
    window.handleCredentialResponse = async function (response) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });
    };

    if (window.google) {
      renderGoogleButton();
    }

  }, [isScriptLoaded, userEmail]); // Re-run when user signs in/out

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => { 
          if (window.google) {
            console.log("Google Sign-In script loaded");
            setIsScriptLoaded(true);
            // renderGoogleButton(); 
            // Google One Tap
            // window.google.accounts.id.prompt();
            }
          }
        }
      />
      {isScriptLoaded && (
        <div id="google-button"/>
      )}
    </>
  );
}