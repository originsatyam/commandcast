import React, { useEffect, useState, useCallback, useMemo } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";
import { AuthContext, type DemoUser } from "./AuthContextDefinition";

const DEMO_USER_STORAGE_KEY = "campus_radar_demo_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState<string>("");

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: activeSession } } = await supabase.auth.getSession();
          if (activeSession && isMounted) {
            setSession(activeSession);
            // Verify with getUser() as recommended by Supabase guidelines
            const { data: { user: verifiedUser } } = await supabase.auth.getUser();
            if (verifiedUser && isMounted) {
              setUser(verifiedUser);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Supabase auth session check warning:", err);
        }
      }

      // Check for local demo user if not connected to Supabase session
      try {
        const storedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
        if (storedDemo && isMounted) {
          const parsed = JSON.parse(storedDemo);
          setUser(parsed);
        }
      } catch {
        // ignore
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth events
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback demo sign in if Supabase credentials are not connected
      const demoUser: DemoUser = {
        id: `demo-${Date.now()}`,
        email,
        name: email.split("@")[0] || "Student",
        isDemo: true
      };
      setUser(demoUser);
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
      setIsAuthModalOpen(false);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error };
      }

      setUser(data.user);
      setSession(data.session);
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      setIsAuthModalOpen(false);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured || !supabase) {
      const demoUser: DemoUser = {
        id: `demo-${Date.now()}`,
        email,
        name: fullName || email.split("@")[0] || "Student",
        isDemo: true
      };
      setUser(demoUser);
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
      setIsAuthModalOpen(false);
      return { error: null, user: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName
          }
        }
      });

      if (error) {
        return { error };
      }

      setUser(data.user);
      setSession(data.session);
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      setIsAuthModalOpen(false);
      return { error: null, user: data.user };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Sign out warning:", err);
      }
    }
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setUser(null);
    setSession(null);
  }, []);

  const signInAsDemo = useCallback((name = "Satyam Manik", email = "satyam.manik@example.com") => {
    const demoUser: DemoUser = {
      id: "demo-user-satyam",
      email,
      name,
      isDemo: true
    };
    setUser(demoUser);
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    setIsAuthModalOpen(false);
  }, []);

  const openAuthModal = useCallback((promptReason = "Sign in to access your saved tracker & personalized profile") => {
    setAuthModalPrompt(promptReason);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isConfigured: isSupabaseConfigured,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
      signInAsDemo,
      openAuthModal,
      closeAuthModal,
      isAuthModalOpen,
      authModalPrompt
    }),
    [
      user,
      session,
      isLoading,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
      signInAsDemo,
      openAuthModal,
      closeAuthModal,
      isAuthModalOpen,
      authModalPrompt
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
