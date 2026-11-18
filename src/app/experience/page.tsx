"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, Pause, Play, RotateCcw, Search, X } from "lucide-react";
import { ALL_TEA_TYPES, TEA_TYPE_COLORS, TEA_TYPE_LABELS, type Tea } from "@/lib/types";
import { useTeaStore } from "@/lib/store";
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
import SteepWheel from "@/components/experience/SteepWheel";
import BrewLogSheet from "@/components/experience/BrewLogSheet";

type Stage = "types" | "teas" | "card" | "steeps" | "log";

/**
 * The Brew page.
 *
 * Pick a type, pick a tea, steep it. Two plain lists, colour-coded: the type's colour
 * appears on its category row and is carried through to every tea beneath it, so the
 * eye follows one line from category to cup. No radial menu.
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

  /**
   * The types that actually hold teas right now. Rows are ordered by the canonical
   * type order, not by count, so a category keeps its place between visits.
   */
  const types = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of pool) {
      if (!t.tea_type) continue;
      counts[t.tea_type] = (counts[t.tea_type] ?? 0) + 1;
    }
    const ordered = ALL_TEA_TYPES.filter((t) => counts[t]);
    for (const k of Object.keys(counts)) if (!ordered.includes(k)) ordered.push(k);
    return ordered.map((k) => ({ key: k, label: TEA_TYPE_LABELS[k] ?? k, count: counts[k] }));
  }, [pool]);

  /** The chosen type's teas, sweetest first, filtered by the search box. */
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
    return [...filtered].sort(
      (a, b) => (b.flavor_y ?? 50) - (a.flavor_y ?? 50) || a.name.localeCompare(b.name)
    );
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
    setSession(finishSteep(session, t));
    setNow(t);
  };
  const onNextSteep = () => session && setSession(startSteep(session, Date.now()));
  const onPause = () => session && setSession(pauseSteep(session, Date.now()));
  const onResume = () => session && setSession(startSteep(session, Date.now()));
  const onReset = () => session && setSession(resetCurrentSteep(session, Date.now()));
  const toLog = () => session && setSession(endSession(session, Date.now())) && setStage("log");
  const abandon = () => {
    persist(null);
    setSession(null);
    setSelectedTea(null);
    setStage("types");
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
    // brewing a tea puts it in the collection — that is what "have" means here
    if (teaStates[selectedTea.slug] === undefined) {
      useTeaStore.getState().setTeaStatus?.(selectedTea.slug, "have");
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

  const back = () => {
    if (stage === "card") return setStage("teas");
    if (stage === "log") return setStage("steeps");
    if (stage === "steeps") return abandon();
    setActiveType(null);
    setQuery("");
    setStage("types");
  };

  const heading =
    stage === "steeps" || stage === "log"
      ? selectedTea?.name
      : stage === "teas"
      ? TEA_TYPE_LABELS[activeType ?? ""] ?? activeType
      : "Brew";

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 sm:px-6 pb-28">
      <div className="flex items-center justify-between pt-5 pb-1">
        <div className="flex items-center gap-3 min-w-0">
          {stage !== "types" && (
            <button
              onClick={back}
              className="flex items-center gap-1 text-xs shrink-0"
              style={{ color: "var(--muted)" }}
            >
              <ChevronLeft size={14} /> back
            </button>
          )}
          <h1 className="font-serif text-lg truncate">{heading}</h1>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {(stage === "types" || stage === "teas") && (
            <button
              onClick={() => {
                setShowAll((v) => !v);
                setQuery("");
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
          <Link href="/" aria-label="Leave the brew page" style={{ color: "var(--muted)" }}>
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

      {stage === "card" && selectedTea ? (
        <TeaCard tea={selectedTea} onBrew={() => begin(selectedTea)} onBack={() => setStage("teas")} />
      ) : stage === "steeps" && session ? (
        <div className="w-full aspect-square max-h-[46vh] mx-auto">
          <SteepWheel
            session={session}
            now={now}
            centre={
              <div className="flex flex-col items-center justify-center text-center px-3">
                <span className="font-serif tabular-nums" style={{ fontSize: 40, lineHeight: 1 }}>
                  {formatClock(liveSecs)}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: "var(--muted)" }}>
                  {live ? `steep ${live.index}` : running ? "paused" : "steep done"}
                </span>
                {selectedTea?.brewing_temp_c && (
                  <span className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
                    {selectedTea.brewing_temp_c} °C
                  </span>
                )}
              </div>
            }
          />
        </div>
      ) : stage === "log" ? null : stage === "types" ? (
        types.length === 0 ? (
          <div
            className="rounded-2xl border p-6 text-center mt-8"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
          >
            <p className="font-serif text-lg">Nothing to brew yet</p>
            <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              {showAll
                ? "No teas are loaded yet — the library is still syncing."
                : "Your collection is empty. Mark teas as owned, or browse the whole library."}
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
          <ul className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {types.map((t) => (
              <li key={t.key}>
                <button
                  onClick={() => {
                    setActiveType(t.key);
                    setQuery("");
                    setStage("teas");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3.5 text-left"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <span
                    aria-hidden
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: TEA_TYPE_COLORS[t.key] ?? "var(--accent)" }}
                  />
                  <span className="flex-1 min-w-0 text-sm">{t.label}</span>
                  <span className="text-xs tabular-nums" style={{ color: "var(--muted)" }}>
                    {t.count}
                  </span>
                  <ChevronLeft
                    size={15}
                    style={{ transform: "rotate(180deg)", color: "var(--muted)" }}
                  />
                </button>
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          <div className="relative mb-3">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)" }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${TEA_TYPE_LABELS[activeType ?? ""] ?? "teas"}`}
              aria-label="Search teas in this type"
              className="w-full h-11 rounded-lg pl-9 pr-3 text-sm outline-none"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          {typeTeas.length === 0 ? (
            <p className="text-sm py-10 text-center" style={{ color: "var(--muted)" }}>
              No tea matches “{query}”.
            </p>
          ) : (
            <ul className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              {typeTeas.map((t) => (
                <li key={t.slug}>
                  <button
                    onClick={() => {
                      setSelectedTea(t);
                      setStage("card");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {/* the type's colour, carried down from the category row */}
                    <span
                      aria-hidden
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ backgroundColor: typeColor }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm truncate">{t.name}</span>
                      {(t.original_name || t.origin) && (
                        <span className="block text-[11px] truncate" style={{ color: "var(--muted)" }}>
                          {[t.original_name, t.origin].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </span>
                    {teaStates[t.slug] === "have" && (
                      <span
                        className="text-[10px] uppercase tracking-wider shrink-0"
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
                  <Play size={15} /> Steep{" "}
                  {session.steeps.filter((s) => s.endedAt !== undefined).length + 1}
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
          <button
            onClick={abandon}
            className="block mx-auto mt-3 text-[11px]"
            style={{ color: "var(--muted)" }}
          >
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
  const colour = TEA_TYPE_COLORS[tea.tea_type] ?? "var(--accent)";
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start gap-2">
        <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colour }} />
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
          <dd className="mt-0.5" style={{ color: colour }}>
            {TEA_TYPE_LABELS[tea.tea_type] ?? tea.tea_type}
          </dd>
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
            {tea.brewing_time_min ? formatClock(tea.brewing_time_min * 60) : "—"} ·{" "}
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
          style={{ borderColor: "var(--border)" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
