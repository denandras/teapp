"use client";

import { motion } from "framer-motion";
import { formatClock } from "@/lib/brew/session";
import {
  BASE_R,
  HUB_R,
  LAP_WIDTH,
  RIM_R,
  dialState,
  lapArc,
  type DialState,
} from "@/lib/brew/steepwheel";

interface SteepDialProps {
  /** seconds on the clock for the current steep */
  seconds: number;
  /** the tea's base steep time — what one lap means */
  target: number;
  /** the recommended length of THIS steep (base + 15 s per steep) */
  due: number;
  /** armed = ready but not ticking; running/paused drive the copy */
  mode: "armed" | "running" | "paused" | "done";
  steepNumber: number;
  /** small line under the clock, e.g. the water temperature */
  note?: string;
}

/**
 * The steep timer.
 *
 * One lap is one recommended steep. As the clock passes it, another lap layers
 * outward instead of the arc running backwards or restarting — so over-brewing is
 * drawn as depth. Base laps are translucent; each new lap is a little more present,
 * which makes "this is the second time over" legible at a glance.
 *
 * The dial does not spin and does not glow: a stopwatch should be calm.
 */
export default function SteepDial({ seconds, target, due, mode, steepNumber, note }: SteepDialProps) {
  const dial = dialState(seconds, target);

  return (
    <div className="relative w-full max-w-[320px] mx-auto aspect-square">
      <svg
        viewBox={`${-RIM_R - 8} ${-RIM_R - 8} ${(RIM_R + 8) * 2} ${(RIM_R + 8) * 2}`}
        className="w-full h-full block"
        role="img"
        aria-label={`Steep ${steepNumber}, ${formatClock(seconds)} of ${formatClock(due)}`}
      >
        {/* the track: a hairline guide, so an empty dial still reads as a dial */}
        {dial.laps.map((lap) => (
          <circle
            key={`track-${lap.index}`}
            r={lap.r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
            opacity={0.55}
          />
        ))}

        {/* filled laps, drawn from the top clockwise */}
        {dial.laps.map((lap) => (
          <Layer key={lap.index} lap={lap} dial={dial} />
        ))}

        {/* the recommended time for THIS steep sits where its clock should stop */}
        <DueTick target={target} due={due} />

        {/* centre disc — solid, so the layers never muddy the clock */}
        <circle r={HUB_R} fill="var(--bg)" stroke="var(--border)" strokeWidth={1} />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <span
          className="font-serif tabular-nums leading-none"
          style={{ fontSize: 46, letterSpacing: "-0.02em" }}
        >
          {formatClock(seconds)}
        </span>
        <span
          className="text-[13px] mt-2 tabular-nums"
          style={{ color: "var(--text)", opacity: 0.72 }}
        >
          {mode === "armed" ? `ready · ${formatClock(due)}` : `of ${formatClock(due)}`}
        </span>
        <span
          className="text-[11px] uppercase tracking-[0.16em] mt-2"
          style={{ color: dial.over ? "var(--accent)" : "var(--muted)" }}
        >
          {mode === "armed"
            ? "press start"
            : mode === "paused"
            ? "paused"
            : mode === "done"
            ? "done"
            : dial.over
            ? `over · ${formatClock(dial.overBy)}`
            : `steep ${steepNumber}`}
        </span>
        {note && (
          <span className="text-[12px] mt-1.5" style={{ color: "var(--muted)" }}>
            {note}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * One lap. The first lap is a whisper; each further lap adds presence, because the
 * later laps are the ones that mean "you are over".
 */
function Layer({ lap, dial }: { lap: ReturnType<typeof dialState>["laps"][number]; dial: DialState }) {
  const end = 90 - 360 * Math.max(0, Math.min(1, lap.fill));
  // a lap past the plan warms toward the accent
  const over = lap.index > 0 && dial.over;
  const colour = over ? "var(--accent)" : "var(--text)";
  if (lap.fill <= 0.001) return null;
  return (
    <motion.path
      d={lapArc(0, 0, lap.r, 90, end)}
      fill="none"
      stroke={colour}
      strokeWidth={LAP_WIDTH}
      strokeLinecap="round"
      initial={false}
      animate={{
        strokeOpacity: over ? 0.75 : 0.32 + lap.index * 0.02,
      }}
      transition={{ duration: 0.35 }}
      style={{ mixBlendMode: "screen" }}
    />
  );
}

/**
 * Where the current steep's recommended time falls on the dial. On steep 1 that is
 * the far side of the base lap; on later steeps it sits further round, which is the
 * cheap visual "each steep gets longer" without a second widget.
 */
function DueTick({ target, due }: { target: number; due: number }) {
  if (!target || due <= 0) return null;
  const laps = due / target;
  const capped = Math.min(laps, 3.999);
  const r = BASE_R + Math.floor(capped) * 20;
  const angle = 90 - 360 * (capped % 1);
  const a = (angle * Math.PI) / 180;
  const x1 = (r - 9) * Math.cos(a);
  const y1 = -(r - 9) * Math.sin(a);
  const x2 = (r + 9) * Math.cos(a);
  const y2 = -(r + 9) * Math.sin(a);
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="var(--accent)"
      strokeWidth={2}
      strokeLinecap="round"
      opacity={0.85}
    />
  );
}
