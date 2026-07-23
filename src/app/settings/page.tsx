"use client";

import { useTeaStore } from "@/lib/store";
import { Check, Palette, Trash2, Coffee } from "lucide-react";

const themes = [
  {
    id: "cozy-dark" as const,
    name: "Cozy Dark",
    description: "Deep warm browns, perfect for evening tea sessions",
    bg: "#1a1410",
    card: "#241c16",
    text: "#e8d5c4",
    accent: "#c4853f",
  },
  {
    id: "cozy-light" as const,
    name: "Cozy Light",
    description: "Warm cream tones, bright and airy",
    bg: "#f5efe6",
    card: "#ffffff",
    text: "#3d2f25",
    accent: "#c4853f",
  },
  {
    id: "warm" as const,
    name: "Warm Amber",
    description: "Rich amber glow, like a teapot on the stove",
    bg: "#2a1f17",
    card: "#34291e",
    text: "#f0d8b8",
    accent: "#e8a040",
  },
];

export default function SettingsPage() {
  const theme = useTeaStore((s) => s.theme);
  const setTheme = useTeaStore((s) => s.setTheme);
  const teaStates = useTeaStore((s) => s.teaStates);
  const customTeas = useTeaStore((s) => s.customTeas);

  const collectionCount = Object.values(teaStates).filter(s => s && s !== "empty").length;
  const haveCount = Object.values(teaStates).filter(s => s === "have").length;
  const triedCount = Object.values(teaStates).filter(s => s === "tried").length;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Settings</h1>
        <p className="text-muted text-sm mt-1">Customize your Teapp experience</p>
      </div>

      {/* Theme selector */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette size={20} className="text-accent" />
          <h2 className="text-lg font-semibold">Theme</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="rounded-xl border-2 p-4 text-left transition-all relative"
              style={{
                backgroundColor: t.card,
                borderColor: theme === t.id ? t.accent : "var(--border)",
                color: t.text,
              }}
            >
              {theme === t.id && (
                <span
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: t.accent, color: "#fff" }}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              <div className="flex gap-1.5 mb-3">
                <span className="w-6 h-6 rounded-full" style={{ backgroundColor: t.bg }} />
                <span className="w-6 h-6 rounded-full" style={{ backgroundColor: t.accent }} />
                <span className="w-6 h-6 rounded-full" style={{ backgroundColor: t.card, border: `1px solid ${t.accent}` }} />
              </div>
              <h3 className="font-medium text-sm">{t.name}</h3>
              <p className="text-xs mt-1 opacity-60">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Coffee size={20} className="text-accent" />
          <h2 className="text-lg font-semibold">Your Collection</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-3xl font-bold text-accent">{collectionCount}</p>
            <p className="text-xs text-muted mt-1">Total</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-3xl font-bold" style={{ color: "#7BA05B" }}>{haveCount}</p>
            <p className="text-xs text-muted mt-1">Currently have</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-3xl font-bold" style={{ color: "#c4853f" }}>{triedCount}</p>
            <p className="text-xs text-muted mt-1">Have tried</p>
          </div>
        </div>
      </div>

      {/* Custom teas */}
      {customTeas.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Custom Teas ({customTeas.length})</h2>
          </div>
          <div className="space-y-2">
            {customTeas.map(ct => (
              <div key={ct.id} className="flex items-center justify-between rounded-lg border p-3" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div>
                  <p className="font-medium text-sm">{ct.name}</p>
                  <p className="text-xs text-muted">{ct.origin || "Unknown origin"} · {ct.tea_type}</p>
                </div>
                <button
                  onClick={() => useTeaStore.getState().removeCustomTea(ct.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">About</h2>
        <p className="text-sm text-muted leading-relaxed">
          Teapp v1.0 — A cozy tea management webapp. Data sourced from Wikidata (277 entries) and TheTeaAPI (26 enriched entries).
          Your collection data is stored locally in your browser. Add custom teas for anything not in the database.
        </p>
      </div>
    </div>
  );
}