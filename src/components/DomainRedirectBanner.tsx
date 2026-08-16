"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";

/**
 * Shows a dismissible banner on the old domain (teapp.denandras.cloud)
 * telling users to use the new domain (teapp.org). After 5 seconds,
 * automatically redirects to the equivalent path on teapp.org.
 */
export default function DomainRedirectBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only show on the old domain
    if (!window.location.hostname.includes("teapp.denandras.cloud")) return;
    if (dismissed) return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          // Redirect to the same path on the new domain
          const newPath = window.location.pathname + window.location.search + window.location.hash;
          window.location.href = `https://teapp.org${newPath}`;
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [dismissed]);

  // Don't render on the new domain or if dismissed
  if (typeof window !== "undefined" && !window.location.hostname.includes("teapp.denandras.cloud")) {
    return null;
  }
  if (dismissed) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 px-4 py-2.5 text-sm shadow-lg"
      style={{
        backgroundColor: "var(--accent)",
        color: "#fff",
      }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <ArrowRight size={16} className="shrink-0" />
        <span className="truncate">
          We&apos;ve moved to <strong>teapp.org</strong> — redirecting in {secondsLeft}s
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss banner"
      >
        <X size={14} />
      </button>
    </div>
  );
}