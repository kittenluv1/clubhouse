import React from "react";
import { supabase } from "../lib/db";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CTAButton from "./CTAButton";

function LoginButton() {
  // login button that changes based on whether the user is logged in or not
  // if logged in, show sign out button, else show sign in button
  const [isLoggedin, setLoggedin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes (e.g., sign in or sign out)
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setLoggedin(true);
      } else {
        setLoggedin(false);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      setLoggedin(false);
      console.log("User signed out successfully");
    }
  };

  return (
    <div className="w-23">
      {isLoggedin ? (
        <CTAButton
          onClick={handleSignOut}
        >
          Sign Out
        </CTAButton>
      ) : (
        <CTAButton
          onClick={() => router.push("/sign-in")}
        >
          Sign In
        </CTAButton>
      )}
    </div>
  );
}

export default LoginButton;
