import { currentSteep, formatClock, steepSeconds, type BrewSession } from "@/lib/brew/session";

/**
 * Geometry for the steep wheel.
 *
 * Steep 1 is the outermost ring and each further steep sits INSIDE it, all the way
 * to the hub — reading outside-in, the way a leaf gives out. Each steep is not a
 * gauge arc but a BUTTON: a band of known angular width, filled, with its own time
 * written inside the band.
 *
 * Angular width is the important decision: a completed steep keeps the share of the
 * wheel its own duration earned (so a long second steep visibly occupies more), and
 * the live steep always holds the rest of the arc so the ring never has dead space.
 */

/** View box half-size. The SVG is drawn from -VIEW..VIEW on both axes. */
export const VIEW = 340;

/** The hub where the live clock sits. */
export const HUB_R = 96;

/** Outermost ring band. */
export const OUTER_R = 318;

/** How thin a steep band may get before we stop nesting and let it overlap. */
export const MIN_BAND = 22;

/** Fraction of the turn a finished steep is guaranteed, so its time is readable. */
const MIN_SHARE = 0.045;

/**
 * Gap between neighbouring bands, in user units. Bands are separated by a hairline
 * of background rather than touching: parallel arcs at different radii with a
 * visible seam read as separate buttons, which is the point of the ring.
 */
export const BAND_GAP = 4;

export interface SteepBand {
  index: number;
  /** inner and outer radius of this band */
  r0: number;
  r1: number;
  /** where the band starts and ends, degrees, screen convention (90 = top) */
  startDeg: number;
  endDeg: number;
  seconds: number;
  done: boolean;
  live: boolean;
  /** colour for this steep, stable for the session */
  color: string;
}

/** A palette that reads well on the dark theme and distinguishes ~6 steeps. */
export const STEEP_COLORS = [
  "var(--accent)",
  "#c98f4a",
  "#a8724a",
  "#8a6a52",
  "#7d6a5c",
  "#6f6459",
];

export function steepColor(index: number): string {
  return STEEP_COLORS[(index - 1) % STEEP_COLORS.length];
}

/**
 * Lay out the wheels for a session.
 *
 * Radius: band i occupies [OUTER_R - (i+1)*band, OUTER_R - i*band]. If the bands
 * would get thinner than MIN_BAND, later steeps reuse the innermost band and the
 * caller renders them stacked — an over-brew is visible as a second lap on the
 * same radius rather than silently disappearing.
 *
 * Angle: each steep's share is its own seconds against the session total; the live
 * steep takes whatever is left so the turn is always fully claimed.
 */
export function steepBands(session: BrewSession, now: number): SteepBand[] {
  const steeps = session.steeps;
  if (steeps.length === 0) return [];
  const live = currentSteep(session);

  const secs = steeps.map((s) => steepSeconds(s, now));
  const total = secs.reduce((a, b) => a + b, 0);

  // Bands from outside in, stopping at MIN_BAND.
  const count = steeps.length;
  const usable = OUTER_R - HUB_R;
  let band = Math.min(usable / count, 46); // never fatter than 46
  const maxBands = Math.max(1, Math.floor(usable / MIN_BAND));
  if (count > maxBands) band = usable / maxBands;

  // Shares.
  //
  // Two rules keep the ring whole and readable:
  //   1. a steep's share follows its own duration, so a long steep is visibly longer;
  //   2. no steep shrinks below MIN_SHARE, so a 5-second steep next to a 5-minute one
  //      still has room for its time.
  //
  // The total must be EXACTLY 1 — this is what stops the ring showing an empty wedge.
  //
  // Important: the LIVE steep is only given the arc its own elapsed time has earned
  // so far, not "everything that is left". Giving it the remainder made the ring
  // perfect but meant a 4-second-old live steep occupied nearly the whole circle,
  // which reads as a broken ring with a stray sliver.
  const lived = steeps.map((s, i) => {
    const isDone = s.endedAt !== undefined;
    if (total > 0) return secs[i] / total;
    // nothing has elapsed yet: split evenly rather than favouring one steep
    return 1 / count;
  });

  let shares = lived.map((v) => Math.max(MIN_SHARE, v));
  const sumNow = () => shares.reduce((a, b) => a + b, 0);

  // Trim (or grow) proportionally so the total is exactly 1, without ever pushing a
  // share below the floor. Iterate because trimming can re-break the floor.
  for (let pass = 0; pass < 8; pass++) {
    const sum = sumNow();
    if (Math.abs(sum - 1) < 1e-9) break;
    const over = shares.filter((s) => s > MIN_SHARE + 1e-9);
    const room = over.reduce((a, b) => a + b, 0); // total headroom to redistribute
    if (over.length === 0 || room <= 0) break;
    const target = 1 - MIN_SHARE * (shares.length - over.length);
    const k = target / room;
    shares = shares.map((s) => (s > MIN_SHARE + 1e-9 ? s * k : s));
  }
  // final guard — floating point must never leave a sliver of uncovered ring
  const finalSum = sumNow();
  shares = shares.map((s) => s / finalSum);

  // the shares below are ready: every steep has its own proportional slice and the
  // turn is exactly covered

  // Convert shares into arcs, starting at 12 o'clock and running clockwise.
  const out: SteepBand[] = [];
  let cursor = 90; // degrees, screen convention: clockwise decreases
  for (let i = 0; i < count; i++) {
    const span = shares[i] * 360;
    const r1 = OUTER_R - Math.min(i, maxBands - 1) * band;
    const r0 = r1 - band;
    out.push({
      index: steeps[i].index,
      r0,
      r1,
      startDeg: cursor,
      endDeg: cursor - span,
      seconds: secs[i],
      done: steeps[i].endedAt !== undefined,
      live: !!live && live.index === steeps[i].index,
      color: steepColor(steeps[i].index),
    });
    cursor -= span;
  }
  return out;
}

export interface SteepGeometry {
  d: string;
  labelX: number;
  labelY: number;
  /** label rotation in degrees, always readable (never upside down) */
  labelRot: number;
}

/**
 * A band segment as a path, plus where to put its label.
 *
 * Same sweep-flag rule as the tea wheel: screen angles run counter-clockwise while
 * SVG user space is y-down, so a wedge going clockwise on screen needs sweep=1 on
 * the outer arc and sweep=0 on the inner return. Getting this backwards draws the
 * shape the long way round and inverts it.
 */
export function bandGeometry(b: SteepBand): SteepGeometry {
  const a0 = (b.startDeg * Math.PI) / 180;
  const a1 = (b.endDeg * Math.PI) / 180;
  const p = (deg: number, r: number) => ({
    x: r * Math.cos((deg * Math.PI) / 180),
    y: -r * Math.sin((deg * Math.PI) / 180),
  });
  const o1 = p(b.startDeg, b.r1);
  const o2 = p(b.endDeg, b.r1);
  const i1 = p(b.startDeg, b.r0);
  const i2 = p(b.endDeg, b.r0);
  const span = Math.abs(b.startDeg - b.endDeg);
  const large = span > 180 ? 1 : 0;

  const d =
    span >= 359.9
      ? // a full turn needs two arcs; a single 360 arc collapses to nothing
        [
          `M ${o1.x} ${o1.y}`,
          `A ${b.r1} ${b.r1} 0 1 1 ${-o1.x} ${-o1.y}`,
          `A ${b.r1} ${b.r1} 0 1 1 ${o1.x} ${o1.y}`,
          `L ${i1.x} ${i1.y}`,
          `A ${b.r0} ${b.r0} 0 1 0 ${-i1.x} ${-i1.y}`,
          `A ${b.r0} ${b.r0} 0 1 0 ${i1.x} ${i1.y}`,
          "Z",
        ].join(" ")
      : [
          `M ${o1.x} ${o1.y}`,
          `A ${b.r1} ${b.r1} 0 ${large} 1 ${o2.x} ${o2.y}`,
          `L ${i2.x} ${i2.y}`,
          `A ${b.r0} ${b.r0} 0 ${large} 0 ${i1.x} ${i1.y}`,
          "Z",
        ].join(" ");

  // Put the label on the band's own mid-angle so it sits inside the band, not on
  // a shared seam. Small bands get pushed further out where the band is widest.
  const midDeg = (b.startDeg + b.endDeg) / 2;
  const rMid = (b.r0 + b.r1) / 2;
  const at = p(midDeg, rMid);

  // Rotation: tangent to the rim, flipped on the left half so nothing is upside down.
  // Screen angle 90 is the top; a label there must read horizontally. Rotating by
  // (90 - midDeg) turns text tangential to the rim. On the left half that would be
  // upside down, so flip it and let the flip land inside [-90, 90].
  let rot = 90 - midDeg;
  rot = ((rot + 180) % 360) - 180; // normalise to (-180, 180]
  if (rot > 90) rot -= 180;
  if (rot < -90) rot += 180;

  return { d, labelX: at.x, labelY: at.y, labelRot: rot };
}

/** Total seconds of a whole steep as one string for the centre reading. */
export function bandLabel(b: SteepBand): string {
  return formatClock(b.seconds);
}
