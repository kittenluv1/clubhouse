"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/db";
import { AnimatePresence, motion } from "framer-motion";
import Majors from "./steps/Majors";

const STEPS = [Majors];

// need to make it so once youre doing with onboarding, you cannot access the onboarding page anymore

export default function OnboardingPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/sign-in");
            } else {
                setUser(user);
            }
        };
        getUser();
    }, []);

    if (!user) return null;

    const StepComponent = STEPS[step];

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-lg"
                >
                    <StepComponent
                        formData={formData}
                        onUpdate={(data) => setFormData((prev) => ({ ...prev, ...data }))}
                        onNext={() => setStep((s) => s + 1)}
                        onBack={() => setStep((s) => s - 1)}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
