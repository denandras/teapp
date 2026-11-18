/**
 * Weapon-wheel geometry for the Tea Experience page.
 *
 * The rules, as the owner asked for them:
 *
 *  - It is a pie/wheel menu: the whole ring is filled by BUTTONS, each button is
 *    a filled wedge with its label drawn inside it. No decorative dead space and
 *    no dots on the rim — if the user sees a region, clicking it does something.
 *  - A tea's angular position comes from its own y (bitter -> sweet), so teas sit
 *    as close as possible to their relative coordinates around the ring.
 *  - When a group of teas would collide, they are merged into ONE button and the
 *    label names them ("3 teas"), because a wheel cannot show 219 buttons and a
 *    sliver with a truncated name is not a button.
 *
 * Two layouts:
 *   wheelLayout()   fixed slice count, one wedge per slot, at least MIN_WEDGE wide
 *   flavourLayout() angle from the data, then greedy slot assignment
 */

export const VIEW = 340;
export const HUB_R = 88; // centre medallion
export const RING_R0 = 96; // wedge inner edge
export const RING_R1 = 318; // wedge outer edge = the rim
export const START_DEG = 90; // 12 o'clock
/** A button must subtend at least this much of the circle to be clickable. */
export const MIN_WEDGE = 360 / 28;
/** Arc length (view units) a label needs at the label radius. */
export const LABEL_ARC = 62;

export interface Wedge<T> {
  items: T[];
  midDeg: number;
  startDeg: number;
  endDeg: number;
}

/** SVG annular-sector path. Angles are screen degrees (0 = right, 90 = up). */
export function wedgePath(startDeg: number, endDeg: number, r0: number, r1: number): string {
  const sweep = (startDeg - endDeg + 360) % 360;
  const large = sweep > 180 ? 1 : 0;
  const pt = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: r * Math.cos(a), y: -r * Math.sin(a) };
  };
  // A full circle cannot be drawn with one arc — draw it as two halves.
  if (sweep >= 359.999) {
    const a = pt(startDeg, r1);
    const a2 = pt(startDeg + 180, r1);
    const b = pt(startDeg + 180, r0);
    const b2 = pt(startDeg, r0);
    return [
      `M ${a.x} ${a.y}`,
      `A ${r1} ${r1} 0 1 1 ${a2.x} ${a2.y}`,
      `A ${r1} ${r1} 0 1 1 ${a.x} ${a.y}`,
      `L ${b2.x} ${b2.y}`,
      `A ${r0} ${r0} 0 1 0 ${b.x} ${b.y}`,
      `A ${r0} ${r0} 0 1 0 ${b2.x} ${b2.y}`,
      "Z",
    ].join(" ");
  }
  const o1 = pt(startDeg, r1);
  const o2 = pt(endDeg, r1);
  const i2 = pt(endDeg, r0);
  const i1 = pt(startDeg, r0);
  // Screen angles run counter-clockwise while SVG user space is y-down, so going
  // from startDeg to endDeg on screen means sweep-flag 1, and the inner edge comes
  // back with sweep-flag 0. With the flags the other way the wedge is drawn the
  // long way round the circle and the shape inverts.
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${r1} ${r1} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${r0} ${r0} 0 ${large} 0 ${i1.x} ${i1.y}`,
    "Z",
  ].join(" ");
}

export interface LabelBox {
  x: number;
  y: number;
  rotate: number;
  anchor: "middle";
  /** usable text width at the label radius */
  maxWidth: number;
}

/**
 * Label inside a wedge: tangential (runs along the arc, i.e. parallel to the rim)
 * centred in the band, flipped 180° on the lower half so it is never upside down.
 */
export function wedgeLabel(midDeg: number, r0: number, r1: number, spanDeg: number): LabelBox {
  const rMid = (r0 + r1) / 2;
  const norm = ((midDeg % 360) + 360) % 360;
  const lower = norm > 180;
  const a = (midDeg * Math.PI) / 180;
  const arc = (Math.abs(spanDeg) * Math.PI * rMid) / 180;
  return {
    x: rMid * Math.cos(a),
    y: -rMid * Math.sin(a),
    rotate: norm - 90 + (lower ? 180 : 0),
    anchor: "middle",
    maxWidth: Math.max(18, Math.min(arc - 8, r1 - r0 - 12)),
  };
}

/** Degrees between two angles, always >= 0 and <= 360. */
export function angleGap(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * NO-FLAVOUR MODE. A fixed number of equal wedges that cover the whole circle.
 * Used where the items have no coordinates (tea types) or where the owner wants
 * a clean wheel.
 */
export function wheelLayout<T>(items: T[], minWedge = MIN_WEDGE): Wedge<T>[] {
  const n = items.length;
  if (n === 0) return [];
  // Every wedge gets an equal share of the FULL circle, so no gaps and no overlap.
  const span = Math.max(360 / n, minWedge);
  return items.map((item, i) => {
    const midDeg = START_DEG - i * span;
    return { items: [item], midDeg, startDeg: midDeg + span / 2, endDeg: midDeg - span / 2 };
  });
}

export interface Point {
  /** 0-100, bitter -> sweet */
  y: number;
  /** tie-breaker so equal sweetness keeps a stable order */
  x?: number;
  key?: string;
}

/**
 * FLAVOUR MODE. Angle comes straight from the tea's sweetness:
 * 100 -> 12 o'clock, 0 -> 6 o'clock, i.e. deg = 90 - (50 - y) * 3.6.
 * Neighbours in flavour end up neighbours on the wheel, so the ring is a faithful
 * projection of the XY chart onto a circle.
 */
export function angleForFlavour(y: number | null | undefined): number {
  const clamped = Math.max(0, Math.min(100, y ?? 50));
  // sweet (100) -> 12 o'clock (90deg), bitter (0) -> 6 o'clock (-90deg)
  return 90 + (clamped - 50) * 3.6;
}

/**
 * Place items around the circle by flavour, then assign wedges greedily so that
 * every wedge is at least `minSpan` wide. Items that would land closer together
 * than that MERGE into one button rather than being drawn as unclickable slivers.
 *
 * Returns wedges in clockwise order starting at 12 o'clock.
 */
export function flavourLayout<T extends Point>(items: T[], minSpan = MIN_WEDGE): Wedge<T>[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    const midDeg = angleForFlavour(items[0].y);
    return [{ items: [...items], midDeg, startDeg: midDeg + 180, endDeg: midDeg - 180 }];
  }

  // 1. desired angle per item (unwrapped, 0..360)
  const desired = items
    .map((it) => ({
      item: it,
      deg: ((angleForFlavour(it.y) % 360) + 360) % 360,
      tie: it.x ?? 0,
    }))
    .sort((a, b) => a.deg - b.deg || a.tie - b.tie);

  // 2. greedy merge: walk clockwise, start a new wedge when the next item is far
  //    enough from the wedge's FIRST item (not its last, which drifts).
  let groups: T[][] = [[desired[0].item]];
  let groupStartDeg = desired[0].deg;
  for (let i = 1; i < desired.length; i++) {
    if (angleGap(desired[i].deg, groupStartDeg) < minSpan) {
      groups[groups.length - 1].push(desired[i].item);
    } else {
      groups.push([desired[i].item]);
      groupStartDeg = desired[i].deg;
    }
  }

  // 3. the ring is closed: fold the last wedge into the first when they collide
  if (groups.length > 1) {
    const firstDeg = desired[0].deg;
    const lastDeg = desired[desired.length - 1].deg;
    if (angleGap(firstDeg, lastDeg) < minSpan) {
      groups[0] = [...groups[groups.length - 1], ...groups[0]];
      groups = groups.slice(0, -1);
    }
  }

  // 4. one wedge per group, each centred on the mean angle of its own items
  const n = groups.length;
  const centres = groups.map((g, gi) => {
    const degs = g.map((it) =>
      ((angleForFlavour(it.y) % 360) + 360) % 360
    );
    // mean of circular values, so a group straddling 0deg stays together
    const sx = degs.reduce((s, d) => s + Math.cos((d * Math.PI) / 180), 0);
    const sy = degs.reduce((s, d) => s + Math.sin((d * Math.PI) / 180), 0);
    let mean = (Math.atan2(sy, sx) * 180) / Math.PI;
    if (mean < 0) mean += 360;
    return { items: g, mid: mean, index: gi };
  });
  centres.sort((a, b) => a.mid - b.mid);

  // 5. Tile the circle. Work in a monotonically ASCENDING copy of the centroids
  //    (extended one turn past the seam), take the midpoint between each pair as
  //    the shared edge, and give each wedge the arc between its two edges. Because
  //    consecutive midpoints partition one full turn, the spans sum to exactly 360.
  const ext: number[] = [...centres.map((k) => k.mid)];
  for (let i = 1; i < n; i++) {
    while (ext[i] < ext[i - 1]) ext[i] += 360; // ascending, no wrap
  }
  // edges[i] is the boundary between ext[i] and ext[i+1] (ext[n] wraps to ext[0] + 360)
  const edges: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = ext[i];
    const b = i === n - 1 ? ext[0] + 360 : ext[i + 1];
    edges.push((a + b) / 2);
  }

  return centres.map((c2, i) => {
    // this wedge sits between the previous edge and its own edge
    const hi = edges[i];
    const lo = i === 0 ? edges[n - 1] - 360 : edges[i - 1];
    return {
      items: c2.items,
      midDeg: c2.mid,
      // on screen the wedge runs clockwise: from the edge below to the edge above
      startDeg: hi,
      endDeg: lo,
    } satisfies Wedge<T>;
  });
}

/** How many equal wedges fit on one wheel before they get too thin to hit. */
export function maxWheelSlots(minSpan = MIN_WEDGE): number {
  return Math.floor(360 / minSpan);
}

/** A wedge's angular width in degrees, correct across the 0/360 seam. */
export function wedgeSpan(w: { startDeg: number; endDeg: number }): number {
  const s = ((w.startDeg % 360) + 360) % 360;
  const e = ((w.endDeg % 360) + 360) % 360;
  const d = (s - e + 360) % 360;
  return d === 0 ? 360 : d;
}

/** True when every wedge is wide enough to be a real button. */
export function wedgesAreClickable<T>(wedges: Wedge<T>[], minSpan = MIN_WEDGE): boolean {
  return wedges.every((w) => wedgeSpan(w) >= minSpan - 1e-6);
}

/** Which wedge, if any, sits under a click at (x, y) in view coordinates. */
export function wedgeAt<T>(wedges: Wedge<T>[], x: number, y: number): Wedge<T> | null {
  const r = Math.hypot(x, y);
  if (r < RING_R0 || r > RING_R1) return null;
  const deg = (((Math.atan2(-y, x) * 180) / Math.PI) + 360) % 360;
  for (const w of wedges) {
    const start = ((w.startDeg % 360) + 360) % 360;
    const end = ((w.endDeg % 360) + 360) % 360;
    const span = (start - end + 360) % 360 || 360;
    const fromStart = (start - deg + 360) % 360;
    if (fromStart <= span) return w;
  }
  return null;
}
