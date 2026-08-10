"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const CONSENT_KEY = "teapp-consent-accepted";

type Policy = {
  key: "terms" | "privacy" | "cookies";
  label: string;
  href: string;
};

const POLICIES: Policy[] = [
  { key: "terms", label: "Terms & Conditions", href: "/terms" },
  { key: "privacy", label: "Privacy Policy", href: "/privacy" },
  { key: "cookies", label: "Cookie Policy", href: "/cookies" },
];

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState(true); // assume accepted to avoid flash
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState<Record<Policy["key"], boolean>>({
    terms: false,
    privacy: false,
    cookies: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    setAccepted(stored === "true");
    setMounted(true);
  }, []);

  const allChecked = checked.terms && checked.privacy && checked.cookies;

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    setAccepted(true);
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  const toggle = (key: Policy["key"]) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  // Before mount, render children (avoids flash for already-consented users)
  if (!mounted || accepted) return <>{children}</>;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[20000] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="max-w-lg w-full rounded-2xl border shadow-2xl p-6"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-start gap-3 mb-4">
              <ShieldCheck size={28} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-serif font-bold" style={{ color: "var(--text)" }}>
                  Before you continue
                </h2>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
                  Please review and accept our policies to start using Teapp. You can read
                  each one by tapping the links below.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              {POLICIES.map((policy) => (
                <label
                  key={policy.key}
                  className="flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-colors"
                  style={{
                    backgroundColor: checked[policy.key]
                      ? "color-mix(in srgb, var(--accent) 8%, var(--bg))"
                      : "var(--bg)",
                    borderColor: checked[policy.key]
                      ? "var(--accent)"
                      : "var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(policy.key)}
                    className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: checked[policy.key]
                        ? "var(--accent)"
                        : "transparent",
                      borderColor: checked[policy.key]
                        ? "var(--accent)"
                        : "var(--border)",
                    }}
                  >
                    {checked[policy.key] && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{ color: "#fff" }}
                      >
                        <path
                          d="M2.5 6.5L4.5 8.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    I agree to the{" "}
                    <Link
                      href={policy.href}
                      className="underline"
                      style={{ color: "var(--accent)" }}
                    >
                      {policy.label}
                    </Link>
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                disabled={!allChecked}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all"
                style={{
                  backgroundColor: allChecked ? "var(--accent)" : "var(--border)",
                  color: allChecked ? "#fff" : "var(--muted)",
                  cursor: allChecked ? "pointer" : "not-allowed",
                }}
              >
                Accept &amp; continue
              </button>
              <button
                onClick={handleDecline}
                className="px-4 py-2.5 rounded-lg font-medium text-sm border transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                Decline
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}