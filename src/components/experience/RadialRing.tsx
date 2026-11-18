"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  layoutRing,
  labelFor,
  slicePath,
  CENTER_R,
  VIEW,
  type RingSlice,
} from "@/lib/brew/ring";

export interface RingItem {
  key: string;
  label: string;
  /** small second line inside the slice, e.g. a count */
  meta?: string;
  /** optional accent for the slice edge, e.g. a tea's colour */
  color?: string;
}

interface RadialRingProps {
  items: RingItem[];
  onPick: (key: string) => void;
  activeKey?: string | null;
  centre: React.ReactNode;
  /** how many concentric rings the layout may use */
  maxRings?: number;
  label: string;
  /** tells the parent what the pointer is over, so a dense ring can name it */
  onHoverItem?: (item: RingItem | null) => void;
}

/** Below this much room for text (viewBox units) a slice is drawn unlabelled. */
const LABEL_MIN_ROOM = 56;

/**
 * A real radial menu: one slice per item, equal angles, selection by direction.
 * Labels sit along the radius and are flipped on the left half, so every label
 * points the same way as its own wedge and never reads upside down.
 */
export default function RadialRing({
  items,
  onPick,
  activeKey,
  centre,
  maxRings = 2,
  label,
  onHoverItem,
}: RadialRingProps) {
  const [hover, setHover] = useState<string | null>(null);
  const { slices } = layoutRing(items, { maxRings });

  const setHovered = (item: RingItem | null) => {
    setHover(item?.key ?? null);
    onHoverItem?.(item);
  };

  return (
    <svg
      viewBox={`-${VIEW} -${VIEW} ${VIEW * 2} ${VIEW * 2}`}
      className="w-full h-full select-none"
      role="menu"
      aria-label={label}
    >
      {slices.map((slice, i) => {
        const band = slice.r1 - slice.r0;
        const step = Math.abs(slice.startDeg - slice.endDeg);
        const lab = labelFor(slice.midDeg, slice.r0, slice.r1, step);
        // Size the text from the room the slice actually has, so dense rings do
        // not truncate every name down to three letters.
        const fontSize = Math.max(7.5, Math.min(13.5, Math.min(band * 0.22, lab.maxWidth / 11)));
        const isActive = activeKey === slice.item.key;
        const isHover = hover === slice.item.key;
        // A slice only gets a label if there is honestly room for words. At high
        // density a wall of truncated text is worse than none: the slice stays a
        // target and names itself in the centre on hover.
        const showLabel = lab.maxWidth >= LABEL_MIN_ROOM || isHover || isActive;
        const chars = Math.max(4, Math.floor(lab.maxWidth / (fontSize * 0.53)));
        const text =
          slice.item.label.length > chars ? `${slice.item.label.slice(0, Math.max(3, chars - 1))}…` : slice.item.label;

        return (
          <g key={slice.item.key}>
            <motion.path
              d={slicePath(slice.startDeg, slice.endDeg, slice.r0, slice.r1)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.16, delay: Math.min(i * 0.008, 0.12) }}
              fill={isActive ? "var(--accent)" : isHover ? "var(--card)" : "transparent"}
              fillOpacity={isActive ? 0.14 : isHover ? 0.9 : 0}
              stroke="var(--border)"
              strokeWidth={1}
              style={{ cursor: "pointer" }}
              onClick={() => onPick(slice.item.key)}
              onMouseEnter={() => setHovered(slice.item)}
              onMouseLeave={() => setHovered(null)}
              role="menuitem"
              tabIndex={0}
              aria-label={`${slice.item.label}${slice.item.meta ? `, ${slice.item.meta}` : ""}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPick(slice.item.key);
                }
              }}
            />

            {/* the slice's own accent tick, so a tea's colour survives on the ring */}
            {slice.item.color && (
              <circle
                cx={Math.cos((slice.midDeg * Math.PI) / 180) * (slice.r1 - 7)}
                cy={-Math.sin((slice.midDeg * Math.PI) / 180) * (slice.r1 - 7)}
                r={2.4}
                fill={slice.item.color}
                pointerEvents="none"
              />
            )}

            {showLabel && (
            <g
              transform={`translate(${lab.x} ${lab.y}) rotate(${lab.rotate})`}
              pointerEvents="none"
            >
              <text
                x={0}
                y={0}
                textAnchor={lab.anchor}
                dominantBaseline="central"
                fontSize={fontSize}
                style={{
                  fill: isActive || isHover ? "var(--accent)" : "var(--text)",
                  letterSpacing: "0.01em",
                }}
              >
                {text}
                {slice.item.meta && (
                  <tspan style={{ fill: "var(--muted)" }} dx={6} fontSize={fontSize * 0.85}>
                    {slice.item.meta}
                  </tspan>
                )}
              </text>
            </g>
            )}
          </g>
        );
      })}

      {/* a hairline per ring so concentric bands read as separate dials */}
      {[...new Set(slices.map((s) => s.r1))].map((r) => (
        <circle key={`rim-${r}`} r={r} fill="none" stroke="var(--border)" strokeWidth={1} pointerEvents="none" />
      ))}

      <foreignObject x={-CENTER_R} y={-CENTER_R} width={CENTER_R * 2} height={CENTER_R * 2}>
        <div className="w-full h-full flex items-center justify-center">{centre}</div>
      </foreignObject>
    </svg>
  );
}

function sliceOuter(slices: RingSlice<RingItem>[]): number {
  return slices.length ? Math.max(...slices.map((s) => s.r1)) : CENTER_R + 12;
}
