"use client";

import { AnimatePresence, motion } from "framer-motion";
import { currentSteep, formatClock, liveSeconds, type BrewSession } from "@/lib/brew/session";
import { bandGeometry, steepBands, VIEW, type SteepBand } from "@/lib/brew/steepwheel";

interface SteepWheelProps {
  session: BrewSession;
  now: number;
  centre: React.ReactNode;
}

/**
 * The session dial, in the same language as the tea picker: the ring is made of
 * filled BUTTONS, one per steep, each carrying its own time inside it.
 *
 * - Steep 1 is the outer band, each further steep nests inside it.
 * - A finished steep keeps the share of the turn its duration earned, so a long
 *   steep is visibly longer.
 * - The live steep takes the rest of the turn and its band fills as it runs.
 */
export default function SteepWheel({ session, now, centre }: SteepWheelProps) {
  const bands = steepBands(session, now);
  const live = currentSteep(session);
  const liveSecs = liveSeconds(session, now);

  return (
    <svg
      viewBox={`-${VIEW} -${VIEW} ${VIEW * 2} ${VIEW * 2}`}
      className="w-full h-full select-none"
      role="img"
      aria-label={`Steep timer ${formatClock(liveSecs)}`}
    >
      <AnimatePresence initial={false}>
        {bands.map((b) => (
          <SteepBandShape key={b.index} band={b} liveSecs={liveSecs} />
        ))}
      </AnimatePresence>

      {/* hub: same circle-over-SVG treatment as the tea wheel */}
      <circle r={92} fill="var(--bg)" stroke="var(--border)" strokeWidth={1} pointerEvents="none" />
      <foreignObject x={-84} y={-84} width={168} height={168}>
        <div className="w-full h-full flex items-center justify-center">{centre}</div>
      </foreignObject>
    </svg>
  );
}

function SteepBandShape({ band, liveSecs }: { band: SteepBand; liveSecs: number }) {
  const g = bandGeometry(band);
  const compact = Math.abs(band.startDeg - band.endDeg) < 26;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      style={{ transformOrigin: "0px 0px" }}
    >
      <motion.path
        d={g.d}
        initial={false}
        animate={{
          fill: band.done ? band.color : band.color,
          fillOpacity: band.done ? 0.30 : band.live ? 0.18 : 0.1,
          stroke: band.color,
          strokeWidth: band.live ? 2 : 1,
          strokeOpacity: band.done ? 0.75 : 1,
        }}
        transition={{ duration: 0.25 }}
        pointerEvents="none"
      />

      {/* the live band's progress, drawn as a brighter overlay along its own arc */}
      {band.live && (
        <LiveSweep band={band} liveSecs={liveSecs} />
      )}

      <g transform={`translate(${g.labelX} ${g.labelY}) rotate(${g.labelRot})`} pointerEvents="none">
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={compact ? 15 : 20}
          style={{
            fill: band.done ? "var(--text)" : "var(--text)",
            opacity: band.done ? 0.95 : 1,
            fontVariantNumeric: "tabular-nums",
            fontWeight: 500,
          }}
        >
          {formatClock(band.seconds)}
        </text>
        {!compact && (
          <text
            y={compact ? 0 : 17}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            letterSpacing="0.16em"
            style={{ fill: "var(--muted)", textTransform: "uppercase" }}
          >
            {band.live ? "steeping" : `steep ${band.index}`}
          </text>
        )}
      </g>
    </motion.g>
  );
}

/**
 * The live steep's own progress: a hairline that travels along its band as the
 * brew goes on, so the wheel moves without anything spinning.
 */
function LiveSweep({ band, liveSecs }: { band: SteepBand; liveSecs: number }) {
  const span = Math.abs(band.startDeg - band.endDeg);
  const expected = Math.max(20, band.seconds > 0 ? band.seconds : liveSecs);
  const frac = Math.min(1, liveSecs / expected);
  const end = band.startDeg - span * frac;
  const probe: SteepBand = { ...band, endDeg: end };
  const d = bandGeometry(probe).d;
  return (
    <motion.path
      d={d}
      initial={false}
      animate={{ fillOpacity: 0.26 }}
      transition={{ duration: 0.2 }}
      style={{ fill: band.color }}
      pointerEvents="none"
    />
  );
}
