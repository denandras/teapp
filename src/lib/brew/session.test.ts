import { describe, it, expect } from "vitest";
import {
  newSession,
  startSteep,
  pauseSteep,
  finishSteep,
  endSession,
  resetCurrentSteep,
  steepSeconds,
  liveSeconds,
  sessionPayload,
  formatClock,
  serializeSession,
  parseSession,
  restoreSession,
  capSteep,
  discardCurrentSteep,
  LONG_GAP_MS,
} from "@/lib/brew/session";

const T0 = 1_700_000_000_000;

describe("stopwatch from timestamps", () => {
  it("derives elapsed from startedAt, so a late render is still correct", () => {
    let s = newSession("genmaicha", T0);
    s = startSteep(s, T0);
    // no ticks happened at all — 90 s pass during a throttled tab
    expect(liveSeconds(s, T0 + 90_000)).toBe(90);
  });

  it("freezes a steep on Done and starts the next at zero", () => {
    let s = newSession("genmaicha", T0);
    s = startSteep(s, T0);
    s = finishSteep(s, T0 + 45_000);
    expect(s.steeps).toHaveLength(1);
    expect(steepSeconds(s.steeps[0], T0 + 10 * 60_000)).toBe(45);
    s = startSteep(s, T0 + 60_000);
    expect(s.steeps).toHaveLength(2);
    expect(liveSeconds(s, T0 + 60_000)).toBe(0);
  });

  it("excludes paused time from the steep", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    s = pauseSteep(s, T0 + 30_000);
    s = startSteep(s, T0 + 90_000); // 60 s paused
    expect(liveSeconds(s, T0 + 90_000)).toBe(30);
    expect(liveSeconds(s, T0 + 100_000)).toBe(40);
  });

  it("reset zeroes the current steep only", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    s = finishSteep(s, T0 + 30_000);
    s = startSteep(s, T0 + 40_000);
    s = resetCurrentSteep(s, T0 + 100_000);
    expect(steepSeconds(s.steeps[0], T0)).toBe(30);
    expect(liveSeconds(s, T0 + 100_000)).toBe(0);
  });

  it("endSession closes a running steep", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    s = endSession(s, T0 + 20_000);
    expect(s.state).toBe("ended");
    expect(sessionPayload(s, T0 + 20_000).brews).toBe(1);
  });
});

describe("session payload (one log row)", () => {
  it("records one row with every steep's seconds in order", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    s = finishSteep(s, T0 + 45_000);
    s = startSteep(s, T0 + 50_000);
    s = finishSteep(s, T0 + 145_000);
    const p = sessionPayload(s, T0 + 200_000);
    expect(p).toEqual({ brews: 2, duration_s: 140, steep_s: [45, 95] });
    expect(p.duration_s).toBe(p.steep_s.reduce((a, b) => a + b, 0));
  });

  it("does not count an unfinished steep", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    s = finishSteep(s, T0 + 30_000);
    s = startSteep(s, T0 + 40_000); // still running
    expect(sessionPayload(s, T0 + 100_000)).toEqual({ brews: 1, duration_s: 30, steep_s: [30] });
  });
});

describe("clock formatting", () => {
  it("formats m:ss and rolls to h:mm:ss", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(59)).toBe("0:59");
    expect(formatClock(60)).toBe("1:00");
    expect(formatClock(3599)).toBe("59:59");
    expect(formatClock(3600)).toBe("1:00:00");
  });

  it("never shows a negative clock", () => {
    expect(formatClock(-5)).toBe("0:00");
  });
});

describe("restore after refresh", () => {
  it("resumes a normal running steep with no warning", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    const restored = restoreSession(parseSession(serializeSession(s))!, T0 + 90_000);
    expect(restored.warning).toBeNull();
    expect(liveSeconds(restored.session, T0 + 90_000)).toBe(90);
  });

  it("flags a steep abandoned for hours instead of silently recording it", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    const restored = restoreSession(parseSession(serializeSession(s))!, T0 + LONG_GAP_MS + 60_000);
    expect(restored.warning).toBe("long-gap");
    expect(restored.session.state).toBe("paused");
  });

  it("flags a clock that jumped backwards", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    // NTP correction / manual change: the clock now reads earlier than the save
    const restored = restoreSession(parseSession(serializeSession(s))!, T0 - 60_000);
    expect(restored.warning).toBe("clock-skew");
    expect(restored.session.state).toBe("paused");
  });

  it("does not pretend to detect a forwards clock jump (indistinguishable from real time)", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    const restored = restoreSession(parseSession(serializeSession(s))!, T0 + 5 * 60_000);
    expect(restored.warning).toBeNull();
    expect(liveSeconds(restored.session, T0 + 5 * 60_000)).toBe(300);
  });

  it("reports no warning when nothing is running", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    s = finishSteep(s, T0 + 30_000);
    expect(restoreSession(s, T0 + 10 * 3600_000).warning).toBeNull();
  });

  it("caps an abandoned steep to a sane length", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    const capped = capSteep(s, 20 * 60, T0 + LONG_GAP_MS);
    expect(liveSeconds(capped, T0 + LONG_GAP_MS)).toBe(1200);
  });

  it("discards the abandoned steep but keeps finished ones", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    s = finishSteep(s, T0 + 30_000);
    s = startSteep(s, T0 + 40_000);
    const discarded = discardCurrentSteep(s, T0 + LONG_GAP_MS);
    expect(discarded.steeps).toHaveLength(1);
    expect(discarded.state).toBe("idle");
  });
});

describe("persistence is defensive", () => {
  it("returns null for empty, junk or half-written blobs", () => {
    expect(parseSession(null)).toBeNull();
    expect(parseSession("")).toBeNull();
    expect(parseSession("not json")).toBeNull();
    expect(parseSession('{"id":"x"')).toBeNull();
    expect(parseSession('{"id":"x","slug":"y","steeps":"nope"}')).toBeNull();
  });

  it("drops malformed steep entries instead of crashing", () => {
    const raw = JSON.stringify({
      id: "s",
      slug: "genmaicha",
      startedAt: T0,
      state: "running",
      lastSeen: T0,
      steeps: [{ index: 1, startedAt: T0 }, { index: 2, startedAt: "bogus" }, null],
    });
    const s = parseSession(raw);
    expect(s).not.toBeNull();
    expect(s!.steeps).toHaveLength(1);
  });

  it("falls back to a sane state for unknown enum values", () => {
    const raw = JSON.stringify({ id: "s", slug: "g", steeps: [], state: "wat" });
    expect(parseSession(raw)!.state).toBe("idle");
  });
});
