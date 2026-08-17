"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceLine, ReferenceArea } from "recharts";
import { Tea, TEA_TYPE_COLORS, TEA_TYPE_LABELS, ALL_TEA_TYPES, SOURCE_COLORS, SOURCE_LABELS } from "@/lib/types";
import { useTeaStore } from "@/lib/store";
import TeaDetailModal from "@/components/TeaDetailModal";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [activeTeahouses, setActiveTeahouses] = useState<string[]>([]);
  const [showOnlyCollection, setShowOnlyCollection] = useState(false);
  const [hoveredTea, setHoveredTea] = useState<{ tea: Tea; x: number; y: number; px: number; py: number } | null>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const teaStates = useTeaStore((s) => s.teaStates);
  const allTeas = useTeaStore((s) => s.allTeas);

  const collectionCount = Object.values(teaStates).filter(s => s && s !== "empty").length;

  // Default to "My Collection" view only if user has teas in their collection
  useEffect(() => {
    if (collectionCount > 0 && !showOnlyCollection) {
      setShowOnlyCollection(true);
    }
  }, [collectionCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredTeas = useMemo(() => {
    let teas = allTeas.map((t, i) => ({ ...t, id: i + 1 }));
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
    if (activeTeahouses.length > 0) {
      teas = teas.filter(t => t.source_type === "teahouse" && activeTeahouses.includes(t.source || ""));
    }
    if (showOnlyCollection) {
      teas = teas.filter(t => teaStates[t.slug] && teaStates[t.slug] !== "empty");
    }
    return teas;
  }, [search, activeTypes, activeTeahouses, showOnlyCollection, teaStates, allTeas]);

  // Convert 0-100 flavor coordinates to centered -50..+50 range
  const chartData = useMemo(() =>
    filteredTeas.map(t => ({
      x: (t.flavor_x ?? 50) - 50,
      y: -((t.flavor_y ?? 50) - 50), // flip Y so positive = up
      z: teaStates[t.slug] === "have" ? 400 : teaStates[t.slug] === "tried" ? 250 : 120,
      tea: t,
      color: t.color_hex || "#999",
      status: teaStates[t.slug] || "empty",
    })),
  [filteredTeas, teaStates]);

  const toggleType = (type: string) => {
    setActiveTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  // Unique teahouse names from visible teas
  const teahouses = useMemo(() => {
    const names = new Set<string>();
    allTeas.forEach(t => {
      if (t.source_type === "teahouse" && t.source) names.add(t.source);
    });
    return Array.from(names).sort();
  }, [allTeas]);

  const toggleTeahouse = (name: string) => {
    setActiveTeahouses(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  };

  // Bubble animation: pop dots out, swap data, pop dots back in
  const [scatterPhase, setScatterPhase] = useState<"idle" | "pop-out" | "pop-in">("idle");

  const handleCollectionToggle = () => {
    // Phase 1: fade existing dots out
    setScatterPhase("pop-out");
    setTimeout(() => {
      // Phase 2: swap data + fade new dots in
      setShowOnlyCollection(prev => !prev);
      setScatterPhase("pop-in");
      setTimeout(() => setScatterPhase("idle"), 400);
    }, 250);
  };

  // Stagger delay for dots popping in
  const staggerDelay = (index: number) => Math.min(index * 0.02, 0.5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Tea Dashboard</h1>
          <p className="text-muted text-sm mt-1">
            {allTeas.length} teas · {collectionCount} in your collection
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search teas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 py-2 rounded-lg text-sm border outline-none w-full"
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
          <motion.button
            onClick={handleCollectionToggle}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap"
            style={{
              backgroundColor: showOnlyCollection ? "var(--accent)" : "transparent",
              color: showOnlyCollection ? "#fff" : "var(--muted)",
              borderColor: showOnlyCollection ? "var(--accent)" : "var(--border)",
            }}
          >
            My Collection
          </motion.button>
        </div>
      </div>

      {/* Type + Teahouse filters */}
      <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-1">
        {ALL_TEA_TYPES.map((type, i) => {
          const active = activeTypes.includes(type);
          return (
            <motion.button
              key={type}
              onClick={() => toggleType(type)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              whileTap={{ scale: 0.92 }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex-shrink-0"
              style={{
                backgroundColor: active ? TEA_TYPE_COLORS[type] : "transparent",
                color: active ? "#fff" : "var(--muted)",
                borderColor: active ? TEA_TYPE_COLORS[type] : "var(--border)",
              }}
            >
              {TEA_TYPE_LABELS[type]}
            </motion.button>
          );
        })}
        {teahouses.length > 0 && (
          <span className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border)" }} />
        )}
        {teahouses.map((name, i) => {
          const active = activeTeahouses.includes(name);
          return (
            <motion.button
              key={name}
              onClick={() => toggleTeahouse(name)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (ALL_TEA_TYPES.length + i) * 0.03, duration: 0.2 }}
              whileTap={{ scale: 0.92 }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex-shrink-0"
              style={{
                backgroundColor: active ? SOURCE_COLORS.teahouse : "transparent",
                color: active ? "#fff" : "var(--muted)",
                borderColor: active ? SOURCE_COLORS.teahouse : "var(--border)",
              }}
            >
              {name}
            </motion.button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="rounded-2xl border p-2 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Flavor Chart</h2>
          <p className="text-xs text-muted mt-1 hidden sm:block">Click a dot to see tea details · Dot size reflects collection status</p>
        </div>
        {showOnlyCollection && filteredTeas.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12" style={{ minHeight: 300 }}>
            <p className="text-muted text-sm mb-2">No teas in your collection yet</p>
            <p className="text-muted text-xs">Mark teas as "have" or "tried" in the Database to see them here</p>
          </div>
        ) : (
        <div className="relative">
          {/* Y-axis labels — vertical text to save horizontal space */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col items-center justify-between pointer-events-none z-10" style={{ width: "clamp(14px, 3.5vw, 20px)" }}>
            <span className="text-[10px] sm:text-xs font-medium text-accent leading-tight" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              ↑ Sweet / Umami
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-accent leading-tight" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              Bitter / Astringent ↓
            </span>
          </div>
          {/* Chart area */}
          <div
            className={`pl-2 sm:pl-10 relative ${scatterPhase === "pop-in" ? "scatter-pop-in" : ""} ${scatterPhase === "pop-out" ? "scatter-pop-out" : ""}`}
            ref={chartAreaRef}
            onMouseMove={(e) => {
              if (chartAreaRef.current && hoveredTea) {
                const rect = chartAreaRef.current.getBoundingClientRect();
                setHoveredTea(prev => prev ? { ...prev, px: e.clientX - rect.left, py: e.clientY - rect.top } : prev);
              }
            }}
          >
            <ResponsiveContainer width="100%" height={350} minHeight={280}>
              <ScatterChart margin={{ top: 10, right: 4, bottom: 10, left: 4 }}>
                {/* Quadrant background colors */}
                <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="var(--accent)" fillOpacity={0.02} />
                <ReferenceArea x1={-50} x2={0} y1={0} y2={50} fill="var(--accent)" fillOpacity={0.01} />
                <ReferenceArea x1={-50} x2={0} y1={-50} y2={0} fill="var(--accent)" fillOpacity={0.03} />
                <ReferenceArea x1={0} x2={50} y1={-50} y2={0} fill="var(--accent)" fillOpacity={0.015} />
                {/* Grid */}
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                {/* X axis */}
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Roast"
                  domain={[-50, 50]}
                  ticks={[-50, -25, 0, 25, 50]}
                  tick={{ fill: "var(--muted)", fontSize: 10 }}
                  tickFormatter={(v) => `${v}`}
                />
                {/* Y axis */}
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Sweetness"
                  domain={[-50, 50]}
                  ticks={[-50, -25, 0, 25, 50]}
                  tick={{ fill: "var(--muted)", fontSize: 10 }}
                  tickFormatter={(v) => `${v}`}
                />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                {/* Zero lines (axes through origin) */}
                <ReferenceLine x={0} stroke="var(--muted)" strokeOpacity={0.5} strokeWidth={1.5} />
                <ReferenceLine y={0} stroke="var(--muted)" strokeOpacity={0.5} strokeWidth={1.5} />

                <Scatter
                  data={chartData}
                  isAnimationActive={false}
                  onMouseEnter={(data: any) => {
                    const d = Array.isArray(data) ? data[0]?.payload : data?.payload;
                    if (d?.tea) {
                      setHoveredTea(prev => prev ? { ...prev, tea: d.tea, x: d.x, y: d.y } : { tea: d.tea, x: d.x, y: d.y, px: 0, py: 0 });
                    }
                  }}
                  onMouseMove={(data: any) => {
                    const d = Array.isArray(data) ? data[0]?.payload : data?.payload;
                    if (d?.tea) {
                      setHoveredTea(prev => prev ? { ...prev, tea: d.tea, x: d.x, y: d.y } : { tea: d.tea, x: d.x, y: d.y, px: 0, py: 0 });
                    }
                  }}
                  onMouseLeave={() => setHoveredTea(null)}
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      fillOpacity={entry.status === "empty" ? 0.5 : 0.9}
                      stroke={entry.color}
                      strokeWidth={entry.status !== "empty" ? 2 : 0}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (entry.tea) {
                          setSelectedTea(entry.tea);
                        }
                      }}
                      onTouchStart={() => {
                        if (entry.tea && chartAreaRef.current) {
                          const rect = chartAreaRef.current.getBoundingClientRect();
                          setHoveredTea({ tea: entry.tea, x: entry.x, y: entry.y, px: rect.width / 2, py: rect.height / 2 });
                        }
                      }}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Custom tooltip — positioned at cursor, click/tap anywhere to dismiss */}
            <AnimatePresence>
              {hoveredTea && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute rounded-lg p-3 border shadow-xl text-sm pointer-events-none z-20"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    maxWidth: 180,
                    left: Math.min(hoveredTea.px + 12, (chartAreaRef.current?.offsetWidth ?? 200) - 190),
                    top: Math.max(hoveredTea.py - 40, 4),
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredTea.tea.color_hex || "#999" }} />
                    <span className="font-bold">{hoveredTea.tea.name}</span>
                  </div>
                  {hoveredTea.tea.original_name && <p className="text-muted text-xs mt-1">{hoveredTea.tea.original_name}</p>}
                  <p className="text-muted text-xs mt-1">{TEA_TYPE_LABELS[hoveredTea.tea.tea_type]}</p>
                  <p className="text-xs mt-0.5" style={{ color: SOURCE_COLORS[hoveredTea.tea.source_type || 'default'] }}>
                    {hoveredTea.tea.source_type === 'default' || !hoveredTea.tea.source
                      ? SOURCE_LABELS[hoveredTea.tea.source_type || 'default']
                      : `${SOURCE_LABELS[hoveredTea.tea.source_type || 'default']}: ${hoveredTea.tea.source}`}
                  </p>
                  <p className="text-muted text-xs mt-0.5">({hoveredTea.x}, {hoveredTea.y})</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* X-axis labels — HTML for responsive control */}
          <div className="flex justify-between pl-2 sm:pl-10 pr-1 mt-1">
            <span className="text-[10px] sm:text-xs font-medium text-accent leading-tight">
              ← Fresh / Green
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-accent leading-tight">
              Roasted Aroma →
            </span>
          </div>
        </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
        {ALL_TEA_TYPES.map(type => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TEA_TYPE_COLORS[type] }} />
            <span className="text-xs text-muted">{TEA_TYPE_LABELS[type]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 sm:ml-4">
          <span className="text-xs text-muted">●</span>
          <span className="text-xs text-muted">Small = not in collection</span>
          <span className="text-xs text-muted">●</span>
          <span className="text-xs text-muted">Large = in collection</span>
        </div>
      </div>

      {selectedTea && <TeaDetailModal tea={selectedTea} onClose={() => setSelectedTea(null)} />}
    </div>
  );
}