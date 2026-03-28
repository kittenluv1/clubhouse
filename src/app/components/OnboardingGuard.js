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
        .select("onboarding_started")
        .eq("id", session.user.id)
        .single();

      // If onboarding_started is false/null, mark it started and redirect once.
      if (!profile?.onboarding_started) {
        await supabase
          .from("profiles")
          .update({ onboarding_started: true })
          .eq("id", session.user.id);
        router.push(`/onboarding`);
      }
    };

    checkOnboarding();
  }, [pathname]);

  return null;
}
