"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, Leaf, Pause, Play, RotateCcw, X } from "lucide-react";
import { ALL_TEA_TYPES, TEA_TYPE_LABELS, type Tea } from "@/lib/types";
import { useTeaStore } from "@/lib/store";
import { layoutTeas, typeSectors, type PlacedDot } from "@/lib/brew/radial";
import {
  SESSION_STORAGE_KEY,
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
import BrewDial, { typeLabel } from "@/components/experience/BrewDial";
import SteepRing from "@/components/experience/SteepRing";
import BrewLogSheet from "@/components/experience/BrewLogSheet";

type Stage = "types" | "teas" | "card" | "steeps" | "log";

interface BrewOverlayProps {
  onClose: () => void;
}

const AXIS_LABELS = { fresh: "Green / fresh", roasted: "Roasted" };

export default function BrewOverlay({ onClose }: BrewOverlayProps) {
  const allTeas = useTeaStore((s) => s.allTeas);
  const teaStates = useTeaStore((s) => s.teaStates);
  const teaLogs = useTeaStore((s) => s.teaLogs);
  const setTeaStatus = useTeaStore((s) => s.setTeaStatus);
  const addTeaLog = useTeaStore((s) => s.addTeaLog);
  const flushBrewOutbox = useTeaStore((s) => s.flushBrewOutbox);

  const [stage, setStage] = useState<Stage>("types");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);
  const [cell, setCell] = useState<PlacedDot | null>(null);
  const [showAll, setShowAll] = useState(false);

  const [session, setSession] = useState<BrewSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [restore, setRestore] = useState<{ session: BrewSession; warning: "long-gap" | "clock-skew" } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  /** Until the stored session has been read, never write `null` over it. */
  const hydrated = useRef(false);

  const teaBySlug = useMemo(() => {
    const m = new Map<string, Tea>();
    for (const t of allTeas) m.set(t.slug, t);
    return m;
  }, [allTeas]);

  // ── the tea pool the dial is showing ────────────────────────────────────
  const pool = useMemo(() => {
    if (showAll) return allTeas;
    return allTeas.filter((t) => teaStates[t.slug] === "have");
  }, [allTeas, teaStates, showAll]);

  const { types, counts } = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of pool) {
      // 3 rows in the table carry no tea_type — they get no sector rather than
      // a bogus "null" wedge.
      if (!t.tea_type) continue;
      c[t.tea_type] = (c[t.tea_type] ?? 0) + 1;
    }
    const ordered = ALL_TEA_TYPES.filter((t) => c[t]);
    for (const t of Object.keys(c)) if (!ordered.includes(t)) ordered.push(t);
    return { types: ordered, counts: c };
  }, [pool]);

  const sectors = useMemo(() => typeSectors(types), [types]);

  const dots = useMemo(() => {
    if (!activeType || stage === "types") return [];
    return layoutTeas(
      pool
        .filter((t) => t.tea_type === activeType)
        .map((t) => ({ slug: t.slug, name: t.name, flavor_x: t.flavor_x, flavor_y: t.flavor_y }))
    );
  }, [pool, activeType, stage]);

  // ── clock: repaint once a second, derive everything from timestamps ─────
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
  }, [session?.state, session]);

  // ── persistence ─────────────────────────────────────────────────────────
  const persist = useCallback((s: BrewSession | null) => {
    try {
      if (!s) localStorage.removeItem(SESSION_STORAGE_KEY);
      else localStorage.setItem(SESSION_STORAGE_KEY, serializeSession(s));
    } catch {
      /* storage disabled — the in-memory session still works */
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    persist(session);
  }, [session, persist]);

  useEffect(() => {
    const heartbeat = () =>
      setSession((s) => (s && s.state === "running" ? { ...s, lastSeen: Date.now() } : s));
    const onHide = () => document.visibilityState === "hidden" && heartbeat();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", heartbeat);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", heartbeat);
    };
  }, []);

  useEffect(() => {
    if (selectedTea || !session) return;
    const t = teaBySlug.get(session.slug);
    if (t) setSelectedTea(t);
  }, [session, selectedTea, teaBySlug]);

  const adopt = useCallback(
    (s: BrewSession) => {
      setSession(s);
      setNow(Date.now());
      const t = teaBySlug.get(s.slug);
      if (t) setSelectedTea(t);
      setStage("steeps");
    },
    [teaBySlug]
  );

  // ── rehydrate a session interrupted by a refresh or a dead tab ──────────
  useEffect(() => {
    let stored: BrewSession | null = null;
    try {
      stored = parseSession(localStorage.getItem(SESSION_STORAGE_KEY));
    } catch {
      stored = null;
    }
    if (!stored || stored.steeps.length === 0) {
      hydrated.current = true;
      return;
    }
    const { session: restored, warning } = restoreSession(stored, Date.now());
    hydrated.current = true;
    if (warning) {
      setRestore({ session: restored, warning });
      return;
    }
    adopt(restored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── retry logs that never reached the server ────────────────────────────
  useEffect(() => {
    void flushBrewOutbox();
    const onOnline = () => void flushBrewOutbox();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushBrewOutbox]);

  // ── session actions ─────────────────────────────────────────────────────
  const begin = (tea: Tea) => {
    const s = startSteep(newSession(tea.slug, Date.now()), Date.now());
    setSession(s);
    setNow(Date.now());
    setStage("steeps");
  };

  const onDone = () => {
    if (!session) return;
    const t = Date.now();
    const finished = finishSteep(session, t);
    setSession(finished);
    setNow(t);
  };

  const onNextSteep = () => {
    if (!session) return;
    const t = Date.now();
    setSession(startSteep(session, t));
    setNow(t);
  };

  const onPause = () => {
    if (!session) return;
    setSession(pauseSteep(session, Date.now()));
  };

  const onResume = () => {
    if (!session) return;
    const t = Date.now();
    setSession(startSteep(session, t));
    setNow(t);
  };

  const onReset = () => {
    if (!session) return;
    const t = Date.now();
    setSession(resetCurrentSteep(session, t));
    setNow(t);
  };

  const toLog = () => {
    if (!session) return;
    const t = Date.now();
    setSession(endSession(session, t));
    setNow(t);
    setStage("log");
  };

  const saveLog = async (rating: number, note: string) => {
    if (!session || !selectedTea) return;
    setSaving(true);
    const p = sessionPayload(session, Date.now());
    const ok = await addTeaLog(selectedTea.slug, rating, note, {
      id: session.id,
      brews: p.brews,
      duration_s: p.duration_s,
      steep_s: p.steep_s,
    });
    setSavedLocally(!ok);
    // A tea outside the collection has now been tried — mark it honestly.
    if (teaStates[selectedTea.slug] !== "have") setTeaStatus(selectedTea.slug, "tried");
    setSaving(false);
    persist(null);
    setSession(null);
    window.setTimeout(onClose, ok ? 260 : 1100);
  };

  const abandon = () => {
    persist(null);
    setSession(null);
    onClose();
  };

  const pickDot = (dot: PlacedDot) => {
    if (dot.teas.length === 1) {
      const t = teaBySlug.get(dot.teas[0].slug);
      if (t) {
        setSelectedTea(t);
        setStage("card");
      }
      return;
    }
    setCell(dot);
  };

  const pickCellTea = (slug: string) => {
    const t = teaBySlug.get(slug);
    if (!t) return;
    setSelectedTea(t);
    setCell(null);
    setStage("card");
  };

  const live = session ? currentSteep(session) : undefined;
  const liveSecs = session ? liveSeconds(session, now) : 0;
  const expected = (selectedTea?.brewing_time_min ?? 2) * 60;
  const previousLogs = selectedTea ? teaLogs[selectedTea.slug] ?? [] : [];
  const running = session?.state === "running";

  // ── centre medallion, per stage ─────────────────────────────────────────
  const medallion = (() => {
    if (stage === "steeps" && session) {
      return (
        <div className="w-[200px] h-[200px] rounded-full flex flex-col items-center justify-center"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
            {live ? `Steep ${live.index}` : "Between steeps"}
          </span>
          <span className="font-serif tabular-nums mt-1"
            style={{ fontSize: 40, lineHeight: 1.05, color: liveSecs > expected ? "var(--accent)" : "var(--text)" }}>
            {formatClock(liveSecs)}
          </span>
          <span className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
            {selectedTea?.brewing_temp_c ? `${selectedTea.brewing_temp_c} °C` : "—"} · {formatClock(expected)} to aim for
          </span>
        </div>
      );
    }
    return (
      <motion.div
        layoutId="brew-medallion"
        className="w-[196px] h-[196px] rounded-full flex flex-col items-center justify-center text-center px-4"
        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
      >
        {activeType ? (
          <>
            <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
              {typeLabel(activeType)}
            </span>
            <span className="font-serif text-2xl mt-1">{counts[activeType] ?? 0}</span>
            <span className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
              {counts[activeType] === 1 ? "tea" : "teas"}
            </span>
          </>
        ) : (
          <>
            <Leaf size={26} style={{ color: "var(--accent)" }} />
            <span className="font-serif text-xl mt-2">Brew</span>
            <span className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
              {pool.length} in {showAll ? "the library" : "your collection"}
            </span>
          </>
        )}
      </motion.div>
    );
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          {stage !== "types" && stage !== "steeps" && (
            <button
              onClick={() => {
                if (stage === "card") setStage("teas");
                else if (stage === "log") setStage("steeps");
                else { setActiveType(null); setStage("types"); }
              }}
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--muted)" }}
            >
              <ChevronLeft size={14} /> back
            </button>
          )}
          <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
            {stage === "steeps" || stage === "log" ? selectedTea?.name : "Tea experience"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {(stage === "types" || stage === "teas") && (
            <button
              onClick={() => setShowAll((v) => !v)}
              aria-pressed={showAll}
              className="flex items-center gap-2 text-[11px] uppercase tracking-wider"
              style={{ color: showAll ? "var(--accent)" : "var(--muted)" }}
            >
              <span
                className="inline-block rounded-full transition-colors"
                style={{
                  width: 26,
                  height: 14,
                  backgroundColor: showAll ? "var(--accent)" : "var(--border)",
                  position: "relative",
                }}
              >
                <span
                  className="absolute rounded-full transition-all"
                  style={{
                    width: 10,
                    height: 10,
                    top: 2,
                    left: showAll ? 14 : 2,
                    backgroundColor: showAll ? "var(--bg)" : "var(--muted)",
                  }}
                />
              </span>
              all teas
            </button>
          )}
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--muted)" }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-6">
        {/* restore prompt */}
        <AnimatePresence>
          {restore && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-[520px] mx-auto mt-2 mb-4 rounded-xl border p-4"
              style={{ borderColor: "var(--accent)", backgroundColor: "var(--card)" }}
            >
              <p className="text-sm">
                {restore.warning === "long-gap"
                  ? `A steep of ${teaBySlug.get(restore.session.slug)?.name ?? "this tea"} has been running since you closed the app.`
                  : "The device clock moved while this steep was open."}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                {restore.warning === "long-gap"
                  ? "Tea does not keep steeping while you sleep. Choose what to record."
                  : "Nothing is trusted from that gap — resume when you are ready."}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => { adopt(restore.session); setRestore(null); }}
                  className="px-3 h-9 rounded-lg text-xs"
                  style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
                >
                  Keep as it is
                </button>
                {restore.warning === "long-gap" && (
                  <button
                    onClick={() => { adopt(capSteep(restore.session, 20 * 60, Date.now())); setRestore(null); }}
                    className="px-3 h-9 rounded-lg text-xs border"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    Cap at 20:00
                  </button>
                )}
                <button
                  onClick={() => {
                    const d = discardCurrentSteep(restore.session, Date.now());
                    if (d.steeps.length === 0) { persist(null); setRestore(null); }
                    else { adopt(d); setRestore(null); }
                  }}
                  className="px-3 h-9 rounded-lg text-xs border"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  Discard that steep
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* dial / ring / card */}
        <div className="max-w-[520px] mx-auto">
          {stage === "card" && selectedTea ? (
            <TeaCard tea={selectedTea} onBrew={() => begin(selectedTea)} onBack={() => setStage("teas")} />
          ) : stage === "steeps" && session ? (
            <div className="w-full aspect-square max-h-[62vh] mx-auto">
              <SteepRing session={session} now={now} expectedSeconds={expected} centre={medallion} />
            </div>
          ) : types.length === 0 ? (
            <div className="rounded-2xl border p-6 text-center mt-8"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
              <p className="font-serif text-lg">Nothing to brew yet</p>
              <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                {showAll
                  ? "No teas are loaded yet — the library is still syncing."
                  : "Your collection is empty. Mark teas as owned, or switch the dial to the whole library."}
              </p>
              {!showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="mt-4 px-4 h-10 rounded-xl text-sm"
                  style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
                >
                  Show all teas
                </button>
              )}
            </div>
          ) : stage === "log" ? null : (
            <div className="w-full aspect-square max-h-[62vh] mx-auto">
              <BrewDial
                sectors={sectors}
                activeType={activeType}
                dots={dots}
                stage={stage}
                centre={medallion}
                counts={counts}
                onPickType={(t) => { setActiveType(t); setStage("teas"); }}
                onPickDot={pickDot}
              />
            </div>
          )}

          {/* axis key — the dial is the chart, so say which way is which */}
          {(stage === "types" || stage === "teas") && (
            <p className="text-center text-[10px] mt-1" style={{ color: "var(--muted)" }}>
              {AXIS_LABELS.fresh} ◀ roast ▶ {AXIS_LABELS.roasted} · centre bitter → rim sweet
            </p>
          )}

          {/* cell sheet: several teas share one spot on the map */}
          <AnimatePresence>
            {cell && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="mt-3 rounded-xl border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    {cell.teas.length} teas here · sweetest first
                  </span>
                  <button onClick={() => setCell(null)} aria-label="Close list" style={{ color: "var(--muted)" }}>
                    <X size={14} />
                  </button>
                </div>
                {cell.teas.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => pickCellTea(t.slug)}
                    className="w-full text-left px-3 py-2.5 text-sm border-b last:border-b-0 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {t.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* controls */}
          {stage === "steeps" && session && (
            <div className="mt-4">
              <div className="flex items-center justify-center gap-2">
                {live ? (
                  <>
                    <button
                      onClick={running ? onPause : onResume}
                      className="flex items-center gap-2 px-4 h-11 rounded-xl text-sm font-medium"
                      style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
                    >
                      {running ? <Pause size={15} /> : <Play size={15} />}
                      {running ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={onDone}
                      className="flex items-center gap-2 px-4 h-11 rounded-xl text-sm border"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }}
                    >
                      <Check size={15} /> Done
                    </button>
                    <button
                      onClick={onReset}
                      aria-label="Reset this steep"
                      className="w-11 h-11 rounded-xl border flex items-center justify-center"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                    >
                      <RotateCcw size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onNextSteep}
                      className="flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-medium"
                      style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
                    >
                      <Play size={15} /> Steep {session.steeps.filter((s) => s.endedAt !== undefined).length + 1}
                    </button>
                    <button
                      onClick={toLog}
                      className="px-4 h-11 rounded-xl text-sm border"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }}
                    >
                      End session
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={abandon}
                className="block mx-auto mt-3 text-[11px]"
                style={{ color: "var(--muted)" }}
              >
                discard this session
              </button>
            </div>
          )}
        </div>

        {/* log sheet */}
        {stage === "log" && selectedTea && session && (
          <div className="mt-4">
            <BrewLogSheet
              tea={selectedTea}
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
      </div>
    </motion.div>
  );
}

function TeaCard({ tea, onBrew, onBack }: { tea: Tea; onBrew: () => void; onBack: () => void }) {
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-start gap-2">
        <span
          className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: tea.color_hex || "var(--accent)" }}
        />
        <div className="min-w-0">
          <h2 className="font-serif text-xl leading-tight">{tea.name}</h2>
          {tea.original_name && (
            <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{tea.original_name}</p>
          )}
          {tea.translation && (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{tea.translation}</p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 mt-4 text-xs">
        <div>
          <dt className="uppercase tracking-wider" style={{ color: "var(--muted)" }}>Type</dt>
          <dd className="mt-0.5">{TEA_TYPE_LABELS[tea.tea_type] ?? tea.tea_type}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider" style={{ color: "var(--muted)" }}>Origin</dt>
          <dd className="mt-0.5">{tea.origin || "—"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider" style={{ color: "var(--muted)" }}>Water</dt>
          <dd className="mt-0.5">{tea.brewing_temp_c ? `${tea.brewing_temp_c} °C` : "—"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider" style={{ color: "var(--muted)" }}>Steep</dt>
          <dd className="mt-0.5">
            {tea.brewing_time_min ? `${formatClock(tea.brewing_time_min * 60)}` : "—"} ·{" "}
            {tea.brewing_num_brews ?? 1}×
          </dd>
        </div>
      </dl>

      {tea.characteristics?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {tea.characteristics.slice(0, 6).map((c) => (
            <span
              key={c}
              className="text-[10px] px-2 py-0.5 rounded-full border"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {tea.description && (
        <p className="text-xs mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
          {tea.description.length > 320 ? `${tea.description.slice(0, 320)}…` : tea.description}
        </p>
      )}

      <div className="flex gap-2 mt-5">
        <button
          onClick={onBrew}
          className="flex-1 h-11 rounded-xl text-sm font-medium"
          style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
        >
          Brew this
        </button>
        <button
          onClick={onBack}
          className="px-4 h-11 rounded-xl text-sm border"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
