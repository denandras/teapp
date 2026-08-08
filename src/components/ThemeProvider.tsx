"use client";

import { useEffect } from "react";
import { useTeaStore } from "@/lib/store";

// Lighten a hex color by the given percentage (0-100) for the hover variant.
function lighten(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const amt = Math.round((255 * percent) / 100);
  const r = Math.min(255, (num >> 16) + amt);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const b = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const accentColor = useTeaStore((s) => s.accentColor);

  useEffect(() => {
    const body = document.body;
    body.style.setProperty("--accent", accentColor);
    body.style.setProperty("--accent-hover", lighten(accentColor, 10));
  }, [accentColor]);

  return <>{children}</>;
}
