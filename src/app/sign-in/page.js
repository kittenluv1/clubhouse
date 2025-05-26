"use client";

import { useEffect, useState } from "react";
import GoogleSignIn from '../components/google-sign-in';
import MobileNavbar from "../components/MobileNavbar";

function SignInPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center h-135 p-10 lg:p-30">
      <h2 className="text-3xl my-6">Sign in with your UCLA email to leave a club review!</h2>
      <p>To keep reviews accurate and trustworthy, only verified UCLA students can contribute.</p>
      <p>While your name will remain anonymous, we securely store your email to help protect against spam and misuse. </p>
      <p>We take community integrity seriously — every review helps build a reliable resource for Bruins, by Bruins.</p>
      <div className="my-10 0 h-10 flex-none">
        <GoogleSignIn/>
      </div>
      <MobileNavbar />
    </div>
  )
}

export default SignInPage