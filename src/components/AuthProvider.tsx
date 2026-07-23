"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useTeaStore, setCurrentUserId } from "@/lib/store";
import LoginForm from "@/components/LoginForm";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncFromSupabase = useTeaStore((s) => s.syncFromSupabase);

  useEffect(() => {
    let mounted = true;

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
  }, [syncFromSupabase]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const value: AuthContextValue = { user, session, loading, signIn, signUp };

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
      ) : user ? (
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