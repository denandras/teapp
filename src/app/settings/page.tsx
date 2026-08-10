"use client";

import { useTeaStore } from "@/lib/store";
import { useAuth } from "@/components/AuthProvider";
import { triggerColorFlow } from "@/components/ThemeProvider";
import { Palette, Trash2, Coffee, LogOut } from "lucide-react";

const accentColors = [
  { id: "amber", name: "Amber", color: "#c4853f" },
  { id: "green", name: "Green", color: "#7BA05B" },
  { id: "rose", name: "Rose", color: "#c44a5f" },
  { id: "blue", name: "Blue", color: "#5b8ac4" },
  { id: "purple", name: "Purple", color: "#9b6bc4" },
  { id: "teal", name: "Teal", color: "#4ab8a0" },
  { id: "gold", name: "Gold", color: "#c4a050" },
  { id: "coral", name: "Coral", color: "#e8704a" },
  { id: "lavender", name: "Lavender", color: "#b8a0d4" },
  { id: "sage", name: "Sage", color: "#8aab6b" },
  { id: "ocean", name: "Ocean", color: "#4a8ab8" },
  { id: "ruby", name: "Ruby", color: "#c44a6f" },
];

export default function SettingsPage() {
  const accentColor = useTeaStore((s) => s.accentColor);
  const setAccentColor = useTeaStore((s) => s.setAccentColor);
  const teaStates = useTeaStore((s) => s.teaStates);
  const customTeas = useTeaStore((s) => s.customTeas);
  const allTeas = useTeaStore((s) => s.allTeas);
  const { isDemo, signOut, exitDemo } = useAuth();

  const collectionCount = Object.values(teaStates).filter(s => s && s !== "empty").length;
  const haveCount = Object.values(teaStates).filter(s => s === "have" || s === "tried").length;
  const triedCount = Object.values(teaStates).filter(s => s === "tried").length;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Settings</h1>
        <p className="text-muted text-sm mt-1">Customize your Teapp experience</p>
      </div>

      {/* Accent color selector */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette size={20} className="text-accent" />
          <h2 className="text-lg font-semibold">Accent Color</h2>
        </div>
        <p className="text-xs text-muted mb-4">
          Pick an accent color to personalize your Teapp. It colors highlights, buttons, and links.
        </p>
        <div className="grid grid-cols-6 gap-3 sm:grid-cols-6">
          {accentColors.map(c => {
            const selected = accentColor.toLowerCase() === c.color.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  triggerColorFlow(c.color, rect.left + rect.width / 2, rect.top + rect.height / 2);
                  setAccentColor(c.color);
                }}
                title={c.name}
                aria-label={`Set accent color to ${c.name}`}
                className="group flex flex-col items-center gap-2 focus:outline-none"
              >
                <span
                  className={`w-10 h-10 rounded-full transition-all duration-150 ${
                    selected
                      ? "ring-2 ring-offset-2 ring-offset-[var(--bg)] scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{
                    backgroundColor: c.color,
                    borderColor: "var(--border)",
                    boxShadow: selected
                      ? `0 0 0 3px ${c.color}33`
                      : `inset 0 0 0 1px rgba(0,0,0,0.2)`,
                  }}
                />
                <span
                  className={`text-[11px] ${selected ? "text-accent font-medium" : "text-muted"}`}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
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
            <p className="text-3xl font-bold" style={{ color: "#c4853f" }}>{triedCount}</p>
            <p className="text-xs text-muted mt-1">Have tried</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-3xl font-bold" style={{ color: "#7BA05B" }}>{haveCount}</p>
            <p className="text-xs text-muted mt-1">Have it</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-3xl font-bold text-accent">{collectionCount}</p>
            <p className="text-xs text-muted mt-1">Total</p>
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

      {/* Logout / Exit Demo */}
      <div className="rounded-xl border p-4 flex items-center justify-between" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {isDemo ? "Demo Mode" : "Account"}
          </h2>
          <p className="text-xs text-muted mt-1">
            {isDemo
              ? "Data stored locally in this browser only."
              : "Sign out to return to the login screen."}
          </p>
        </div>
        <button
          onClick={isDemo ? exitDemo : () => signOut()}
          className="ml-4 shrink-0 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 border"
          style={{
            backgroundColor: "transparent",
            borderColor: isDemo ? "var(--accent)" : "var(--border)",
            color: isDemo ? "var(--accent)" : "var(--muted)",
          }}
        >
          <LogOut size={14} />
          {isDemo ? "Exit Demo" : "Sign out"}
        </button>
      </div>

      {/* About */}
      <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">About</h2>
        <p className="text-sm text-muted leading-relaxed">
          Teapp v2.0 — A cozy tea management webapp. Database: {allTeas.filter(t => t.source_type === "default").length} default teas, {allTeas.filter(t => t.source_type === "teahouse").length} teahouse teas. Includes a tea wiki covering brewing methods, pouring techniques, accessories, and tea processing.
          {isDemo
            ? " Demo mode: data stored locally in your browser only."
            : " Your data is synced to Supabase. Add custom teas for anything not in the database."}
        </p>
      </div>

      {/* Contact */}
      <div className="text-center pb-4">
        <p className="text-xs text-muted">
          Questions or feedback?{" "}
          <a
            href="mailto:contact@andrasdenes.com"
            className="hover:underline"
            style={{ color: "var(--accent)" }}
          >
            contact@andrasdenes.com
          </a>
        </p>
      </div>
    </div>
  );
}