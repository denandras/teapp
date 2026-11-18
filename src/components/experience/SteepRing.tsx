"use client";

import { motion } from "framer-motion";
import {
  currentSteep,
  formatClock,
  steepSeconds,
  type BrewSession,
} from "@/lib/brew/session";

interface SteepRingProps {
  session: BrewSession;
  now: number;
  /** the tea's own expected steep length in seconds — the arc's visual scale */
  expectedSeconds: number;
  centre: React.ReactNode;
}

const R_TOP = 272;
const R_STEP = 13;

/**
 * Steep 1 is the outermost track and each further steep sits inside it —
 * reading outside-in, the way a leaf gives out. Finished steeps keep their
 * own time on the track, so a session reads as a bracelet of times.
 */
export default function SteepRing({ session, now, expectedSeconds, centre }: SteepRingProps) {
  const live = currentSteep(session);
  const scale = Math.max(20, expectedSeconds);

  return (
    <svg viewBox="-340 -340 680 680" className="w-full h-full select-none" aria-label="Steep timer">
      {session.steeps.map((steep, i) => {
        const r = R_TOP - i * R_STEP;
        if (r < 130) return null;
        const secs = steepSeconds(steep, now);
        const done = steep.endedAt !== undefined;
        const frac = Math.min(1, secs / scale);
        const isLive = !done && !!live && live.index === steep.index;
        const a = Math.PI * 0.75; // 135°, upper-left, where the track begins
        const startX = r * Math.cos(a);
        const startY = -r * Math.sin(a);
        return (
          <g key={steep.index}>
            <circle
              r={r}
              fill="none"
              stroke="var(--border)"
              strokeWidth={isLive ? 3 : 2}
              strokeOpacity={done ? 0.9 : 0.5}
            />
            <motion.circle
              r={r}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={isLive ? 3.5 : 2.5}
              strokeLinecap="round"
              pathLength={1000}
              strokeDasharray={`${frac * 1000} 1000`}
              transform="rotate(-90)"
              initial={false}
              animate={{ strokeDashoffset: 0, opacity: done ? 0.55 : 1 }}
              transition={{ duration: 0.18 }}
            />
            {/* the steep's own time, set at the start of its track */}
            <text
              x={startX - 8}
              y={startY - 4}
              textAnchor="end"
              fontSize={13}
              style={{ fill: done ? "var(--text)" : "var(--muted)", fontVariantNumeric: "tabular-nums" }}
            >
              {formatClock(secs)}
            </text>
            <text
              x={startX - 8}
              y={startY + 12}
              textAnchor="end"
              fontSize={9}
              letterSpacing="0.12em"
              style={{ fill: "var(--muted)", opacity: 0.75, textTransform: "uppercase" }}
            >
              {steep.index}
            </text>
          </g>
        );
      })}

      <foreignObject x={-120} y={-120} width={240} height={240}>
        <div className="w-full h-full flex items-center justify-center">{centre}</div>
      </foreignObject>
    </svg>
  );
}
