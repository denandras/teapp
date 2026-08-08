"use client";

import { useState } from "react";
import { Leaf, Loader2, Check } from "lucide-react";

export default function PasswordRecoveryForm({
  onReset,
}: {
  onReset: (newPassword: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await onReset(password);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div
          className="w-full max-w-md rounded-2xl border shadow-2xl p-8 text-center"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#7BA05B20" }}
            >
              <Check size={32} style={{ color: "#7BA05B" }} />
            </div>
            <h1 className="text-2xl font-serif font-bold" style={{ color: "var(--text)" }}>
              Password Updated
            </h1>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>
              Your password has been changed. Please sign in with your new password.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-lg font-medium transition-all"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

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
          <Leaf size={40} className="text-accent mb-2" />
          <h1 className="text-2xl font-serif font-bold" style={{ color: "var(--text)" }}>
            Set New Password
          </h1>
          <p className="text-sm mt-1 text-center" style={{ color: "var(--muted)" }}>
            Enter a new password for your Teapp account.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="text-sm font-semibold uppercase tracking-wide block mb-2"
              style={{ color: "var(--muted)" }}
            >
              New Password
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
          <div>
            <label
              className="text-sm font-semibold uppercase tracking-wide block mb-2"
              style={{ color: "var(--muted)" }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}