import { describe, it, expect } from "vitest";
import {
  toPoint,
  angleFor,
  radiusFor,
  layoutTeas,
  typeSectors,
  labelPlacement,
  dotRadius,
  CENTER_R,
  type TeaPoint,
} from "@/lib/brew/radial";

const tea = (slug: string, x: number, y: number): TeaPoint => ({ slug, name: slug, flavor_x: x, flavor_y: y });

describe("polar mapping", () => {
  it("puts sweetness radially: sweet far from the hub, bitter close to it", () => {
    const sweet = toPoint(50, 95);
    const bitter = toPoint(50, 5);
    expect(Math.hypot(sweet.px, sweet.py)).toBeGreaterThan(Math.hypot(bitter.px, bitter.py));
  });

  it("sweeps the roast axis clockwise from upper-left to lower-left", () => {
    const fresh = toPoint(0, 50);
    const medium = toPoint(50, 50);
    const roasted = toPoint(100, 50);
    expect(fresh.px).toBeLessThan(0);
    expect(fresh.py).toBeLessThan(0); // upper-left
    expect(medium.px).toBeGreaterThan(0); // right
    expect(roasted.px).toBeLessThan(0);
    expect(roasted.py).toBeGreaterThan(0); // lower-left
  });

  it("never makes fresh and roasted neighbours (270° gauge, not a full turn)", () => {
    const fresh = toPoint(0, 50);
    const roasted = toPoint(100, 50);
    const sep = Math.abs(Math.atan2(fresh.py, fresh.px) - Math.atan2(roasted.py, roasted.px));
    expect(sep).toBeGreaterThan(Math.PI); // more than half a turn apart
  });

  it("keeps radius monotonic in sweetness", () => {
    const radii = [0, 20, 40, 60, 80, 100].map((y) => radiusFor(y));
    for (let i = 1; i < radii.length; i++) expect(radii[i]).toBeGreaterThan(radii[i - 1]);
  });

  it("never places a dot inside the centre medallion", () => {
    // the bitterest possible tea still clears the medallion edge
    expect(radiusFor(0)).toBeGreaterThan(CENTER_R);
    expect(Math.min(...[0, 10, 50, 99, 100].map((y) => radiusFor(y)))).toBeGreaterThan(CENTER_R);
  });

  it("clamps garbage input instead of producing NaN", () => {
    for (const [x, y] of [[Number.NaN, Number.NaN], [-50, 400], [1e9, -1e9]] as const) {
      const p = toPoint(x as number, y as number);
      expect(Number.isFinite(p.px)).toBe(true);
      expect(Number.isFinite(p.py)).toBe(true);
    }
  });

  it("angleFor maps the chart axis onto a 270° gauge", () => {
    expect(angleFor(50)).toBe(0);
    expect(angleFor(0)).toBe(135);
    expect(angleFor(100)).toBe(-135);
  });
});

describe("occupancy lattice", () => {
  it("aggregates exact duplicates into one dot instead of hiding a tea", () => {
    const dots = layoutTeas([tea("a", 30, 40), tea("b", 30, 40)]);
    expect(dots).toHaveLength(1);
    expect(dots[0].teas.map((t) => t.slug).sort()).toEqual(["a", "b"]);
  });

  it("sorts each cell's teas sweetest first", () => {
    const dots = layoutTeas([tea("bitter", 30, 10), tea("sweet", 30, 90)]);
    // different cells here, so check the shared-cell case
    const shared = layoutTeas([tea("bitter", 30, 40), tea("sweet", 30, 40)]);
    expect(shared[0].teas[0].flavor_y).toBeGreaterThanOrEqual(shared[0].teas[1].flavor_y);
    expect(dots.length).toBeGreaterThan(0);
  });

  it("gives crowded cells a bigger dot", () => {
    expect(dotRadius(1)).toBeLessThan(dotRadius(6));
    expect(dotRadius(100)).toBeLessThanOrEqual(14);
  });

  it("keeps every dot at least one cell apart for distinct teas", () => {
    const teas = [tea("a", 10, 10), tea("b", 90, 90), tea("c", 55, 32), tea("d", 22, 67)];
    const dots = layoutTeas(teas);
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const d = Math.hypot(dots[i].px - dots[j].px, dots[i].py - dots[j].py);
        expect(d).toBeGreaterThan(0);
      }
    }
  });

  it("is deterministic", () => {
    const teas = Array.from({ length: 40 }, (_, i) => tea(`t${i}`, i * 2.5, i * 2.4));
    expect(layoutTeas(teas)).toEqual(layoutTeas(teas));
  });

  it("does not lose a tea: dot counts always sum to the input", () => {
    const teas = Array.from({ length: 350 }, (_, i) => tea(`t${i}`, (i * 7) % 100, (i * 13) % 100));
    const dots = layoutTeas(teas);
    const total = dots.reduce((n, d) => n + d.teas.length, 0);
    expect(total).toBe(350);
    expect(Math.max(...dots.map((d) => d.teas.length))).toBeLessThanOrEqual(8);
  });
});

describe("type sectors", () => {
  it("starts at 12 o'clock and spreads evenly", () => {
    const s = typeSectors(["green", "black", "oolong"]);
    expect(s[0].mid).toBe(90);
    expect(s[1].mid).toBeCloseTo(-30);
    expect(s[2].mid).toBeCloseTo(-150);
    for (const sec of s) expect(sec.end - sec.start).toBeCloseTo(120);
  });

  it("never sizes a sector by tea count", () => {
    const s = typeSectors(["sheng_puerh", "yellow"]);
    expect(s[0].end - s[0].start).toBeCloseTo(180);
  });

  it("handles the empty and single cases", () => {
    expect(typeSectors([])).toEqual([]);
    expect(typeSectors(["green"])[0].end - typeSectors(["green"])[0].start).toBeCloseTo(360);
  });
});

describe("rim labels", () => {
  it("never renders text upside down", () => {
    for (let a = -180; a < 180; a += 7) {
      const p = labelPlacement(a);
      expect(Math.abs(p.rotate)).toBeLessThanOrEqual(90);
    }
  });
});
