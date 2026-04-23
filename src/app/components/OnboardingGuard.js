"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/db";

// Paths where the onboarding check should not run
const EXCLUDED_PATHS = ["/sign-in", "/onboarding"];

export default function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;

    const checkOnboarding = async () => {
      // Detects whether the logged-in user has completed onboarding.
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_started")
        .eq("id", user.id)
        .single();

      // If onboarding_started is false/null, mark it done and redirect once.
      if (!profile?.onboarding_started) {
        await supabase
          .from("profiles")
          .update({ onboarding_started: true })
          .eq("id", user.id);
        console.log('pushing to onboarding')
      }
    };

    checkOnboarding();
  }, [pathname, user, loading]);

  return null;
}
