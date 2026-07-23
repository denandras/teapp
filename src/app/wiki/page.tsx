"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BREWING_STYLES, BrewingStyle } from "@/data/brewingStyles";
import {
  Award,
  Coffee,
  GlassWater,
  Snowflake,
  Thermometer,
  Clock,
  Scale,
  Repeat,
  CupSoda,
  ChevronDown,
  Lightbulb,
  Check,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Award,
  Coffee,
  GlassWater,
  Snowflake,
};

export default function WikiPage() {
  const [selectedSlug, setSelectedSlug] = useState<string>(BREWING_STYLES[0].slug);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const selected = BREWING_STYLES.find((s) => s.slug === selectedSlug)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold">Brewing Guide</h1>
        <p className="text-muted text-sm mt-1">
          Learn different tea brewing styles — from gongfu to cold brew. Find the method that suits your tea and mood.
        </p>
      </div>

      {/* Style selector tabs */}
      <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-1">
        {BREWING_STYLES.map((style) => {
          const Icon = iconMap[style.icon] || CupSoda;
          const active = selectedSlug === style.slug;
          return (
            <button
              key={style.slug}
              onClick={() => {
                setSelectedSlug(style.slug);
                setExpandedStep(null);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border flex-shrink-0"
              style={{
                backgroundColor: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "var(--muted)",
                borderColor: active ? "var(--accent)" : "var(--border)",
              }}
            >
              <Icon size={16} />
              <span>{style.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.slug}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Title + description */}
          <div className="rounded-2xl border p-5 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-start gap-3 mb-3">
              {(() => {
                const Icon = iconMap[selected.icon] || CupSoda;
                return <Icon size={28} className="text-accent flex-shrink-0 mt-0.5" />;
              })()}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold">{selected.name}</h2>
                  {selected.original_name && (
                    <span className="font-serif text-lg text-muted">{selected.original_name}</span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted">{selected.description}</p>
            {/* Best for */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-xs text-muted uppercase tracking-wide font-semibold">Best for:</span>
              {selected.best_for.map((b) => (
                <span
                  key={b}
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: "var(--accent)" + "20", color: "var(--accent)" }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="rounded-2xl border p-5 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Brewing Parameters</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ParamCard icon={Scale} label="Leaf-to-Water" value={selected.parameters.leaf_to_water} />
              <ParamCard icon={Thermometer} label="Water Temp" value={selected.parameters.water_temp_c} />
              <ParamCard icon={Clock} label="Steep Time" value={selected.parameters.steep_time} />
              <ParamCard icon={Repeat} label="Infusions" value={selected.parameters.num_brews} />
              <ParamCard icon={CupSoda} label="Vessel" value={selected.parameters.vessel} />
            </div>
          </div>

          {/* Steps */}
          <div className="rounded-2xl border p-5 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Step-by-Step</h3>
            <div className="space-y-2">
              {selected.steps.map((step, i) => {
                const expanded = expandedStep === i;
                return (
                  <div
                    key={i}
                    className="rounded-lg border transition-colors"
                    style={{
                      backgroundColor: expanded ? "var(--bg)" : "transparent",
                      borderColor: expanded ? "var(--border)" : "transparent",
                    }}
                  >
                    <button
                      onClick={() => setExpandedStep(expanded ? null : i)}
                      className="w-full flex items-start gap-3 p-3 text-left"
                    >
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: "var(--accent)" + "20", color: "var(--accent)" }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed flex-1 pt-0.5">
                        {step}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-muted flex-shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border p-5 sm:p-6 paper-card" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-accent" />
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Tips for Beginners</h3>
            </div>
            <ul className="space-y-2.5">
              {selected.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <Check size={15} className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ParamCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={15} className="text-accent" />
        <span className="text-xs text-muted uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}