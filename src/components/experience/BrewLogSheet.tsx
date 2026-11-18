"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Tea, TeaLog } from "@/lib/types";
import { formatClock, sessionPayload, type BrewSession } from "@/lib/brew/session";

interface BrewLogSheetProps {
  tea: Tea;
  session: BrewSession;
  now: number;
  previous: TeaLog[];
  saving: boolean;
  savedLocally: boolean;
  onSave: (rating: number, note: string) => void;
  onCancel: () => void;
}

const RATINGS = [1, 2, 3, 4, 5];

export default function BrewLogSheet({
  tea,
  session,
  now,
  previous,
  saving,
  savedLocally,
  onSave,
  onCancel,
}: BrewLogSheetProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const payload = sessionPayload(session, now);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full max-w-[560px] mx-auto rounded-2xl border p-5"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Session
          </p>
          <h3 className="font-serif text-lg mt-0.5">{tea.name}</h3>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            {payload.brews} steep{payload.brews === 1 ? "" : "s"} · {formatClock(payload.duration_s)} total
            {payload.steep_s.length > 0 && (
              <> · {payload.steep_s.map((s) => formatClock(s)).join(" / ")}</>
            )}
          </p>
        </div>
        <button
          onClick={onCancel}
          aria-label="Back to the timer"
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--muted)" }}
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
        Rating
      </p>
      <div className="flex gap-2 mb-4">
        {RATINGS.map((r) => (
          <button
            key={r}
            onClick={() => setRating(r)}
            aria-pressed={rating === r}
            className="flex-1 h-10 rounded-lg border text-sm transition-colors"
            style={{
              borderColor: rating === r ? "var(--accent)" : "var(--border)",
              backgroundColor: rating === r ? "var(--accent)" : "transparent",
              color: rating === r ? "var(--bg)" : "var(--text)",
              fontWeight: rating === r ? 600 : 400,
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="How was it?"
        rows={3}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
        style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
      />

      <button
        onClick={() => rating !== null && onSave(rating, note.trim())}
        disabled={rating === null || saving}
        className="w-full h-11 rounded-xl mt-4 text-sm font-medium transition-opacity"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--bg)",
          opacity: rating === null || saving ? 0.45 : 1,
          cursor: rating === null || saving ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "Saving…" : savedLocally ? "Saved on this device — will sync" : "Save session"}
      </button>

      {previous.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
            Earlier sessions
          </p>
          <div className="max-h-48 overflow-y-auto pr-1">
            {previous.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="flex items-baseline gap-3 py-2 border-t text-xs"
                style={{ borderColor: "var(--border)" }}
              >
                <span style={{ color: "var(--muted)", minWidth: 74 }}>
                  {new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </span>
                <span style={{ color: "var(--accent)", minWidth: 28 }}>{log.rating}★</span>
                <span className="flex-1" style={{ color: "var(--text)" }}>
                  {log.note || <span style={{ color: "var(--muted)" }}>no note</span>}
                </span>
                {log.brews ? (
                  <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {log.brews}× · {formatClock(log.duration_s ?? 0)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
