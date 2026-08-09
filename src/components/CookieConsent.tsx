"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "teapp-consent-accepted";

export function CookieConsent({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState(true); // assume accepted to avoid flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    setAccepted(stored === "true");
    setMounted(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    setAccepted(true);
  };

  const handleDecline = () => {
    // Redirect away — they can't use the app without accepting essential cookies
    window.location.href = "https://www.google.com";
  };

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
              <Cookie size={28} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-serif font-bold" style={{ color: "var(--text)" }}>
                  Before you continue
                </h2>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
                  Teapp uses essential cookies for authentication — these are strictly necessary
                  for sign-in and core functionality. We don&apos;t use tracking or advertising cookies.
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-3 mb-5" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                By clicking <span className="font-semibold" style={{ color: "var(--text)" }}>&ldquo;Accept&rdquo;</span>,
                you consent to our use of essential cookies and acknowledge our{" "}
                <Link href="/cookies" className="underline" style={{ color: "var(--accent)" }}>Cookie Policy</Link>,
                <Link href="/privacy" className="underline" style={{ color: "var(--accent)" }}> Privacy Policy</Link>,
                and <Link href="/terms" className="underline" style={{ color: "var(--accent)" }}>Terms &amp; Conditions</Link>.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                Accept
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