import { describe, it, expect } from "vitest";
import {
  layoutRing,
  slicePath,
  labelFor,
  slotsForRadius,
  labelSlots,
  capacityFor,
  LABEL_ARC,
  ringBands,
  paginate,
  INNER_R,
  OUTER_R,
  MAX_RINGS,
  START_DEG,
} from "@/lib/brew/ring";

const items = (n: number) => Array.from({ length: n }, (_, i) => `tea-${i}`);

describe("capacity is computed from the geometry", () => {
  it("fits fewer slices on a tighter ring", () => {
    expect(slotsForRadius(120)).toBeLessThan(slotsForRadius(300));
  });

  it("never returns a zero capacity", () => {
    expect(slotsForRadius(1)).toBeGreaterThanOrEqual(1);
  });

  it("sizes a ring so every slice can carry a readable label", () => {
    for (const k of [1, 2, 3]) {
      for (const band of ringBands(k)) {
        const rMid = (band.r0 + band.r1) / 2;
        const arc = (2 * Math.PI * rMid) / labelSlots(band);
        expect(arc).toBeGreaterThanOrEqual(LABEL_ARC - 1e-9);
      }
    }
  });

  it("grows capacity by adding concentric rings", () => {
    const one = capacityFor(1);
    const many = capacityFor(200);
    expect(many.ringCount).toBeGreaterThan(one.ringCount);
    expect(many.capacity).toBeGreaterThan(one.capacity);
  });

  it("never exceeds the maximum ring count", () => {
    const huge = capacityFor(10_000);
    expect(huge.ringCount).toBeLessThanOrEqual(MAX_RINGS);
  });

  it("splits the band into equal thicknesses, outer ring first", () => {
    const bands = ringBands(3);
    expect(bands[0].r1).toBeCloseTo(OUTER_R);
    expect(bands[2].r0).toBeCloseTo(INNER_R);
    const t0 = bands[0].r1 - bands[0].r0;
    const t2 = bands[2].r1 - bands[2].r0;
    expect(t0).toBeCloseTo(t2);
    for (let i = 1; i < bands.length; i++) expect(bands[i].r1).toBeLessThanOrEqual(bands[i - 1].r0 + 1e-9);
  });
});

describe("layoutRing", () => {
  it("gives every item an equal slice starting at the top", () => {
    const { slices } = layoutRing(items(8));
    expect(slices).toHaveLength(8);
    expect(slices[0].midDeg).toBe(START_DEG);
    for (const s of slices) expect(s.startDeg - s.endDeg).toBeCloseTo(45);
  });

  it("runs clockwise", () => {
    const { slices } = layoutRing(items(4));
    expect(slices[0].midDeg).toBe(90);
    expect(slices[1].midDeg).toBe(0);
    expect(slices[2].midDeg).toBe(-90);
    expect(slices[3].midDeg).toBe(-180);
  });

  it("keeps every slice inside the band", () => {
    for (const n of [1, 3, 10, 40, 120]) {
      const { slices } = layoutRing(items(n));
      for (const s of slices) {
        expect(s.r0).toBeGreaterThanOrEqual(INNER_R - 1e-9);
        expect(s.r1).toBeLessThanOrEqual(OUTER_R + 1e-9);
        expect(s.r1).toBeGreaterThan(s.r0);
      }
    }
  });

  it("never loses an item it agreed to hold", () => {
    for (const n of [1, 5, 17, 60, 200]) {
      const { slices, capacity } = layoutRing(items(n));
      expect(slices).toHaveLength(Math.min(n, capacity));
      const seen = new Set(slices.map((s) => s.item));
      expect(seen.size).toBe(slices.length);
    }
  });

  it("reports overflow instead of silently dropping teas", () => {
    const n = 5000;
    const { slices, capacity, overflow } = layoutRing(items(n));
    expect(overflow).toBe(true);
    expect(slices).toHaveLength(capacity);
  });

  it("does not overflow when everything fits", () => {
    const { capacity, overflow } = layoutRing(items(6));
    expect(overflow).toBe(false);
    expect(capacity).toBeGreaterThanOrEqual(6);
  });

  it("is deterministic", () => {
    expect(layoutRing(items(30))).toEqual(layoutRing(items(30)));
  });

  it("handles the empty case", () => {
    const r = layoutRing([]);
    expect(r.slices).toEqual([]);
    expect(r.overflow).toBe(false);
  });

  it("fills the outer ring before using an inner one", () => {
    const { slices, ringCount } = layoutRing(items(200));
    expect(ringCount).toBeGreaterThan(1);
    const outer = slices.filter((s) => s.ring === 0);
    const inner = slices.filter((s) => s.ring > 0);
    expect(outer.length).toBeGreaterThan(0);
    expect(inner.length).toBeGreaterThan(0);
    expect(Math.min(...outer.map((s) => s.r1))).toBeGreaterThan(Math.max(...inner.map((s) => s.r1)) - 1e-9);
  });
});

describe("slicePath", () => {
  it("produces a closed path with two arcs", () => {
    const d = slicePath(90, 45, 120, 300);
    expect(d.startsWith("M ")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expect((d.match(/A /g) ?? [])).toHaveLength(2);
  });

  it("does not emit NaN for degenerate slices", () => {
    expect(slicePath(0, 0.0001, 120, 300)).not.toContain("NaN");
  });
});

describe("label placement — tangential, aligned to the rim", () => {
  const norm = (d: number) => ((d % 360) + 540) % 360 - 180;

  it("is never upside down at any angle", () => {
    for (let a = -180; a < 180; a += 3) {
      const l = labelFor(a, 200, 300, 30);
      // readable means within ±90° of horizontal
      expect(Math.abs(norm(l.rotate))).toBeLessThanOrEqual(90);
    }
  });

  it("keeps text horizonatal at the top and bottom of the wheel", () => {
    expect(norm(labelFor(90, 200, 300, 30).rotate)).toBeCloseTo(0);      // 12 o'clock
    expect(Math.abs(norm(labelFor(270, 200, 300, 30).rotate))).toBeCloseTo(0); // 6 o'clock, flipped
  });

  it("runs the text along the arc, not across it", () => {
    // at 3 o'clock a tangential label is vertical
    expect(Math.abs(norm(labelFor(0, 200, 300, 30).rotate))).toBeCloseTo(90);
  });

  it("sits in the middle of its band", () => {
    for (let a = -180; a < 180; a += 15) {
      const l = labelFor(a, 200, 300, 40);
      expect(Math.hypot(l.x, l.y)).toBeCloseTo(250, 5);
    }
  });

  it("gives narrow slices less room for text, and never zero", () => {
    const wide = labelFor(0, 200, 300, 60);
    const narrow = labelFor(0, 200, 300, 4);
    expect(narrow.maxWidth).toBeLessThan(wide.maxWidth);
    expect(narrow.maxWidth).toBeGreaterThan(0);
  });

  it("centres the text on the slice", () => {
    expect(labelFor(45, 200, 300, 30).anchor).toBe("middle");
  });
});

describe("pagination", () => {
  it("splits into full pages plus a remainder", () => {
    expect(paginate(items(10), 4).map((p) => p.length)).toEqual([4, 4, 2]);
  });

  it("returns one page when everything fits", () => {
    expect(paginate(items(3), 10)).toHaveLength(1);
  });

  it("never returns zero pages", () => {
    expect(paginate([], 10)).toEqual([[]]);
  });
});
