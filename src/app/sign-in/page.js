"use client";

import { useState, useEffect } from 'react';
import Google from '../components/google-sign-in';
import { supabase } from '../lib/db';
import LoginButton from '../components/login-button';

function SignInPage() {
  // if userEmail is not null, user is signed in
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    // Fetch the current session to get the user's email
    const fetchUserSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
      } else if (session) {
        setUserEmail(session.user.email);
      }
    };

    fetchUserSession();

    // Listen for auth state changes (e.g., sign in or sign out)
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserEmail(session.user.email); // Update email when signed in
        console.log("Auth state changed: SIGNED IN", session.user.email);
      } else {
        setUserEmail(null); // Clear email when signed out
        console.log("Auth state changed: SIGNED OUT");
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once

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
        <Google userEmail={userEmail}/>
      </div>
    )}

    <LoginButton />

    </div>
  )
}

export default SignInPage