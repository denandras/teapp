/**
 * Brew session state: a stopwatch per steep, persisted so a refresh, a dead
 * connection or a sleeping phone cannot lose or corrupt the time.
 *
 * The rule that makes this safe: the session stores timestamps, never a
 * counter. Elapsed time is always derived from an epoch value, so throttled
 * tabs, dropped frames and suspended laptops self-correct for free.
 *
 * Pure functions only — the component owns rendering and storage.
 */

export type SteepState = "idle" | "running" | "paused" | "ended";

export interface Steep {
  index: number;
  /** epoch ms */
  startedAt: number;
  /** epoch ms; present once Done was pressed */
  endedAt?: number;
}

export interface BrewSession {
  id: string;
  slug: string;
  startedAt: number;
  steeps: Steep[];
  state: SteepState;
  /** heartbeat written on every transition — lets a restore spot a jumped clock */
  lastSeen: number;
}

export type RestoreWarning = "long-gap" | "clock-skew";

/** A steep that has been running longer than this is treated as abandoned. */
export const LONG_GAP_MS = 2 * 60 * 60 * 1000;
/** Tolerance for second-granularity clock jitter on restore. */
export const SKEW_TOLERANCE_MS = 60 * 1000;

export function newSession(slug: string, now: number, id?: string): BrewSession {
  return {
    id: id ?? makeId(),
    slug,
    startedAt: now,
    steeps: [],
    state: "idle",
    lastSeen: now,
  };
}

export function makeId(): string {
  // crypto.randomUUID exists in browsers and node 19+; fall back for safety.
  const c = typeof globalThis !== "undefined" ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

/** Start the next steep (or resume the current one), stamping the heartbeat. */
export function startSteep(session: BrewSession, now: number): BrewSession {
  const steeps = [...session.steeps];
  const last = steeps[steeps.length - 1];
  if (!last || last.endedAt !== undefined) {
    steeps.push({ index: steeps.length + 1, startedAt: now });
  } else if (session.state === "paused") {
    // Resume: shift startedAt forward by the paused duration so the elapsed
    // time does not include the pause.
    const pausedFor = now - session.lastSeen;
    steeps[steeps.length - 1] = { ...last, startedAt: last.startedAt + Math.max(0, pausedFor) };
  }
  return { ...session, steeps, state: "running", lastSeen: now };
}

/** Pause the running steep without ending it. */
export function pauseSteep(session: BrewSession, now: number): BrewSession {
  if (session.state !== "running") return { ...session, lastSeen: now };
  return { ...session, state: "paused", lastSeen: now };
}

/** Close the current steep and return the session in a "between steeps" state. */
export function finishSteep(session: BrewSession, now: number): BrewSession {
  const steeps = [...session.steeps];
  const last = steeps[steeps.length - 1];
  if (!last || last.endedAt !== undefined) {
    return { ...session, state: "idle", lastSeen: now };
  }
  steeps[steeps.length - 1] = { ...last, endedAt: now };
  return { ...session, steeps, state: "idle", lastSeen: now };
}

export function endSession(session: BrewSession, now: number): BrewSession {
  const finished = session.steeps.length && session.steeps[session.steeps.length - 1].endedAt === undefined
    ? finishSteep(session, now)
    : session;
  return { ...finished, state: "ended", lastSeen: now };
}

/** Reset the current (unfinished) steep back to zero. */
export function resetCurrentSteep(session: BrewSession, now: number): BrewSession {
  const steeps = [...session.steeps];
  const last = steeps[steeps.length - 1];
  if (last && last.endedAt === undefined) {
    steeps[steeps.length - 1] = { ...last, startedAt: now };
  }
  return { ...session, steeps, state: "running", lastSeen: now };
}

/** Seconds elapsed in a steep; 0 when it has not started. */
export function steepSeconds(steep: Steep | undefined, now: number): number {
  if (!steep) return 0;
  const end = steep.endedAt ?? now;
  return Math.max(0, Math.round((end - steep.startedAt) / 1000));
}

export function currentSteep(session: BrewSession): Steep | undefined {
  const last = session.steeps[session.steeps.length - 1];
  return last && last.endedAt === undefined ? last : undefined;
}

/** Live clock for the centre of the dial. */
export function liveSeconds(session: BrewSession, now: number): number {
  const steep = currentSteep(session);
  if (!steep) return 0;
  return steepSeconds(steep, now);
}

export function completedSteeps(session: BrewSession): Steep[] {
  return session.steeps.filter((s) => s.endedAt !== undefined);
}

export function sessionTotalSeconds(session: BrewSession, now: number): number {
  return session.steeps.reduce((sum, s) => sum + steepSeconds(s, now), 0);
}

/** The payload the log row needs — one row per session. */
export function sessionPayload(session: BrewSession, now: number): {
  brews: number;
  duration_s: number;
  steep_s: number[];
} {
  const done = session.steeps.filter((s) => s.endedAt !== undefined);
  const steep_s = done.map((s) => steepSeconds(s, now));
  return {
    brews: done.length,
    duration_s: steep_s.reduce((a, b) => a + b, 0),
    steep_s,
  };
}

/** m:ss up to an hour, then h:mm:ss. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const two = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${two(m)}:${two(sec)}` : `${m}:${two(sec)}`;
}

// ── persistence ────────────────────────────────────────────────────────────

export const SESSION_STORAGE_KEY = "teapp-brew-session";

export function serializeSession(session: BrewSession): string {
  return JSON.stringify(session);
}

/** Parse defensively: a half-written or old blob must never break the page. */
export function parseSession(raw: string | null): BrewSession | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (!v || typeof v !== "object") return null;
    if (typeof v.id !== "string" || typeof v.slug !== "string") return null;
    if (!Array.isArray(v.steeps)) return null;
    const steeps: Steep[] = v.steeps
      .filter((s: unknown): s is Steep => !!s && typeof (s as Steep).startedAt === "number")
      .map((s: Steep, i: number) => ({
        index: typeof s.index === "number" ? s.index : i + 1,
        startedAt: s.startedAt,
        endedAt: typeof s.endedAt === "number" ? s.endedAt : undefined,
      }));
    return {
      id: v.id,
      slug: v.slug,
      startedAt: typeof v.startedAt === "number" ? v.startedAt : Date.now(),
      steeps,
      state: (["idle", "running", "paused", "ended"] as SteepState[]).includes(v.state) ? v.state : "idle",
      lastSeen: typeof v.lastSeen === "number" ? v.lastSeen : Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Rehydrate after a refresh and say what looks wrong, rather than silently
 * continuing with a number nobody can trust.
 */
export function restoreSession(
  session: BrewSession,
  now: number
): { session: BrewSession; warning: RestoreWarning | null } {
  const steep = currentSteep(session);
  if (!steep) return { session, warning: null };

  // A clock that ran BACKWARDS is detectable and always wrong. A clock that
  // ran forwards while the app was closed is indistinguishable from real
  // elapsed time — that case is handled honestly by the long-gap guard.
  if (now < session.lastSeen || now < steep.startedAt) {
    return { session: { ...session, state: "paused" }, warning: "clock-skew" };
  }
  if (session.state !== "running" && session.state !== "paused") {
    return { session, warning: null };
  }
  if (session.state === "running" && now - steep.startedAt > LONG_GAP_MS) {
    return { session: { ...session, state: "paused" }, warning: "long-gap" };
  }
  return { session, warning: null };
}

/** Long-gap resolutions offered to the user. */
export function capSteep(session: BrewSession, seconds: number, now: number): BrewSession {
  const steeps = [...session.steeps];
  const last = steeps[steeps.length - 1];
  if (!last || last.endedAt !== undefined) return { ...session, lastSeen: now };
  steeps[steeps.length - 1] = { ...last, startedAt: now - seconds * 1000 };
  return { ...session, steeps, lastSeen: now };
}

/** Drop the current unfinished steep entirely. */
export function discardCurrentSteep(session: BrewSession, now: number): BrewSession {
  const steeps = session.steeps.filter((s) => s.endedAt !== undefined);
  return { ...session, steeps, state: "idle", lastSeen: now };
}
