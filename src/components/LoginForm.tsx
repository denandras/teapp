"use client";

import { useEffect, useState } from "react";
import { Leaf, Loader2, Sparkles, MapPin } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginForm() {
  const { signIn, signUp, signInDemo } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [geo, setGeo] = useState<{ country: string; loading: boolean }>({
    country: "HU",
    loading: true,
  });

  useEffect(() => {
    let mounted = true;
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data: { country?: string }) => {
        if (!mounted) return;
        setGeo({ country: (data?.country || "HU").toUpperCase(), loading: false });
      })
      .catch(() => {
        if (!mounted) return;
        setGeo({ country: "HU", loading: false });
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isRestricted = geo.country !== "HU";

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

  const handleDemo = () => {
    setError(null);
    setInfo(null);
    signInDemo();
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
        {/* Logo + intro */}
        <div className="flex flex-col items-center mb-6">
          <Leaf size={40} className="text-accent mb-2" />
          <h1 className="text-2xl font-serif font-bold" style={{ color: "var(--text)" }}>
            Teapp
          </h1>
          <p className="text-sm text-center mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>
            Track your tea collection, discover new varieties, and explore teas from
            tea houses across Hungary.
          </p>
        </div>

        {/* Demo button — always visible first */}
        <button
          onClick={handleDemo}
          className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border mb-4"
          style={{
            backgroundColor: "transparent",
            borderColor: "var(--accent)",
            color: "var(--accent)",
          }}
        >
          <Sparkles size={18} />
          Try it out (no account needed)
        </button>

        {isRestricted ? (
          <div className="flex flex-col items-center text-center py-4">
            <MapPin size={28} className="text-accent mb-3" />
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Sign-up is currently available only in Hungary. We&apos;ll expand to more
              countries soon!
            </p>
          </div>
        ) : (
          <>
            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: "var(--border)" }} />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  or {mode === "signin" ? "sign in" : "sign up"}
                </span>
              </div>
            </div>

            {error && (
              <div
                className="rounded-lg border p-3 mb-4 mt-4 text-sm"
                style={{ backgroundColor: "#c44a3f20", borderColor: "#c44a3f", color: "#c44a3f" }}
              >
                {error}
              </div>
            )}
            {info && (
              <div
                className="rounded-lg border p-3 mb-4 mt-4 text-sm"
                style={{ backgroundColor: "#7BA05B20", borderColor: "#7BA05B", color: "#7BA05B" }}
              >
                {info}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
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
                    {mode === "signin" ? "Signing in..." : "Creating account..."}
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
          </>
        )}

        <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Questions or feedback?{" "}
            <a
              href="mailto:contact@andrasdenes.com"
              className="hover:underline"
              style={{ color: "var(--accent)" }}
            >
              contact@andrasdenes.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}