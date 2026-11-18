"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { VIEW, RING_R0, RING_R1, wedgePath, wedgeLabel, wedgeSpan, type Wedge } from "@/lib/brew/wheel";

export interface WheelButton {
  key: string;
  label: string;
  /** second line under the label, e.g. "3 teas" */
  meta?: string;
  /** filled colour for the button */
  tone?: string;
  disabled?: boolean;
}

interface WheelMenuProps {
  wedges: Wedge<WheelButton>[];
  onPick: (key: string) => void;
  activeKey?: string | null;
  centre: React.ReactNode;
  label: string;
}

/**
 * A weapon-wheel menu: the ring is made of solid button wedges with their own
 * labels inside. Every visible region is clickable — no dots, no empty arcs.
 */
/**
 * Slice fills. Adjacent wedges alternate between two card tones so the ring reads
 * as a row of separate buttons instead of one grey disc.
 */
// --card and --bg are only ~8% apart, which read as one grey disc with hairlines.
// These rgba washes over the page background give wedges you can actually see.
const SLICE_A = "rgba(196, 133, 63, 0.16)"; // warm, off the accent
const SLICE_B = "rgba(255, 255, 255, 0.06)"; // neutral

export default function WheelMenu({ wedges, onPick, activeKey, centre, label }: WheelMenuProps) {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <svg
      viewBox={`-${VIEW} -${VIEW} ${VIEW * 2} ${VIEW * 2}`}
      className="w-full h-full select-none"
      role="menu"
      aria-label={label}
    >
      {wedges.map((w, i) => {
        const b = w.items[0];
        // Modular width: a wedge that crosses 12 o'clock has startDeg < endDeg, and
        // Math.abs() then measured the arc the LONG way round. That made huge wedges
        // claim a small font (and vice versa) — the labels that visibly sat off-centre.
        const span = wedgeSpan(w);
        // Put the label at the ANGULAR MIDDLE of the wedge, not at the centroid of its
        // items: for a merged wedge those differ, and the label drifted onto the seam.
        const arcMid = w.startDeg - span / 2;
        const lab = wedgeLabel(arcMid, RING_R0, RING_R1, span);
        // type size from the room the wedge gives, so text never spills out
        const fontSize = Math.max(8, Math.min(15, Math.min(lab.maxWidth / 9, span * 1.4)));
        // Only the wedge label goes inside the button: a merged button is named as
        // "First Tea +N" and its members live in `meta` for the aria-label. Putting the
        // member list on the wedge is what made dense wheels unreadable.
        const chars = Math.max(4, Math.floor(lab.maxWidth / (fontSize * 0.55)));
        const text = b.label.length > chars ? `${b.label.slice(0, Math.max(3, chars - 1))}…` : b.label;
        const isMerged = (b.meta ?? "").length > 0;
        const isActive = activeKey === b.key;
        const isHover = hover === b.key;

        return (
          <g key={b.key}>
            <motion.path
              d={wedgePath(w.startDeg, w.endDeg, RING_R0, RING_R1)}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: b.disabled ? 0.4 : 1, scale: 1 }}
              transition={{ duration: 0.18, delay: Math.min(i * 0.012, 0.16) }}
              // Colour goes in `style`, not the fill attribute: framer-motion reads
              // the attribute as a colour and drops an rgba() there, which painted
              // every wedge black. CSS alpha is honoured.
              style={{
                transformOrigin: "0px 0px",
                fill: isActive ? "var(--accent)" : isHover ? "var(--accent)" : b.tone ?? (i % 2 ? SLICE_A : SLICE_B),
                fillOpacity: isActive ? 1 : isHover ? 0.22 : 1,
                stroke: isActive ? "var(--accent)" : "rgba(255,255,255,0.18)",
                strokeWidth: isActive ? 2 : 1,
              }}
              cursor={b.disabled ? "default" : "pointer"}
              onClick={() => !b.disabled && onPick(b.key)}
              onMouseEnter={() => setHover(b.key)}
              onMouseLeave={() => setHover((h) => (h === b.key ? null : h))}
              role="menuitem"
              tabIndex={b.disabled ? -1 : 0}
              aria-label={`${b.label}${b.meta ? `, ${b.meta}` : ""}`}
              aria-disabled={b.disabled || undefined}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !b.disabled) {
                  e.preventDefault();
                  onPick(b.key);
                }
              }}
            />

            <g transform={`translate(${lab.x} ${lab.y}) rotate(${lab.rotate})`} pointerEvents="none">
              <text
                textAnchor={lab.anchor}
                dominantBaseline="central"
                fontSize={fontSize}
                style={{
                  fill: isActive ? "var(--bg)" : "var(--text)",
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.01em",
                }}
              >
                {text}
              </text>
              {b.meta && span > 22 && !isMerged && (
                <text
                  y={fontSize + 3}
                  textAnchor={lab.anchor}
                  dominantBaseline="central"
                  fontSize={fontSize * 0.82}
                  style={{ fill: isActive ? "var(--bg)" : "var(--muted)", opacity: isActive ? 0.8 : 1 }}
                >
                  {b.meta}
                </text>
              )}
            </g>
          </g>
        );
      })}

      {/* outer rim hairline, so the buttons sit on a finished edge */}
      <circle r={RING_R1} fill="none" stroke="var(--border)" strokeWidth={1} pointerEvents="none" />

      {/* centre hub: a real circle at the ring's inner edge, not a square */}
      <circle r={RING_R0 - 1} fill="var(--bg)" stroke="var(--border)" strokeWidth={1} pointerEvents="none" />

      {/* hub content: a circle of the same radius, drawn as HTML over the SVG */}
      <foreignObject x={-(RING_R0 - 8)} y={-(RING_R0 - 8)} width={(RING_R0 - 8) * 2} height={(RING_R0 - 8) * 2}>
        <div className="w-full h-full flex items-center justify-center">{centre}</div>
      </foreignObject>
    </svg>
  );
}
