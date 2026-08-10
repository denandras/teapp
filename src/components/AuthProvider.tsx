"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useTeaStore, setCurrentUserId, setDemoMode } from "@/lib/store";
import { fetchProfile, type Profile } from "@/lib/profiles";
import LoginForm from "@/components/LoginForm";
import PasswordRecoveryForm from "@/components/PasswordRecoveryForm";
import { ConsentGate } from "@/components/ConsentGate";
import { Leaf } from "lucide-react";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
  exitDemo: () => void;
  refreshProfile: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_FLAG_KEY = "teapp-demo-mode";

// Bump this when auth flow changes — purges stale sessions from older versions
const AUTH_VERSION_KEY = "teapp-auth-version";
const AUTH_VERSION = "4";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  // Ref flag to block auth listener from processing events during password
  // update (prevents SIGNED_IN from recovery token re-setting user before signOut)
  const authBlockedRef = useRef(false);

  const pathname = usePathname();
  const router = useRouter();

  const syncFromSupabase = useTeaStore((s) => s.syncFromSupabase);
  const loadDemoData = useTeaStore((s) => s.loadDemoData);

  // Load profile for a user. Redirects new users (no profile row) to /onboarding,
  // unless they're already on the onboarding page.
  const loadProfileForUser = useCallback(
    async (userId: string) => {
      const fetched = await fetchProfile(userId);
      setProfile(fetched);
      if (!fetched && pathname !== "/onboarding") {
        router.replace("/onboarding");
      }
    },
    [pathname, router]
  );

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    const fetched = await fetchProfile(user.id);
    setProfile(fetched);
  }, [user]);

  useEffect(() => {
    let mounted = true;

    // --- Step 1: Version check ---
    // If auth version changed, purge everything and start fresh.
    const storedVersion = typeof window !== "undefined" ? localStorage.getItem(AUTH_VERSION_KEY) : null;
    if (storedVersion !== AUTH_VERSION) {
      localStorage.setItem(AUTH_VERSION_KEY, AUTH_VERSION);
      localStorage.removeItem(DEMO_FLAG_KEY);
      supabase.auth.signOut().catch(() => {});
      setCurrentUserId(null);
      setDemoMode(false);
      setLoading(false);
      // Don't return — fall through to set up the auth listener
    }

    // --- Step 2: Check for recovery token in URL hash ---
    // Supabase password reset links put type=recovery&access_token=... in the hash.
    // This must take priority over demo mode.
    const hashParams = typeof window !== "undefined" ? new URLSearchParams(window.location.hash.substring(1)) : null;
    const hasRecoveryToken = hashParams?.get("type") === "recovery" && !!hashParams?.get("access_token");

    if (hasRecoveryToken) {
      // Clear demo mode — recovery takes over
      localStorage.removeItem(DEMO_FLAG_KEY);
      setDemoMode(false);
      setIsDemo(false);
      // Set up the auth listener to catch PASSWORD_RECOVERY event.
      // Also call getSession which may detect the hash token and
      // trigger the event synchronously.
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          if (!mounted) return;
          if (authBlockedRef.current) return;
          if (event === "PASSWORD_RECOVERY") {
            setIsPasswordRecovery(true);
            setLoading(false);
            return;
          }
          // If it's another event (e.g. SIGNED_IN from the recovery token),
          // also show the recovery form so the user can set a new password
          if (newSession?.user && event === "SIGNED_IN") {
            // Check if this came from a recovery token
            const currentHash = typeof window !== "undefined" ? window.location.hash : "";
            if (currentHash.includes("type=recovery")) {
              setIsPasswordRecovery(true);
              setLoading(false);
              return;
            }
          }
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
        }
      );
      // getSession will detect the hash token and fire onAuthStateChange
      supabase.auth.getSession().then(() => {
        if (!mounted) return;
        // If getSession didn't trigger a recovery event, check manually
        // by seeing if we got a session from the hash
      }).catch(() => {
        if (!mounted) return;
        setLoading(false);
      });
      // Safety timeout — if no event fires in 8s, show login form
      const recoveryTimeout = setTimeout(() => {
        if (!mounted) return;
        console.warn("Recovery token not processed after 8s — showing login");
        setLoading(false);
      }, 8000);
      return () => {
        mounted = false;
        clearTimeout(recoveryTimeout);
        authListener.subscription.unsubscribe();
      };
    } else {
      // --- Step 3: Check demo mode ---
      const wasDemo = typeof window !== "undefined" && localStorage.getItem(DEMO_FLAG_KEY) === "true";
      if (wasDemo) {
        setDemoMode(true);
        setIsDemo(true);
        setCurrentUserId(null);
        setProfile(null);
        loadDemoData();
        setLoading(false);
        return; // Demo mode — don't contact Supabase at all
      }
    }

    // --- Step 4: Set up auth listener FIRST, then getSession ---
    // The listener catches PASSWORD_RECOVERY events from the hash token.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        if (authBlockedRef.current) return;

        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
          setLoading(false);
          return;
        }

        // Normal auth state change (sign in, sign out, token refresh)
        if (event === "SIGNED_IN" && newSession?.user) {
          setCurrentUserId(newSession.user.id);
          syncFromSupabase(newSession.user.id);
          loadProfileForUser(newSession.user.id);
        } else if (event === "SIGNED_OUT" || !newSession?.user) {
          setCurrentUserId(null);
          setProfile(null);
        }
        // TOKEN_REFRESHED and other events: keep existing store state as-is
        // to avoid clobbering local changes (e.g. accent color) with stale
        // server data before user edits have been persisted.
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    // --- Step 5: Check existing session ---
    const sessionTimeout = setTimeout(() => {
      if (!mounted) return;
      console.warn("getSession timed out after 5s");
      setLoading(false);
    }, 5000);

    supabase.auth.getSession().then(({ data, error: err }) => {
      clearTimeout(sessionTimeout);
      if (!mounted) return;
      if (err) {
        console.warn("getSession error (non-blocking):", err.message);
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
        syncFromSupabase(data.session.user.id);
        loadProfileForUser(data.session.user.id);
      }
      setLoading(false);
    }).catch((e: unknown) => {
      clearTimeout(sessionTimeout);
      console.warn("getSession exception (non-blocking):", e);
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncFromSupabase, loadDemoData, loadProfileForUser]);

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
    setProfile(null);
    loadDemoData();
    setLoading(false);
  }, [loadDemoData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUserId(null);
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const exitDemo = useCallback(() => {
    localStorage.removeItem(DEMO_FLAG_KEY);
    setDemoMode(false);
    setIsDemo(false);
    setCurrentUserId(null);
    setUser(null);
    setSession(null);
    setProfile(null);
    // Also clear any stale Supabase tokens so exitDemo truly returns to login
    supabase.auth.signOut().catch(() => {});
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    // Block auth listener from processing SIGNED_OUT/SIGNED_IN events
    // that fire during signOut — prevents redirect to onboarding
    authBlockedRef.current = true;
    setIsPasswordRecovery(false);
    // Clean the URL hash
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    // Sign out so they can sign in with the new password
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    // Unblock after a short delay to allow normal auth flow to resume
    setTimeout(() => { authBlockedRef.current = false; }, 2000);
  }, []);

  const value: AuthContextValue = {
    user, session, loading, isDemo, profile, signIn, signUp, signInDemo, signOut, exitDemo, refreshProfile, updatePassword,
  };

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
      ) : isPasswordRecovery ? (
        <PasswordRecoveryForm onReset={async (pw) => updatePassword(pw)} />
      ) : loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: "var(--bg)" }}>
          <Leaf size={32} className="text-accent animate-pulse" />
          <div className="text-muted text-sm">Loading…</div>
        </div>
      ) : (user || isDemo) ? (
        children
      ) : (
        <ConsentGate>
          <LoginForm />
        </ConsentGate>
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