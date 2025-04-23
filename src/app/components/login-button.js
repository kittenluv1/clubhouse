import React from 'react'
import { supabase } from '../lib/db';
import { useState, useEffect } from 'react';
import Button from './button';
import { useRouter } from 'next/navigation';

function LoginButton() {
    // if userEmail is not null, user is signed in
    const [isLoggedin, setLoggedin] = useState(false);
    const router = useRouter();
  
    useEffect(() => {
      // check if user is signed in
      const fetchUserSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
  
        if (error) {
          console.error("Error fetching session:", error);
        } else if (session) {
          setLoggedin(true);
        }
      };

      fetchUserSession();

      // Listen for auth state changes (e.g., sign in or sign out)
      const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          setLoggedin(true);
        } else {
          setLoggedin(false);}
      });
  
      // Cleanup the listener when the component unmounts
      return () => {
        subscription.unsubscribe();
      };
  
    }, []);
  
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error signing out:", error.message);
        } else {
          console.log("User signed out successfully");
        }
      } 

  return (
    <div>
      {isLoggedin ? (
          <button onClick={handleSignOut} className="bg-amber-400">Sign Out</button>
        ) : (
          <button onClick={() => router.push('/sign-in')} className="bg-amber-400">Sign In</button>
        )
    }
    </div>
  )
}

export default LoginButton;