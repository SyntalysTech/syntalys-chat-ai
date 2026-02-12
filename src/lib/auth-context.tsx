"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "./supabase-client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "./types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) setProfile(data as UserProfile);
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          console.warn("Error getting session:", error.message);
        } else if (session?.user) {
          setUser(session.user);
          try {
            await fetchProfile(session.user.id);
          } catch (e) {
            console.warn("Error fetching profile:", e);
          }
        }
      } catch (e) {
        console.warn("Session check failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          await fetchProfile(session.user.id);
        } catch (e) {
          console.warn("Error fetching profile on auth change:", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    await supabase.from("profiles").update(updates).eq("id", user.id);
    await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
