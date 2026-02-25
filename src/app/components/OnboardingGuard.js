"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/db";

// Paths where the onboarding check should not run
const EXCLUDED_PATHS = ["/sign-in", "/onboarding"];

export default function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;

    const checkOnboarding = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return; 

      // Detects whether the logged-in user has completed onboarding.
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_done")
        .eq("id", session.user.id)
        .single();
      
      //If profiles.onboarding_done is false/null, redirects to /onboarding.
      if (!profile?.onboarding_done) {
        console.log("redirecting to onboarding")
        // TODO: redirect to /onboarding once the onboarding flow is implemented
      }
    };

    checkOnboarding();
  }, [pathname]);

  return null;
}
