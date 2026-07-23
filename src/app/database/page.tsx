"use client";

import { useState, useMemo } from "react";
import { TEAS } from "@/data/teas";
import { Tea, TEA_TYPE_COLORS, TEA_TYPE_LABELS, ALL_TEA_TYPES, TeaStatus } from "@/lib/types";
import { useTeaStore } from "@/lib/store";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import TeaDetailModal from "@/components/TeaDetailModal";

export default function DatabasePage() {
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<TeaStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "type">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedTea, setExpandedTea] = useState<string | null>(null);
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);

  const teaStates = useTeaStore((s) => s.teaStates);
  const cycleTeaStatus = useTeaStore((s) => s.cycleTeaStatus);
  const customTeas = useTeaStore((s) => s.customTeas);

  const allTeas = useMemo(() => {
    const teaList = TEAS.map((t, i) => ({ ...t, id: i + 1 }));
    // Add custom teas
    const customMapped = customTeas.map((ct) => ({
      id: -1,
      name: ct.name,
      slug: `custom-${ct.id}`,
      phonetic_name: "",
      chinese_name: "",
      description: ct.description,
      origin: ct.origin,
      tea_type: ct.tea_type,
      category: "",
      caffeine_level: "",
      brewing_temp_c: null,
      brewing_time_min: null,
      brewing_instructions: "",
      characteristics: [],
      health_benefits: [],
      color_hex: TEA_TYPE_COLORS[ct.tea_type] || "#999",
      oxidation_level: 50,
      roast_level: 50,
      source: "custom",
      wikidata_qid: null,
      is_custom: true,
    }));
    return [...teaList, ...customMapped];
  }, [customTeas]);

  const filteredTeas = useMemo(() => {
    let teas = [...allTeas];
    if (search) {
      const q = search.toLowerCase();
      teas = teas.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.chinese_name?.toLowerCase().includes(q) ||
        t.phonetic_name?.toLowerCase().includes(q)
      );
    }
    if (activeTypes.length > 0) {
      teas = teas.filter(t => activeTypes.includes(t.tea_type));
    }
    if (statusFilter !== "all") {
      teas = teas.filter(t => (teaStates[t.slug] || "empty") === statusFilter);
    }
    teas.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else cmp = a.tea_type.localeCompare(b.tea_type);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return teas;
  }, [allTeas, search, activeTypes, statusFilter, sortBy, sortDir, teaStates]);

  const toggleType = (type: string) => {
    setActiveTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleSort = () => setSortDir(prev => prev === "asc" ? "desc" : "asc");

  const statusConfig: Record<string, { label: string; color: string }> = {
    empty: { label: "—", color: "var(--muted)" },
    have: { label: "✓ Have", color: "#7BA05B" },
    tried: { label: "✓ Tried", color: "#c4853f" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold">Tea Database</h1>
        <p className="text-muted text-sm mt-1">
          {filteredTeas.length} of {allTeas.length} teas · Click checkbox to cycle: none → have → tried → none
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search by name, phonetic, or Chinese name..."
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
      <div className="flex items-center gap-2 flex-wrap">
        {ALL_TEA_TYPES.map(type => {
          const active = activeTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
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
        <button
          onClick={() => setSortBy(s => s === "name" ? "type" : "name")}
          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          Sort: {sortBy === "name" ? "Name" : "Type"}
        </button>
        <button
          onClick={toggleSort}
          className="px-2 py-1.5 rounded-full text-xs font-medium border transition-all"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          {sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Tea list */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        {filteredTeas.length === 0 ? (
          <div className="p-8 text-center text-muted">No teas found matching your filters.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filteredTeas.map((tea) => {
              const status = teaStates[tea.slug] || "empty";
              const expanded = expandedTea === tea.slug;
              return (
                <div
                  key={tea.slug}
                  className="group"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    className="flex items-center gap-3 p-3 hover:bg-accent/5 cursor-pointer transition-colors"
                    onClick={() => setExpandedTea(expanded ? null : tea.slug)}
                  >
                    {/* Color dot */}
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tea.color_hex }}
                    />

                    {/* Name */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium truncate">{tea.name}</span>
                        {tea.is_custom && (
                          <span className="text-xs px-1.5 py-0.5 rounded text-accent" style={{ backgroundColor: "var(--accent)" + "20" }}>custom</span>
                        )}
                      </div>
                      {(tea.chinese_name || tea.phonetic_name) && (
                        <span className="text-xs text-muted truncate block">
                          {tea.chinese_name && <span className="font-serif">{tea.chinese_name}</span>}
                          {tea.chinese_name && tea.phonetic_name && " · "}
                          {tea.phonetic_name}
                        </span>
                      )}
                    </div>

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
                  {expanded && (
                    <div className="px-4 pb-4 pt-1 space-y-2">
                      <p className="text-sm leading-relaxed">{tea.description || "No description available."}</p>
                      {tea.origin && <p className="text-xs text-muted">Origin: {tea.origin}</p>}
                      {tea.caffeine_level && <p className="text-xs text-muted">Caffeine: {tea.caffeine_level}</p>}
                      {(tea.brewing_temp_c || tea.brewing_time_min) && (
                        <p className="text-xs text-muted">
                          Brewing: {tea.brewing_temp_c ? `${tea.brewing_temp_c}°C` : ""} {tea.brewing_time_min ? `${tea.brewing_time_min}min` : ""}
                        </p>
                      )}
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTea && <TeaDetailModal tea={selectedTea} onClose={() => setSelectedTea(null)} />}
    </div>
  );
}