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

export type SteepState = "idle" | "armed" | "running" | "paused" | "ended";

export interface Steep {
  index: number;
  /**
   * epoch ms. On an ARMED steep this is a placeholder and must not be read as a
   * start time — the clock only begins when the user presses Start.
   */
  startedAt: number;
  /** epoch ms; present once Done was pressed */
  endedAt?: number;
}

export interface BrewSession {
  id: string;
  slug: string;
  /**
   * Base steep time in seconds, copied from the tea when the session started. The
   * session must be able to finish its job if the tea is renamed, merged or deleted
   * mid-steep — the dial reads this, not the library.
   */
  baseSeconds?: number | null;
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
/**
 * The longest pause we will credit back to the clock. Beyond it the app may simply
 * have been closed, and subtracting that time would silently shorten a real steep.
 */
export const PAUSE_GAP_CAP_MS = 2 * 60 * 1000;

export function newSession(slug: string, now: number, id?: string, baseSeconds?: number | null): BrewSession {
  return {
    id: id ?? makeId(),
    slug,
    baseSeconds: baseSeconds ?? null,
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

/**
 * Put the next steep on the dial WITHOUT starting its clock.
 *
 * Brewing is the user's action, not the app's: tapping "Brew this" or "Steep 3"
 * readies the timer and leaves the actual start to a deliberate press. The armed
 * steep is already in the list so the dial can draw the upcoming lap, but nothing
 * is ticking and no time is being recorded.
 */
export function armSteep(session: BrewSession, now: number): BrewSession {
  const steeps = [...session.steeps];
  const last = steeps[steeps.length - 1];
  if (!last || last.endedAt !== undefined) {
    steeps.push({ index: steeps.length + 1, startedAt: now });
  }
  return { ...session, steeps, state: "armed", lastSeen: now };
}

/** Start the next steep (or resume the current one), stamping the heartbeat. */
export function startSteep(session: BrewSession, now: number): BrewSession {
  const steeps = [...session.steeps];
  const last = steeps[steeps.length - 1];
  // Already ticking? Then this is not a start — a caller that thinks "make sure it is
  // running" must not silently reset a nine-hour steep back to zero.
  if (last && last.endedAt === undefined && session.state === "running") {
    return { ...session, lastSeen: now };
  }
  if (!last || last.endedAt !== undefined) {
    steeps.push({ index: steeps.length + 1, startedAt: now });
  } else if (session.state === "paused") {
    // Resume: shift startedAt forward by the paused duration so the elapsed
    // time does not include the pause — but only the time actually spent paused.
    // A pause that outlived the tab is capped by PAUSE_GAP_CAP_MS: beyond that we
    // cannot tell a pause from a closed app, and crediting hours of "pause" would
    // erase genuine steeping time.
    const pausedFor = Math.min(Math.max(0, now - session.lastSeen), PAUSE_GAP_CAP_MS);
    steeps[steeps.length - 1] = { ...last, startedAt: last.startedAt + pausedFor };
  } else if (session.state === "armed") {
    // First press of Start: the clock begins now, not when the steep was armed.
    steeps[steeps.length - 1] = { ...last, startedAt: now };
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

/** Seconds elapsed in a steep; 0 when it has not started yet. */
export function steepSeconds(steep: Steep | undefined, now: number): number {
  if (!steep) return 0;
  // an armed steep has a placeholder startedAt and nothing has ticked
  if (steep.endedAt === undefined && steep.startedAt > now) return 0;
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
  if (session.state === "armed") return 0;
  return steepSeconds(steep, now);
}

export function completedSteeps(session: BrewSession): Steep[] {
  return session.steeps.filter((s) => s.endedAt !== undefined);
}

export function sessionTotalSeconds(session: BrewSession, now: number): number {
  return session.steeps.reduce((sum, s) => sum + steepSeconds(s, now), 0);
}

// ── recommended times ──────────────────────────────────────────────────────
//
// A gongfu session lengthens each steep: the leaf has given up its easy
// aromatics and needs a little longer to yield the same cup. Fifteen seconds per
// steep is the working rule.

/** Extra time each steep gains over the one before it. */
export const STEEP_STEP_S = 15;

/**
 * The recommended length of `index` (1-based). Falls back to 30 s when the tea
 * carries no time of its own, so the ring always has something to fill against.
 */
export function recommendedSeconds(baseSeconds: number | null | undefined, index: number): number {
  const base = baseSeconds && baseSeconds > 0 ? baseSeconds : 30;
  return Math.max(5, base + STEEP_STEP_S * Math.max(0, index - 1));
}

/** How many steep steps the tea suggests, at least one. */
export function plannedSteeps(tea: { brewing_num_brews?: number | null }): number {
  const n = tea.brewing_num_brews ?? 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
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

/**
 * Where a session began, said the way a person would.
 *
 * A session can be left between steeps and picked up the next morning — the leaf does
 * not care, but the drinker should know whether they are continuing last night's cup
 * or this afternoon's.
 */
export function sessionOrigin(startedAt: number, now: number): string {
  const start = new Date(startedAt);
  const today = new Date(now);
  const hm = `${start.getHours()}:${String(start.getMinutes()).padStart(2, "0")}`;
  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(today) - midnight(start)) / 86_400_000);
  if (days <= 0) return `started today at ${hm}`;
  if (days === 1) return `started yesterday at ${hm}`;
  if (days < 7) return `started ${days} days ago`;
  return `started ${start.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
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
      baseSeconds: typeof v.baseSeconds === "number" ? v.baseSeconds : null,
      startedAt: typeof v.startedAt === "number" ? v.startedAt : Date.now(),
      steeps,
      state: (["idle", "armed", "running", "paused", "ended"] as SteepState[]).includes(v.state)
        ? v.state
        : "idle",
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
): { session: BrewSession; warning: RestoreWarning | null; gapMs: number } {
  const steep = currentSteep(session);
  if (!steep) return { session, warning: null, gapMs: 0 };
  // how much of this steep happened while the app was not open
  const unseenMs = Math.max(0, now - session.lastSeen);

  // A clock that ran BACKWARDS is detectable and always wrong. A clock that
  // ran forwards while the app was closed is indistinguishable from real
  // elapsed time — that case is handled honestly by the long-gap guard.
  if (session.state === "armed") return { session, warning: null, gapMs: 0 };
  if (now < session.lastSeen || now < steep.startedAt) {
    return { session: { ...session, state: "paused" }, warning: "clock-skew", gapMs: 0 };
  }
  if (session.state !== "running" && session.state !== "paused") {
    return { session, warning: null, gapMs: 0 };
  }

  if (session.state === "running" && now - steep.startedAt > LONG_GAP_MS) {
    return { session: { ...session, state: "paused" }, warning: "long-gap", gapMs: unseenMs };
  }
  return { session, warning: null, gapMs: unseenMs };
}

/**
 * Was this steep already on its way when the app closed?
 *
 * An overnight brew is a real thing: a tea goes in at eleven and the phone is asleep
 * by the time anyone looks. The elapsed time is genuine, so it is kept — but the time
 * the app could not watch is returned separately, because "you have been steeping for
 * nine hours" and "we watched all nine hours" are not the same claim.
 */
export function unseenSeconds(session: BrewSession, now: number): number {
  return Math.max(0, Math.round((now - session.lastSeen) / 1000));
}

/** True when the current steep started before the app last checked in. */
export function steepPredatesResume(session: BrewSession): boolean {
  const steep = currentSteep(session);
  return !!steep && steep.startedAt < session.lastSeen;
}

/** Long-gap resolutions offered to the user. */
export function capSteep(session: BrewSession, seconds: number, now: number): BrewSession {
  const steeps = [...session.steeps];
  const last = steeps[steeps.length - 1];
  if (!last || last.endedAt !== undefined) return { ...session, lastSeen: now };
  steeps[steeps.length - 1] = { ...last, startedAt: now - seconds * 1000 };
  return { ...session, steeps, lastSeen: now };
}

/**
 * Drop the current unfinished (or armed) steep entirely, keeping the finished ones.
 *
 * This is the one-tap escape from "I started this by mistake": at any point in the
 * session the user can throw away the steep in progress without being pushed back
 * to the tea picker and without losing the steeps already recorded.
 */
export function discardCurrentSteep(session: BrewSession, now: number): BrewSession {
  const steeps = session.steeps.filter((s) => s.endedAt !== undefined);
  return { ...session, steeps, state: "idle", lastSeen: now };
}
