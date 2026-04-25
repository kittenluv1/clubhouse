"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/db";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin =
    !!user?.email && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession((prev) => {
        if (prev?.access_token === session?.access_token) return prev;
        return session;
      });
      setUser((prev) => {
        const newUser = session?.user ?? null;
        if (prev?.id === newUser?.id) return prev;
        return newUser;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile row when user changes. Depends on user?.id (primitive)
  // so token refreshes don't re-trigger this.
  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    supabase
      .from("profiles")
      .select("avatar_id, onboarding_completed")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Profile fetch error:", error.message);
          return;
        }
        setProfile(data);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out error:", error.message);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isAdmin, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth() {
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/sign-in?returnUrl=${returnUrl}`);
    }
  }, [auth.user, auth.loading, pathname, router]);
  return auth;
}