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
  unseenSeconds,
  steepPredatesResume,
  LONG_GAP_MS,
} from "@/lib/brew/session";

const T0 = 1_700_000_000_000;

describe("arming and starting are not the same act", () => {
  it("does not restart a steep that is already running", () => {
    let s = newSession("sencha", T0, undefined, 120);
    s = startSteep(s, T0);
    // nine hours later something calls startSteep believing it is a fresh start
    const later = startSteep(s, T0 + 9 * 60 * 60 * 1000);
    expect(later.steeps).toHaveLength(1);
    expect(later.steeps[0].startedAt).toBe(T0);
    expect(liveSeconds(later, T0 + 9 * 60 * 60 * 1000)).toBe(9 * 60 * 60);
  });

  it("keeps the real elapsed time when a run resumes after an overnight gap", () => {
    // nine hours on the clock, app closed the whole time: choosing to keep it must
    // leave nine hours on the clock, not restart it
    let s = startSteep(newSession("sencha", T0, undefined, 120), T0);
    const nine = 9 * 60 * 60 * 1000;
    s = { ...s, lastSeen: T0 }; // last seen when it started
    const resumed = startSteep(s, T0 + nine);
    expect(resumed.steeps).toHaveLength(1);
    expect(resumed.steeps[0].startedAt).toBe(T0);
    expect(liveSeconds(resumed, T0 + nine)).toBe(9 * 60 * 60);
  });

  it("still resumes a paused steep and still adds a genuinely new one", () => {
    let s = startSteep(newSession("sencha", T0, undefined, 120), T0);
    s = pauseSteep(s, T0 + 30_000);
    s = startSteep(s, T0 + 90_000); // 60 s of pause removed
    expect(liveSeconds(s, T0 + 120_000)).toBe(60);
    const next = startSteep(finishSteep(s, T0 + 120_000), T0 + 200_000);
    expect(next.steeps).toHaveLength(2);
  });
});

describe("a session outliving its tea", () => {
  it("carries its own steep time, so it still works when the tea is gone", () => {
    const s = newSession("sencha", T0, undefined, 120);
    expect(s.baseSeconds).toBe(120);
    expect(parseSession(serializeSession(s))?.baseSeconds).toBe(120);
  });

  it("survives a round trip with no stored base time", () => {
    const s = newSession("sencha", T0);
    expect(s.baseSeconds).toBeNull();
    expect(parseSession(serializeSession(s))?.baseSeconds).toBeNull();
  });

  it("keeps its slug through storage, so a renamed tea can be matched by cup", () => {
    let s = newSession("sencha", T0, undefined, 120);
    s = startSteep(s, T0);
    expect(parseSession(serializeSession(s))?.slug).toBe("sencha");
  });
});

describe("a steep that spans the night", () => {
  it("reports how long the app was closed instead of inventing a limit", () => {
    let s = newSession("sencha", T0, undefined, 120);
    s = startSteep(s, T0);
    const morning = T0 + 9 * 60 * 60 * 1000; // nine hours later
    const res = restoreSession(s, morning);
    expect(res.warning).toBe("long-gap");
    expect(res.gapMs).toBe(9 * 60 * 60 * 1000);
    // the elapsed time is genuine and is NOT truncated by the restore
    expect(res.session.steeps[0].endedAt).toBeUndefined();
  });

  it("measures unseen time from the last heartbeat, not from the steep's start", () => {
    let s = newSession("sencha", T0, undefined, 120);
    s = startSteep(s, T0);
    // five minutes of watching, then the phone sleeps for an hour
    s = { ...s, lastSeen: T0 + 5 * 60 * 1000 };
    const now = T0 + 65 * 60 * 1000;
    expect(unseenSeconds(s, now)).toBe(60 * 60);
  });

  it("treats a steep started before the last check-in as resumed, not new", () => {
    // started at T0, app last seen two minutes later: the steep predates the resume
    let s = newSession("sencha", T0, undefined, 120);
    s = startSteep(s, T0);
    expect(steepPredatesResume({ ...s, lastSeen: T0 + 120_000 })).toBe(true);
    // finishing steep 1 and starting steep 2 makes the new steep a fresh one
    const done = finishSteep({ ...s, lastSeen: T0 + 120_000 }, T0 + 120_000);
    const fresh = startSteep(done, T0 + 130_000);
    expect(fresh.steeps[fresh.steeps.length - 1].startedAt).toBe(T0 + 130_000);
    expect(steepPredatesResume(fresh)).toBe(false);
  });
});

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

  it("does NOT start the next steep automatically — you drink first", () => {
    let s = newSession("genmaicha", T0);
    s = startSteep(s, T0);
    s = finishSteep(s, T0 + 45_000);
    // Walk away for ten minutes between steep 2 and drinking the tea.
    expect(liveSeconds(s, T0 + 10 * 60_000)).toBe(0);
    expect(s.state).toBe("idle");
    expect(s.steeps).toHaveLength(1);
    // Only an explicit press starts the next one, and it starts at NOW.
    s = startSteep(s, T0 + 10 * 60_000);
    expect(s.steeps).toHaveLength(2);
    expect(s.steeps[1].startedAt).toBe(T0 + 10 * 60_000);
    expect(liveSeconds(s, T0 + 10 * 60_000)).toBe(0);
  });

  it("keeps the done steep's time fixed while the session sits idle", () => {
    let s = newSession("t", T0);
    s = startSteep(s, T0);
    s = finishSteep(s, T0 + 40_000);
    const later = T0 + 3600_000;
    expect(steepSeconds(s.steeps[0], later)).toBe(40);
    expect(sessionPayload(s, later).steep_s).toEqual([40]);
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
