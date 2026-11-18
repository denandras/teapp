/**
 * Radial layout maths for the Tea Experience dial.
 *
 * The dial is the same two-axis space as the dashboard chart, just bent into a
 * circle: x (fresh → roasted) becomes the angle, y (bitter → sweet) becomes the
 * distance from the centre. So the hub is bitter, the rim is sweet.
 *
 * Everything here is pure and unit-tested: no React, no DOM, no store access.
 */

/** Outer edge of the tea field (viewBox units). */
export const DIAL_R = 280;
/** Radius of the rim that carries the type labels. */
export const RIM_R = 306;
/** Radius of the centre medallion. */
export const CENTER_R = 104;
/** Bitter teas must clear the medallion, so the field starts outside it. */
export const DOT_MIN_R = 118;
/**
 * The roast axis is a 270° gauge, not a full turn: fresh and roasted are two
 * ENDS of an axis and must not become neighbours at a seam. The 90° gap at
 * 9 o'clock is where the scale stops.
 */
export const ANGLE_START = 135;
export const ANGLE_SWEEP = 270;
/** Occupancy lattice cell size in viewBox units. */
export const CELL = 16;

export interface TeaPoint {
  slug: string;
  name: string;
  flavor_x: number;
  flavor_y: number;
}

export interface PlacedDot {
  /** lattice key — stable across renders, safe as a React key */
  key: string;
  px: number;
  py: number;
  /** dot radius, grows with how many teas share the cell */
  r: number;
  /** teas aggregated into this dot, sweetest first */
  teas: TeaPoint[];
}

export interface Sector {
  type: string;
  /** degrees, screen convention: 0 = right, 90 = up */
  mid: number;
  start: number;
  end: number;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Angle from flavour_x. Sweeps clockwise over 270° from upper-left to
 * lower-left: fresh/green at ~135°, medium roast at 0° (right),
 * roasted at ~-135°. The 90° gap at 9 o'clock separates the axis ends.
 */
export function angleFor(x: number): number {
  const xx = clamp(Number.isFinite(x) ? x : 50, 0, 100);
  return ANGLE_START - (ANGLE_SWEEP * xx) / 100;
}

/** Radius from flavour_y. Bitter sits just outside the hub, sweet at the rim. */
export function radiusFor(y: number, R: number = DIAL_R): number {
  const yy = clamp(Number.isFinite(y) ? y : 50, 0, 100);
  return DOT_MIN_R + (R - DOT_MIN_R) * (yy / 100);
}

export function toPoint(x: number, y: number, R: number = DIAL_R): { px: number; py: number; angle: number; rho: number } {
  const angle = angleFor(x);
  const rho = radiusFor(y, R);
  const rad = (angle * Math.PI) / 180;
  // SVG y grows downward, so invert the sine to get "sweet at the top".
  return { px: rho * Math.cos(rad), py: -rho * Math.sin(rad), angle, rho };
}

/** Point on a circle at an angle in screen convention (0 = right, counter-clockwise). */
export function onCircle(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: radius * Math.cos(rad), y: -radius * Math.sin(rad) };
}

/**
 * Equal sectors for the given types, starting at 12 o'clock and going clockwise.
 * Never sized by tea count — a 350-tea type must not eat the ring.
 */
export function typeSectors(types: string[]): Sector[] {
  const n = types.length;
  if (n === 0) return [];
  const step = 360 / n;
  return types.map((type, i) => {
    const mid = 90 - i * step; // screen convention: start at top, run clockwise
    return { type, mid, start: mid - step / 2, end: mid + step / 2 };
  });
}

export function sectorOf(sectors: Sector[], type: string): Sector | undefined {
  return sectors.find((s) => s.type === type);
}

/**
 * Aggregate teas onto an occupancy lattice so density becomes information
 * instead of a hairball: one dot per occupied cell, area grows with the count.
 */
export function layoutTeas(teas: TeaPoint[], opts: { cell?: number; R?: number } = {}): PlacedDot[] {
  const cell = opts.cell ?? CELL;
  const R = opts.R ?? DIAL_R;
  const cells = new Map<string, PlacedDot>();

  for (const tea of teas) {
    const { px, py } = toPoint(tea.flavor_x, tea.flavor_y, R);
    const cx = Math.round(px / cell);
    const cy = Math.round(py / cell);
    const key = `${cx}:${cy}`;
    const existing = cells.get(key);
    if (existing) {
      existing.teas.push(tea);
    } else {
      cells.set(key, { key, px: cx * cell, py: cy * cell, r: 0, teas: [tea] });
    }
  }

  const dots = [...cells.values()];
  for (const dot of dots) {
    // sweetest first, then alphabetical — the cell sheet reads in flavour order
    dot.teas.sort((a, b) => b.flavor_y - a.flavor_y || a.name.localeCompare(b.name));
    dot.r = dotRadius(dot.teas.length);
  }
  // big cells underneath so small dots stay clickable
  dots.sort((a, b) => a.teas.length - b.teas.length || a.key.localeCompare(b.key));
  return dots;
}

/** 5px for a single tea, up to 14px for a crowded cell. */
export function dotRadius(count: number): number {
  return Math.min(14, 4.4 + Math.sqrt(count) * 3.4);
}

/** Label placement on the rim: tangent, flipped when upside-down, anchored outward. */
export function labelPlacement(angleDeg: number, radius: number = RIM_R) {
  const { x, y } = onCircle(angleDeg, radius);
  // Normalise to [-180, 180)
  let rot = angleDeg + 90;
  while (rot >= 180) rot -= 360;
  while (rot < -180) rot += 360;
  const flip = rot > 90 || rot < -90;
  let out = flip ? rot + 180 : rot;
  while (out >= 180) out -= 360;
  while (out < -180) out += 360;
  return {
    x,
    y,
    rotate: out,
    anchor: (flip ? "end" : "start") as "start" | "end",
  };
}

/** SVG arc path for the sector wash, from start° to end° (screen convention). */
export function arcPath(startDeg: number, endDeg: number, rInner: number, rOuter: number): string {
  const p1 = onCircle(startDeg, rOuter);
  const p2 = onCircle(endDeg, rOuter);
  const p3 = onCircle(endDeg, rInner);
  const p4 = onCircle(startDeg, rInner);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  // sweep=0: clockwise in screen coordinates
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${large} 1 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

/** Circumference helper for the steep rings. */
export function circleLength(r: number): number {
  return 2 * Math.PI * r;
}
