"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf } from "lucide-react";
import BrewOverlay from "@/components/experience/BrewOverlay";

/**
 * The footer notch: the footer grows a handle for the brew ritual.
 *
 * Deliberately legible rather than "quiet architecture" — the first version used
 * a --bg disc on a --card footer (~6% contrast, no label) and the owner could not
 * find it. The accent fill plus the word BREW is the affordance; the notch is
 * just the frame. Opening morphs this node into the dial's centre.
 */
export default function BrewLauncher() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Defer the shared-element pairing until after hydration.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const disc = (
    <Leaf size={20} strokeWidth={2} aria-hidden />
  );

  return (
    <>
      <div className="brew-lip">
        <button
          onClick={() => setOpen(true)}
          aria-label="Brew a tea"
          className="brew-lip-button"
        >
          {mounted ? (
            <motion.span layoutId="brew-medallion" className="brew-lip-disc">
              {disc}
            </motion.span>
          ) : (
            <span className="brew-lip-disc">{disc}</span>
          )}
          <span className="brew-lip-label">Brew</span>
        </button>
      </div>

      <AnimatePresence>{open && <BrewOverlay onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
