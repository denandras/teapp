"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, Save, Trash2, Thermometer, Clock, Repeat, MapPin, Star, Heart, Coffee, AlertTriangle } from "lucide-react";
import { Tea, TeaStatus, TeaLog, CAFFEINE_LABELS } from "@/lib/types";
import { useTeaStore } from "@/lib/store";
import StatusCheckbox from "./StatusCheckbox";

interface Props {
  tea: Tea;
  onClose: () => void;
}

const EMPTY_LOGS: TeaLog[] = [];

function StarRating({ rating, onChange, size = 18, interactive = true }: {
  rating: number;
  onChange?: (r: number) => void;
  size?: number;
  interactive?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hover || rating) >= star;
        return (
          <motion.button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            whileTap={interactive ? { scale: 0.8 } : {}}
          >
            <motion.div
              animate={{ scale: filled ? 1 : 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Star
                size={size}
                className={filled ? "text-accent" : "text-muted"}
                fill={filled ? "var(--accent)" : "none"}
                strokeWidth={1.5}
              />
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
}

function CaffeineMeter({ level, onChange, editing }: { level: number; onChange?: (n: number) => void; editing?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <motion.div
            key={n}
            animate={{ backgroundColor: n <= level ? "#c4853f" : "var(--border)" }}
            transition={{ duration: 0.2 }}
            className="w-3 h-5 rounded-sm"
            style={{ cursor: editing ? "pointer" : "default" }}
            onClick={() => editing && onChange?.(n)}
          />
        ))}
      </div>
      <span className="text-xs text-muted">{CAFFEINE_LABELS[level] || "Unknown"}</span>
    </div>
  );
}

export default function TeaDetailModal({ tea, onClose }: Props) {
  const [editing, setEditing] = useState(false);
  const [editedTea, setEditedTea] = useState(tea);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logRating, setLogRating] = useState(0);
  const [logNote, setLogNote] = useState("");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editLogRating, setEditLogRating] = useState(0);
  const [editLogNote, setEditLogNote] = useState("");

  const teaStatus = useTeaStore((s) => s.teaStates[tea.slug] || "empty");
  const cycleTeaStatus = useTeaStore((s) => s.cycleTeaStatus);
  const teaLogs = useTeaStore((s) => s.teaLogs[tea.slug]) || EMPTY_LOGS;
  const addTeaLog = useTeaStore((s) => s.addTeaLog);
  const editTeaLog = useTeaStore((s) => s.editTeaLog);
  const deleteTeaLog = useTeaStore((s) => s.deleteTeaLog);
  const hideTea = useTeaStore((s) => s.hideTea);
  const removeCustomTea = useTeaStore((s) => s.removeCustomTea);

  // Parse caffeine level string to number
  const caffeineNum = useMemo(() => {
    const c = (editing ? editedTea.caffeine_level : tea.caffeine_level || "").toLowerCase();
    if (c.includes("very high") || c === "5") return 5;
    if (c.includes("high") || c === "4") return 4;
    if (c.includes("medium") || c.includes("moderate") || c === "3") return 3;
    if (c.includes("low") || c === "2") return 2;
    if (c.includes("very low") || c === "1") return 1;
    if (c.includes("none") || c.includes("no") || c.includes("decaf") || c === "0") return 0;
    return 3;
  }, [tea.caffeine_level, editedTea.caffeine_level, editing]);

  const avgRating = useMemo(() => {
    if (teaLogs.length === 0) return null;
    return teaLogs.reduce((acc, log) => acc + log.rating, 0) / teaLogs.length;
  }, [teaLogs]);

  const handleSave = () => {
    setEditing(false);
    // For database teas: no persistence (read-only data)
    // For custom teas: could wire up but currently custom teas use a different store shape
    // The edit is visual only for database teas
  };

  const handleDelete = () => {
    if (tea.is_custom) {
      // Try to find matching custom tea and remove
      const customTeas = useTeaStore.getState().customTeas;
      const match = customTeas.find(ct => `custom-${ct.id}` === tea.slug);
      if (match) removeCustomTea(match.id);
    } else {
      hideTea(tea.slug);
    }
    onClose();
  };

  const handleAddLog = () => {
    if (logRating === 0) return;
    addTeaLog(tea.slug, logRating, logNote.trim());
    setLogRating(0);
    setLogNote("");
  };

  const handleEditLog = (log: TeaLog) => {
    editTeaLog(tea.slug, log.id, editLogRating, editLogNote.trim());
    setEditingLogId(null);
  };

  const startEditLog = (log: TeaLog) => {
    setEditingLogId(log.id);
    setEditLogRating(log.rating);
    setEditLogNote(log.note);
  };

  const formatDate = (ts: string) => {
    try {
      return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return ts;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm !mt-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl paper-card"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Delete confirmation dialog */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-2xl"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="rounded-xl border p-6 max-w-sm mx-4 text-center"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
                  <h3 className="font-semibold text-lg mb-2">Delete this tea?</h3>
                  <p className="text-sm text-muted mb-4">
                    {tea.is_custom
                      ? "This custom tea will be permanently deleted."
                      : "This tea will be hidden from your view. You can restore it later."}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-lg text-sm border transition-colors"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: "#c44a3f", color: "#fff" }}
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="sticky top-0 z-10 flex items-start justify-between p-6 border-b paper-header"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <motion.div
                className="w-12 h-12 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: (editing ? editedTea.color_hex : tea.color_hex) || "#999", boxShadow: `0 0 20px ${(editing ? editedTea.color_hex : tea.color_hex) || "#999"}40` }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-serif font-bold">
                  {editing ? (
                    <input
                      value={editedTea.name}
                      onChange={(e) => setEditedTea({ ...editedTea, name: e.target.value })}
                      className="bg-transparent border-b w-full"
                      style={{ borderColor: "var(--border)" }}
                    />
                  ) : (tea.name || "Unknown Tea")}
                </h2>
                {editing ? (
                  <div className="mt-1 space-y-1">
                    <input
                      value={editedTea.chinese_name}
                      onChange={(e) => setEditedTea({ ...editedTea, chinese_name: e.target.value })}
                      placeholder="Chinese name"
                      className="font-serif text-lg bg-transparent border-b w-full"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <input
                      value={editedTea.phonetic_name}
                      onChange={(e) => setEditedTea({ ...editedTea, phonetic_name: e.target.value })}
                      placeholder="Phonetic name"
                      className="text-sm text-muted bg-transparent border-b w-full"
                      style={{ borderColor: "var(--border)" }}
                    />
                  </div>
                ) : (
                  (tea.chinese_name || tea.phonetic_name) && (
                    <p className="text-muted text-sm mt-1">
                      {tea.chinese_name && <span className="font-serif text-lg">{tea.chinese_name}</span>}
                      {tea.chinese_name && tea.phonetic_name && " · "}
                      {tea.phonetic_name && <span>{tea.phonetic_name}</span>}
                    </p>
                  )
                )}

                {/* Brewing badges - inline right after name, before description */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: (editing ? editedTea.color_hex : tea.color_hex) + "30", color: (editing ? editedTea.color_hex : tea.color_hex) }}
                  >
                    {(editing ? editedTea.tea_type : tea.tea_type) || "unknown"}
                  </span>
                  {/* Brewing inline badges */}
                  {(editing ? editedTea.brewing_temp_c : tea.brewing_temp_c) != null && (
                    <span className="flex items-center gap-1 text-xs text-muted px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg)" }}>
                      <Thermometer size={12} className="text-accent" />
                      {editing ? (
                        <input
                          type="number"
                          value={editedTea.brewing_temp_c ?? ""}
                          onChange={(e) => setEditedTea({ ...editedTea, brewing_temp_c: e.target.value ? Number(e.target.value) : null })}
                          className="w-12 bg-transparent border-b text-xs"
                          style={{ borderColor: "var(--border)" }}
                        />
                      ) : tea.brewing_temp_c}
                      °C
                    </span>
                  )}
                  {(editing ? editedTea.brewing_time_min : tea.brewing_time_min) != null && (
                    <span className="flex items-center gap-1 text-xs text-muted px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg)" }}>
                      <Clock size={12} className="text-accent" />
                      {editing ? (
                        <input
                          type="number"
                          value={editedTea.brewing_time_min ?? ""}
                          onChange={(e) => setEditedTea({ ...editedTea, brewing_time_min: e.target.value ? Number(e.target.value) : null })}
                          className="w-12 bg-transparent border-b text-xs"
                          style={{ borderColor: "var(--border)" }}
                        />
                      ) : tea.brewing_time_min}
                      min
                    </span>
                  )}
                  {(editing ? editedTea.brewing_num_brews : tea.brewing_num_brews) > 1 && (
                    <span className="flex items-center gap-1 text-xs text-muted px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg)" }}>
                      <Repeat size={12} className="text-accent" />
                      {editing ? (
                        <input
                          type="number"
                          value={editedTea.brewing_num_brews ?? 1}
                          onChange={(e) => setEditedTea({ ...editedTea, brewing_num_brews: e.target.value ? Number(e.target.value) : 1 })}
                          className="w-10 bg-transparent border-b text-xs"
                          style={{ borderColor: "var(--border)" }}
                        />
                      ) : tea.brewing_num_brews}
                      × brews
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
                  title="Save"
                >
                  <Save size={18} />
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg)" }}>
              <span className="text-sm text-muted">Your collection:</span>
              <StatusCheckbox slug={tea.slug} status={teaStatus} onCycle={() => cycleTeaStatus(tea.slug)} />
              {avgRating !== null && (
                <div className="flex items-center gap-1 ml-auto">
                  <Star size={14} fill="var(--accent)" className="text-accent" />
                  <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-muted">({teaLogs.length})</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Description</h3>
              {editing ? (
                <textarea
                  value={editedTea.description}
                  onChange={(e) => setEditedTea({ ...editedTea, description: e.target.value })}
                  className="w-full bg-transparent border rounded-lg p-2 text-sm"
                  style={{ borderColor: "var(--border)" }}
                  rows={4}
                />
              ) : (
                <p className="text-sm leading-relaxed">{tea.description || "No description available."}</p>
              )}
            </div>

            {/* Caffeine */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Caffeine</h3>
              <CaffeineMeter
                level={caffeineNum}
                onChange={(n) => setEditedTea({ ...editedTea, caffeine_level: CAFFEINE_LABELS[n] })}
                editing={editing}
              />
            </div>

            {/* Origin */}
            {(editing || tea.origin) && (
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Origin</h3>
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin size={14} className="text-accent" />
                  {editing ? (
                    <input
                      value={editedTea.origin}
                      onChange={(e) => setEditedTea({ ...editedTea, origin: e.target.value })}
                      className="bg-transparent border-b w-full"
                      style={{ borderColor: "var(--border)" }}
                    />
                  ) : (
                    <span>{tea.origin || "Unknown"}</span>
                  )}
                </div>
              </div>
            )}

            {/* Characteristics */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Flavor Profile</h3>
              {editing ? (
                <input
                  value={editedTea.characteristics.join(", ")}
                  onChange={(e) => setEditedTea({ ...editedTea, characteristics: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-transparent border rounded-lg p-2 text-sm"
                  style={{ borderColor: "var(--border)" }}
                  placeholder="Floral, Sweet, Umami"
                />
              ) : tea.characteristics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tea.characteristics.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-1 rounded-full text-xs"
                      style={{ backgroundColor: (tea.color_hex || "#999") + "20", color: tea.color_hex || "#999" }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No flavor notes available.</p>
              )}
            </div>

            {/* Health Benefits */}
            {(editing || tea.health_benefits.length > 0) && (
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Health Benefits</h3>
                {editing ? (
                  <input
                    value={editedTea.health_benefits.join(", ")}
                    onChange={(e) => setEditedTea({ ...editedTea, health_benefits: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                    className="w-full bg-transparent border rounded-lg p-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                    placeholder="Rich in Antioxidants, Improves Focus"
                  />
                ) : tea.health_benefits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tea.health_benefits.map((h) => (
                      <span
                        key={h}
                        className="px-2.5 py-1 rounded-full text-xs text-muted"
                        style={{ backgroundColor: "var(--bg)" }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Flavor chart position */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Flavor Position</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--bg)" }}>
                  <p className="text-xs text-muted">Roast Aroma</p>
                  <p className="text-lg font-bold text-accent">{editing ? (
                    <input
                      type="number"
                      value={editedTea.flavor_x ?? 50}
                      onChange={(e) => setEditedTea({ ...editedTea, flavor_x: Number(e.target.value) })}
                      className="w-16 bg-transparent border-b text-center"
                      style={{ borderColor: "var(--border)" }}
                    />
                  ) : (tea.flavor_x ?? 50)}/100</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--bg)" }}>
                  <p className="text-xs text-muted">Bitterness</p>
                  <p className="text-lg font-bold text-accent">{editing ? (
                    <input
                      type="number"
                      value={editedTea.flavor_y ?? 50}
                      onChange={(e) => setEditedTea({ ...editedTea, flavor_y: Number(e.target.value) })}
                      className="w-16 bg-transparent border-b text-center"
                      style={{ borderColor: "var(--border)" }}
                    />
                  ) : (tea.flavor_y ?? 50)}/100</p>
                </div>
              </div>
            </div>

            {/* Brewing instructions */}
            {(editing || tea.brewing_instructions) && (
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Brewing Instructions</h3>
                {editing ? (
                  <textarea
                    value={editedTea.brewing_instructions}
                    onChange={(e) => setEditedTea({ ...editedTea, brewing_instructions: e.target.value })}
                    className="w-full bg-transparent border rounded-lg p-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm leading-relaxed">{tea.brewing_instructions || "No specific instructions."}</p>
                )}
              </div>
            )}

            {/* Drinking Logs */}
            <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Drinking Log</h3>

              {/* Add new log form */}
              <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: "var(--bg)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={logRating} onChange={setLogRating} />
                  <input
                    type="text"
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 bg-transparent border-b text-sm"
                    style={{ borderColor: "var(--border)" }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddLog()}
                  />
                  <button
                    onClick={handleAddLog}
                    disabled={logRating === 0}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Log list */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <AnimatePresence>
                  {teaLogs.length === 0 ? (
                    <p className="text-sm text-muted text-center py-4">No logs yet. Rate this tea to start your journal!</p>
                  ) : (
                    teaLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="rounded-lg p-3 flex items-start gap-3"
                        style={{ backgroundColor: "var(--bg)" }}
                      >
                        {editingLogId === log.id ? (
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <StarRating rating={editLogRating} onChange={setEditLogRating} />
                              <input
                                type="text"
                                value={editLogNote}
                                onChange={(e) => setEditLogNote(e.target.value)}
                                className="flex-1 bg-transparent border-b text-sm"
                                style={{ borderColor: "var(--border)" }}
                                autoFocus
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditLog(log)}
                                className="px-2 py-1 rounded text-xs"
                                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingLogId(null)}
                                className="px-2 py-1 rounded text-xs text-muted"
                                style={{ border: "1px solid var(--border)" }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-shrink-0">
                              <StarRating rating={log.rating} interactive={false} size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              {log.note && <p className="text-sm">{log.note}</p>}
                              <p className="text-xs text-muted mt-0.5">{formatDate(log.timestamp)}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => startEditLog(log)}
                                className="p-1 rounded hover:bg-accent/10 text-muted hover:text-accent transition-colors"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => deleteTeaLog(tea.slug, log.id)}
                                className="p-1 rounded hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
      </motion.div>
    </div>
  );
}