"use client";

import { useEffect } from "react";
import { useTeaStore } from "@/lib/store";

// --- Color utilities ---

/** Convert hex to {h, s, l} (all 0–1 except h which is 0–360). */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s, l };
}

/** Convert HSL back to a hex string. */
function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Lighten a hex color by the given percentage (0-100). */
function lighten(hex: string, percent: number): string {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex(h, s, Math.min(0.95, l + percent / 100));
}

/**
 * Derive a full palette from an accent color by rotating the hue of the
 * default amber-based cozy-dark theme to match the accent's hue.
 *
 * The default theme is built around amber (#c4853f, h≈32°). We take the
 * accent's hue and shift every palette color by the same delta, keeping
 * their saturation and lightness intact. This makes the entire UI feel
 * tinted by the chosen accent — dark tones included.
 */
function derivePalette(accentHex: string) {
  const accent = hexToHSL(accentHex);
  const defaultAccent = hexToHSL("#c4853f");

  // Hue rotation: how many degrees to shift from the default amber hue
  const hueShift = accent.h - defaultAccent.h;

  // Rotate a color's hue by the shift, wrapping around 360°
  const rotate = (hex: string) => {
    const { h, s, l } = hexToHSL(hex);
    return hslToHex((h + hueShift + 360) % 360, s, l);
  };

  // Default cozy-dark palette (amber-based)
  const defaults = {
    bg: "#1a1410",
    card: "#241c16",
    border: "#3d2f25",
    text: "#e8d5c4",
    muted: "#a08878",
  };

  return {
    bg: rotate(defaults.bg),
    card: rotate(defaults.card),
    border: rotate(defaults.border),
    text: rotate(defaults.text),
    muted: rotate(defaults.muted),
    accent: accentHex,
    accentHover: lighten(accentHex, 10),
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const accentColor = useTeaStore((s) => s.accentColor);

  useEffect(() => {
    const body = document.body;
    const palette = derivePalette(accentColor);
    body.style.setProperty("--bg", palette.bg);
    body.style.setProperty("--card", palette.card);
    body.style.setProperty("--border", palette.border);
    body.style.setProperty("--text", palette.text);
    body.style.setProperty("--muted", palette.muted);
    body.style.setProperty("--accent", palette.accent);
    body.style.setProperty("--accent-hover", palette.accentHover);
  }, [accentColor]);

  return <>{children}</>;
}