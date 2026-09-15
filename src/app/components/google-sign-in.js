"use client";

import Button from "./button";
import Script from "next/script";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/db";
import { isValidReturnUrl } from "../lib/utils/redirect";
import posthog from "posthog-js";

export default function GoogleSignIn() {
  // userEmail is either: null (logged out), string (logged in), or INVALID (invalid email)
  const [userEmail, setUserEmail] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const club = searchParams.get("club");
  const clubId = searchParams.get("clubId");
  // Ref to this instance's own overlay div. Using a ref (not a shared
  // getElementById id) keeps each mounted GoogleSignIn — the desktop and
  // mobile layouts both render one — targeting its own button container.
  const buttonRef = useRef(null);

  // Render the Google Sign-In button after the GSI script is available.
  const renderGoogleButton = () => {
    if (window.google && buttonRef.current) {
      if (!window.__clubhouseGoogleInitialized) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: (response) => window.handleCredentialResponse?.(response),
          ux_mode: "popup",
          use_fedcm_for_prompt: true,
        });
        window.__clubhouseGoogleInitialized = true;
      }

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
        logo_alignment: "left",
      });
    }
  };

  useEffect(() => {
    // global function to handle credential response, mounted on component load
    window.handleCredentialResponse = async function (response) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      // if signin fails profiles email constraint, supabase will return a database error
      if (error) {
        await supabase.auth.signOut(); // Clear any partial/corrupted session
        setUserEmail("INVALID");
        return;
      }

      const email = data.user.email;
      setUserEmail(email);
      posthog.identify(data.user.id, { email });
      posthog.capture("user_signed_in", { provider: "google", email });
    };

    if (window.google) {
      renderGoogleButton();
    }
  }, []);

  // listen to auth state changes to dynamically display the right option for user to sign in/out
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserEmail(session.user.email); // Update email when signed in

        // Check for returnUrl parameter first
        const returnUrl = searchParams.get("returnUrl");
        if (returnUrl && isValidReturnUrl(returnUrl)) {
          router.push(returnUrl);
          return;
        }

        if (club != null) {
          if (clubId != null) {
            router.push(`/review?club=${club}&clubId=${clubId}`);
          } else {
            router.push(`/clubs/${club}`);
          }
        } else {
          router.push("/profile");
        }
      } else {
        setUserEmail(null); // Clear email when signed out
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      data.subscription.unsubscribe();
    };
    // Mount-only: set up the auth subscription once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.google) {
            renderGoogleButton();
          }
        }}
      />
      <div className="flex flex-col items-center justify-center gap-3">
        {/* this doesn't show, even when the email is invalid */}
        {userEmail === "INVALID" && (
          <p>Please sign in with a valid UCLA email.</p>
        )}
        <div className="group relative inline-block">
          <Button
            type="CTA"
            size="large"
            style="pointer-events-none group-hover:from-[#B21D58] group-hover:to-[#D86761]"
          >
            <span className="flex items-center gap-2">
              <img src="/google.svg" alt="" className="h-5 w-5" />
              Sign in with Google
            </span>
          </Button>
          <div
            ref={buttonRef}
            className="hide-google-loading absolute inset-0 overflow-hidden rounded-full"
            style={{ opacity: 0.001 }}
          />
        </div>
      </div>
    </>
  );
}
