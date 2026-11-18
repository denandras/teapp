"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf } from "lucide-react";
import BrewOverlay from "@/components/experience/BrewOverlay";

/**
 * The footer notch: a 4px lip the footer grows around a leaf. Not a floating
 * action button — accent lives on the glyph, never as a filled glow.
 * Opening morphs this node into the dial's centre and closing brings it home.
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
              <Leaf size={22} strokeWidth={1.75} />
            </motion.span>
          ) : (
            <span className="brew-lip-disc">
              <Leaf size={22} strokeWidth={1.75} />
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>{open && <BrewOverlay onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
