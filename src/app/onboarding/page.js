"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";
import { AnimatePresence, motion } from "framer-motion";
import Majors from "./steps/Majors";
import OnboardingCard from "./components/OnboardingCard";
import OnboardingNav from "./components/OnboardingNav";

const STEPS = [Majors];
const TOTAL_STEPS = 5;

export default function OnboardingPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [canAdvance, setCanAdvance] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/sign-in");
                return;
            }

            const res = await fetch("/api/onboarding");
            const { onboarding_completed } = await res.json();
            if (onboarding_completed) {
                router.push("/");
                return;
            }

            setUser(user);
        };
        checkAccess();
    }, []);

    if (!user) return null;

    const StepComponent = STEPS[step];

    return (
        <div className="flex min-h-[calc(100vh-84px)] items-center justify-center px-4 py-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-4xl"
                >
                    <OnboardingCard step={step} totalSteps={TOTAL_STEPS}>
                        <StepComponent
                            formData={formData}
                            onUpdate={(data) => setFormData((prev) => ({ ...prev, ...data }))}
                            onValidChange={setCanAdvance}
                        />
                        {/* Confirmation step (last) uses its own CTAs instead of standard nav */}
                        {step < TOTAL_STEPS - 1 && (
                            <OnboardingNav
                                onNext={() => setStep((s) => s + 1)}
                                onBack={() => { setStep((s) => s - 1); setCanAdvance(true); }}
                                isFirstStep={step === 0}
                                canAdvance={canAdvance}
                            />
                        )}
                    </OnboardingCard>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
