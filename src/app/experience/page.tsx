"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, Leaf, Pause, Play, RotateCcw, X } from "lucide-react";
import { ALL_TEA_TYPES, TEA_TYPE_LABELS, type Tea } from "@/lib/types";
import { useTeaStore } from "@/lib/store";
import {
  wheelLayout,
  flavourLayout,
  maxWheelSlots,
  type Wedge,
} from "@/lib/brew/wheel";
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
  steepSeconds,
  parseSession,
  pauseSteep,
  resetCurrentSteep,
  restoreSession,
  serializeSession,
  sessionPayload,
  startSteep,
  type BrewSession,
} from "@/lib/brew/session";
import WheelMenu, { type WheelButton } from "@/components/experience/WheelMenu";
import SteepWheel from "@/components/experience/SteepWheel";
import BrewLogSheet from "@/components/experience/BrewLogSheet";

type Stage = "types" | "teas" | "card" | "steeps" | "log";

/**
 * The Tea Experience page.
 *
 * Layout is a weapon wheel: the ring is made of button wedges, the labels live
 * inside those buttons, and there is no decoration that is not clickable.
 */
export default function TeaExperiencePage() {
  const allTeas = useTeaStore((s) => s.allTeas);
  const teaStates = useTeaStore((s) => s.teaStates);
  const teaLogs = useTeaStore((s) => s.teaLogs);
  const addTeaLog = useTeaStore((s) => s.addTeaLog);
  const flushBrewOutbox = useTeaStore((s) => s.flushBrewOutbox);

  const [stage, setStage] = useState<Stage>("types");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(0);
  /**
   * A merged wedge (drawn as "Gyokuro +1") stands for several teas that share an
   * angle. Tapping it opens those teas as their own ring, the way a weapon wheel's
   * sub-slot does — so no tea is ever hidden behind a count.
   */
  const [drill, setDrill] = useState<{ label: string; slugs: string[] } | null>(null);

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

  // ── stage 1: the types, one button each ─────────────────────────────────
  const typeWedges: Wedge<WheelButton>[] = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of pool) {
      if (!t.tea_type) continue;
      counts[t.tea_type] = (counts[t.tea_type] ?? 0) + 1;
    }
    const ordered = ALL_TEA_TYPES.filter((t) => counts[t]);
    for (const t of Object.keys(counts)) if (!ordered.includes(t)) ordered.push(t);
    const buttons: WheelButton[] = ordered.map((t) => ({
      key: t,
      label: TEA_TYPE_LABELS[t] ?? t,
      meta: `${counts[t]} ${counts[t] === 1 ? "tea" : "teas"}`,
    }));
    return wheelLayout(buttons) as Wedge<WheelButton>[];
  }, [pool]);

  // ── stage 2: the teas of one type, placed by their own flavour coordinates ──
  const typeTeas = useMemo(
    () => (activeType ? pool.filter((t) => t.tea_type === activeType) : []),
    [pool, activeType]
  );

  /**
   * The wheel holds at most maxWheelSlots buttons. When a type has more teas than
   * that, they are chunked into *ranges of the flavour axis* so each page is a
   * contiguous arc, then each chunk is laid out by coordinate.
   */
  const slots = maxWheelSlots();
  const sortedTeas = useMemo(
    () => [...typeTeas].sort((a, b) => (b.flavor_y ?? 50) - (a.flavor_y ?? 50) || (a.slug < b.slug ? -1 : 1)),
    [typeTeas]
  );
  const pageCount = Math.max(1, Math.ceil(sortedTeas.length / slots));
  const pageTeas = useMemo(
    () => sortedTeas.slice(page * slots, (page + 1) * slots),
    [sortedTeas, page, slots]
  );

  /** The teas the wheel is currently showing: the page, or a drilled-in group. */
  const shownTeas = useMemo(
    () => (drill ? drill.slugs.map((s) => teaBySlug.get(s)).filter((t): t is Tea => !!t) : pageTeas),
    [drill, pageTeas, teaBySlug]
  );

  /**
   * Wedges for the teas on show, plus the map from a merged button back to the teas
   * it stands for so tapping it can open them.
   *
   * A drilled-in group is laid out in equal slices: its members are together precisely
   * because their coordinates are close, so re-running the flavour layout would merge
   * them straight back into one button and the group would never open.
   */
  const { wedges: teaWedges, merged } = useMemo(() => {
    const buttons: (WheelButton & { y: number; x: number })[] = shownTeas.map((t) => ({
      key: t.slug,
      label: t.name,
      y: t.flavor_y ?? 50,
      x: t.flavor_x ?? 50,
    }));

    const groups = new Map<string, string[]>();
    const wedges = (drill ? wheelLayout(buttons) : flavourLayout(buttons)) as Wedge<WheelButton>[];

    for (const w of wedges) {
      if (w.items.length > 1) {
        const names = w.items.map((i) => i.label);
        groups.set(w.items[0].key, w.items.map((i) => i.key));
        // the label names the first tea and how many more are behind it
        w.items[0] = {
          ...w.items[0],
          label: `${names[0]} +${names.length - 1}`,
          meta: names.slice(1).join(" · "),
        };
      }
    }
    return { wedges, merged: groups };
  }, [shownTeas, drill]);

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
      /* storage disabled — in-memory session still works */
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

  const live = session ? currentSteep(session) : null;
  const running = session?.state === "running";
  const liveSecs = session ? liveSeconds(session, now) : 0;

  const begin = (tea: Tea) => {
    const s = startSteep(newSession(tea.slug, Date.now()), Date.now());
    setSession(s);
    setSelectedTea(tea);
    setStage("steeps");
  };

  const onDone = () => {
    if (!session) return;
    const t = Date.now();
    const next = finishSteep(session, t);
    setSession(next);
    setNow(t);
  };
  const onNextSteep = () => {
    if (!session) return;
    setSession(startSteep(session, Date.now()));
  };
  const onPause = () => session && setSession(pauseSteep(session, Date.now()));
  const onResume = () => session && setSession(startSteep(session, Date.now()));
  const onReset = () => session && setSession(resetCurrentSteep(session, Date.now()));
  const toLog = () => session && setSession(endSession(session, Date.now())) && setStage("log");
  const abandon = () => {
    persist(null);
    setSession(null);
    setStage("types");
    setSelectedTea(null);
  };

  const saveLog = async (rating: number, note: string) => {
    if (!session || !selectedTea) return;
    setSaving(true);
    const payload = sessionPayload(session, Date.now());
    const ok = await addTeaLog(selectedTea.slug, rating, note, {
      brews: payload.brews,
      duration_s: payload.duration_s,
      steep_s: payload.steep_s,
    });
    setSaving(false);
    if (!ok) {
      setSavedLocally(true);
      return;
    }
    // a tea that was not in the collection has now been brewed — record that
    if (teaStates[selectedTea.slug] === undefined) {
      useTeaStore.getState().setTeaStatus?.(selectedTea.slug, "tried");
    }
    persist(null);
    setSession(null);
    setSelectedTea(null);
    setStage("types");
  };

  const previousLogs = useMemo(
    () => (selectedTea ? (teaLogs[selectedTea.slug] ?? []).slice(0, 4) : []),
    [teaLogs, selectedTea]
  );

  const medallion =
    stage === "steeps" ? (
      <div className="flex flex-col items-center justify-center text-center px-3">
        <span className="font-serif tabular-nums" style={{ fontSize: 40, lineHeight: 1 }}>
          {formatClock(liveSecs)}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: "var(--muted)" }}>
          {live ? `steep ${live.index}` : "paused"}
        </span>
        {selectedTea?.brewing_temp_c && (
          <span className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
            {selectedTea.brewing_temp_c} °C
          </span>
        )}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center text-center px-2">
        <Leaf size={18} style={{ color: "var(--accent)" }} />
        <span className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: "var(--muted)" }}>
          {stage === "teas" ? TEA_TYPE_LABELS[activeType ?? ""] ?? activeType : "Brew"}
        </span>
        <span className="font-serif text-xl mt-0.5">
          {stage === "teas" ? shownTeas.length : pool.length}
        </span>
        <span className="text-[10px]" style={{ color: "var(--muted)" }}>
          {stage === "teas" ? (drill ? "here" : "teas") : "in your collection"}
        </span>
      </div>
    );

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 sm:px-6 pb-16">
      {/* header */}
      <div className="flex items-center justify-between pt-5 pb-2">
        <div className="flex items-center gap-3 min-w-0">
          {stage !== "types" && (
            <button
              onClick={() => {
                if (stage === "card") setStage("teas");
                else if (stage === "log") setStage("steeps");
                else if (drill) setDrill(null);
                else {
                  setActiveType(null);
                  setPage(0);
                  setStage("types");
                }
              }}
              className="flex items-center gap-1 text-xs shrink-0"
              style={{ color: "var(--muted)" }}
            >
              <ChevronLeft size={14} /> back
            </button>
          )}
          <h1 className="font-serif text-lg truncate">
            {stage === "steeps" || stage === "log" ? selectedTea?.name : "Tea experience"}
          </h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {(stage === "types" || stage === "teas") && (
            <button
              onClick={() => {
                setShowAll((v) => !v);
                setPage(0);
              }}
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
          <Link href="/" aria-label="Leave the experience" style={{ color: "var(--muted)" }}>
            <X size={18} />
          </Link>
        </div>
      </div>

      {/* restore prompt */}
      <AnimatePresence>
        {restore && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border p-4 mb-3"
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
                onClick={() => {
                  adopt(restore.session);
                  setRestore(null);
                }}
                className="px-3 h-9 rounded-lg text-xs"
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
                  className="px-3 h-9 rounded-lg text-xs border"
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
                className="px-3 h-9 rounded-lg text-xs border"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                Discard that steep
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the wheel / card / timer */}
      {stage === "card" && selectedTea ? (
        <TeaCard tea={selectedTea} onBrew={() => begin(selectedTea)} onBack={() => setStage("teas")} />
      ) : stage === "steeps" && session ? (
        <div className="w-full aspect-square max-h-[46vh] mx-auto">
          <SteepWheel session={session} now={now} centre={medallion} />
        </div>
      ) : stage === "log" ? null : typeWedges.length === 0 ? (
        <div
          className="rounded-2xl border p-6 text-center mt-8"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
        >
          <p className="font-serif text-lg">Nothing to brew yet</p>
          <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
            {showAll
              ? "No teas are loaded yet — the library is still syncing."
              : "Your collection is empty. Mark teas as owned, or switch to the whole library."}
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
      ) : (
        <div className="w-full aspect-square max-h-[54vh] mx-auto">
          <WheelMenu
            wedges={stage === "teas" ? teaWedges : typeWedges}
            onPick={(key) => {
              if (stage === "teas") {
                // a merged button opens its own teas instead of guessing one
                const group = merged.get(key);
                if (group) {
                  const first = teaBySlug.get(key);
                  setDrill({ label: first?.name ?? "teas", slugs: group });
                  return;
                }
                const t = teaBySlug.get(key);
                if (t) {
                  setSelectedTea(t);
                  setStage("card");
                }
              } else {
                setActiveType(key);
                setPage(0);
                setDrill(null);
                setStage("teas");
              }
            }}
            activeKey={stage === "teas" ? selectedTea?.slug ?? null : activeType}
            centre={medallion}
            label={
              stage === "teas"
                ? drill
                  ? `Teas grouped with ${drill.label}`
                  : `Teas in ${activeType ?? ""}`
                : "Tea categories"
            }
          />
        </div>
      )}

      {stage === "teas" && !drill && pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 mt-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous teas"
            className="w-9 h-9 rounded-lg border flex items-center justify-center"
            style={{ borderColor: "var(--border)", opacity: page === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs tabular-nums" style={{ color: "var(--muted)" }}>
            {page * slots + 1}–{Math.min(sortedTeas.length, (page + 1) * slots)} of {sortedTeas.length} ·{" "}
            {pageCount} {pageCount === 1 ? "wheel" : "wheels"}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            aria-label="More teas"
            className="w-9 h-9 rounded-lg border flex items-center justify-center"
            style={{ borderColor: "var(--border)", opacity: page >= pageCount - 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
        </div>
      )}

      {/* timer controls */}
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
                  style={{ borderColor: "var(--border)" }}
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
                  style={{ borderColor: "var(--border)" }}
                >
                  End session
                </button>
              </>
            )}
          </div>
          <button onClick={abandon} className="block mx-auto mt-3 text-[11px]" style={{ color: "var(--muted)" }}>
            discard this session
          </button>
        </div>
      )}

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
    </main>
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
            <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
              {tea.original_name}
            </p>
          )}
          {tea.translation && (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {tea.translation}
            </p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 mt-4 text-xs">
        <div>
          <dt className="uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Type
          </dt>
          <dd className="mt-0.5">{TEA_TYPE_LABELS[tea.tea_type] ?? tea.tea_type}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Origin
          </dt>
          <dd className="mt-0.5">{tea.origin || "—"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Water
          </dt>
          <dd className="mt-0.5">{tea.brewing_temp_c ? `${tea.brewing_temp_c} °C` : "—"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Steep
          </dt>
          <dd className="mt-0.5">
            {tea.brewing_time_min ? formatClock(tea.brewing_time_min * 60) : "—"} · {tea.brewing_num_brews ?? 1}×
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
          style={{ borderColor: "var(--border)" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
