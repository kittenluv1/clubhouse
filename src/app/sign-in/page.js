"use client";

import { useState, useEffect } from 'react';
import GoogleSignIn from '../components/sign-in/google-sign-in';
import { supabase } from '../lib/db';
import LoginButton from '../components/sign-in/login-button';

function SignInPage() {
  // if userEmail is not null, user is signed in
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    // Listen for auth state changes (e.g., sign in or sign out)
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserEmail(session.user.email); // Update email when signed in
        console.log("Auth state changed:", event, session.user.email);
      } else {
        setUserEmail(null); // Clear email when signed out
        console.log("Auth state changed:", event);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      data.subscription.unsubscribe();
    };
  }, []); 

  return (
    <div>
      <h2 className="text-2xl my-5">Sign in with your UCLA email to leave a club review!</h2>
      <p className="my-3">
        To keep reviews accurate and trustworthy, only verified UCLA students can contribute. 
While your name will remain anonymous we securely store your email to help protect against spam and misuse. 
We take community integrity seriously — every review helps build a reliable resource for Bruins, by Bruins.
    </p>

    {userEmail ? (
      <div>
        <p>You are signed in as {userEmail}</p>
      </div>
    ) : (
      <div>
        <GoogleSignIn userEmail={userEmail}/>
      </div>
    )}

    <LoginButton />

    </div>
  )
}

export default SignInPage