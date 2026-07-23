"use client";

import { useState } from "react";
import { X, Edit, Save, Thermometer, Clock, MapPin, Coffee, Heart, Droplet } from "lucide-react";
import { Tea, TeaStatus } from "@/lib/types";
import { useTeaStore } from "@/lib/store";
import StatusCheckbox from "./StatusCheckbox";

interface Props {
  tea: Tea;
  onClose: () => void;
}

export default function TeaDetailModal({ tea, onClose }: Props) {
  const [editing, setEditing] = useState(false);
  const [editedTea, setEditedTea] = useState(tea);
  const teaStatus = useTeaStore((s) => s.teaStates[tea.slug] || "empty");
  const cycleTeaStatus = useTeaStore((s) => s.cycleTeaStatus);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-6 border-b"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-start gap-4 flex-1">
            <div
              className="w-12 h-12 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: tea.color_hex, boxShadow: `0 0 20px ${tea.color_hex}40` }}
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
                ) : tea.name}
              </h2>
              {(tea.chinese_name || tea.phonetic_name) && !editing && (
                <p className="text-muted text-sm mt-1">
                  {tea.chinese_name && <span className="font-serif text-lg">{tea.chinese_name}</span>}
                  {tea.chinese_name && tea.phonetic_name && " · "}
                  {tea.phonetic_name && <span>{tea.phonetic_name}</span>}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: tea.color_hex + "30", color: tea.color_hex }}
                >
                  {tea.tea_type}
                </span>
                {tea.caffeine_level && (
                  <span className="px-2 py-0.5 rounded-full text-xs text-muted"
                    style={{ backgroundColor: "var(--border)" }}
                  >
                    {tea.caffeine_level} caffeine
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
              >
                <Edit size={18} />
              </button>
            ) : (
              <button
                onClick={() => { setEditing(false); setEditedTea(tea); }}
                className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
              >
                <Save size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: "var(--bg)" }}
          >
            <span className="text-sm text-muted">Your collection:</span>
            <StatusCheckbox slug={tea.slug} status={teaStatus} onCycle={() => cycleTeaStatus(tea.slug)} />
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

          {/* Brewing */}
          {(tea.brewing_temp_c || tea.brewing_time_min || tea.brewing_instructions) && (
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Brewing</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                {tea.brewing_temp_c && (
                  <div className="flex items-center gap-1.5">
                    <Thermometer size={14} className="text-accent" />
                    <span>{tea.brewing_temp_c}°C</span>
                  </div>
                )}
                {tea.brewing_time_min && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-accent" />
                    <span>{tea.brewing_time_min} min</span>
                  </div>
                )}
              </div>
              {tea.brewing_instructions && (
                <p className="text-sm leading-relaxed mt-2">{tea.brewing_instructions}</p>
              )}
            </div>
          )}

          {/* Origin */}
          {tea.origin && (
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Origin</h3>
              <div className="flex items-center gap-1.5 text-sm">
                <MapPin size={14} className="text-accent" />
                <span>{tea.origin}</span>
              </div>
            </div>
          )}

          {/* Characteristics */}
          {tea.characteristics.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Flavor Profile</h3>
              <div className="flex flex-wrap gap-2">
                {tea.characteristics.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-full text-xs"
                    style={{ backgroundColor: tea.color_hex + "20", color: tea.color_hex }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Health Benefits */}
          {tea.health_benefits.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Health Benefits</h3>
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
            </div>
          )}

          {/* Chart position */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--bg)" }}>
              <p className="text-xs text-muted">Oxidation</p>
              <p className="text-lg font-bold text-accent">{tea.oxidation_level}%</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--bg)" }}>
              <p className="text-xs text-muted">Roast Level</p>
              <p className="text-lg font-bold text-accent">{tea.roast_level}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}