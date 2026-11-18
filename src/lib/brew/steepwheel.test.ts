import { describe, it, expect } from "vitest";
import { newSession, startSteep, finishSteep } from "@/lib/brew/session";
import { bandGeometry, steepBands, VIEW, HUB_R, OUTER_R, MIN_BAND } from "@/lib/brew/steepwheel";

const T0 = 1_700_000_000_000;

/** A session with n finished steeps of the given lengths (seconds). */
function sessionWith(lengths: number[]) {
  let s = newSession("genmaicha", T0);
  let t = T0;
  for (const len of lengths) {
    s = startSteep(s, t);
    t += len * 1000;
    s = finishSteep(s, t);
  }
  return { session: s, now: t };
}

const totalSpan = (bands: { startDeg: number; endDeg: number }[]) =>
  bands.reduce((sum, b) => sum + Math.abs(b.startDeg - b.endDeg), 0);

describe("steep bands — the wheel must always claim the whole turn", () => {
  it("a single running steep fills the full 360", () => {
    const s = startSteep(newSession("genmaicha", T0), T0);
    const bands = steepBands(s, T0 + 3000);
    expect(bands).toHaveLength(1);
    expect(totalSpan(bands)).toBeCloseTo(360, 4);
  });

  it("never leaves a gap however many steeps there are", () => {
    for (const n of [1, 2, 3, 4, 5, 8]) {
      const { session, now } = sessionWith(Array.from({ length: n }, () => 45));
      const bands = steepBands(session, now);
      expect(bands).toHaveLength(n);
      expect(totalSpan(bands)).toBeCloseTo(360, 4);
    }
  });

  it("never lets an early live steep swallow the turn", () => {
    // two finished steeps (6s, 9s) and a live steep that is only 4s old.
    // The live band used to receive "all the remainder" and covered ~85% of the
    // circle, which read as a broken ring with a stray sliver.
    let s = sessionWith([6, 9]).session;
    const startedAt = T0 + 15_000;
    s = startSteep(s, startedAt);
    const bands = steepBands(s, startedAt + 4000);
    const liveBand = bands.find((b) => b.live)!;
    const liveShare = Math.abs(liveBand.startDeg - liveBand.endDeg);
    expect(liveShare).toBeLessThan(110); // 4s of 19s is ~76deg, plus slack
    expect(totalSpan(bands)).toBeCloseTo(360, 4);
  });

  it("gives a longer steep a bigger share than a shorter one", () => {
    const { session, now } = sessionWith([40, 120]);
    const bands = steepBands(session, now);
    const first = Math.abs(bands[0].startDeg - bands[0].endDeg);
    const second = Math.abs(bands[1].startDeg - bands[1].endDeg);
    expect(second).toBeGreaterThan(first);
  });

  it("keeps every finished steep wide enough to read", () => {
    // one steep of 5s next to one of 300s: the short one must not vanish
    const { session, now } = sessionWith([5, 300]);
    const bands = steepBands(session, now);
    for (const b of bands) {
      expect(Math.abs(b.startDeg - b.endDeg)).toBeGreaterThan(10);
    }
  });

  it("nests each steep inside the previous one", () => {
    const { session, now } = sessionWith([40, 50, 60]);
    const bands = steepBands(session, now);
    expect(bands[0].r1).toBeCloseTo(OUTER_R, 5);
    for (let i = 1; i < bands.length; i++) {
      expect(bands[i].r1).toBeLessThanOrEqual(bands[i - 1].r0 + 0.001);
    }
  });

  it("never nests through the hub, however long the session", () => {
    const { session, now } = sessionWith(Array.from({ length: 12 }, () => 30));
    for (const b of steepBands(session, now)) {
      expect(b.r0).toBeGreaterThanOrEqual(HUB_R - 0.001);
      expect(b.r1 - b.r0).toBeGreaterThanOrEqual(MIN_BAND - 0.001);
    }
  });

  it("stays inside the view box", () => {
    const { session, now } = sessionWith([40, 50]);
    for (const b of steepBands(session, now)) {
      expect(b.r1).toBeLessThanOrEqual(VIEW);
      expect(b.r0).toBeGreaterThan(0);
    }
  });

  it("marks exactly one band live while a steep is running", () => {
    let s = sessionWith([40])["session"];
    s = startSteep(s, T0 + 60_000);
    const bands = steepBands(s, T0 + 70_000);
    expect(bands.filter((b) => b.live)).toHaveLength(1);
    expect(bands.filter((b) => b.done)).toHaveLength(1);
  });

  it("gives each steep a stable colour that differs from its neighbour", () => {
    const { session, now } = sessionWith([40, 50, 60]);
    const bands = steepBands(session, now);
    for (let i = 1; i < bands.length; i++) {
      expect(bands[i].color).not.toBe(bands[i - 1].color);
    }
  });
});

describe("band geometry", () => {
  it("sweeps clockwise on screen (sweep-flag 1 on the outer arc)", () => {
    // two finished steeps: neither is a full turn, so each is a 3-command wedge
    const { session, now } = sessionWith([40, 60]);
    const g = bandGeometry(steepBands(session, now)[0]);
    const parts = g.d.split(" A ");
    expect(parts).toHaveLength(3);
    expect(parts[1].split(" ")[4]).toBe("1"); // outer: clockwise
    expect(parts[2].split(" ")[4]).toBe("0"); // inner: back the other way
  });

  it("handles a full turn without collapsing to an empty path", () => {
    const s = startSteep(newSession("genmaicha", T0), T0);
    const g = bandGeometry(steepBands(s, T0 + 5000)[0]);
    expect(g.d).not.toContain("NaN");
    // a 360 arc is impossible in one command, so it must be drawn as two
    expect(g.d.split(" A ").length).toBe(5);
  });

  it("keeps the label inside the band's own radius", () => {
    const { session, now } = sessionWith([40, 50]);
    const bands = steepBands(session, now);
    for (const b of bands) {
      const g = bandGeometry(b);
      const r = Math.hypot(g.labelX, g.labelY);
      expect(r).toBeGreaterThan(b.r0 - 1);
      expect(r).toBeLessThan(b.r1 + 1);
    }
  });

  it("never writes a label upside down", () => {
    const { session, now } = sessionWith([40, 50, 60]);
    for (const b of steepBands(session, now)) {
      const rot = bandGeometry(b).labelRot;
      expect(rot).toBeGreaterThanOrEqual(-90);
      expect(rot).toBeLessThanOrEqual(90);
    }
  });
});
