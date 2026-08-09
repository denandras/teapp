"use client";

import { create } from "zustand";
import type { Tea, TeaStatus, TeaLog } from "./types";
import { SOURCE_LABELS, TEA_TYPE_COLORS } from "./types";
import { supabase } from "./supabaseClient";

// Dynamic user ID — set by AuthProvider when auth state changes
let currentUserId: string | null = null;

export function setCurrentUserId(id: string | null) {
  currentUserId = id;
}

export function getCurrentUserId() {
  return currentUserId;
}

// Demo mode — bypasses Supabase, uses localStorage only
let demoMode = false;

export function setDemoMode(v: boolean) {
  demoMode = v;
}

export function isDemoMode() {
  return demoMode;
}

const DEMO_STORAGE_KEY = "teapp-demo-data";
const ACCENT_STORAGE_KEY = "teapp-accent-color";

/** Cache accent color in localStorage for instant restore on page reload. */
function saveAccentCache(color: string) {
  try { localStorage.setItem(ACCENT_STORAGE_KEY, color); } catch {}
}
function loadAccentCache(): string | null {
  try { return localStorage.getItem(ACCENT_STORAGE_KEY); } catch { return null; }
}

interface DemoState {
  teaStates: Record<string, TeaStatus>;
  teaLogs: Record<string, TeaLog[]>;
  customTeas: CustomTea[];
  hiddenTeas: string[];
  theme: "cozy-dark" | "cozy-light" | "warm" | "dark-green";
  accentColor: string;
}

function saveDemoState(state: {
  teaStates: TeaStateMap;
  teaLogs: TeaLogsMap;
  customTeas: CustomTea[];
  hiddenTeas: string[];
  theme: "cozy-dark" | "cozy-light" | "warm" | "dark-green";
  accentColor: string;
}) {
  try {
    const data: DemoState = {
      teaStates: state.teaStates,
      teaLogs: state.teaLogs,
      customTeas: state.customTeas,
      hiddenTeas: state.hiddenTeas,
      theme: state.theme,
      accentColor: state.accentColor,
    };
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save demo state:", e);
  }
}

function loadDemoState(): DemoState | null {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoState;
  } catch {
    return null;
  }
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
  slug?: string;
  phonetic_name?: string;
  original_name?: string;
  description: string;
  origin: string;
  tea_type: string;
  category?: string;
  caffeine_level: string;
  brewing_temp_c: string;
  brewing_time_min: string;
  brewing_num_brews?: number;
  brewing_instructions?: string;
  characteristics: string[];
  health_benefits?: string[];
  color_hex?: string;
  oxidation_level?: number;
  roast_level?: number;
  flavor_x?: number;
  flavor_y?: number;
  source?: string;
  source_type?: "default" | "user" | "teahouse";
  wikidata_qid?: string | null;
  is_custom?: boolean;
  is_public?: boolean;
  owner_id?: string | null;
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
  accentColor: string;
  setAccentColor: (color: string) => void;
  allTeas: Tea[];
  syncFromSupabase: (userId: string) => Promise<void>;
  migrateFromLocalStorage: (userId: string) => Promise<void>;
  loadDemoData: () => void;
}

const STATUS_CYCLE: TeaStatus[] = ["empty", "tried", "have"];

// Helper: look up a tea's UUID in the `teas` table by its slug.
// Only looks in the `teas` table — custom teas are now stored there too
// (source_type='user'). Kept simple; falls back to null on error.
async function getTeaIdBySlug(slug: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("teas")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data.id as string;
  } catch (e) {
    console.error("getTeaIdBySlug error:", e);
    return null;
  }
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
    if (demoMode) { saveDemoState(get()); return; }
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
    const slug = tea.slug ?? `custom-${id}`;
    const created_at = new Date().toISOString();
    set((state) => ({ customTeas: [...state.customTeas, { ...tea, id, slug, created_at }] }));
    if (demoMode) { saveDemoState(get()); return; }
    const userId = getUserId();
    if (!userId) return;
    const sourceType = tea.source_type ?? "user";
    // Default teas (created by admin) have no owner and are public.
    // User/teahouse teas are owned by the current user.
    const isPublic = tea.is_public ?? (sourceType === "default");
    const ownerId = tea.source_type === "default" ? null : (tea.owner_id ?? userId);
    const insertRow = {
      name: tea.name,
      slug,
      phonetic_name: tea.phonetic_name ?? "",
      original_name: tea.original_name ?? "",
      description: tea.description,
      origin: tea.origin,
      tea_type: tea.tea_type,
      category: tea.category ?? "",
      caffeine_level: tea.caffeine_level,
      brewing_temp_c: tea.brewing_temp_c ? Number(tea.brewing_temp_c) : null,
      brewing_time_min: tea.brewing_time_min ? Number(tea.brewing_time_min) : null,
      brewing_num_brews: tea.brewing_num_brews ?? 1,
      brewing_instructions: tea.brewing_instructions ?? "",
      characteristics: tea.characteristics,
      health_benefits: tea.health_benefits ?? [],
      color_hex: tea.color_hex ?? "",
      oxidation_level: tea.oxidation_level ?? 50,
      roast_level: tea.roast_level ?? 50,
      flavor_x: tea.flavor_x ?? 50,
      flavor_y: tea.flavor_y ?? 50,
      source_type: sourceType,
      source: tea.source ?? (sourceType === "default" ? "Teapp" : sourceType === "teahouse" ? "" : "custom"),
      owner_id: ownerId,
      is_public: isPublic,
    };
    // Primary: insert into the unified `teas` table (source_type='user').
    // Fallback: if the teas table doesn't have the source_type column yet
    // (migration not run), fall back to the legacy custom_teas table.
    supabase
      .from("teas")
      .insert(insertRow)
      .then(({ error }) => {
        if (!error) return;
        // Fallback to legacy custom_teas table
        supabase
          .from("custom_teas")
          .insert({
            user_id: userId,
            name: tea.name,
            slug,
            description: tea.description,
            tea_type: tea.tea_type,
            origin: tea.origin,
            caffeine_level: tea.caffeine_level,
            brewing_temp_c: tea.brewing_temp_c,
            brewing_time_min: tea.brewing_time_min,
            characteristics: tea.characteristics,
          })
          .then(({ error: legacyErr }) => {
            if (legacyErr) console.error("Failed to insert custom tea (teas & custom_teas):", error.message, legacyErr.message);
          });
      });
  },
  removeCustomTea: (id) => {
    set((state) => ({ customTeas: state.customTeas.filter((t) => t.id !== id) }));
    if (demoMode) { saveDemoState(get()); return; }
    const userId = getUserId();
    if (!userId) return;
    const slug = `custom-${id}`;
    // Primary: delete from unified `teas` table by slug.
    // Fallback: delete from legacy custom_teas table.
    supabase
      .from("teas")
      .delete()
      .eq("slug", slug)
      .then(({ error }) => {
        if (!error) return;
        supabase
          .from("custom_teas")
          .delete()
          .eq("user_id", userId)
          .eq("slug", slug)
          .then(({ error: legacyErr }) => {
            if (legacyErr) console.error("Failed to delete custom tea (teas & custom_teas):", error.message, legacyErr.message);
          });
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
    if (demoMode) { saveDemoState(get()); return; }
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
    if (demoMode) { saveDemoState(get()); return; }
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
    if (demoMode) { saveDemoState(get()); return; }
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
    if (demoMode) { saveDemoState(get()); return; }
    const userId = getUserId();
    if (!userId) return;
    const status = get().teaStates[slug] || "empty";
    getTeaIdBySlug(slug).then((teaId) => {
      if (teaId) upsertUserTea(userId, teaId, status, true);
    });
  },
  unhideTea: (slug) => {
    set((state) => ({ hiddenTeas: state.hiddenTeas.filter((s) => s !== slug) }));
    if (demoMode) { saveDemoState(get()); return; }
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
    if (demoMode) { saveDemoState(get()); return; }
    const userId = getUserId();
    if (!userId) return;
    supabase
      .from("user_preferences")
      .upsert({ user_id: userId, theme }, { onConflict: "user_id" })
      .then(({ error }) => {
        if (error) console.error("Failed to upsert user_preferences:", error.message);
      });
  },

  accentColor: typeof window !== "undefined" ? (loadAccentCache() || "#c4853f") : "#c4853f",
  allTeas: [],
  setAccentColor: (color) => {
    set({ accentColor: color });
    saveAccentCache(color);
    if (demoMode) { saveDemoState(get()); return; }
    const userId = getUserId();
    if (!userId) return;
    supabase
      .from("user_preferences")
      .upsert({ user_id: userId, accent_color: color }, { onConflict: "user_id" })
      .then(({ error }) => {
        if (error) console.error("Failed to upsert user_preferences:", error.message);
      });
  },

  // --- Demo mode: load from localStorage ---
  loadDemoData: () => {
    const data = loadDemoState();
    if (data) {
      const demoAccent = data.accentColor || "#c4853f";
      saveAccentCache(demoAccent);
      set({
        teaStates: data.teaStates || {},
        teaLogs: data.teaLogs || {},
        customTeas: data.customTeas || [],
        hiddenTeas: data.hiddenTeas || [],
        theme: data.theme || "cozy-dark",
        accentColor: demoAccent,
        allTeas: [],  // Will be loaded from Supabase; demo mode fetches public teas read-only
      });
    } else {
      // Fresh demo — start empty
      set({ teaStates: {}, teaLogs: {}, customTeas: [], hiddenTeas: [], theme: "cozy-dark", accentColor: "#c4853f", allTeas: [] });
    }

    // Demo mode can still READ from Supabase (anon key allows public teas).
    // Fetch all teas — RLS policies ensure only visible teas are returned
    // (default teas are public, teahouse teas are public if is_public=true,
    // user teas are private to their owner).
    supabase
      .from("teas")
      .select("*")
      .order("name")
      .then(({ data: publicTeas, error }) => {
        if (!error && publicTeas) {
          const normalized = (publicTeas as Tea[]).map((t) => ({
            ...t,
            source_type: (t.source_type as Tea["source_type"]) || "default",
            source: t.source || SOURCE_LABELS[(t.source_type as Tea["source_type"]) || "default"] || "Teapp",
            is_custom: (t.source_type as Tea["source_type"]) !== "default",
          }));
          set({ allTeas: normalized });
        } else if (error) {
          console.error("loadDemoData: failed to fetch teas:", error.message);
        }
      });
  },

  // --- Supabase sync ---

  syncFromSupabase: async (userId: string) => {
    try {
      // 0. Load ALL teas with ALL columns → stored as `allTeas`.
      //    These include default teas, user teas (source_type='user'), and
      //    teahouse teas. Build an id→slug mapping for status/log resolution.
      let allTeas: Tea[] = [];
      let teaIdToSlug: Record<string, string> = {};
      let userTeaRows: Tea[] = [];
      try {
        const { data: teasData, error: teasErr } = await supabase
          .from("teas")
          .select("*");
        if (!teasErr && teasData) {
          allTeas = (teasData as Tea[]).map((t) => ({
            ...t,
            source_type: (t.source_type as Tea["source_type"]) || "default",
            source: t.source || SOURCE_LABELS[(t.source_type as Tea["source_type"]) || "default"] || "Teapp",
            is_custom: (t.source_type as Tea["source_type"]) !== "default",
          }));
          teaIdToSlug = {};
          for (const row of allTeas) {
            teaIdToSlug[row.id as number] = row.slug;
          }
          // User teas = teas with source_type='user' owned by this user
          userTeaRows = allTeas.filter((t) => t.source_type === "user" && t.owner_id === userId);
        }
      } catch (e) {
        // `teas` table select failed (e.g. source_type column missing). Fall back
        // to id+slug-only select and legacy custom_teas for user teas.
        console.error("syncFromSupabase: failed to select all teas, falling back:", e);
        const { data: teasData, error: teasErr } = await supabase
          .from("teas")
          .select("id, slug");
        if (!teasErr && teasData) {
          teaIdToSlug = {};
          for (const row of teasData) {
            teaIdToSlug[row.id] = row.slug;
          }
        }
        allTeas = (teasData || []).map((row: any, i: number) => ({ ...row, id: i + 1 })) as Tea[];
      }

      // 0b. If no user teas found in the unified `teas` table, fall back to
      //     legacy custom_teas table (backward compat before migration).
      if (userTeaRows.length === 0) {
        try {
          const { data: custom, error: customErr } = await supabase
            .from("custom_teas")
            .select("*")
            .eq("user_id", userId);
          if (!customErr && custom && custom.length > 0) {
            const legacyUserTeas: Tea[] = custom.map((row) => ({
              id: -1,
              name: row.name,
              slug: row.slug || `custom-${row.id}`,
              phonetic_name: "",
              original_name: "",
              description: row.description || "",
              origin: row.origin || "",
              tea_type: row.tea_type || "",
              category: "",
              caffeine_level: row.caffeine_level || "",
              brewing_temp_c: row.brewing_temp_c != null ? Number(row.brewing_temp_c) : null,
              brewing_time_min: row.brewing_time_min != null ? Number(row.brewing_time_min) : null,
              brewing_num_brews: 1,
              brewing_instructions: "",
              characteristics: row.characteristics || [],
              health_benefits: [],
              color_hex: TEA_TYPE_COLORS[row.tea_type] || "#999",
              oxidation_level: 50,
              roast_level: 50,
              flavor_x: 50,
              flavor_y: 50,
              source: "custom",
              wikidata_qid: null,
              is_custom: true,
              source_type: "user",
              owner_id: userId,
              is_public: false,
            }));
            userTeaRows = legacyUserTeas;
            for (const row of legacyUserTeas) {
              teaIdToSlug[row.id as number] = row.slug;
            }
            allTeas = [...allTeas.filter((t) => !String(t.slug).startsWith("custom-")), ...legacyUserTeas];
          }
        } catch (e) {
          console.error("syncFromSupabase: custom_teas fallback failed:", e);
        }
      }

      // 1. Load user_teas (flat — no join, resolve slug via mapping)
      const { data: userTeas, error: utErr } = await supabase
        .from("user_teas")
        .select("tea_id, status, hidden")
        .eq("user_id", userId);
      const teaStates: TeaStateMap = {};
      const hiddenTeas: string[] = [];
      if (!utErr && userTeas) {
        for (const row of userTeas) {
          const slug = teaIdToSlug[row.tea_id];
          if (!slug) continue;
          teaStates[slug] = row.status as TeaStatus;
          if (row.hidden) hiddenTeas.push(slug);
        }
      }

      // 2. Load tea_logs (flat — no join, resolve slug via mapping)
      const { data: logs, error: logsErr } = await supabase
        .from("tea_logs")
        .select("id, tea_id, rating, note, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      const teaLogs: TeaLogsMap = {};
      if (!logsErr && logs) {
        for (const row of logs) {
          const slug = teaIdToSlug[row.tea_id];
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

      // 3. Load user_preferences (theme + accent color)
      let theme: "cozy-dark" | "cozy-light" | "warm" | "dark-green" = "cozy-dark";
      // Preserve cached accent color — don't reset to default if DB has nothing
      let accentColor: string = loadAccentCache() || "#c4853f";
      const { data: prefs, error: prefsErr } = await supabase
        .from("user_preferences")
        .select("theme, accent_color")
        .eq("user_id", userId)
        .single();
      if (!prefsErr && prefs) {
        if (prefs.theme) {
          theme = prefs.theme as typeof theme;
        }
        if (prefs.accent_color) {
          accentColor = prefs.accent_color as string;
          saveAccentCache(accentColor);
        }
      }

      // 4. Build customTeas from user teas (backward compat for components
      //    that still read the customTeas array).
      const customTeas: CustomTea[] = userTeaRows.map((t) => ({
        id: String(t.slug).replace(/^custom-/, ""),
        name: t.name,
        description: t.description,
        tea_type: t.tea_type,
        origin: t.origin,
        caffeine_level: t.caffeine_level,
        brewing_temp_c: t.brewing_temp_c != null ? String(t.brewing_temp_c) : "",
        brewing_time_min: t.brewing_time_min != null ? String(t.brewing_time_min) : "",
        characteristics: t.characteristics,
        created_at: new Date().toISOString(),
      }));

      set({ teaStates, teaLogs, customTeas, hiddenTeas, theme, accentColor, allTeas });
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

      // 3. Migrate custom teas → into the unified `teas` table (source_type='user').
      //    Fall back to legacy custom_teas if the source_type column isn't there yet.
      for (const ct of oldCustomTeas) {
        const slug = `custom-${ct.id}`;
        const insertRow = {
          name: ct.name,
          slug,
          description: ct.description,
          tea_type: ct.tea_type,
          origin: ct.origin,
          caffeine_level: ct.caffeine_level,
          brewing_temp_c: ct.brewing_temp_c ? Number(ct.brewing_temp_c) : null,
          brewing_time_min: ct.brewing_time_min ? Number(ct.brewing_time_min) : null,
          characteristics: ct.characteristics,
          source_type: "user",
          source: "custom",
          owner_id: userId,
          is_public: false,
        };
        const { error } = await supabase.from("teas").insert(insertRow);
        if (error) {
          await supabase.from("custom_teas").insert({
            user_id: userId,
            name: ct.name,
            slug,
            description: ct.description,
            tea_type: ct.tea_type,
            origin: ct.origin,
            caffeine_level: ct.caffeine_level,
            brewing_temp_c: ct.brewing_temp_c,
            brewing_time_min: ct.brewing_time_min,
            characteristics: ct.characteristics,
          });
        }
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