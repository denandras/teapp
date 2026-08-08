"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tea, TEA_TYPE_COLORS, TEA_TYPE_LABELS, ALL_TEA_TYPES, TeaStatus, TeaSourceType, SOURCE_LABELS, SOURCE_COLORS } from "@/lib/types";
import { useTeaStore, getCurrentUserId } from "@/lib/store";
import { Search, X, ChevronDown, ChevronUp, Star, Thermometer, Clock, Repeat } from "lucide-react";
import TeaDetailModal from "@/components/TeaDetailModal";

// Small pill badge showing where a tea came from (default / user / teahouse).
function SourceBadge({ tea }: { tea: Tea }) {
  const type: TeaSourceType = tea.source_type || "default";
  const color = SOURCE_COLORS[type];
  const label = tea.source || SOURCE_LABELS[type] || "Teapp";
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{ backgroundColor: type === "default" ? "transparent" : color + "22", color, border: type === "default" ? "1px solid var(--border)" : "1px solid " + color + "55" }}
      title={`Source: ${SOURCE_LABELS[type]}`}
    >
      {label}
    </span>
  );
}

export default function DatabasePage() {
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<TeaStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<TeaSourceType | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "type" | "rating">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedTea, setExpandedTea] = useState<string | null>(null);
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);

  // Reset expanded state when search or filters change to avoid stale state
  const searchKey = search + activeTypes.join(",") + statusFilter + sourceFilter;
  const [lastSearchKey, setLastSearchKey] = useState(searchKey);
  if (searchKey !== lastSearchKey) {
    setLastSearchKey(searchKey);
    if (expandedTea) setExpandedTea(null);
  }

  const teaStates = useTeaStore((s) => s.teaStates);
  const cycleTeaStatus = useTeaStore((s) => s.cycleTeaStatus);
  const allTeas = useTeaStore((s) => s.allTeas);
  const teaLogs = useTeaStore((s) => s.teaLogs);
  const hiddenTeas = useTeaStore((s) => s.hiddenTeas);

  const currentUserId = getCurrentUserId();

  const visibleTeas = useMemo(() => {
    return allTeas.filter(t => !hiddenTeas.includes(t.slug));
  }, [allTeas, hiddenTeas]);

  const filteredTeas = useMemo(() => {
    let teas = [...visibleTeas];
    if (search) {
      const q = search.toLowerCase();
      teas = teas.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.original_name?.toLowerCase().includes(q) ||
        t.phonetic_name?.toLowerCase().includes(q)
      );
    }
    if (activeTypes.length > 0) {
      teas = teas.filter(t => activeTypes.includes(t.tea_type));
    }
    if (statusFilter !== "all") {
      teas = teas.filter(t => (teaStates[t.slug] || "empty") === statusFilter);
    }
    if (sourceFilter !== "all") {
      if (sourceFilter === "user") {
        // 'Mine' — teas owned by the current user (both personal and teahouse)
        teas = teas.filter(t => (t.source_type === "user" || t.source_type === "teahouse") && t.owner_id === currentUserId);
      } else {
        teas = teas.filter(t => t.source_type === sourceFilter);
      }
    }
    teas.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "type") cmp = a.tea_type.localeCompare(b.tea_type);
      else if (sortBy === "rating") {
        const avgA = teaLogs[a.slug]?.length ? teaLogs[a.slug].reduce((s, l) => s + l.rating, 0) / teaLogs[a.slug].length : 0;
        const avgB = teaLogs[b.slug]?.length ? teaLogs[b.slug].reduce((s, l) => s + l.rating, 0) / teaLogs[b.slug].length : 0;
        cmp = avgA - avgB;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return teas;
  }, [visibleTeas, search, activeTypes, statusFilter, sourceFilter, sortBy, sortDir, teaStates, teaLogs, currentUserId]);

  const toggleType = (type: string) => {
    setActiveTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleSort = () => setSortDir(prev => prev === "asc" ? "desc" : "asc");

  const statusConfig: Record<string, { label: string; color: string }> = {
    empty: { label: "—", color: "var(--muted)" },
    have: { label: "✓ Have", color: "#7BA05B" },
    tried: { label: "✓ Tried", color: "#c4853f" },
  };

  const getAvgRating = (slug: string): number | null => {
    const logs = teaLogs[slug];
    if (!logs || logs.length === 0) return null;
    return logs.reduce((s, l) => s + l.rating, 0) / logs.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold">Tea Database</h1>
        <p className="text-muted text-sm mt-1">
          {filteredTeas.length} of {visibleTeas.length} teas · Click checkbox to cycle status
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search by name, phonetic, or original name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9 w-full py-2.5 rounded-lg text-sm border outline-none"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-accent"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-1">
        {ALL_TEA_TYPES.map(type => {
          const active = activeTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex-shrink-0"
              style={{
                backgroundColor: active ? TEA_TYPE_COLORS[type] : "transparent",
                color: active ? "#fff" : "var(--muted)",
                borderColor: active ? TEA_TYPE_COLORS[type] : "var(--border)",
              }}
            >
              {TEA_TYPE_LABELS[type]}
            </button>
          );
        })}
        <div className="w-px h-6 mx-2" style={{ backgroundColor: "var(--border)" }} />
        {(["all", "have", "tried", "empty"] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
            style={{
              backgroundColor: statusFilter === s ? "var(--accent)" : "transparent",
              color: statusFilter === s ? "#fff" : "var(--muted)",
              borderColor: statusFilter === s ? "var(--accent)" : "var(--border)",
            }}
          >
            {s === "all" ? "All" : statusConfig[s].label}
          </button>
        ))}
        <div className="w-px h-6 mx-2" style={{ backgroundColor: "var(--border)" }} />
        {(["all", "default", "teahouse", "user"] as const).map(s => (
          <button
            key={s}
            onClick={() => setSourceFilter(s)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
            style={{
              backgroundColor: sourceFilter === s ? SOURCE_COLORS[s === "all" ? "default" : s] : "transparent",
              color: sourceFilter === s ? "#fff" : "var(--muted)",
              borderColor: sourceFilter === s ? SOURCE_COLORS[s === "all" ? "default" : s] : "var(--border)",
            }}
          >
            {s === "all" ? "All" : s === "default" ? "Default" : s === "teahouse" ? "Tea House" : "Mine"}
          </button>
        ))}
        <div className="w-px h-6 mx-2" style={{ backgroundColor: "var(--border)" }} />
        <div className="flex items-center gap-1">
          {(["name", "type", "rating"] as const).map(s => (
            <button
              key={s}
              onClick={() => { setSortBy(s); if (s === "rating") setSortDir("desc"); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                backgroundColor: sortBy === s ? "var(--accent)" : "transparent",
                color: sortBy === s ? "#fff" : "var(--muted)",
                borderColor: sortBy === s ? "var(--accent)" : "var(--border)",
              }}
            >
              Sort: {s === "name" ? "Name" : s === "type" ? "Type" : "Rating"}
            </button>
          ))}
          <button
            onClick={toggleSort}
            className="px-2 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            {sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Tea list */}
      <div className="rounded-xl border overflow-hidden paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        {filteredTeas.length === 0 ? (
          <div className="p-8 text-center text-muted">No teas found matching your filters.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            <AnimatePresence>
              {filteredTeas.map((tea) => {
                const status = teaStates[tea.slug] || "empty";
                const expanded = expandedTea === tea.slug;
                const avgRating = getAvgRating(tea.slug);
                const logCount = teaLogs[tea.slug]?.length || 0;
                return (
                  <motion.div
                    key={tea.slug}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="group"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div
                      className="flex items-center gap-3 p-3 hover:bg-accent/5 cursor-pointer transition-colors"
                      onClick={() => setExpandedTea(expanded ? null : tea.slug)}
                    >
                      {/* Color dot — click to filter by type */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleType(tea.tea_type); }}
                        className="w-3 h-3 rounded-full flex-shrink-0 transition-transform hover:scale-125"
                        style={{ backgroundColor: tea.color_hex, outline: activeTypes.includes(tea.tea_type) ? `2px solid ${tea.color_hex}` : "none", outlineOffset: "2px" }}
                        title={`Filter: ${TEA_TYPE_LABELS[tea.tea_type]}`}
                        aria-label={`Filter by ${TEA_TYPE_LABELS[tea.tea_type]}`}
                      />

                      {/* Name — click to open detail modal */}
                      <div
                        className="min-w-0 flex-1"
                        onClick={(e) => { e.stopPropagation(); setSelectedTea(tea); }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate hover:text-accent transition-colors">{tea.name || "Unknown Tea"}</span>
                          <SourceBadge tea={tea} />
                        </div>
                        {(tea.original_name || tea.phonetic_name) && (
                          <span className="text-xs text-muted truncate block">
                            {tea.original_name && <span className="font-serif">{tea.original_name}</span>}
                            {tea.original_name && tea.phonetic_name && " · "}
                            {tea.phonetic_name}
                          </span>
                        )}
                        {/* Inline brewing badges */}
                        <div className="flex items-center gap-2 mt-1">
                          {tea.brewing_temp_c != null && (
                            <span className="flex items-center gap-0.5 text-xs text-muted">
                              <Thermometer size={11} className="text-accent" />
                              {tea.brewing_temp_c}°C
                            </span>
                          )}
                          {tea.brewing_time_min != null && (
                            <span className="flex items-center gap-0.5 text-xs text-muted">
                              <Clock size={11} className="text-accent" />
                              {tea.brewing_time_min}m
                            </span>
                          )}
                          {tea.brewing_num_brews > 1 && (
                            <span className="flex items-center gap-0.5 text-xs text-muted">
                              <Repeat size={11} className="text-accent" />
                              {tea.brewing_num_brews}×
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Average rating */}
                      {avgRating !== null && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star size={13} fill="var(--accent)" className="text-accent" />
                          <span className="text-xs font-medium">{avgRating.toFixed(1)}</span>
                          <span className="text-xs text-muted">({logCount})</span>
                        </div>
                      )}

                      {/* Type badge */}
                      <span
                        className="hidden sm:inline px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                        style={{ backgroundColor: tea.color_hex + "20", color: tea.color_hex }}
                      >
                        {TEA_TYPE_LABELS[tea.tea_type]}
                      </span>

                      {/* Status checkbox */}
                      <button
                        onClick={(e) => { e.stopPropagation(); cycleTeaStatus(tea.slug); }}
                        className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: status === "empty" ? "transparent" : statusConfig[status].color,
                          border: `2px solid ${status === "empty" ? "var(--border)" : statusConfig[status].color}`,
                          color: status === "empty" ? "var(--muted)" : "#fff",
                        }}
                        title={`Status: ${status} (click to cycle)`}
                      >
                        {status === "have" && "✓"}
                        {status === "tried" && "✓"}
                        {status === "empty" && ""}
                      </button>

                      {/* Expand arrow */}
                      <ChevronDown
                        size={16}
                        className={`text-muted flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 space-y-2">
                            <p className="text-sm leading-relaxed">{tea.description || "No description available."}</p>
                            {tea.origin && <p className="text-xs text-muted">Origin: {tea.origin}</p>}
                            {tea.caffeine_level && <p className="text-xs text-muted">Caffeine: {tea.caffeine_level}</p>}
                            {tea.characteristics.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {tea.characteristics.map((c: string) => (
                                  <span key={c} className="px-2 py-0.5 rounded-full text-xs"
                                    style={{ backgroundColor: tea.color_hex + "20", color: tea.color_hex }}>{c}</span>
                                ))}
                              </div>
                            )}
                            <button
                              onClick={() => setSelectedTea(tea)}
                              className="text-xs text-accent hover:text-accent transition-colors mt-2"
                            >
                              View full details →
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {selectedTea && <TeaDetailModal tea={selectedTea} onClose={() => setSelectedTea(null)} />}
    </div>
  );
}