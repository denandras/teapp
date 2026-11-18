"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, Pause, Play, RotateCcw, Search, Trash2, X } from "lucide-react";
import { TEA_TYPE_COLORS, TEA_TYPE_LABELS, type Tea, type TeaLog } from "@/lib/types";
import { useTeaStore } from "@/lib/store";
import {
  SESSION_STORAGE_KEY,
  armSteep,
  capSteep,
  currentSteep,
  discardCurrentSteep,
  endSession,
  finishSteep,
  formatClock,
  liveSeconds,
  newSession,
  parseSession,
  pauseSteep,
  resetCurrentSteep,
  restoreSession,
  serializeSession,
  sessionPayload,
  startSteep,
  type BrewSession,
} from "@/lib/brew/session";
import { dueSeconds } from "@/lib/brew/steepwheel";
import SteepDial from "@/components/experience/SteepDial";
import BrewLogSheet from "@/components/experience/BrewLogSheet";

type Stage = "types" | "teas" | "card" | "steeps" | "log";

/**
 * The Brew page.
 *
 * Pick a type, pick a tea, then steep it. Two plain lists, colour-coded: the type's
 * colour appears on its category row and is carried through to every tea beneath it.
 *
 * The timer never starts by itself. Brewing readies the dial (state "armed"); the
 * clock begins on a deliberate press of Start, because a person — not an app —
 * decides when the water goes in.
 */
export default function BrewPage() {
  const allTeas = useTeaStore((s) => s.allTeas);
  const teaStates = useTeaStore((s) => s.teaStates);
  const teaLogs = useTeaStore((s) => s.teaLogs);
  const addTeaLog = useTeaStore((s) => s.addTeaLog);
  const flushBrewOutbox = useTeaStore((s) => s.flushBrewOutbox);

  const [stage, setStage] = useState<Stage>("types");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");

  const [session, setSession] = useState<BrewSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [restore, setRestore] = useState<{ session: BrewSession; warning: "long-gap" | "clock-skew" } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const hydrated = useRef(false);

  const teaBySlug = useMemo(() => {
    const m = new Map<string, Tea>();
    for (const t of allTeas) m.set(t.slug, t);
    return m;
  }, [allTeas]);

  const pool = useMemo(
    () => (showAll ? allTeas : allTeas.filter((t) => teaStates[t.slug] === "have")),
    [allTeas, teaStates, showAll]
  );

  /** The types that actually hold teas right now, A to Z by their label. */
  const types = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of pool) {
      if (!t.tea_type) continue;
      counts[t.tea_type] = (counts[t.tea_type] ?? 0) + 1;
    }
    return Object.keys(counts)
      .sort((a, b) => (TEA_TYPE_LABELS[a] ?? a).localeCompare(TEA_TYPE_LABELS[b] ?? b))
      .map((k) => ({ key: k, label: TEA_TYPE_LABELS[k] ?? k, count: counts[k] }));
  }, [pool]);

  /** The chosen type's teas, A to Z. */
  const typeTeas = useMemo(() => {
    if (!activeType) return [];
    const list = pool.filter((t) => t.tea_type === activeType);
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            (t.original_name ?? "").toLowerCase().includes(q) ||
            (t.origin ?? "").toLowerCase().includes(q)
        )
      : list;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [pool, activeType, query]);

  const typeColor = activeType ? TEA_TYPE_COLORS[activeType] ?? "var(--accent)" : "var(--accent)";

  // ── clock ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session || session.state !== "running") return;
    let raf = 0;
    const loop = () => {
      const t = Date.now();
      setNow((prev) => (t - prev >= 500 ? t : prev));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [session]);

  // ── persistence ─────────────────────────────────────────────────────────
  const persist = useCallback((s: BrewSession | null) => {
    try {
      if (!s) localStorage.removeItem(SESSION_STORAGE_KEY);
      else localStorage.setItem(SESSION_STORAGE_KEY, serializeSession(s));
    } catch {
      /* storage disabled — the in-memory session still works */
    }
  }, []);

  const adopt = useCallback(
    (s: BrewSession) => {
      setSession(s);
      persist(s);
      const tea = teaBySlug.get(s.slug);
      if (tea) setSelectedTea(tea);
      setActiveType(tea?.tea_type ?? null);
      setStage("steeps");
    },
    [persist, teaBySlug]
  );

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(SESSION_STORAGE_KEY);
    } catch {
      return;
    }
    if (!raw) return;
    const parsed = parseSession(raw);
    if (!parsed) return;
    const res = restoreSession(parsed, Date.now());
    if (res.warning) setRestore({ session: res.session, warning: res.warning });
    else adopt(res.session);
    flushBrewOutbox().catch(() => {});
  }, [adopt, flushBrewOutbox]);

  useEffect(() => {
    if (!hydrated.current) return;
    persist(session);
  }, [session, persist]);

  /**
   * The tea on screen. On a cold reload the session restores from localStorage before
   * the tea library has finished loading, so the stored `selectedTea` can be null for
   * a moment. Deriving it from the session's slug means the tea — and therefore its
   * steep time — is picked up the instant the library lands.
   */
  const activeTea: Tea | null = selectedTea ?? (session ? teaBySlug.get(session.slug) ?? null : null);

  const live = session ? currentSteep(session) : null;
  const mode: "armed" | "running" | "paused" | "done" =
    session?.state === "armed"
      ? "armed"
      : session?.state === "running"
      ? "running"
      : session?.state === "paused"
      ? "paused"
      : "done";
  const liveSecs = session ? liveSeconds(session, now) : 0;
  const baseSecs = activeTea?.brewing_time_min ? Math.round(activeTea.brewing_time_min * 60) : null;
  const doneCount = session?.steeps.filter((s) => s.endedAt !== undefined).length ?? 0;
  const steepNo = live?.index ?? doneCount + 1;
  const dueNow = dueSeconds(baseSecs, steepNo);

  /** Ready the next steep — the clock stays stopped until Start. */
  const arm = (tea: Tea, existing: BrewSession | null) => {
    const s = armSteep(existing ?? newSession(tea.slug, Date.now()), Date.now());
    setSession(s);
    setSelectedTea(tea);
    setStage("steeps");
  };

  const onStart = () => session && setSession(startSteep(session, Date.now()));
  const onDone = () => {
    if (!session) return;
    const t = Date.now();
    setSession(finishSteep(session, t));
    setNow(t);
  };
  const onPause = () => session && setSession(pauseSteep(session, Date.now()));
  const onReset = () => session && setSession(resetCurrentSteep(session, Date.now()));

  /**
   * The one way out of a running session.
   *
   * While a steep is on the dial this drops that steep and keeps the ones already
   * recorded. Between steeps there is nothing to drop, so it ends the whole run
   * instead — a button must always do what its label says.
   */
  const onDiscard = () => {
    if (!session) return;
    const unfinished = session.steeps.some((s) => s.endedAt === undefined);
    if (unfinished) {
      const next = discardCurrentSteep(session, Date.now());
      if (next.steeps.length > 0) {
        setSession(next);
        return;
      }
    }
    persist(null);
    setSession(null);
    setSelectedTea(null);
    setQuery("");
    setStage(activeTea?.tea_type ? "teas" : "types");
  };

  const toLog = () => {
    if (!session) return;
    setSession(endSession(session, Date.now()));
    setStage("log");
  };

  const saveLog = async (rating: number, note: string) => {
    if (!session || !activeTea) return;
    setSaving(true);
    const payload = sessionPayload(session, Date.now());
    const ok = await addTeaLog(activeTea.slug, rating, note, {
      brews: payload.brews,
      duration_s: payload.duration_s,
      steep_s: payload.steep_s,
    });
    setSaving(false);
    if (!ok) {
      setSavedLocally(true);
      return;
    }
    // brewing a tea puts it in the collection — that is what "have" means here
    if (teaStates[activeTea.slug] === undefined) {
      useTeaStore.getState().setTeaStatus?.(activeTea.slug, "have");
    }
    persist(null);
    setSession(null);
    setSelectedTea(null);
    setStage("types");
  };

  const previousLogs = useMemo(
    () => (activeTea ? (teaLogs[activeTea.slug] ?? []).slice(0, 6) : []),
    [teaLogs, activeTea]
  );

  /**
   * Back exists only while choosing a tea. Once a steep is on the dial the header's
   * back button disappears: leaving a running session should be a deliberate act —
   * discarding the steep — not the same gesture you use to browse.
   */
  const inSession = stage === "steeps" || stage === "log";
  const canGoBack = stage !== "types" && !inSession;

  const back = () => {
    if (stage === "card") return setStage("teas");
    setActiveType(null);
    setQuery("");
    setStage("types");
  };

  const heading =
    stage === "steeps" || stage === "log"
      ? activeTea?.name
      : stage === "teas"
      ? TEA_TYPE_LABELS[activeType ?? ""] ?? activeType
      : "Brew";

  return (
    <main className="mx-auto w-full max-w-[680px] px-5 sm:px-8 pb-32">
      {/* ── header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 pt-6 pb-2">
        <div className="flex items-center gap-3 min-w-0">
          {canGoBack && (
            <button
              onClick={back}
              aria-label="Back"
              className="grid place-items-center w-9 h-9 rounded-full shrink-0"
              style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
            >
              <ChevronLeft size={17} />
            </button>
          )}
          <h1 className="font-serif text-[22px] leading-tight truncate">{heading}</h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {(stage === "types" || stage === "teas") && (
            <button
              onClick={() => {
                setShowAll((v) => !v);
                setQuery("");
              }}
              aria-pressed={showAll}
              className="flex items-center gap-2.5 h-9 pl-3 pr-3.5 rounded-full text-[12px]"
              style={{
                border: "1px solid var(--border)",
                color: showAll ? "var(--accent)" : "var(--muted)",
              }}
            >
              <span
                aria-hidden
                className="relative inline-block rounded-full transition-colors"
                style={{
                  width: 30,
                  height: 16,
                  backgroundColor: showAll ? "var(--accent)" : "var(--border)",
                }}
              >
                <span
                  className="absolute rounded-full transition-all"
                  style={{
                    width: 12,
                    height: 12,
                    top: 2,
                    left: showAll ? 16 : 2,
                    backgroundColor: showAll ? "var(--bg)" : "var(--muted)",
                  }}
                />
              </span>
              All teas
            </button>
          )}
          <Link
            href="/"
            aria-label="Leave the brew page"
            className="grid place-items-center w-9 h-9 rounded-full"
            style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
          >
            <X size={17} />
          </Link>
        </div>
      </header>

      {/* ── restore prompt ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {restore && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border p-5 mt-3"
            style={{ borderColor: "var(--accent)", backgroundColor: "var(--card)" }}
          >
            <p className="text-[15px] leading-relaxed">
              {restore.warning === "long-gap"
                ? `A steep of ${teaBySlug.get(restore.session.slug)?.name ?? "this tea"} has been running since you closed the app.`
                : "The device clock moved while this steep was open."}
            </p>
            <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>
              {restore.warning === "long-gap"
                ? "Tea does not keep steeping while you sleep. Choose what to record."
                : "Nothing is trusted from that gap — resume when you are ready."}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => {
                  adopt(restore.session);
                  setRestore(null);
                }}
                className="px-4 h-10 rounded-full text-[13px] font-medium"
                style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
              >
                Keep as it is
              </button>
              {restore.warning === "long-gap" && (
                <button
                  onClick={() => {
                    adopt(capSteep(restore.session, 20 * 60, Date.now()));
                    setRestore(null);
                  }}
                  className="px-4 h-10 rounded-full text-[13px] border"
                  style={{ borderColor: "var(--border)" }}
                >
                  Cap at 20:00
                </button>
              )}
              <button
                onClick={() => {
                  const d = discardCurrentSteep(restore.session, Date.now());
                  if (d.steeps.length === 0) {
                    persist(null);
                    setRestore(null);
                  } else {
                    adopt(d);
                    setRestore(null);
                  }
                }}
                className="px-4 h-10 rounded-full text-[13px] border"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                Discard that steep
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── body ───────────────────────────────────────────────────────── */}
      <div className="mt-4">
        {stage === "card" && activeTea ? (
          <TeaCard
            tea={activeTea}
            previous={previousLogs}
            onBrew={() => arm(activeTea, null)}
            onBack={() => setStage("teas")}
          />
        ) : stage === "steeps" && session ? (
          <div className="pt-1">
            <SteepDial
              seconds={liveSecs}
              target={baseSecs ?? 30}
              due={dueNow}
              mode={mode}
              steepNumber={steepNo}
              note={activeTea?.brewing_temp_c ? `${activeTea.brewing_temp_c} °C` : undefined}
            />

            {/* done steeps, as a quiet record under the dial */}
            {doneCount > 0 && (
              <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
                {session.steeps
                  .filter((s) => s.endedAt !== undefined)
                  .map((s) => (
                    <span
                      key={s.index}
                      className="px-3 h-8 inline-flex items-center rounded-full text-[12px] tabular-nums"
                      style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                    >
                      {s.index} · {formatClock(Math.round((s.endedAt! - s.startedAt) / 1000))}
                    </span>
                  ))}
              </div>
            )}
          </div>
        ) : stage === "log" ? null : stage === "types" ? (
          types.length === 0 ? (
            <div
              className="rounded-2xl border p-8 text-center mt-6"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
            >
              <p className="font-serif text-xl">Nothing to brew yet</p>
              <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>
                {showAll
                  ? "No teas are loaded yet — the library is still syncing."
                  : "Your collection is empty. Mark teas as owned, or browse the whole library."}
              </p>
              {!showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="mt-5 px-5 h-11 rounded-full text-[14px] font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
                >
                  Show all teas
                </button>
              )}
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {types.map((t) => (
                <li key={t.key}>
                  <button
                    onClick={() => {
                      setActiveType(t.key);
                      setQuery("");
                      setStage("teas");
                    }}
                    className="w-full flex items-center gap-4 px-4 h-[62px] rounded-2xl text-left"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <span
                      aria-hidden
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: TEA_TYPE_COLORS[t.key] ?? "var(--accent)" }}
                    />
                    <span className="flex-1 min-w-0 text-[15px]">{t.label}</span>
                    <span
                      className="text-[13px] tabular-nums px-2.5 h-7 inline-flex items-center rounded-full"
                      style={{ color: "var(--muted)", backgroundColor: "var(--bg)" }}
                    >
                      {t.count}
                    </span>
                    <ChevronLeft
                      size={17}
                      style={{ transform: "rotate(180deg)", color: "var(--muted)", flexShrink: 0 }}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <>
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--muted)" }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${TEA_TYPE_LABELS[activeType ?? ""] ?? "teas"}`}
                aria-label="Search teas in this type"
                className="w-full h-12 rounded-2xl pl-11 pr-4 text-[15px] outline-none"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />
            </div>

            {typeTeas.length === 0 ? (
              <p className="text-[14px] py-12 text-center" style={{ color: "var(--muted)" }}>
                No tea matches “{query}”.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {typeTeas.map((t) => (
                  <li key={t.slug}>
                    <button
                      onClick={() => {
                        setSelectedTea(t);
                        setStage("card");
                      }}
                      className="w-full flex items-stretch gap-4 px-4 py-3.5 rounded-2xl text-left"
                      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                    >
                      {/* the type's colour, carried down from the category row */}
                      <span
                        aria-hidden
                        className="w-1 rounded-full shrink-0"
                        style={{ backgroundColor: typeColor }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] leading-snug truncate">{t.name}</span>
                        {(t.original_name || t.origin) && (
                          <span
                            className="block text-[12.5px] leading-snug mt-0.5 truncate"
                            style={{ color: "var(--muted)" }}
                          >
                            {[t.original_name, t.origin].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                      {teaStates[t.slug] === "have" && (
                        <span
                          className="text-[10.5px] uppercase tracking-[0.12em] shrink-0 self-center"
                          style={{ color: typeColor }}
                        >
                          in stock
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* ── controls ───────────────────────────────────────────────────── */}
      {stage === "steeps" && session && (
        <div className="mt-7">
          <div className="flex items-center justify-center gap-2.5">
            {mode === "armed" && (
              <button
                onClick={onStart}
                className="flex items-center gap-2.5 px-9 h-[52px] rounded-full text-[15px] font-semibold"
                style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
              >
                <Play size={17} /> Start
              </button>
            )}

            {mode === "running" && (
              <>
                <button
                  onClick={onPause}
                  className="flex items-center gap-2 px-6 h-[52px] rounded-full text-[15px] font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
                >
                  <Pause size={16} /> Pause
                </button>
                <button
                  onClick={onDone}
                  className="flex items-center gap-2 px-6 h-[52px] rounded-full text-[15px] border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Check size={16} /> Done
                </button>
              </>
            )}

            {mode === "paused" && (
              <>
                <button
                  onClick={onStart}
                  className="flex items-center gap-2 px-6 h-[52px] rounded-full text-[15px] font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
                >
                  <Play size={16} /> Resume
                </button>
                <button
                  onClick={onDone}
                  className="flex items-center gap-2 px-6 h-[52px] rounded-full text-[15px] border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Check size={16} /> Done
                </button>
              </>
            )}

            {mode === "done" && (
              <>
                <button
                  onClick={() => activeTea && arm(activeTea, session)}
                  className="flex items-center gap-2 px-7 h-[52px] rounded-full text-[15px] font-semibold"
                  style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
                >
                  <Play size={16} /> Steep {doneCount + 1}
                </button>
                <button
                  onClick={toLog}
                  className="px-6 h-[52px] rounded-full text-[15px] border"
                  style={{ borderColor: "var(--border)" }}
                >
                  End session
                </button>
              </>
            )}
          </div>

          {/* the escapes: always reachable, never in the way */}
          <div className="flex items-center justify-center gap-6 mt-4">
            {mode === "running" && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 h-9 text-[12.5px]"
                style={{ color: "var(--muted)" }}
              >
                <RotateCcw size={13} /> restart
              </button>
            )}
            <button
              onClick={onDiscard}
              className="flex items-center gap-1.5 h-9 text-[12.5px]"
              style={{ color: "var(--muted)" }}
            >
              <Trash2 size={13} />
              {mode === "armed" ? "cancel" : mode === "done" ? "discard session" : "discard steep"}
            </button>
          </div>
        </div>
      )}

      {stage === "log" && activeTea && session && (
        <div className="mt-2">
          <BrewLogSheet
            tea={activeTea}
            session={session}
            now={now}
            previous={previousLogs}
            saving={saving}
            savedLocally={savedLocally}
            onSave={saveLog}
            onCancel={() => setStage("steeps")}
          />
        </div>
      )}
    </main>
  );
}

function TeaCard({
  tea,
  previous,
  onBrew,
  onBack,
}: {
  tea: Tea;
  previous: TeaLog[];
  onBrew: () => void;
  onBack: () => void;
}) {
  const colour = TEA_TYPE_COLORS[tea.tea_type] ?? "var(--accent)";
  const firstSteep = dueSeconds(tea.brewing_time_min ? Math.round(tea.brewing_time_min * 60) : null, 1);
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-2 w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colour }} />
        <div className="min-w-0">
          <h2 className="font-serif text-[26px] leading-tight">{tea.name}</h2>
          {tea.original_name && (
            <p className="text-[14px] mt-1" style={{ color: "var(--muted)" }}>
              {tea.original_name}
            </p>
          )}
          {tea.translation && (
            <p className="text-[13px] mt-0.5" style={{ color: "var(--muted)" }}>
              {tea.translation}
            </p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-4 mt-6">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
            Type
          </dt>
          <dd className="mt-1 text-[14px]" style={{ color: colour }}>
            {TEA_TYPE_LABELS[tea.tea_type] ?? tea.tea_type}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
            Origin
          </dt>
          <dd className="mt-1 text-[14px]">{tea.origin || "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
            Water
          </dt>
          <dd className="mt-1 text-[14px]">{tea.brewing_temp_c ? `${tea.brewing_temp_c} °C` : "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
            First steep
          </dt>
          <dd className="mt-1 text-[14px] tabular-nums">
            {formatClock(firstSteep)} · {tea.brewing_num_brews ?? 1}×
          </dd>
        </div>
      </dl>

      {tea.characteristics && tea.characteristics.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {tea.characteristics.slice(0, 6).map((c) => (
            <span
              key={c}
              className="text-[12px] px-2.5 h-7 inline-flex items-center rounded-full"
              style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {tea.description && (
        <p className="text-[13.5px] mt-6 leading-relaxed" style={{ color: "var(--muted)" }}>
          {tea.description.length > 320 ? `${tea.description.slice(0, 320)}…` : tea.description}
        </p>
      )}

      {previous.length > 0 && (
        <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: "var(--muted)" }}>
            Previous sessions
          </p>
          <ul className="flex flex-col">
            {previous.map((log) => (
              <li
                key={log.id}
                className="py-2.5 first:pt-0 last:pb-0"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-[12.5px] tabular-nums shrink-0" style={{ color: "var(--muted)" }}>
                    {new Date(log.timestamp).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[12.5px] tabular-nums shrink-0" style={{ color: colour }}>
                    {log.rating}/5
                  </span>
                  {log.brews ? (
                    <span className="text-[12.5px] tabular-nums ml-auto shrink-0" style={{ color: "var(--muted)" }}>
                      {log.brews}× · {formatClock(log.duration_s ?? 0)}
                    </span>
                  ) : null}
                </div>
                {log.note && (
                  <p className="text-[13px] mt-1 leading-snug" style={{ color: "var(--text)", opacity: 0.8 }}>
                    {log.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2.5 mt-7">
        <button
          onClick={onBrew}
          className="flex-1 h-[52px] rounded-full text-[15px] font-semibold"
          style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
        >
          {previous.length > 0 ? "Brew again" : "Brew this"}
        </button>
        <button
          onClick={onBack}
          className="px-6 h-[52px] rounded-full text-[15px] border"
          style={{ borderColor: "var(--border)" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
