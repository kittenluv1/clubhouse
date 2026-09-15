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
      const response = await fetch("/api/onboarding");
      const profile = await response.json();

      if (!response.ok) return;

      if (!profile?.onboarding_started) {
        await fetch("/api/onboarding/start", { method: "POST" });
      }

      if (!profile?.onboarding_started) {
        router.replace("/onboarding");
      }
    };

    checkOnboarding();
  }, [pathname, router, user, loading]);

  return null;
}
