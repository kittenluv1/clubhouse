'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const page = () => {
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session) {
          window.location.href = './sign-in';
        } else if (session.user.email !== 'clubhouseucla@gmail.com') {
          window.location.href = './sign-in'; // or any fallback
        }
      });
      
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return <label>Hello</label>
}

export default page
