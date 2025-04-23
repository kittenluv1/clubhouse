"use client"; 

import Script from "next/script";
import { useEffect } from "react";
import { supabase } from "../lib/db";

export default function GoogleSignIn() {

  useEffect(() => {
    window.handleCredentialResponse = async function (response) {
      console.log("Google token:", response.credential);
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
  }, []);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.google) {
            console.log("Current Origin:", window.location.origin);
            window.google.accounts.id.initialize({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              callback: window.handleCredentialResponse,
              ux_mode: "popup", // or "popup"
              // login_uri: "http://localhost:3000/sign-in", // where to send users after login - this was not working
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

            // Google One Tap
            // window.google.accounts.id.prompt();
          }
        }}
      />
      <div id="google-button" />
    </>
  );
}