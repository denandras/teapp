/**
 * Radial (pie) menu geometry for the Tea Experience dial.
 *
 * Established radial-menu rules this follows
 * (see research: Josh Clark "Touch means a new chance for radial menus",
 *  Fitts's law research on pie menus, ray-menu implementations):
 *
 *  - every item gets an equal angular slice, at the same distance from the centre,
 *    so selection is by DIRECTION and muscle memory can learn the layout;
 *  - a submenu REPLACES the ring (type -> teas), never nests inside it;
 *  - labels are rotated with their slice and flipped on the left half so text is
 *    never upside down and always points the same way as its wedge;
 *  - when there are more items than fit, capacity is computed from the geometry
 *    and the overflow goes to concentric rings, then to pages.
 *
 * Pure functions: no React, no DOM.
 */

export const VIEW = 340; // viewBox is -VIEW..VIEW
export const CENTER_R = 104; // centre medallion
export const INNER_R = 116; // inner edge of the ring band
export const OUTER_R = 322; // outer edge of the ring band
/** Minimum arc length (viewBox units) at a ring's inner edge — a tappable slice. */
export const MIN_ARC = 26;
/**
 * Arc length needed at the label radius for the label to be worth drawing.
 * Capacity is driven by THIS, not by tap size: a wheel of 80 truncated slivers
 * is unusable, so if a page cannot label its slices it should hold fewer of them.
 */
export const LABEL_ARC = 76;
export const MAX_RINGS = 3;
/** Degrees; slice 0 starts at the top and the menu runs clockwise. */
export const START_DEG = 90;

export interface RingSlice<T> {
  item: T;
  ring: number;
  startDeg: number;
  endDeg: number;
  midDeg: number;
  r0: number;
  r1: number;
}

export interface RingLayout<T> {
  slices: RingSlice<T>[];
  ringCount: number;
  /** items this layout can hold (rings only) */
  capacity: number;
  /** true when the caller must page the item list */
  overflow: boolean;
}

/**
 * How many slices fit on a ring whose inner edge sits at r?
 * A slice must be at least MIN_ARC long along that inner edge.
 */
export function slotsForRadius(rInner: number): number {
  if (rInner <= 0) return 0;
  const minAngleRad = MIN_ARC / rInner;
  const n = Math.floor((2 * Math.PI) / minAngleRad);
  return Math.max(1, n);
}

/** Band split for k concentric rings, outer first. */
export function ringBands(k: number): { r0: number; r1: number }[] {
  const total = OUTER_R - INNER_R;
  const thickness = total / k;
  const bands: { r0: number; r1: number }[] = [];
  for (let i = 0; i < k; i++) {
    // ring 0 is the outermost
    const r1 = OUTER_R - i * thickness;
    const r0 = r1 - thickness;
    bands.push({ r0, r1 });
  }
  return bands;
}

/** Slices that fit on a band if every one of them must carry a readable label. */
export function labelSlots(band: { r0: number; r1: number }): number {
  const rMid = (band.r0 + band.r1) / 2;
  const byLabel = Math.floor((2 * Math.PI * rMid) / LABEL_ARC);
  const byTap = slotsForRadius(band.r0);
  return Math.max(1, Math.min(byLabel, byTap));
}

/** Choose the smallest number of rings that can hold n items. */
export function capacityFor(
  n: number,
  maxRings: number = MAX_RINGS
): { ringCount: number; capacity: number; bands: { r0: number; r1: number }[] } {
  const limit = Math.max(1, Math.min(MAX_RINGS, maxRings));
  for (let k = 1; k <= limit; k++) {
    const bands = ringBands(k);
    const capacity = bands.reduce((sum, b) => sum + labelSlots(b), 0);
    if (capacity >= n || k === limit) return { ringCount: k, capacity, bands };
  }
  // unreachable, MAX_RINGS >= 1
  const bands = ringBands(1);
  return { ringCount: 1, capacity: slotsForRadius(bands[0].r0), bands };
}

/**
 * Lay out up to `capacity` items on concentric rings, filling the outer ring
 * first. Slices are equal within each ring, start at the top, run clockwise.
 */
export function layoutRing<T>(items: T[], opts: { maxRings?: number } = {}): RingLayout<T> {
  const n = items.length;
  const { ringCount, capacity, bands } = capacityFor(n, opts.maxRings);
  if (n === 0) return { slices: [], ringCount: 0, capacity, overflow: false };

  // how many go on each ring: outermost first
  const perRing: number[] = [];
  let remaining = Math.min(n, capacity);
  for (let i = 0; i < ringCount; i++) {
    const room = labelSlots(bands[i]);
    const take = Math.min(room, remaining);
    perRing.push(take);
    remaining -= take;
  }

  const slices: RingSlice<T>[] = [];
  let index = 0;
  for (let r = 0; r < ringCount; r++) {
    const count = perRing[r];
    if (count === 0) continue;
    const step = 360 / count;
    const band = bands[r];
    for (let i = 0; i < count; i++) {
      const midDeg = START_DEG - i * step; // clockwise on screen
      slices.push({
        item: items[index++],
        ring: r,
        startDeg: midDeg + step / 2,
        endDeg: midDeg - step / 2,
        midDeg,
        r0: band.r0,
        r1: band.r1,
      });
    }
  }

  return { slices, ringCount, capacity, overflow: n > capacity };
}

/** SVG path for one annular slice. Angles are screen degrees (0 = right, 90 = up). */
export function slicePath(startDeg: number, endDeg: number, r0: number, r1: number): string {
  const p = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: r * Math.cos(a), y: -r * Math.sin(a) };
  };
  const outerStart = p(startDeg, r1);
  const outerEnd = p(endDeg, r1);
  const innerEnd = p(endDeg, r0);
  const innerStart = p(startDeg, r0);
  const sweep = (startDeg - endDeg + 360) % 360; // clockwise travel
  const large = sweep > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${r1} ${r1} 0 ${large} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${r0} ${r0} 0 ${large} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

/**
 * Label placement: the text is TANGENTIAL — it follows the rim of its own slice,
 * centred in the band, so its direction always matches the slice (and the button
 * that slice stands for). On the lower half of the wheel it is flipped 180° so it
 * never reads upside down.
 *
 * Radial labels were tried first and rejected: at 6 o'clock the text stands on
 * its head, which is exactly the "direction doesn't match the button" complaint.
 */
export function labelFor(
  midDeg: number,
  r0: number,
  r1: number,
  sliceDeg: number
): { x: number; y: number; rotate: number; anchor: "middle"; maxWidth: number } {
  const rMid = (r0 + r1) / 2;
  const a = (midDeg * Math.PI) / 180;
  // Normalise so the flip test is not confused by negative or >180 angles.
  const norm = ((midDeg % 360) + 360) % 360;
  const lowerHalf = norm > 180; // below the horizontal on screen
  const rotate = norm - 90 + (lowerHalf ? 180 : 0);
  const arc = (Math.abs(sliceDeg) * Math.PI * rMid) / 180;
  return {
    x: rMid * Math.cos(a),
    y: -rMid * Math.sin(a),
    rotate,
    anchor: "middle",
    maxWidth: Math.max(24, arc - 10),
  };
}

/** Group items into pages of `capacity`. */
export function paginate<T>(items: T[], capacity: number): T[][] {
  if (capacity <= 0) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += capacity) pages.push(items.slice(i, i + capacity));
  return pages.length ? pages : [[]];
}
