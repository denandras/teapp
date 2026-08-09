"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowLeft,
  Thermometer,
  Clock,
  Repeat,
  Palette,
  ShieldAlert,
  Coffee,
} from "lucide-react";
import { useTeaStore } from "@/lib/store";
import {
  TEA_TYPE_COLORS,
  TEA_TYPE_LABELS,
  ALL_TEA_TYPES,
  CAFFEINE_LABELS,
} from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { isApprovedTeahouse, isAdmin } from "@/lib/profiles";

const CAFFEINE_LEVELS = [0, 1, 2, 3, 4, 5];
const PRESET_SWATCHES = ["#7BA05B", "#C8C4B0", "#8B4513", "#D4852A", "#6B4226", "#E6C84E", "#C0856A", "#B07D56"];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "tea";
}

function randomHash(len = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-semibold text-muted uppercase tracking-wide block mb-2">
      {children}
    </label>
  );
}

const inputStyle = {
  backgroundColor: "var(--card)",
  borderColor: "var(--border)",
  color: "var(--text)",
} as React.CSSProperties;

function TextInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors focus:border-accent ${props.className || ""}`}
      style={{ ...inputStyle, ...(props.style || {}) }}
    />
  );
}

function TextArea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-2.5 rounded-lg border outline-none resize-none transition-colors focus:border-accent ${props.className || ""}`}
      style={{ ...inputStyle, ...(props.style || {}) }}
    />
  );
}

function RangeSlider({
  label,
  left,
  right,
  value,
  onChange,
}: {
  label: string;
  left: string;
  right: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
        style={{ accentColor: "var(--accent)" }}
      />
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[11px] text-muted">{left}</span>
        <span className="text-[11px] text-muted">{right}</span>
      </div>
    </div>
  );
}

export default function AddTeaPage() {
  const router = useRouter();
  const addCustomTea = useTeaStore((s) => s.addCustomTea);
  const allTeas = useTeaStore((s) => s.allTeas);
  const { profile, isDemo } = useAuth();

  const isTeahouse = profile?.profile_type === "teahouse";
  const isApproved = isApprovedTeahouse(profile);
  const teahouseLocked = isTeahouse && isApproved;
  const adminUser = isAdmin(profile);

  // Admin can choose to create as "default" (global, public, no owner) or
  // "custom" (owned by admin's user account). Teahouses always create as
  // teahouse teas. Regular users always create as user teas.
  const [adminCreateAs, setAdminCreateAs] = useState<"default" | "user">("default");

  const [name, setName] = useState("");
  const [phonetic_name, setPhoneticName] = useState("");
  const [original_name, setOriginalName] = useState("");
  const [description, setDescription] = useState("");
  const [tea_type, setTeaType] = useState("blend");
  const [category, setCategory] = useState("");
  const [origin, setOrigin] = useState("");
  const [caffeineIndex, setCaffeineIndex] = useState(3);
  const [brewing_temp_c, setBrewingTempC] = useState("");
  const [brewing_time_min, setBrewingTimeMin] = useState("");
  const [brewing_num_brews, setBrewingNumBrews] = useState("1");
  const [brewing_instructions, setBrewingInstructions] = useState("");
  const [characteristics, setCharacteristics] = useState("");
  const [health_benefits, setHealthBenefits] = useState("");
  const [color_hex, setColorHex] = useState("#7BA05B");
  const [flavor_x, setFlavorX] = useState(50);
  const [flavor_y, setFlavorY] = useState(50);
  const [source, setSource] = useState("");
  const [success, setSuccess] = useState(false);
  const [nameBlurred, setNameBlurred] = useState(false);

  const sourceType: "default" | "user" | "teahouse" = adminUser ? adminCreateAs : isTeahouse ? "teahouse" : "user";
  const sourceLockedValue = isTeahouse ? (profile?.teahouse_name || "") : "";

  // Case-insensitive dedup check: warn if a tea with the same name already exists
  // from a different source. The dedup key is (name + source_type + source), so
  // this is only a warning — multiple same-named teas from different sources are valid.
  const duplicateTeas = name.trim()
    ? allTeas.filter((t) => t.name?.trim().toLowerCase() === name.trim().toLowerCase())
    : [];
  const duplicateSources = Array.from(
    new Set(
      duplicateTeas
        .map((t) => t.source || (t.source_type === "teahouse" ? "teahouse" : "Teapp"))
        .filter(Boolean)
    )
  );
  const showDupWarning = nameBlurred && duplicateTeas.length > 0 && name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const effectiveSource = isTeahouse ? sourceLockedValue : source.trim();
    const slug = `${slugify(name)}-${sourceType}-${randomHash()}`;

    addCustomTea({
      name: name.trim(),
      slug,
      phonetic_name: phonetic_name.trim(),
      original_name: original_name.trim(),
      description: description.trim(),
      origin: origin.trim(),
      tea_type,
      category: category.trim(),
      caffeine_level: CAFFEINE_LABELS[caffeineIndex],
      brewing_temp_c: brewing_temp_c,
      brewing_time_min: brewing_time_min,
      brewing_num_brews: Number(brewing_num_brews) || 1,
      brewing_instructions: brewing_instructions.trim(),
      characteristics: characteristics.split(",").map((s) => s.trim()).filter(Boolean),
      health_benefits: health_benefits.split(",").map((s) => s.trim()).filter(Boolean),
      color_hex,
      flavor_x,
      flavor_y,
      source: effectiveSource,
      source_type: sourceType,
      is_public: sourceType === "default" ? true : isTeahouse,
      is_custom: sourceType !== "default",
    });

    setSuccess(true);
    setTimeout(() => router.push("/database"), 1500);
  };

  // Demo users cannot add teas — read-only mode (admins bypass this)
  if (isDemo && !adminUser) {
    return (
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="rounded-2xl border p-8 text-center"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-serif font-bold">Add Tea</h1>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "var(--bg)" }}
          >
            <Coffee size={28} style={{ color: "var(--muted)" }} />
          </motion.div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Demo mode is read-only. Sign up to add your own teas and build your collection.
          </p>
        </motion.div>
      </div>
    );
  }

  // Teahouse whose enrollment is pending or rejected → block the form.
  // Admins bypass this check.
  if (isTeahouse && !isApproved && !adminUser) {
    return (
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="rounded-2xl border p-8 text-center"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-serif font-bold">Add Tea</h1>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "var(--bg)" }}
          >
            <ShieldAlert size={28} style={{ color: "var(--muted)" }} />
          </motion.div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Your teahouse enrollment is pending approval. You can browse teas but cannot add
            teahouse teas until approved.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => router.push("/")}
          className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif font-bold">Add Tea</h1>
          <p className="text-muted text-sm mt-1">
            {adminUser
              ? "Create a new tea entry in the database."
              : isTeahouse
                ? "Publish a tea to your teahouse catalogue."
                : "Can't find it in the database? Add your own."}
          </p>
        </div>
      </motion.div>

      {/* Admin source type toggle */}
      {adminUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-xs font-semibold text-muted uppercase tracking-wide mr-1">Create as:</span>
          <button
            type="button"
            onClick={() => setAdminCreateAs("default")}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
            style={{
              backgroundColor: adminCreateAs === "default" ? "var(--accent)" : "transparent",
              color: adminCreateAs === "default" ? "#fff" : "var(--muted)",
              borderColor: adminCreateAs === "default" ? "var(--accent)" : "var(--border)",
            }}
          >
            Default (global)
          </button>
          <button
            type="button"
            onClick={() => setAdminCreateAs("user")}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
            style={{
              backgroundColor: adminCreateAs === "user" ? "var(--accent)" : "transparent",
              color: adminCreateAs === "user" ? "#fff" : "var(--muted)",
              borderColor: adminCreateAs === "user" ? "var(--accent)" : "var(--border)",
            }}
          >
            Custom (my own)
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border p-4 text-center"
            style={{ backgroundColor: "#7BA05B20", borderColor: "#7BA05B" }}
          >
            <p className="text-sm font-medium" style={{ color: "#7BA05B" }}>
              Tea added! Redirecting to database...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Name */}
        <div>
          <SectionLabel>Name *</SectionLabel>
          <TextInput
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setNameBlurred(true)}
            placeholder="e.g. Dong Ding Oolong"
          />
          {showDupWarning && (
            <div
              className="mt-2 rounded-lg border px-3 py-2.5 text-sm"
              style={{ backgroundColor: "#E6C84E20", borderColor: "#E6C84E" }}
            >
              <p style={{ color: "#b8860b" }}>
                A tea called <span className="font-medium">&ldquo;{name.trim()}&rdquo;</span> already
                exists from {duplicateSources.join(", ")}. Yours will appear separately with your
                source.
              </p>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Phonetic name */}
          <div>
            <SectionLabel>Phonetic Name</SectionLabel>
            <TextInput
              value={phonetic_name}
              onChange={(e) => setPhoneticName(e.target.value)}
              placeholder="e.g. Dong Ding"
            />
          </div>
          {/* Original name */}
          <div>
            <SectionLabel>Original Name</SectionLabel>
            <TextInput
              value={original_name}
              onChange={(e) => setOriginalName(e.target.value)}
              placeholder="e.g. 凍頂烏龍茶"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <SectionLabel>Description</SectionLabel>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What makes this tea special?"
            rows={3}
          />
        </div>

        {/* Tea Type */}
        <div>
          <SectionLabel>Tea Type</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {ALL_TEA_TYPES.map((type) => (
              <motion.button
                key={type}
                type="button"
                onClick={() => {
                  setTeaType(type);
                  setColorHex(TEA_TYPE_COLORS[type] || "#999");
                }}
                whileTap={{ scale: 0.94 }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                style={{
                  backgroundColor: tea_type === type ? TEA_TYPE_COLORS[type] : "transparent",
                  color: tea_type === type ? "#fff" : "var(--muted)",
                  borderColor: tea_type === type ? TEA_TYPE_COLORS[type] : "var(--border)",
                }}
              >
                {TEA_TYPE_LABELS[type]}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <SectionLabel>Category</SectionLabel>
          <TextInput
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. True Tea, Blend, Tisane (Herbal Tea)"
          />
        </div>

        {/* Origin */}
        <div>
          <SectionLabel>Origin</SectionLabel>
          <TextInput
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. Taiwan"
          />
        </div>

        {/* Caffeine segmented control */}
        <div>
          <SectionLabel>Caffeine Level</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {CAFFEINE_LEVELS.map((n) => (
              <motion.button
                key={n}
                type="button"
                onClick={() => setCaffeineIndex(n)}
                whileTap={{ scale: 0.94 }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                style={{
                  backgroundColor: caffeineIndex === n ? "#c4853f" : "transparent",
                  color: caffeineIndex === n ? "#fff" : "var(--muted)",
                  borderColor: caffeineIndex === n ? "#c4853f" : "var(--border)",
                }}
              >
                {CAFFEINE_LABELS[n]}
              </motion.button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Coffee size={14} style={{ color: "var(--muted)" }} />
            <div className="flex items-center gap-1">
              {CAFFEINE_LEVELS.map((n) => (
                <motion.div
                  key={n}
                  animate={{ backgroundColor: n <= caffeineIndex ? "#c4853f" : "var(--border)" }}
                  transition={{ duration: 0.2 }}
                  className="w-3 h-5 rounded-sm"
                />
              ))}
            </div>
            <span className="text-xs text-muted">{CAFFEINE_LABELS[caffeineIndex]}</span>
          </div>
        </div>

        {/* Brewing */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <SectionLabel>
              <span className="inline-flex items-center gap-1"><Thermometer size={12} /> Temp (°C)</span>
            </SectionLabel>
            <TextInput
              type="number"
              value={brewing_temp_c}
              onChange={(e) => setBrewingTempC(e.target.value)}
              placeholder="e.g. 90"
            />
          </div>
          <div>
            <SectionLabel>
              <span className="inline-flex items-center gap-1"><Clock size={12} /> Time (min)</span>
            </SectionLabel>
            <TextInput
              type="number"
              value={brewing_time_min}
              onChange={(e) => setBrewingTimeMin(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
          <div>
            <SectionLabel>
              <span className="inline-flex items-center gap-1"><Repeat size={12} /> Brews</span>
            </SectionLabel>
            <TextInput
              type="number"
              min={1}
              value={brewing_num_brews}
              onChange={(e) => setBrewingNumBrews(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        {/* Brewing instructions */}
        <div>
          <SectionLabel>Brewing Instructions</SectionLabel>
          <TextArea
            value={brewing_instructions}
            onChange={(e) => setBrewingInstructions(e.target.value)}
            placeholder="e.g. Rinse leaves, steep 3 min with water at 90°C..."
            rows={2}
          />
        </div>

        {/* Characteristics */}
        <div>
          <SectionLabel>Characteristics / Flavor Notes (comma-separated)</SectionLabel>
          <TextInput
            value={characteristics}
            onChange={(e) => setCharacteristics(e.target.value)}
            placeholder="e.g. Floral, Sweet, Umami"
          />
        </div>

        {/* Health benefits */}
        <div>
          <SectionLabel>Health Benefits (comma-separated)</SectionLabel>
          <TextInput
            value={health_benefits}
            onChange={(e) => setHealthBenefits(e.target.value)}
            placeholder="e.g. Antioxidants, Aids digestion"
          />
        </div>

        {/* Color */}
        <div>
          <SectionLabel>
            <span className="inline-flex items-center gap-1"><Palette size={12} /> Color</span>
          </SectionLabel>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color_hex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-10 h-10 rounded-lg border cursor-pointer"
              style={{ backgroundColor: color_hex, borderColor: "var(--border)" }}
            />
            <span className="text-xs font-mono text-muted">{color_hex}</span>
            <div className="flex items-center gap-1.5 flex-wrap ml-1">
              {PRESET_SWATCHES.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setColorHex(c)}
                  className="w-6 h-6 rounded-full border"
                  style={{
                    backgroundColor: c,
                    borderColor: color_hex === c ? "var(--text)" : "var(--border)",
                    boxShadow: color_hex === c ? `0 0 0 2px ${c}40` : "none",
                  }}
                  aria-label={`Set color to ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Flavor profile sliders */}
        <div className="space-y-5 rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <RangeSlider label="Flavor" left="Fresh" right="Roasted" value={flavor_x} onChange={setFlavorX} />
          <RangeSlider label="Taste" left="Bitter" right="Sweet" value={flavor_y} onChange={setFlavorY} />
        </div>

        {/* Source */}
        <div>
          <SectionLabel>Source</SectionLabel>
          <TextInput
            value={isTeahouse ? sourceLockedValue : source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={isTeahouse ? "" : adminUser && adminCreateAs === "default" ? "Teapp" : "e.g. Your Tea Shop"}
            disabled={isTeahouse}
            style={isTeahouse ? { ...inputStyle, opacity: 0.6, cursor: "not-allowed" } : inputStyle}
          />
          <p className="text-xs text-muted mt-1.5">
            {isTeahouse
              ? "Locked to your teahouse name."
              : adminUser && adminCreateAs === "default"
                ? "Default teas show \u201cTeapp\u201d as the source to all users."
                : "This is the source visible to other users."}
          </p>
        </div>

        <motion.button
          type="submit"
          disabled={!name.trim()}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          <Plus size={18} />
          {adminUser
            ? adminCreateAs === "default" ? "Add Default Tea" : "Add Custom Tea"
            : isTeahouse ? "Publish Tea" : "Add Tea"}
        </motion.button>
      </motion.form>
    </div>
  );
}
