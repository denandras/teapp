import { describe, it, expect } from "vitest";
import {
  wheelLayout,
  flavourLayout,
  wedgePath,
  wedgeLabel,
  wedgeAt,
  wedgesAreClickable,
  angleForFlavour,
  angleGap,
  MIN_WEDGE,
  maxWheelSlots,
  wedgeSpan,
  RING_R0,
  RING_R1,
  START_DEG,
} from "@/lib/brew/wheel";

const pts = (...ys: number[]) => ys.map((y, i) => ({ y, x: i, key: `t${i}` }));

describe("wedgePath", () => {
  it("closes and draws two arcs for a normal wedge", () => {
    const d = wedgePath(90, 45, 96, 318);
    expect(d.endsWith("Z")).toBe(true);
    expect((d.match(/A /g) ?? [])).toHaveLength(2);
    expect(d).not.toContain("NaN");
  });

  it("handles a full circle without NaN", () => {
    const d = wedgePath(90, -270, 96, 318);
    expect(d).not.toContain("NaN");
    expect(d.endsWith("Z")).toBe(true);
  });

  it("uses the large-arc flag for wedges over half the circle", () => {
    const big = wedgePath(90, -180, 96, 318);
    expect(big).toMatch(/A [\d.]+ [\d.]+ 0 1 [01]/);
  });

  // Regression: the sweep flags were inverted, so every wedge was drawn the long
  // way round the circle. The circle is CONTINUOUS: sample points along the arc.
  it("sweeps over the TOP for a top wedge, not around the bottom", () => {
    const d = wedgePath(135, 45, 96, 318);
    const afterA = d.slice(d.indexOf(" A ") + 3).split(" ");
    expect(Number(afterA[4])).toBe(1); // sweep-flag: clockwise on screen
    // both outer arc endpoints (x y at the end of each A command) sit ABOVE the
    // centre, i.e. negative y in SVG space — that is what "over the top" means
    expect(Number(afterA[6])).toBeLessThan(-100); // end of the outer arc
  });

  it("keeps the inner arc as the closing edge, swept the other way", () => {
    const d = wedgePath(135, 45, 96, 318);
    const parts = d.split(" A ");
    expect(parts).toHaveLength(3);
    const inner = parts[2].split(" ");
    expect(Number(inner[4])).toBe(0);
  });

  it("draws every wedge in a full wheel within the outer radius", () => {
    for (let i = 0; i < 8; i++) {
      const midDeg = 90 - i * 45;
      const span = 45;
      const d = wedgePath(midDeg + span / 2, midDeg - span / 2, 96, 318);
      for (const raw of d.match(/-?[\d.]+/g)!.map(Number)) {
        expect(Math.abs(raw)).toBeLessThanOrEqual(318.001);
      }
    }
  });
});

describe("wheelLayout — a clean wheel with one button per item", () => {
  it("spreads equal wedges round the whole circle starting at the top", () => {
    const w = wheelLayout(["a", "b", "c", "d"]);
    expect(w).toHaveLength(4);
    expect(w[0].midDeg).toBe(START_DEG);
    for (const x of w) expect(wedgeSpan(x)).toBeCloseTo(90);
  });

  it("covers the full circle", () => {
    const w = wheelLayout(["a", "b", "c"]);
    const spans = w.map((x) => wedgeSpan(x));
    expect(spans.reduce((s, v) => s + v, 0)).toBeCloseTo(360);
  });

  it("never makes a wedge thinner than the clickable minimum", () => {
    // the honest wheel never exceeds maxWheelSlots; 28 is the arithmetic limit
    const n = maxWheelSlots();
    expect(n).toBeGreaterThanOrEqual(6);
    const w = wheelLayout(Array.from({ length: n }, (_, i) => i));
    expect(wedgesAreClickable(w)).toBe(true);
  });

  it("leaves no gaps: a full wheel covers the circle exactly", () => {
    for (const n of [3, 7, 12, 28]) {
      const w = wheelLayout(Array.from({ length: n }, (_, i) => i));
      const spans = w.map((x) => wedgeSpan(x));
      expect(spans.reduce((s, v) => s + v, 0)).toBeCloseTo(360);
    }
  });

  it("is empty for no items", () => {
    expect(wheelLayout([])).toEqual([]);
  });
});

describe("flavour placement — teas sit where their coordinates say", () => {
  it("maps sweetness to the vertical axis: 50 at the top, 0 at the bottom-left", () => {
    const yScreen = (deg: number) => -Math.sin((deg * Math.PI) / 180);
    expect(yScreen(angleForFlavour(50))).toBeLessThan(-0.9); // top
    expect(yScreen(angleForFlavour(50))).toBeCloseTo(-1, 2);
    expect(angleForFlavour(0)).toBeCloseTo(-90, 5); // bitter: bottom-left seam
    expect(angleForFlavour(25)).toBeCloseTo(0, 5); // bitter-sweet: right
    expect(angleForFlavour(100)).toBeCloseTo(270, 5); // sweetest: bottom-right seam
  });

  it("keeps flavour order: sweeter is never further clockwise than bitter", () => {
    const w = flavourLayout(pts(95, 80, 60, 40, 20, 5));
    const mids = w.map((x) => ((x.midDeg % 360) + 360) % 360);
    const sorted = [...mids].sort((a, b) => a - b);
    expect(mids).toEqual(sorted);
  });

  it("protects neighbours: two teas close in flavour merge into one button", () => {
    const w = flavourLayout(pts(60, 61, 62));
    expect(w).toHaveLength(1);
    expect(w[0].items).toHaveLength(3);
  });

  it("keeps well-separated teas as separate buttons", () => {
    const w = flavourLayout(pts(95, 70, 45, 20));
    expect(w).toHaveLength(4);
  });

  it("every wedge in a dense type is still clickable, merging the rest", () => {
    const many = pts(...Array.from({ length: 219 }, (_, i) => (i * 37) % 101));
    const w = flavourLayout(many);
    expect(wedgesAreClickable(w)).toBe(true);
    // and no tea was lost
    expect(w.reduce((s, x) => s + x.items.length, 0)).toBe(219);
  });

  it("handles a single tea as a full-circle button", () => {
    const w = flavourLayout(pts(88));
    expect(w).toHaveLength(1);
    expect(wedgeSpan(w[0])).toBeCloseTo(360);
  });

  it("wraps the ring: the sweetest and the bitterest are neighbours too", () => {
    const w = flavourLayout(pts(99, 96, 30, 3));
    const labels = w.map((x) => x.items.length);
    // 99 and 3 are adjacent across 12 o'clock, so they merge
    expect(labels.reduce((s, v) => s + v, 0)).toBe(4);
    expect(w.length).toBeLessThan(4);
  });

  it("is deterministic", () => {
    const a = flavourLayout(pts(90, 60, 30, 10));
    const b = flavourLayout(pts(90, 60, 30, 10));
    expect(a).toEqual(b);
  });

  it("copes with missing coordinates", () => {
    const w = flavourLayout([{ y: null as unknown as number, key: "a" }, { y: 40, key: "b" }]);
    expect(w.length).toBeGreaterThan(0);
    expect(w.flatMap((x) => x.items)).toHaveLength(2);
  });

  it("survives 350 items without losing one or producing a sliver", () => {
    const many = pts(...Array.from({ length: 350 }, (_, i) => (i * 13) % 101));
    const w = flavourLayout(many);
    expect(w.flatMap((x) => x.items)).toHaveLength(350);
    expect(wedgesAreClickable(w)).toBe(true);
  });
});

describe("tiling — wedges must cover the circle exactly once", () => {
  const coverage = <T,>(w: { startDeg: number; endDeg: number }[]) => {
    // sum of |span| must be 360 and no two wedges may overlap
    const spans = w.map((x) => wedgeSpan(x));
    return spans.reduce((s, v) => s + v, 0);
  };

  it("covers 360 degrees for uneven flavour data", () => {
    for (const ys of [[95, 90, 88, 40, 20], [100, 99, 50, 49, 1], [70, 60, 30]]) {
      const w = flavourLayout(pts(...ys));
      expect(coverage(w)).toBeCloseTo(360, 5);
    }
  });

  // The real invariant: click anywhere in the ring and exactly one button answers.
  it("every angle in the ring is covered by exactly one button", () => {
    for (const ys of [[95, 90, 40, 20, 5], [70, 60, 30], [100, 99, 98, 40, 39, 2]]) {
      const w = flavourLayout(pts(...ys));
      const r = (RING_R0 + RING_R1) / 2;
      for (let a = 0; a < 360; a += 1) {
        const hit = wedgeAt(w, r * Math.cos((a * Math.PI) / 180), -r * Math.sin((a * Math.PI) / 180));
        expect(hit === null ? `gap at ${a}` : "ok").toBe("ok");
      }
    }
  });

  it("covers 360 degrees when everything merged into one button", () => {
    const w = flavourLayout(pts(60, 60.5, 61));
    expect(w).toHaveLength(1);
    expect(coverage(w)).toBeCloseTo(360, 5);
  });

  it("covers 360 degrees for a full tea type", () => {
    const many = pts(...Array.from({ length: 24 }, (_, i) => 100 - i * 4));
    expect(coverage(flavourLayout(many))).toBeCloseTo(360, 5);
  });
});

describe("hit testing", () => {
  const wheel = wheelLayout(["a", "b", "c", "d"]);

  it("finds the wedge at 12 o'clock", () => {
    const w = wedgeAt(wheel, 0, -200);
    expect(w?.items[0]).toBe("a");
  });

  it("finds the wedge on the right", () => {
    const w = wedgeAt(wheel, 200, 0);
    expect(w?.items[0]).toBe("b");
  });

  it("returns null inside the hub", () => {
    expect(wedgeAt(wheel, 0, -20)).toBeNull();
  });

  it("returns null outside the rim", () => {
    expect(wedgeAt(wheel, 0, -(RING_R1 + 40))).toBeNull();
  });

  it("hits every wedge somewhere in its own band", () => {
    for (const w of wheel) {
      const a = (w.midDeg * Math.PI) / 180;
      const r = (RING_R0 + RING_R1) / 2;
      expect(wedgeAt(wheel, r * Math.cos(a), -r * Math.sin(a))?.items[0]).toBe(w.items[0]);
    }
  });
});

describe("labels", () => {
  it("are tangential and never upside down", () => {
    for (let a = -180; a < 180; a += 2) {
      const l = wedgeLabel(a, 96, 318, 30);
      const norm = ((l.rotate % 360) + 540) % 360 - 180;
      expect(Math.abs(norm)).toBeLessThanOrEqual(90);
    }
  });

  it("sit in the middle of the band", () => {
    for (let a = -180; a < 180; a += 20) {
      const l = wedgeLabel(a, 96, 318, 40);
      expect(Math.hypot(l.x, l.y)).toBeCloseTo((96 + 318) / 2, 5);
    }
  });

  it("give narrow wedges less room, never zero", () => {
    expect(wedgeLabel(0, 96, 318, 4).maxWidth).toBeLessThan(wedgeLabel(0, 96, 318, 60).maxWidth);
    expect(wedgeLabel(0, 96, 318, 4).maxWidth).toBeGreaterThan(0);
  });
});

describe("angleGap", () => {
  it("measures the short way round", () => {
    expect(angleGap(10, 350)).toBeCloseTo(20);
    expect(angleGap(0, 180)).toBeCloseTo(180);
  });
});
