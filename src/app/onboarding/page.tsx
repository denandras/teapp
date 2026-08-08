"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Store, Loader2, MapPin, Mail, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { upsertProfile, type ProfileType } from "@/lib/profiles";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [selected, setSelected] = useState<ProfileType | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [teahouseName, setTeahouseName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const userId = user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userId) {
      setError("You must be signed in to set up your profile.");
      return;
    }
    if (!selected) {
      setError("Please choose a profile type first.");
      return;
    }
    setBusy(true);
    try {
      if (selected === "personal") {
        if (!displayName.trim()) {
          setError("Please enter a display name.");
          setBusy(false);
          return;
        }
        // Personal profiles are immediately approved.
        await upsertProfile(userId, {
          display_name: displayName.trim(),
          profile_type: "personal",
          enrollment_status: "approved",
        });
      } else {
        if (!teahouseName.trim() || !contactEmail.trim() || !address.trim()) {
          setError("Please fill in all teahouse details.");
          setBusy(false);
          return;
        }
        // Teahouse enrollments start as pending until an admin approves them.
        await upsertProfile(userId, {
          display_name: teahouseName.trim(),
          profile_type: "teahouse",
          teahouse_name: teahouseName.trim(),
          teahouse_contact_email: contactEmail.trim(),
          teahouse_address: address.trim(),
          enrollment_status: "pending",
        });
      }

      await refreshProfile();
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save your profile.";
      setError(message);
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl p-8"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-col items-center mb-6">
          <Store size={40} className="text-accent mb-2" />
          <h1 className="text-2xl font-serif font-bold" style={{ color: "var(--text)" }}>
            Welcome to Teapp
          </h1>
          <p className="text-sm mt-1 text-center" style={{ color: "var(--muted)" }}>
            Tell us a little about yourself to get started.
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

        {!selected ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted)" }}>
              How will you use Teapp?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelected("personal")}
                className="rounded-xl border p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
              >
                <User size={28} className="text-accent mb-3" />
                <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>
                  Personal
                </h2>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Track your tea collection, log tastings, and build a wishlist for yourself.
                  You&apos;ll get started right away.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelected("teahouse")}
                className="rounded-xl border p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
              >
                <Store size={28} className="text-accent mb-3" />
                <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>
                  Teahouse
                </h2>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  List your teahouse&apos;s teas and share them with the community. Enrollments
                  require a short review.
                </p>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-sm hover:underline"
              style={{ color: "var(--accent)" }}
            >
              <ArrowLeft size={16} />
              Change profile type
            </button>

            {selected === "personal" ? (
              <div>
                <label className="text-sm font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                  className="w-full px-4 py-2.5 rounded-lg border outline-none"
                  style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                />
                <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: "#7BA05B" }}>
                  <Check size={14} />
                  Your personal profile is ready immediately.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>
                    Teahouse Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={teahouseName}
                    onChange={(e) => setTeahouseName(e.target.value)}
                    placeholder="e.g. The Green Leaf Teahouse"
                    className="w-full px-4 py-2.5 rounded-lg border outline-none"
                    style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="owner@yourteahouse.com"
                    className="w-full px-4 py-2.5 rounded-lg border outline-none"
                    style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--muted)" }}>
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, Hungary"
                    className="w-full px-4 py-2.5 rounded-lg border outline-none"
                    style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div
                  className="rounded-lg border p-3 text-sm"
                  style={{ backgroundColor: "#c4a05020", borderColor: "#c4a050" }}
                >
                  <p style={{ color: "var(--muted)" }}>
                    <span className="font-semibold" style={{ color: "#c4a050" }}>
                      Your enrollment is pending approval.
                    </span>{" "}
                    You can browse teas but cannot add teahouse teas until approved.
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              {busy ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving…
                </>
              ) : (
                "Finish setup"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
