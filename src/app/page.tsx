"use client";

import { useState, useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ReferenceArea } from "recharts";
import { TEAS } from "@/data/teas";
import { Tea, TEA_TYPE_COLORS, TEA_TYPE_LABELS, ALL_TEA_TYPES } from "@/lib/types";
import { useTeaStore } from "@/lib/store";
import TeaDetailModal from "@/components/TeaDetailModal";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [showOnlyCollection, setShowOnlyCollection] = useState(false);
  const teaStates = useTeaStore((s) => s.teaStates);

  const filteredTeas = useMemo(() => {
    let teas = TEAS.map((t, i) => ({ ...t, id: i + 1 }));
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
    if (showOnlyCollection) {
      teas = teas.filter(t => teaStates[t.slug] && teaStates[t.slug] !== "empty");
    }
    return teas;
  }, [search, activeTypes, showOnlyCollection, teaStates]);

  // Convert 0-100 flavor coordinates to centered -50..+50 range
  const chartData = useMemo(() =>
    filteredTeas.map(t => ({
      x: (t.flavor_x ?? 50) - 50,
      y: -((t.flavor_y ?? 50) - 50), // flip Y so positive = up
      z: teaStates[t.slug] === "have" ? 400 : teaStates[t.slug] === "tried" ? 250 : 120,
      tea: t,
      color: t.color_hex,
      status: teaStates[t.slug] || "empty",
    })),
  [filteredTeas, teaStates]);

  const toggleType = (type: string) => {
    setActiveTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const collectionCount = Object.values(teaStates).filter(s => s && s !== "empty").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Tea Dashboard</h1>
          <p className="text-muted text-sm mt-1">
            {filteredTeas.length} teas · {collectionCount} in your collection
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
          <button
            onClick={() => setShowOnlyCollection(!showOnlyCollection)}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap"
            style={{
              backgroundColor: showOnlyCollection ? "var(--accent)" : "transparent",
              color: showOnlyCollection ? "#fff" : "var(--muted)",
              borderColor: showOnlyCollection ? "var(--accent)" : "var(--border)",
            }}
          >
            My Collection
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-1">
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
      </div>

      {/* Chart */}
      <div className="rounded-2xl border p-3 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Flavor Chart</h2>
          <p className="text-xs text-muted mt-1">Click a dot to see tea details · Dot size reflects collection status</p>
        </div>
        <ResponsiveContainer width="100%" height={400} minHeight={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
            {/* Quadrant background colors */}
            <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="var(--accent)" fillOpacity={0.02} />
            <ReferenceArea x1={-50} x2={0} y1={0} y2={50} fill="var(--accent)" fillOpacity={0.01} />
            <ReferenceArea x1={-50} x2={0} y1={-50} y2={0} fill="var(--accent)" fillOpacity={0.03} />
            <ReferenceArea x1={0} x2={50} y1={-50} y2={0} fill="var(--accent)" fillOpacity={0.015} />
            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            {/* X axis — centered at 0, range -50..+50 */}
            <XAxis
              type="number"
              dataKey="x"
              name="Roast"
              domain={[-50, 50]}
              ticks={[-50, -25, 0, 25, 50]}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
              label={{ value: "← Fresh / Green          Roasted Aroma →", position: "bottom", offset: 25, fill: "var(--muted)", fontSize: 12 }}
            />
            {/* Y axis — centered at 0, range -50..+50 */}
            <YAxis
              type="number"
              dataKey="y"
              name="Sweetness"
              domain={[-50, 50]}
              ticks={[-50, -25, 0, 25, 50]}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
              label={{ value: "↑ Sweet / Umami    Bitter / Astringent ↓", angle: -90, position: "insideLeft", offset: 10, fill: "var(--muted)", fontSize: 12 }}
            />
            <ZAxis type="number" dataKey="z" range={[60, 400]} />
            {/* Zero lines (axes through origin) */}
            <ReferenceLine x={0} stroke="var(--muted)" strokeOpacity={0.5} strokeWidth={1.5} />
            <ReferenceLine y={0} stroke="var(--muted)" strokeOpacity={0.5} strokeWidth={1.5} />
            {/* Quadrant labels positioned in data coordinate space */}
            <ReferenceLine
              x={25}
              stroke="none"
              label={{ value: "Roasted & Sweet", position: "insideTopRight", fill: "var(--muted)", fontSize: 10, opacity: 0.4 }}
            />
            <ReferenceLine
              x={-25}
              stroke="none"
              label={{ value: "Fresh & Sweet", position: "insideTopLeft", fill: "var(--muted)", fontSize: 10, opacity: 0.4 }}
            />
            <ReferenceLine
              x={-25}
              stroke="none"
              label={{ value: "Fresh & Bitter", position: "insideBottomLeft", fill: "var(--muted)", fontSize: 10, opacity: 0.4 }}
            />
            <ReferenceLine
              x={25}
              stroke="none"
              label={{ value: "Roasted & Bitter", position: "insideBottomRight", fill: "var(--muted)", fontSize: 10, opacity: 0.4 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "var(--accent)" }}
              content={({ payload, active }) => {
                if (!payload || !payload.length) return null;
                const d = payload[0].payload;
                const tea = d.tea;
                return (
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="rounded-lg p-3 border shadow-xl text-sm"
                        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="font-bold">{tea.name}</span>
                        </div>
                        {tea.original_name && <p className="text-muted text-xs mt-1">{tea.original_name}</p>}
                        <p className="text-muted text-xs mt-1">{TEA_TYPE_LABELS[tea.tea_type]}</p>
                        <p className="text-muted text-xs mt-0.5">({d.x}, {d.y})</p>
                        {d.status !== "empty" && (
                          <p className="text-xs mt-1 text-accent">
                            {d.status === "have" ? "✓ In collection" : "✓ Tried"}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              }}
            />
            <Scatter
              data={chartData}
              onClick={(data: any) => {
                if (Array.isArray(data) && data.length > 0 && data[0]?.payload?.tea) {
                  setSelectedTea(data[0].payload.tea);
                } else if (data?.payload?.tea) {
                  setSelectedTea(data.payload.tea);
                }
              }}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={entry.status === "empty" ? 0.5 : 0.9} stroke={entry.color} strokeWidth={entry.status !== "empty" ? 2 : 0} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
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
          <span className="text-xs text-accent">●</span>
          <span className="text-xs text-muted">Large = in collection</span>
        </div>
      </div>

      {selectedTea && <TeaDetailModal tea={selectedTea} onClose={() => setSelectedTea(null)} />}
    </div>
  );
}