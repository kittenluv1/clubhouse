import React from 'react'
import { supabase } from '../lib/db';
import { useState, useEffect } from 'react';
import Button from './button';

function LoginButton() {
    // login button that changes based on whether the user is logged in or not
    // if logged in, show sign out button, else show sign in button
    const [isLoggedin, setLoggedin] = useState(false);
  
    useEffect(() => {
      // Listen for auth state changes (e.g., sign in or sign out)
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          setLoggedin(true);
          console.log("Login button:", event);
        } else {
          setLoggedin(false);
          console.log("Login button:", event);
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
      } 

  return (
    <div>
      {isLoggedin ? (
          <Button value="Sign Out" onClick={handleSignOut} border="true"></Button>
        ) : (
          <Button value="Sign In" to="/sign-in" border="true"></Button>
        )
    }
    </div>
  )
}

export default LoginButton;