import { describe, expect, it } from "vitest";
import { BASE_R, LAP_STEP, MAX_LAPS, RIM_R, dialState, dueSeconds, lapArc } from "@/lib/brew/steepwheel";

describe("steep timer dial", () => {
  it("starts empty on one lap", () => {
    const d = dialState(0, 180);
    expect(d.laps).toHaveLength(1);
    expect(d.laps[0].fill).toBe(0);
    expect(d.over).toBe(false);
  });

  it("is half of the base lap half way through the recommended time", () => {
    const d = dialState(90, 180);
    expect(d.laps).toHaveLength(1);
    expect(d.laps[0].fill).toBeCloseTo(0.5, 5);
    expect(d.passed).toBe(0);
    expect(d.over).toBe(false);
  });

  it("closes the first lap at the target and opens a second", () => {
    const d = dialState(180, 180);
    expect(d.laps).toHaveLength(2);
    expect(d.laps[0].fill).toBe(1);
    expect(d.laps[1].fill).toBeCloseTo(0, 6);
    expect(d.over).toBe(true);
  });

  it("layers a larger lap when the steep over-runs", () => {
    const d = dialState(270, 180); // 1.5 targets
    expect(d.laps).toHaveLength(2);
    expect(d.laps[1].fill).toBeCloseTo(0.5, 5);
    expect(d.laps[1].r - d.laps[0].r).toBe(LAP_STEP);
    expect(d.passed).toBe(1);
    expect(d.overBy).toBeCloseTo(90, 5);
  });

  it("keeps layering while the clock climbs", () => {
    const d = dialState(555, 180); // 3.08 targets
    expect(d.laps).toHaveLength(4);
    expect(d.laps[3].fill).toBeCloseTo(0.0833, 3);
  });

  it("never draws past the rim, however long the steep runs", () => {
    const d = dialState(60 * 60, 60); // an hour against a one-minute tea
    expect(d.laps.length).toBeLessThanOrEqual(MAX_LAPS);
    const outermost = d.laps[d.laps.length - 1];
    expect(outermost.r).toBeLessThan(RIM_R);
    expect(d.passed).toBe(60);
  });

  it("marks only the final lap active", () => {
    const d = dialState(400, 120);
    const active = d.laps.filter((l) => l.active);
    expect(active).toHaveLength(1);
    expect(active[0].index).toBe(d.laps.length - 1);
  });

  it("falls back to 30 s when the tea carries no time", () => {
    expect(dialState(15, 0).laps[0].fill).toBeCloseTo(0.5, 5);
    expect(dueSeconds(null, 1)).toBe(30);
  });

  it("adds fifteen seconds for every steep after the first", () => {
    expect(dueSeconds(180, 1)).toBe(180);
    expect(dueSeconds(180, 2)).toBe(195);
    expect(dueSeconds(180, 3)).toBe(210);
  });

  it("starts every lap at twelve o'clock", () => {
    const quarter = lapArc(0, 0, BASE_R, 90, 0);
    expect(quarter.startsWith(`M 0 -${BASE_R}`)).toBe(true);
  });

  it("draws a full lap as two arcs, never one empty one", () => {
    // a lap is drawn from 12 o'clock to 12 o'clock, i.e. 90 down to -270
    const full = lapArc(0, 0, BASE_R, 90, -270);
    expect(full.split("A").length - 1).toBe(2);
  });
});
