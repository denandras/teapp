"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import {
  arcPath,
  labelPlacement,
  sectorOf,
  type PlacedDot,
  type Sector,
  CENTER_R,
  DIAL_R,
  RIM_R,
} from "@/lib/brew/radial";

export type DialStage = "types" | "teas" | "card" | "steeps";

interface BrewDialProps {
  sectors: Sector[];
  activeType: string | null;
  dots: PlacedDot[];
  stage: DialStage;
  /** centre medallion content */
  centre: React.ReactNode;
  onPickType: (type: string) => void;
  onPickDot: (dot: PlacedDot) => void;
  /** count of teas a sector holds, for the "dim empty sectors" case */
  counts: Record<string, number>;
}

const TYPE_LABELS: Record<string, string> = {
  green: "Green",
  white: "White",
  black: "Black",
  oolong: "Oolong",
  sheng_puerh: "Sheng",
  shou_puerh: "Shou",
  dark: "Dark",
  yellow: "Yellow",
  tisane: "Tisane",
  blend: "Blend",
};

export function typeLabel(t: string): string {
  return TYPE_LABELS[t] ?? t;
}

/**
 * Letterpress dial: hairline rim, no filled disc, labels tangent to the rim,
 * teas as flat dots whose size carries how crowded that corner of the map is.
 */
export default function BrewDial({
  sectors,
  activeType,
  dots,
  stage,
  centre,
  onPickType,
  onPickDot,
  counts,
}: BrewDialProps) {
  const active = activeType ? sectorOf(sectors, activeType) : undefined;

  return (
    <svg
      viewBox="-340 -340 680 680"
      className="w-full h-full select-none"
      role="group"
      aria-label="Tea dial"
    >
      {/* rim — hairline, not a filled disc */}
      <circle r={RIM_R} fill="none" stroke="var(--border)" strokeWidth={1.25} />
      <circle r={DIAL_R} fill="none" stroke="var(--border)" strokeWidth={0.75} strokeOpacity={0.5} />

      {/* selected sector wash */}
      {active && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.14 }}>
          <path
            d={arcPath(active.start, active.end, CENTER_R + 6, RIM_R - 2)}
            fill="var(--accent)"
            fillOpacity={0.09}
          />
          {/* a hairline on the rim so the active sector reads at a glance */}
          <path
            d={arcPath(active.start + 1.5, active.end - 1.5, RIM_R - 1.5, RIM_R + 1.5)}
            fill="var(--accent)"
            fillOpacity={0.9}
          />
        </motion.g>
      )}

      {/* type labels, tangent to the rim, never upside down */}
      {sectors.map((sector) => {
        const p = labelPlacement(sector.mid, RIM_R + 16);
        const isActive = sector.type === activeType;
        const empty = (counts[sector.type] ?? 0) === 0;
        return (
          <g
            key={sector.type}
            transform={`translate(${p.x} ${p.y}) rotate(${p.rotate})`}
            onClick={() => onPickType(sector.type)}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label={`${typeLabel(sector.type)}, ${counts[sector.type] ?? 0} teas`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPickType(sector.type);
              }
            }}
          >
            {/* generous invisible hit area so labels are tappable on a phone */}
            <rect x={-6} y={-18} width={110} height={36} fill="transparent" />
            <text
              x={0}
              y={0}
              textAnchor={p.anchor}
              dominantBaseline="middle"
              fontSize={15}
              letterSpacing="0.08em"
              style={{
                fill: isActive ? "var(--accent)" : empty ? "var(--muted)" : "var(--text)",
                textTransform: "uppercase",
                opacity: empty ? 0.45 : 1,
              }}
            >
              {typeLabel(sector.type)}
            </text>
          </g>
        );
      })}

      {/* teas: one dot per occupied cell, area grows with how many live there */}
      {stage !== "types" &&
        dots.map((dot, i) => (
          <g key={dot.key}>
            <circle
              cx={dot.px}
              cy={dot.py}
              r={dot.r}
              fill="var(--accent)"
              fillOpacity={0.42}
              stroke="var(--accent)"
              strokeOpacity={0.55}
              strokeWidth={0.75}
            />
            <circle
              cx={dot.px}
              cy={dot.py}
              r={Math.max(dot.r + 10, 20)}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onClick={() => onPickDot(dot)}
              role="button"
              tabIndex={0}
              aria-label={
                dot.teas.length === 1
                  ? dot.teas[0].name
                  : `${dot.teas.length} teas: ${dot.teas.map((t) => t.name).join(", ")}`
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPickDot(dot);
                }
              }}
            />
          </g>
        ))}

      {/* centre medallion */}
      <foreignObject x={-CENTER_R} y={-CENTER_R} width={CENTER_R * 2} height={CENTER_R * 2}>
        <div className="w-full h-full flex items-center justify-center">{centre}</div>
      </foreignObject>
    </svg>
  );
}
