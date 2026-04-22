"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";
import Welcome from "./steps/Welcome";
import Majors from "./steps/Majors";
import Clubs from "./steps/Clubs";
import Interests from "./steps/Interests";
import OnboardingFinish from "./steps/OnboardingFinish";
import Categories from "./steps/Categories";
import OnboardingCard from "./components/OnboardingCard";
import OnboardingNav from "./components/OnboardingNav";

const SCREENS = [Welcome, Majors, Clubs, Categories, Interests, OnboardingFinish];
const TOTAL_STEPS = 5;

export default function OnboardingPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [screen, setScreen] = useState(0);
    const [formData, setFormData] = useState({});
    const [canAdvance, setCanAdvance] = useState(true);
    const [clubOptions, setClubOptions] = useState([]);

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/sign-in");
                return;
            }

            const res = await fetch("/api/onboarding");
            const { onboarding_completed } = await res.json().catch(() => ({}));
            console.log(onboarding_completed);
            if (onboarding_completed) {
                router.push("/");
                return;
            }

            setUser(user);
        };
        checkAccess();

        const fetchClubNames = async () => {
            const { data, error } = await supabase
                .from("clubs")
                .select("OrganizationName");
            if (!error && data) {
                setClubOptions(data.map((c) => c.OrganizationName));
            }
        };
        fetchClubNames();
    }, [router]);
    if (!user) return null;

    const StepComponent = SCREENS[screen];
    const isWelcomeScreen = screen === 0;
    const isLastScreen = screen === SCREENS.length - 1;
    // progressStep: 0-indexed among the non-welcome steps (screen 1 → step 0, screen 2 → step 1, …)
    const progressStep = screen - 1;

    return (
        <div className="flex min-h-[calc(100vh-84px)] items-center justify-center px-4 py-8">
            <div className="w-full max-w-[1116px]">
                <OnboardingCard progressStep={progressStep} totalSteps={TOTAL_STEPS} showProgress={!isWelcomeScreen}>
                    <StepComponent
                        formData={formData}
                        onUpdate={(data) => setFormData((prev) => ({ ...prev, ...data }))}
                        onValidChange={setCanAdvance}
                        clubOptions={clubOptions}
                    />
                    {/* Confirmation step (last) uses its own CTAs instead of standard nav */}
                    {!isLastScreen && (
                        <OnboardingNav
                            onNext={() => setScreen((s) => s + 1)}
                            onBack={() => { setScreen((s) => s - 1); setCanAdvance(true); }}
                            isFirstStep={isWelcomeScreen}
                            canAdvance={canAdvance}
                        />
                    )}
                </OnboardingCard>
            </div>
        </div>
    );
}
