"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Droplets,
  Package,
  Leaf,
  Scale,
  Thermometer,
  Clock,
  Repeat,
  CupSoda,
  Lightbulb,
  Check,
  ChevronRight,
  BookOpen,
  Compass,
  Zap,
  Feather,
  MoveVertical,
  MoveDown,
  RotateCw,
  RotateCcw,
  GitFork,
  CookingPot,
  FlaskConical,
  Utensils,
  Box,
  Crosshair,
  RectangleHorizontal,
  Waves,
  Circle,
  Award,
  GlassWater,
  Snowflake,
  Flame,
  Sun,
  Sparkles,
  ArrowLeft,
  Mountain,
} from "lucide-react";
import {
  WIKI_CATEGORIES,
  WikiCategory,
  WikiEntry,
  WikiParamCard as WikiParam,
} from "@/data/wikiData";

// ── Icon resolver ────────────────────────────────────────────────────

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Coffee, Droplets, Package, Leaf, Scale, Thermometer, Clock, Repeat, CupSoda,
  Lightbulb, Check, ChevronRight, BookOpen, Compass, Zap, Feather, MoveVertical,
  MoveDown, RotateCw, RotateCcw, GitFork, Mountain, CookingPot, FlaskConical, Utensils, Box,
  Crosshair, RectangleHorizontal, Waves, Circle, Award, GlassWater, Snowflake,
  Flame, Sun, Sparkles, ArrowLeft,
};

function getIcon(name: string) {
  return ICONS[name] || CupSoda;
}

// ── ParamCard component ──────────────────────────────────────────────

function ParamCard({ param }: { param: WikiParam }) {
  const Icon = getIcon(param.icon);
  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={15} className="text-accent" />
        <span className="text-xs text-muted uppercase tracking-wide font-semibold">{param.label}</span>
      </div>
      <p className="text-sm leading-relaxed">{param.value}</p>
    </div>
  );
}

// ── Entry detail view ────────────────────────────────────────────────

function EntryDetail({ entry, onBack }: { entry: WikiEntry; onBack: () => void }) {
  const Icon = getIcon(entry.icon);

  return (
    <motion.div
      key={entry.slug}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft size={16} />
        Back to {""}
      </button>

      {/* Title + description */}
      <div className="rounded-2xl border p-5 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-start gap-3 mb-3">
          <Icon size={28} className="text-accent flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-serif font-bold">{entry.name}</h2>
              {entry.original_name && (
                <span className="font-serif text-lg text-muted">{entry.original_name}</span>
              )}
            </div>
            {entry.romaji && (
              <p className="text-xs text-muted mt-0.5 italic">{entry.romaji}</p>
            )}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted">{entry.description}</p>
        {entry.best_for && entry.best_for.length > 0 && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-xs text-muted uppercase tracking-wide font-semibold">Best for:</span>
            {entry.best_for.map((b) => (
              <span
                key={b}
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: "var(--accent)" + "20", color: "var(--accent)" }}
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Parameters */}
      {entry.params && entry.params.length > 0 && (
        <div className="rounded-2xl border p-5 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Key Parameters</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entry.params.map((p, i) => (
              <ParamCard key={i} param={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      {entry.sections && entry.sections.length > 0 && (
        <div className="space-y-4">
          {entry.sections.map((sec, i) => (
            <div key={i} className="rounded-2xl border p-5 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">{sec.heading}</h3>
              <p className="text-sm leading-relaxed mb-3">{sec.body}</p>
              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {sec.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed">
                      <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                      <span className="text-muted">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Steps */}
      {entry.steps && entry.steps.length > 0 && (
        <div className="rounded-2xl border p-5 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Step-by-Step</h3>
          <div className="space-y-2">
            {entry.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: "var(--accent)" + "20", color: "var(--accent)" }}
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed flex-1 pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {entry.tips && entry.tips.length > 0 && (
        <div className="rounded-2xl border p-5 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-accent" />
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Tips for Beginners</h3>
          </div>
          <ul className="space-y-2.5">
            {entry.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <Check size={15} className="text-accent flex-shrink-0 mt-0.5" />
                <span className="text-muted">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

// ── Entry list (menu of entries within a category) ───────────────────

function EntryList({
  category,
  onSelect,
}: {
  category: WikiCategory;
  onSelect: (slug: string) => void;
}) {
  return (
    <motion.div
      key={category.slug}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-3"
    >
      <p className="text-sm text-muted leading-relaxed">{category.description}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {category.entries.map((entry) => {
          const Icon = getIcon(entry.icon);
          return (
            <motion.button
              key={entry.slug}
              onClick={() => onSelect(entry.slug)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="text-left rounded-2xl border p-4 paper-card transition-colors"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent)" + "15" }}
                >
                  <Icon size={20} className="text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{entry.name}</h3>
                    {entry.original_name && (
                      <span className="font-serif text-sm text-muted">{entry.original_name}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                    {entry.description}
                  </p>
                </div>
                <ChevronRight size={18} className="text-muted flex-shrink-0 mt-1" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Main wiki page ────────────────────────────────────────────────────

export default function WikiPage() {
  const [categorySlug, setCategorySlug] = useState<string>(WIKI_CATEGORIES[0].slug);
  const [entrySlug, setEntrySlug] = useState<string | null>(null);

  const category = useMemo(
    () => WIKI_CATEGORIES.find((c) => c.slug === categorySlug)!,
    [categorySlug]
  );
  const entry = useMemo(
    () => entrySlug ? category.entries.find((e) => e.slug === entrySlug) ?? null : null,
    [categorySlug, entrySlug]
  );

  const selectCategory = (slug: string) => {
    setCategorySlug(slug);
    setEntrySlug(null);
  };

  const selectEntry = (slug: string) => {
    setEntrySlug(slug);
  };

  const goBack = () => {
    setEntrySlug(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold flex items-center gap-2">
          <BookOpen size={26} className="text-accent" />
          Tea Wiki
        </h1>
        <p className="text-muted text-sm mt-1">
          A growing reference for tea brewing methods, pouring techniques, accessories, and the making of tea.
        </p>
      </div>

      {/* Category selector — top-level pushable buttons */}
      <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-1">
        {WIKI_CATEGORIES.map((cat) => {
          const Icon = getIcon(cat.icon);
          const active = categorySlug === cat.slug && !entrySlug;
          const activeCat = categorySlug === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => selectCategory(cat.slug)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border flex-shrink-0"
              style={{
                backgroundColor: activeCat ? "var(--accent)" : "transparent",
                color: activeCat ? "#fff" : "var(--muted)",
                borderColor: activeCat ? "var(--accent)" : "var(--border)",
                opacity: entrySlug && !activeCat ? 0.5 : 1,
              }}
            >
              <Icon size={16} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content area: either entry list or entry detail */}
      <AnimatePresence mode="wait">
        {entry ? (
          <EntryDetail key={`${categorySlug}-${entrySlug}`} entry={entry} onBack={goBack} />
        ) : (
          <EntryList key={categorySlug} category={category} onSelect={selectEntry} />
        )}
      </AnimatePresence>
    </div>
  );
}