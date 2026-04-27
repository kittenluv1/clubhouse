"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";
import { useRequireAuth } from "../context/AuthContext";
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
    const { user, loading } = useRequireAuth();
    const [screen, setScreen] = useState(0);
    const [formData, setFormData] = useState({});
    const [canAdvance, setCanAdvance] = useState(true);
    const [clubOptions, setClubOptions] = useState([]);

    useEffect(() => {
        if (!user) return;

        const checkAccess = async () => {
            const res = await fetch("/api/onboarding");
            const { onboarding_completed } = await res.json().catch(() => ({}));
            if (onboarding_completed) {
                router.push("/");
            }
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
    }, [user, router]);

    if (loading || !user) return null;

    const StepComponent = SCREENS[screen];
    const isWelcomeScreen = screen === 0;
    const isLastScreen = screen === SCREENS.length - 1;
    const isFinishStep = screen === SCREENS.length - 2;
    // progressStep: 0-indexed among the non-welcome steps (screen 1 → step 0, screen 2 → step 1)
    const progressStep = screen - 1;

    const handleFinish = async () => {
        const res = await fetch("/api/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                majors: formData.majors ?? [],
                minors: formData.minors ?? [],
                broadCategories: formData.interests ?? [],
                subcategories: formData.subcategories ?? [],
                currentClubs: formData.clubs ?? [],
            }),
        });
        if (res.ok) {
            setScreen((s) => s + 1);
        }
    };

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
                            onNext={isFinishStep ? handleFinish : () => setScreen((s) => s + 1)}
                            onBack={() => { setScreen((s) => s - 1); setCanAdvance(true); }}
                            isFirstStep={isWelcomeScreen}
                            canAdvance={canAdvance}
                            nextLabel={isFinishStep ? "Finish" : "Next"}
                        />
                    )}
                </OnboardingCard>
            </div>
        </div>
    );
}
