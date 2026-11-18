import { currentSteep, formatClock, steepSeconds, type BrewSession } from "@/lib/brew/session";

/**
 * Geometry for the steep timer dial.
 *
 * One live steep is drawn as a stack of complete laps: each lap is a full turn
 * against the tea's base steep time, and a steep that runs past it starts another,
 * slightly larger lap. So a 4:30 steep of a 3:00 tea reads as a closed ring plus
 * half a second ring — over-brewing is visible as depth, not as a broken arc.
 *
 * The laps are the only moving geometry. The centre clock and the outer hairline
 * are fixed, so the dial is still while a steep runs, which is what a stopwatch
 * should be.
 */

/** View box half-size. The SVG is drawn from -VIEW..VIEW on both axes. */
export const VIEW = 340;

/** The clock's disc. */
export const HUB_R = 104;

/** Innermost lap radius — sits a comfortable gap outside the clock. */
export const BASE_R = 236;

/** Each extra lap adds this much radius, so stacked laps stay distinguishable. */
export const LAP_STEP = 20;

/** How far a lap may reach before the ring would clip its hairline at the rim. */
export const RIM_R = 326;

/** Laps drawn at most; beyond this the ring is full and the centre carries the truth. */
export const MAX_LAPS = 4;

/** Ring thickness of a lap. Thinner than the gap is not: the depth must read. */
export const LAP_WIDTH = 10;

/** What the resting state shows: a barely-there guide, never a promise. */
export const IDLE_R = BASE_R;

export interface Lap {
  /** 0-based; lap 0 is the base time, each further lap is one more of it */
  index: number;
  r: number;
  /** 0..1 of this lap that is filled */
  fill: number;
  /** true when this is the lap the timer is currently drawing into */
  active: boolean;
}

export interface DialState {
  /** seconds on the clock for the current steep */
  seconds: number;
  /** the recommended length this ring is measured against */
  target: number;
  laps: Lap[];
  /** true once the steep has passed its target */
  over: boolean;
  /** how many targets have been passed, e.g. 2 = twice the recommended time */
  passed: number;
  /** seconds past the current target, 0 while still filling */
  overBy: number;
}

/**
 * The dial for a live steep.
 *
 * `target` is the tea's base steep time: the ring fills against it, and every
 * further full turn of the same length adds a lap. That is deliberately NOT the
 * per-steep recommendation (base + 15 s × n) — the recommendation tells you when to
 * pour, the ring shows how far the clock has gone, and mixing the two makes the
 * layers mean nothing.
 */
export function dialState(seconds: number, target: number): DialState {
  const base = target > 0 ? target : 30;
  const safe = Math.max(0, seconds);
  const raw = safe / base;
  const passed = Math.floor(raw);
  const fill = raw - passed;
  const shownLaps = Math.min(passed + 1, MAX_LAPS);
  const laps: Lap[] = [];
  for (let i = 0; i < shownLaps; i++) {
    const isLast = i === shownLaps - 1;
    laps.push({
      index: i,
      r: BASE_R + i * LAP_STEP,
      // earlier laps are complete; the final one carries the running fill
      fill: isLast ? fill : 1,
      active: isLast,
    });
  }
  return {
    seconds: safe,
    target: base,
    laps,
    over: raw >= 1,
    passed,
    overBy: raw >= 1 ? safe - passed * base : 0,
  };
}

/**
 * A lap as a stroke path. Angles use the screen convention (90 = 12 o'clock,
 * decreasing clockwise) and start at the top, the way a stopwatch sweep does.
 */
export function lapArc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const span = Math.abs(fromDeg - toDeg);
  // Round tiny floating-point residue to zero: at 12 o'clock cos(90°) is 1.4e-14,
  // which renders as "M 1.44e-14 -236" — fine for SVG, useless in a path to compare.
  const snap = (n: number) => (Math.abs(n) < 1e-9 ? 0 : Number(n.toFixed(6)));
  const p = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: snap(cx + r * Math.cos(a)), y: snap(cy - r * Math.sin(a)) };
  };
  const s = p(fromDeg);
  const e = p(toDeg);
  if (span >= 359.99) {
    const mid = p(fromDeg - 180);
    // two half turns: a single 360° arc collapses to nothing
    return `M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${mid.x} ${mid.y} A ${r} ${r} 0 1 1 ${s.x} ${s.y}`;
  }
  const large = span > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

/** m:ss for the centre, but with the tenths kept off — a stopwatch, not a lab meter. */
export function dialClock(seconds: number): string {
  return formatClock(seconds);
}

/**
 * When the current steep is due, given the tea's base time and the steep number.
 * The +15 s per steep rule gives the pour point; the ring itself still measures
 * against the base time so the laps stay meaningful.
 */
export function dueSeconds(baseSeconds: number | null | undefined, index: number): number {
  const base = baseSeconds && baseSeconds > 0 ? baseSeconds : 30;
  return Math.max(5, base + 15 * Math.max(0, index - 1));
}

/** Convenience for a session: how long the current steep should run. */
export function dueForSession(session: BrewSession, baseSeconds: number | null | undefined): number {
  const live = currentSteep(session);
  const index = live?.index ?? session.steeps.length;
  return dueSeconds(baseSeconds, index);
}

/** The finished steeps of a session as compact rows for the summary line. */
export function steepSummary(session: BrewSession, now: number): { index: number; seconds: number }[] {
  return session.steeps.map((s) => ({ index: s.index, seconds: steepSeconds(s, now) }));
}
