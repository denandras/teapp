"use client";

import { create } from "zustand";
import type { TeaStatus, TeaLog } from "./types";
import { supabase } from "./supabaseClient";

// Dynamic user ID — set by AuthProvider when auth state changes
let currentUserId: string | null = null;

export function setCurrentUserId(id: string | null) {
  currentUserId = id;
}

export function getCurrentUserId() {
  return currentUserId;
}

interface TeaStateMap {
  [teaSlug: string]: TeaStatus;
}

interface TeaLogsMap {
  [teaSlug: string]: TeaLog[];
}

interface CustomTea {
  id: string;
  name: string;
  description: string;
  tea_type: string;
  origin: string;
  caffeine_level: string;
  brewing_temp_c: string;
  brewing_time_min: string;
  characteristics: string[];
  created_at: string;
}

interface TeaStore {
  teaStates: TeaStateMap;
  setTeaStatus: (slug: string, status: TeaStatus) => void;
  cycleTeaStatus: (slug: string) => void;
  getTeaStatus: (slug: string) => TeaStatus;
  customTeas: CustomTea[];
  addCustomTea: (tea: Omit<CustomTea, "id" | "created_at">) => void;
  removeCustomTea: (id: string) => void;
  teaLogs: TeaLogsMap;
  addTeaLog: (slug: string, rating: number, note: string) => void;
  editTeaLog: (slug: string, logId: string, rating: number, note: string) => void;
  deleteTeaLog: (slug: string, logId: string) => void;
  getAvgRating: (slug: string) => number | null;
  hiddenTeas: string[];
  hideTea: (slug: string) => void;
  unhideTea: (slug: string) => void;
  theme: "cozy-dark" | "cozy-light" | "warm" | "dark-green";
  setTheme: (theme: "cozy-dark" | "cozy-light" | "warm" | "dark-green") => void;
  syncFromSupabase: (userId: string) => Promise<void>;
  migrateFromLocalStorage: (userId: string) => Promise<void>;
}

const STATUS_CYCLE: TeaStatus[] = ["empty", "have", "tried"];

// Helper: look up a tea's UUID in the `teas` table by its slug.
async function getTeaIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("teas")
    .select("id")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return data.id as string;
}

// Helper: upsert a row in user_teas (status + hidden) for the current user.
async function upsertUserTea(userId: string, teaId: string, status: TeaStatus, hidden: boolean) {
  const { error } = await supabase
    .from("user_teas")
    .upsert(
      { user_id: userId, tea_id: teaId, status, hidden },
      { onConflict: "user_id,tea_id" }
    );
  if (error) console.error("Failed to upsert user_teas:", error.message);
}

function getUserId(): string {
  if (!currentUserId) {
    console.error("No user ID set — auth not ready");
    return "";
  }
  return currentUserId;
}

export const useTeaStore = create<TeaStore>()((set, get) => ({
  teaStates: {},
  setTeaStatus: (slug, status) => {
    set((state) => ({ teaStates: { ...state.teaStates, [slug]: status } }));
    const userId = getUserId();
    if (!userId) return;
    const isCurrentlyHidden = get().hiddenTeas.includes(slug);
    getTeaIdBySlug(slug).then((teaId) => {
      if (teaId) upsertUserTea(userId, teaId, status, isCurrentlyHidden);
    });
  },
  cycleTeaStatus: (slug) => {
    const current = get().teaStates[slug] || "empty";
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    get().setTeaStatus(slug, next);
  },
  getTeaStatus: (slug) => get().teaStates[slug] || "empty",

  customTeas: [],
  addCustomTea: (tea) => {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    set((state) => ({
      customTeas: [...state.customTeas, { ...tea, id, created_at }],
    }));
    const userId = getUserId();
    if (!userId) return;
    supabase
      .from("custom_teas")
      .insert({
        user_id: userId,
        name: tea.name,
        slug: `custom-${id}`,
        description: tea.description,
        tea_type: tea.tea_type,
        origin: tea.origin,
        caffeine_level: tea.caffeine_level,
        brewing_temp_c: tea.brewing_temp_c,
        brewing_time_min: tea.brewing_time_min,
        characteristics: tea.characteristics,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to insert custom_teas:", error.message);
      });
  },
  removeCustomTea: (id) => {
    set((state) => ({ customTeas: state.customTeas.filter((t) => t.id !== id) }));
    const userId = getUserId();
    if (!userId) return;
    supabase
      .from("custom_teas")
      .delete()
      .eq("user_id", userId)
      .eq("slug", `custom-${id}`)
      .then(({ error }) => {
        if (error) console.error("Failed to delete custom_teas:", error.message);
      });
  },

  teaLogs: {},
  addTeaLog: (slug, rating, note) => {
    const log: TeaLog = {
      id: crypto.randomUUID(),
      rating,
      note,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      teaLogs: {
        ...state.teaLogs,
        [slug]: [log, ...(state.teaLogs[slug] || [])],
      },
    }));
    const userId = getUserId();
    if (!userId) return;
    getTeaIdBySlug(slug).then((teaId) => {
      if (!teaId) return;
      supabase
        .from("tea_logs")
        .upsert(
          { user_id: userId, tea_id: teaId, rating, note },
          { onConflict: "user_id,tea_id" }
        )
        .then(({ error }) => {
          if (error) console.error("Failed to insert tea_logs:", error.message);
        });
    });
  },
  editTeaLog: (slug, logId, rating, note) => {
    set((state) => ({
      teaLogs: {
        ...state.teaLogs,
        [slug]: (state.teaLogs[slug] || []).map((log) =>
          log.id === logId ? { ...log, rating, note } : log
        ),
      },
    }));
    const userId = getUserId();
    if (!userId) return;
    getTeaIdBySlug(slug).then((teaId) => {
      if (!teaId) return;
      supabase
        .from("tea_logs")
        .update({ rating, note })
        .eq("user_id", userId)
        .eq("tea_id", teaId)
        .eq("id", logId)
        .then(({ error }) => {
          if (error) console.error("Failed to update tea_logs:", error.message);
        });
    });
  },
  deleteTeaLog: (slug, logId) => {
    set((state) => ({
      teaLogs: {
        ...state.teaLogs,
        [slug]: (state.teaLogs[slug] || []).filter((log) => log.id !== logId),
      },
    }));
    const userId = getUserId();
    if (!userId) return;
    getTeaIdBySlug(slug).then((teaId) => {
      if (!teaId) return;
      supabase
        .from("tea_logs")
        .delete()
        .eq("user_id", userId)
        .eq("tea_id", teaId)
        .eq("id", logId)
        .then(({ error }) => {
          if (error) console.error("Failed to delete tea_logs:", error.message);
        });
    });
  },
  getAvgRating: (slug) => {
    const logs = get().teaLogs[slug];
    if (!logs || logs.length === 0) return null;
    const sum = logs.reduce((acc, log) => acc + log.rating, 0);
    return sum / logs.length;
  },

  hiddenTeas: [],
  hideTea: (slug) => {
    set((state) =>
      state.hiddenTeas.includes(slug)
        ? {}
        : { hiddenTeas: [...state.hiddenTeas, slug] }
    );
    const userId = getUserId();
    if (!userId) return;
    const status = get().teaStates[slug] || "empty";
    getTeaIdBySlug(slug).then((teaId) => {
      if (teaId) upsertUserTea(userId, teaId, status, true);
    });
  },
  unhideTea: (slug) => {
    set((state) => ({ hiddenTeas: state.hiddenTeas.filter((s) => s !== slug) }));
    const userId = getUserId();
    if (!userId) return;
    const status = get().teaStates[slug] || "empty";
    getTeaIdBySlug(slug).then((teaId) => {
      if (teaId) upsertUserTea(userId, teaId, status, false);
    });
  },

  theme: "cozy-dark",
  setTheme: (theme) => {
    set({ theme });
    const userId = getUserId();
    if (!userId) return;
    supabase
      .from("user_preferences")
      .upsert({ user_id: userId, theme }, { onConflict: "user_id" })
      .then(({ error }) => {
        if (error) console.error("Failed to upsert user_preferences:", error.message);
      });
  },

  // --- Supabase sync ---

  syncFromSupabase: async (userId: string) => {
    try {
      // 1. Load user_teas (join teas to get slug + status + hidden)
      const { data: userTeas, error: utErr } = await supabase
        .from("user_teas")
        .select("status, hidden, teas(slug)")
        .eq("user_id", userId);
      const teaStates: TeaStateMap = {};
      const hiddenTeas: string[] = [];
      if (!utErr && userTeas) {
        for (const row of userTeas) {
          const slug = (row.teas as unknown as { slug: string } | null)?.slug;
          if (!slug) continue;
          teaStates[slug] = row.status as TeaStatus;
          if (row.hidden) hiddenTeas.push(slug);
        }
      }

      // 2. Load tea_logs (join teas to get slug) — newest first
      const { data: logs, error: logsErr } = await supabase
        .from("tea_logs")
        .select("id, rating, note, created_at, teas(slug)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      const teaLogs: TeaLogsMap = {};
      if (!logsErr && logs) {
        for (const row of logs) {
          const slug = (row.teas as unknown as { slug: string } | null)?.slug;
          if (!slug) continue;
          const log: TeaLog = {
            id: String(row.id),
            rating: row.rating,
            note: row.note || "",
            timestamp: row.created_at,
          };
          if (!teaLogs[slug]) teaLogs[slug] = [];
          teaLogs[slug].push(log);
        }
      }

      // 3. Load custom_teas
      const { data: custom, error: customErr } = await supabase
        .from("custom_teas")
        .select("*")
        .eq("user_id", userId);
      const customTeas: CustomTea[] = [];
      if (!customErr && custom) {
        for (const row of custom) {
          const id = row.slug?.startsWith("custom-") ? row.slug.slice(7) : String(row.id);
          customTeas.push({
            id,
            name: row.name,
            description: row.description || "",
            tea_type: row.tea_type || "",
            origin: row.origin || "",
            caffeine_level: row.caffeine_level || "",
            brewing_temp_c: row.brewing_temp_c != null ? String(row.brewing_temp_c) : "",
            brewing_time_min: row.brewing_time_min != null ? String(row.brewing_time_min) : "",
            characteristics: row.characteristics || [],
            created_at: row.created_at || new Date().toISOString(),
          });
        }
      }

      // 4. Load user_preferences (theme)
      let theme: "cozy-dark" | "cozy-light" | "warm" | "dark-green" = "cozy-dark";
      const { data: prefs, error: prefsErr } = await supabase
        .from("user_preferences")
        .select("theme")
        .eq("user_id", userId)
        .single();
      if (!prefsErr && prefs && prefs.theme) {
        theme = prefs.theme as typeof theme;
      }

      set({ teaStates, teaLogs, customTeas, hiddenTeas, theme });
    } catch (err) {
      console.error("syncFromSupabase error:", err);
    }
  },

  migrateFromLocalStorage: async (userId: string) => {
    try {
      const raw = localStorage.getItem("teapp-storage");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const oldState = parsed.state || parsed;
      const oldTeaStates: TeaStateMap = oldState.teaStates || {};
      const oldTeaLogs: TeaLogsMap = oldState.teaLogs || {};
      const oldCustomTeas: CustomTea[] = oldState.customTeas || [];
      const oldHiddenTeas: string[] = oldState.hiddenTeas || [];
      const oldTheme = oldState.theme || "cozy-dark";

      // 1. Migrate tea statuses + hidden flags
      for (const [slug, status] of Object.entries(oldTeaStates)) {
        if (status === "empty") continue;
        const teaId = await getTeaIdBySlug(slug);
        if (!teaId) continue;
        const hidden = oldHiddenTeas.includes(slug);
        await upsertUserTea(userId, teaId, status, hidden);
      }
      for (const slug of oldHiddenTeas) {
        if (oldTeaStates[slug] && oldTeaStates[slug] !== "empty") continue;
        const teaId = await getTeaIdBySlug(slug);
        if (!teaId) continue;
        await upsertUserTea(userId, teaId, "empty", true);
      }

      // 2. Migrate tea logs
      for (const [slug, logs] of Object.entries(oldTeaLogs)) {
        const teaId = await getTeaIdBySlug(slug);
        if (!teaId) continue;
        for (const log of logs) {
          await supabase.from("tea_logs").upsert({
            user_id: userId,
            tea_id: teaId,
            rating: log.rating,
            note: log.note,
          }, { onConflict: "user_id,tea_id" });
        }
      }

      // 3. Migrate custom teas
      for (const ct of oldCustomTeas) {
        await supabase.from("custom_teas").insert({
          user_id: userId,
          name: ct.name,
          slug: `custom-${ct.id}`,
          description: ct.description,
          tea_type: ct.tea_type,
          origin: ct.origin,
          caffeine_level: ct.caffeine_level,
          brewing_temp_c: ct.brewing_temp_c,
          brewing_time_min: ct.brewing_time_min,
          characteristics: ct.characteristics,
        });
      }

      // 4. Migrate theme preference
      await supabase
        .from("user_preferences")
        .upsert({ user_id: userId, theme: oldTheme }, { onConflict: "user_id" });

      // 5. Reload from Supabase
      await get().syncFromSupabase(userId);

      // 6. Clear old localStorage data
      localStorage.removeItem("teapp-storage");
    } catch (err) {
      console.error("migrateFromLocalStorage error:", err);
    }
  },
}));