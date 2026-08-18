"use client";

import { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTeaStore } from "@/lib/store";
import { useAuth } from "@/components/AuthProvider";
import { triggerColorFlow } from "@/components/ThemeProvider";
import { Palette, Trash2, Coffee, LogOut, PieChart as PieIcon, Store, CalendarDays } from "lucide-react";
import TeaCalendarGraph from "@/components/TeaCalendarGraph";
import { TEA_TYPE_COLORS, TEA_TYPE_LABELS, ALL_TEA_TYPES } from "@/lib/types";
import { isApprovedTeahouse } from "@/lib/profiles";
import { supabase } from "@/lib/supabaseClient";

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
  const teaLogs = useTeaStore((s) => s.teaLogs);
  const customTeas = useTeaStore((s) => s.customTeas);
  const allTeas = useTeaStore((s) => s.allTeas);
  const { isDemo, signOut, exitDemo } = useAuth();

  const haveCount = Object.values(teaStates).filter(s => s === "have").length;
  const triedCount = Object.values(teaStates).filter(s => s === "tried").length;
  const collectionCount = haveCount + triedCount;

  // Build slug → tea_type lookup from allTeas
  const teaTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of allTeas) {
      map[t.slug] = t.tea_type;
    }
    return map;
  }, [allTeas]);

  // Collection breakdown: count teas by type for teas in collection (have + tried)
  const collectionByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [slug, status] of Object.entries(teaStates)) {
      if (status !== "have" && status !== "tried") continue;
      const type = teaTypeMap[slug];
      if (!type) continue;
      counts[type] = (counts[type] || 0) + 1;
    }
    return ALL_TEA_TYPES
      .map(t => ({ type: t, name: TEA_TYPE_LABELS[t] || t, value: counts[t] || 0, color: TEA_TYPE_COLORS[t] || "#999" }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [teaStates, teaTypeMap]);

  const collectionTotal = collectionByType.reduce((sum, d) => sum + d.value, 0);

  // Taste profile: sum log ratings by tea type
  const tasteByType = useMemo(() => {
    const sums: Record<string, number> = {};
    for (const [slug, logs] of Object.entries(teaLogs)) {
      const type = teaTypeMap[slug];
      if (!type || !logs || logs.length === 0) continue;
      const totalRating = logs.reduce((sum, l) => sum + l.rating, 0);
      sums[type] = (sums[type] || 0) + totalRating;
    }
    return ALL_TEA_TYPES
      .map(t => ({ type: t, name: TEA_TYPE_LABELS[t] || t, value: sums[t] || 0, color: TEA_TYPE_COLORS[t] || "#999" }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [teaLogs, teaTypeMap]);

  const tasteTotal = tasteByType.reduce((sum, d) => sum + d.value, 0);

  // --- Teahouse community stats ---
  const { profile } = useAuth();
  const showTeahouseStats = isApprovedTeahouse(profile);

  // Teahouse published teas breakdown by type (from allTeas filtered by owner)
  const teahouseCollectionByType = useMemo(() => {
    if (!showTeahouseStats || !profile?.id) return [];
    const counts: Record<string, number> = {};
    for (const t of allTeas) {
      if (t.source_type !== "teahouse" || t.owner_id !== profile.id) continue;
      counts[t.tea_type] = (counts[t.tea_type] || 0) + 1;
    }
    return ALL_TEA_TYPES
      .map(t => ({ type: t, name: TEA_TYPE_LABELS[t] || t, value: counts[t] || 0, color: TEA_TYPE_COLORS[t] || "#999" }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [allTeas, showTeahouseStats, profile]);

  const teahouseCollectionTotal = teahouseCollectionByType.reduce((sum, d) => sum + d.value, 0);

  // Teahouse community ratings by type (via RPC)
  interface TeahouseRatingEntry { tea_type: string; avg: number; count: number; sum: number; }
  const [teahouseRatings, setTeahouseRatings] = useState<TeahouseRatingEntry[]>([]);
  useEffect(() => {
    if (!showTeahouseStats || !profile?.id) return;
    supabase
      .rpc("get_teahouse_rating_breakdown", { owner_id_val: profile.id })
      .then(({ data, error }) => {
        if (error) {
          console.error("get_teahouse_rating_breakdown error:", error.message);
          return;
        }
        if (data) setTeahouseRatings(data as TeahouseRatingEntry[]);
      });
  }, [showTeahouseStats, profile]);

  const teahouseTasteByType = useMemo(() => {
    return teahouseRatings
      .map(r => ({
        type: r.tea_type,
        name: TEA_TYPE_LABELS[r.tea_type] || r.tea_type,
        value: r.sum,
        count: r.count,
        avg: r.avg,
        color: TEA_TYPE_COLORS[r.tea_type] || "#999",
      }))
      .sort((a, b) => b.value - a.value);
  }, [teahouseRatings]);

  const teahouseTasteTotal = teahouseTasteByType.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-8">
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
            <p className="text-xs text-muted mt-1">In collection</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-3xl font-bold text-accent">{collectionCount}</p>
            <p className="text-xs text-muted mt-1">Total</p>
          </div>
        </div>
      </div>

      {/* Tea drinking calendar — full history */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={20} className="text-accent" />
          <h2 className="text-lg font-semibold">Drinking History</h2>
        </div>
        <p className="text-xs text-muted mb-4">
          Your tea drinking activity. The calendar fills the available space — hover any day to see what you logged.
        </p>
        <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <TeaCalendarGraph />
        </div>
      </div>

      {/* Collection breakdown pie chart */}
      {collectionTotal > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={20} className="text-accent" />
            <h2 className="text-lg font-semibold">Collection Breakdown</h2>
          </div>
          <p className="text-xs text-muted mb-4">
            Tea type distribution across your collection ({collectionTotal} {collectionTotal === 1 ? "tea" : "teas"}).
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={collectionByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {collectionByType.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload as { name: string; value: number; color: string };
                      const pct = collectionTotal > 0 ? Math.round((d.value / collectionTotal) * 100) : 0;
                      return (
                        <div className="rounded-lg px-2.5 py-1.5 text-xs shadow-lg" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                          <span style={{ color: d.color }}>●</span>{" "}
                          <span style={{ color: "var(--text)" }}>{d.name}</span>
                          <span className="text-muted"> — {d.value} ({pct}%)</span>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              {collectionByType.map((d) => {
                const pct = collectionTotal > 0 ? Math.round((d.value / collectionTotal) * 100) : 0;
                return (
                  <div key={d.type} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="flex-1 truncate" style={{ color: "var(--text)" }}>{d.name}</span>
                    <span className="text-muted text-xs">{d.value} · {pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Taste profile pie chart */}
      {tasteTotal > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={20} className="text-accent" />
            <h2 className="text-lg font-semibold">Taste Profile</h2>
          </div>
          <p className="text-xs text-muted mb-4">
            Which tea types you like most, based on all-time tasting log ratings.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasteByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {tasteByType.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload as { name: string; value: number; color: string };
                      const pct = tasteTotal > 0 ? Math.round((d.value / tasteTotal) * 100) : 0;
                      return (
                        <div className="rounded-lg px-2.5 py-1.5 text-xs shadow-lg" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                          <span style={{ color: d.color }}>●</span>{" "}
                          <span style={{ color: "var(--text)" }}>{d.name}</span>
                          <span className="text-muted"> — {d.value} pts ({pct}%)</span>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              {tasteByType.map((d) => {
                const pct = tasteTotal > 0 ? Math.round((d.value / tasteTotal) * 100) : 0;
                return (
                  <div key={d.type} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="flex-1 truncate" style={{ color: "var(--text)" }}>{d.name}</span>
                    <span className="text-muted text-xs">{d.value} pts · {pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Teahouse community stats */}
      {showTeahouseStats && (
        <>
          <div className="border-t pt-6" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Store size={20} className="text-accent" />
              <h2 className="text-lg font-semibold">Teahouse Statistics</h2>
            </div>
            <p className="text-xs text-muted mb-6">
              Community ratings and collection breakdown for your published teas.
            </p>
          </div>

          {/* Teahouse published teas breakdown */}
          {teahouseCollectionTotal > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Your Published Teas</h3>
              <p className="text-xs text-muted mb-4">
                Tea type distribution across your teahouse catalogue ({teahouseCollectionTotal} {teahouseCollectionTotal === 1 ? "tea" : "teas"}).
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-48 h-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={teahouseCollectionByType}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={85}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {teahouseCollectionByType.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const d = payload[0].payload as { name: string; value: number; color: string };
                          const pct = teahouseCollectionTotal > 0 ? Math.round((d.value / teahouseCollectionTotal) * 100) : 0;
                          return (
                            <div className="rounded-lg px-2.5 py-1.5 text-xs shadow-lg" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                              <span style={{ color: d.color }}>●</span>{" "}
                              <span style={{ color: "var(--text)" }}>{d.name}</span>
                              <span className="text-muted"> — {d.value} ({pct}%)</span>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {teahouseCollectionByType.map((d) => {
                    const pct = teahouseCollectionTotal > 0 ? Math.round((d.value / teahouseCollectionTotal) * 100) : 0;
                    return (
                      <div key={d.type} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="flex-1 truncate" style={{ color: "var(--text)" }}>{d.name}</span>
                        <span className="text-muted text-xs">{d.value} · {pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Teahouse community ratings by type */}
          {teahouseTasteTotal > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Community Taste Profile</h3>
              <p className="text-xs text-muted mb-4">
                Which of your tea types the community likes most, based on all ratings from all users.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-48 h-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={teahouseTasteByType}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={85}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {teahouseTasteByType.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const d = payload[0].payload as { name: string; value: number; count: number; avg: number; color: string };
                          const pct = teahouseTasteTotal > 0 ? Math.round((d.value / teahouseTasteTotal) * 100) : 0;
                          return (
                            <div className="rounded-lg px-2.5 py-1.5 text-xs shadow-lg" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                              <span style={{ color: d.color }}>●</span>{" "}
                              <span style={{ color: "var(--text)" }}>{d.name}</span>
                              <span className="text-muted"> — {d.value} pts · {d.count} {d.count === 1 ? "rating" : "ratings"} · avg {d.avg} ({pct}%)</span>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {teahouseTasteByType.map((d) => {
                    const pct = teahouseTasteTotal > 0 ? Math.round((d.value / teahouseTasteTotal) * 100) : 0;
                    return (
                      <div key={d.type} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="flex-1 truncate" style={{ color: "var(--text)" }}>{d.name}</span>
                        <span className="text-muted text-xs">{d.value} pts · {pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Teahouse has no published teas or no community ratings yet */}
          {teahouseCollectionTotal === 0 && teahouseTasteTotal === 0 && (
            <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <p className="text-sm text-muted">
                You haven&apos;t published any teahouse teas yet. Publish teas to see community rating statistics here.
              </p>
            </div>
          )}
        </>
      )}

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