"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useTeaStore, setCurrentUserId, setDemoMode } from "@/lib/store";
import LoginForm from "@/components/LoginForm";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
  exitDemo: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_FLAG_KEY = "teapp-demo-mode";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const syncFromSupabase = useTeaStore((s) => s.syncFromSupabase);
  const loadDemoData = useTeaStore((s) => s.loadDemoData);

  useEffect(() => {
    let mounted = true;

    // Check if demo mode was previously activated (e.g. page refresh)
    const wasDemo = typeof window !== "undefined" && localStorage.getItem(DEMO_FLAG_KEY) === "true";

    if (wasDemo) {
      // Restore demo mode without hitting Supabase
      setDemoMode(true);
      setIsDemo(true);
      setCurrentUserId(null);
      loadDemoData();
      setLoading(false);
      return;
    }

    // Add a timeout — getSession can hang in some environments
    const sessionTimeout = setTimeout(() => {
      if (!mounted) return;
      console.warn("getSession timed out after 5s");
      setLoading(false);
    }, 5000);

    supabase.auth.getSession().then(({ data, error: err }) => {
      clearTimeout(sessionTimeout);
      if (!mounted) return;
      if (err) {
        console.error("getSession error:", err);
        setError(err.message);
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
        syncFromSupabase(data.session.user.id);
      }
      setLoading(false);
    }).catch((e: unknown) => {
      clearTimeout(sessionTimeout);
      console.error("getSession exception:", e);
      const msg = (e as Error)?.message || String(e);
      setError(msg);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          setCurrentUserId(newSession.user.id);
          syncFromSupabase(newSession.user.id);
        } else {
          setCurrentUserId(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncFromSupabase, loadDemoData]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signInDemo = useCallback(() => {
    localStorage.setItem(DEMO_FLAG_KEY, "true");
    setDemoMode(true);
    setIsDemo(true);
    setCurrentUserId(null);
    loadDemoData();
    setLoading(false);
  }, [loadDemoData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUserId(null);
    setUser(null);
    setSession(null);
  }, []);

  const exitDemo = useCallback(() => {
    localStorage.removeItem(DEMO_FLAG_KEY);
    setDemoMode(false);
    setIsDemo(false);
    setCurrentUserId(null);
    setUser(null);
    setSession(null);
  }, []);

  const value: AuthContextValue = { user, session, loading, isDemo, signIn, signUp, signInDemo, signOut, exitDemo };

  return (
    <AuthContext.Provider value={value}>
      {error ? (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
          <div className="max-w-md rounded-xl border p-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Auth Error</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg text-sm"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              Retry
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
          <div className="text-muted text-sm">Loading…</div>
        </div>
      ) : (user || isDemo) ? (
        children
      ) : (
        <LoginForm />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}