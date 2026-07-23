"use client";

import { useState } from "react";
import { Coffee, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useTeaStore } from "@/lib/store";

export default function LoginForm() {
  const { signIn, signUp } = useAuth();
  const migrateFromLocalStorage = useTeaStore((s) => s.migrateFromLocalStorage);
  const syncFromSupabase = useTeaStore((s) => s.syncFromSupabase);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const hasLocalData =
    typeof window !== "undefined" && !!localStorage.getItem("teapp-storage");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
        setInfo("Account created! Check your email for a confirmation link if required, then sign in.");
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleMigrate = async () => {
    setError(null);
    setInfo(null);
    setMigrating(true);
    try {
      // We need a user id — get it from the current session
      const { data } = await import("@/lib/supabaseClient").then((m) =>
        m.supabase.auth.getSession()
      );
      const userId = data.session?.user?.id;
      if (!userId) {
        setError("You must be signed in to migrate data.");
        setMigrating(false);
        return;
      }
      await migrateFromLocalStorage(userId);
      await syncFromSupabase(userId);
      setInfo("Your local data has been migrated to your account!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Migration failed";
      setError(message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl p-8"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-col items-center mb-6">
          <Coffee size={40} className="text-accent mb-2" />
          <h1 className="text-2xl font-serif font-bold" style={{ color: "var(--text)" }}>
            Teapp
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {mode === "signin" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        {error && (
          <div
            className="rounded-lg border p-3 mb-4 text-sm"
            style={{ backgroundColor: "#c44a3f20", borderColor: "#c44a3f", color: "#c44a3f" }}
          >
            {error}
          </div>
        )}
        {info && (
          <div
            className="rounded-lg border p-3 mb-4 text-sm"
            style={{ backgroundColor: "#7BA05B20", borderColor: "#7BA05B", color: "#7BA05B" }}
          >
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="text-sm font-semibold uppercase tracking-wide block mb-2"
              style={{ color: "var(--muted)" }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border outline-none"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label
              className="text-sm font-semibold uppercase tracking-wide block mb-2"
              style={{ color: "var(--muted)" }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border outline-none"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            {busy ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {mode === "signin" ? "Signing in…" : "Creating account…"}
              </>
            ) : (
              mode === "signin" ? "Sign in" : "Sign up"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-sm hover:underline"
            style={{ color: "var(--accent)" }}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        {hasLocalData && (
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
              We found existing tea data in your browser. After signing in, migrate it to your account.
            </p>
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="w-full py-2.5 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              {migrating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Migrating…
                </>
              ) : (
                "Migrate my data"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}