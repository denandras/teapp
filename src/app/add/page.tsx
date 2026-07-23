"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTeaStore } from "@/lib/store";
import { TEA_TYPE_COLORS, TEA_TYPE_LABELS, ALL_TEA_TYPES } from "@/lib/types";
import { Plus, ArrowLeft } from "lucide-react";

export default function AddTeaPage() {
  const router = useRouter();
  const addCustomTea = useTeaStore((s) => s.addCustomTea);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tea_type, setTeaType] = useState("blend");
  const [origin, setOrigin] = useState("");
  const [caffeine_level, setCaffeineLevel] = useState("");
  const [brewing_temp_c, setBrewingTempC] = useState("");
  const [brewing_time_min, setBrewingTimeMin] = useState("");
  const [characteristics, setCharacteristics] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomTea({
      name: name.trim(),
      description: description.trim(),
      tea_type,
      origin: origin.trim(),
      caffeine_level: caffeine_level.trim(),
      brewing_temp_c: brewing_temp_c,
      brewing_time_min: brewing_time_min,
      characteristics: characteristics.split(",").map(s => s.trim()).filter(Boolean),
    });

    setSuccess(true);
    setTimeout(() => router.push("/database"), 1500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/")} className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif font-bold">Add Custom Tea</h1>
          <p className="text-muted text-sm mt-1">Can't find it in the database? Add your own.</p>
        </div>
      </div>

      {success && (
        <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: "#7BA05B20", borderColor: "#7BA05B" }}>
          <p className="text-sm font-medium" style={{ color: "#7BA05B" }}>Tea added! Redirecting to database...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-muted uppercase tracking-wide block mb-2">Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dong Ding Oolong"
            className="w-full px-4 py-2.5 rounded-lg border outline-none"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-muted uppercase tracking-wide block mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What makes this tea special?"
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border outline-none resize-none"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-muted uppercase tracking-wide block mb-2">Tea Type</label>
          <div className="flex flex-wrap gap-2">
            {ALL_TEA_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setTeaType(type)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                style={{
                  backgroundColor: tea_type === type ? TEA_TYPE_COLORS[type] : "transparent",
                  color: tea_type === type ? "#fff" : "var(--muted)",
                  borderColor: tea_type === type ? TEA_TYPE_COLORS[type] : "var(--border)",
                }}
              >
                {TEA_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-muted uppercase tracking-wide block mb-2">Origin</label>
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Taiwan"
              className="w-full px-4 py-2.5 rounded-lg border outline-none"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted uppercase tracking-wide block mb-2">Caffeine Level</label>
            <input
              value={caffeine_level}
              onChange={(e) => setCaffeineLevel(e.target.value)}
              placeholder="e.g. Low, Medium, High"
              className="w-full px-4 py-2.5 rounded-lg border outline-none"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-muted uppercase tracking-wide block mb-2">Brewing Temp (°C)</label>
            <input
              type="number"
              value={brewing_temp_c}
              onChange={(e) => setBrewingTempC(e.target.value)}
              placeholder="e.g. 90"
              className="w-full px-4 py-2.5 rounded-lg border outline-none"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted uppercase tracking-wide block mb-2">Steeping Time (min)</label>
            <input
              type="number"
              value={brewing_time_min}
              onChange={(e) => setBrewingTimeMin(e.target.value)}
              placeholder="e.g. 3"
              className="w-full px-4 py-2.5 rounded-lg border outline-none"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted uppercase tracking-wide block mb-2">Flavor Notes (comma-separated)</label>
          <input
            value={characteristics}
            onChange={(e) => setCharacteristics(e.target.value)}
            placeholder="e.g. Floral, Sweet, Umami"
            className="w-full px-4 py-2.5 rounded-lg border outline-none"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          <Plus size={18} />
          Add Tea
        </button>
      </form>
    </div>
  );
}