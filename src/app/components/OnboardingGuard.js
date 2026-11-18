"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

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
      try {
        const response = await fetch("/api/onboarding");
        if (!response.ok) return;

        const profile = await response.json();

        let startResponse = null;
        if (!profile?.onboarding_started) {
          try {
            startResponse = await fetch("/api/onboarding/start", {
              method: "POST",
            });
          } catch (error) {
            console.error("Failed to update onboarding_started:", error);
          }
        }

        if (!profile?.onboarding_started && startResponse?.ok) {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Failed to check onboarding:", error);
      }
    };

    checkOnboarding();
  }, [pathname, router, user, loading]);

  return null;
}
