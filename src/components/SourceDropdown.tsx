"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface DropdownProps {
  /** Label shown on the collapsed button, e.g. "Shop" */
  label: string;
  /** Option names */
  options: string[];
  /** Currently selected option names */
  selected: string[];
  /** Toggle an option on/off */
  onToggle: (name: string) => void;
  /** Accent color for selected rows + open state */
  color: string;
}

// Multi-select dropdown (not a native <select> — custom, closes on outside click)
export default function SourceDropdown({ label, options, selected, onToggle, color }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-1.5"
        style={{
          backgroundColor: selected.length > 0 ? color : "transparent",
          color: selected.length > 0 ? "#fff" : "var(--muted)",
          borderColor: selected.length > 0 ? color : "var(--border)",
        }}
      >
        {label}
        {selected.length > 0 && (
          <span
            className="px-1.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
          >
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1 z-50 rounded-lg border shadow-lg py-1 min-w-44 max-w-60"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            {options.map(name => {
              const active = selected.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => onToggle(name)}
                  className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:opacity-80 transition-opacity"
                  style={{ color: active ? color : "var(--text)" }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: active ? color : "var(--border)",
                      backgroundColor: active ? color : "transparent",
                    }}
                  >
                    {active && <Check size={10} color="#fff" />}
                  </span>
                  <span className="truncate">{name}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}