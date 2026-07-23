"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TeaStatus, TeaLog } from "./types";

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
  theme: "cozy-dark" | "cozy-light" | "warm";
  setTheme: (theme: "cozy-dark" | "cozy-light" | "warm") => void;
}

const STATUS_CYCLE: TeaStatus[] = ["empty", "have", "tried"];

export const useTeaStore = create<TeaStore>()(
  persist(
    (set, get) => ({
      teaStates: {},
      setTeaStatus: (slug, status) =>
        set((state) => ({
          teaStates: { ...state.teaStates, [slug]: status },
        })),
      cycleTeaStatus: (slug) => {
        const current = get().teaStates[slug] || "empty";
        const idx = STATUS_CYCLE.indexOf(current);
        const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        set((state) => ({
          teaStates: { ...state.teaStates, [slug]: next },
        }));
      },
      getTeaStatus: (slug) => get().teaStates[slug] || "empty",
      customTeas: [],
      addCustomTea: (tea) =>
        set((state) => ({
          customTeas: [
            ...state.customTeas,
            { ...tea, id: crypto.randomUUID(), created_at: new Date().toISOString() },
          ],
        })),
      removeCustomTea: (id) =>
        set((state) => ({
          customTeas: state.customTeas.filter((t) => t.id !== id),
        })),
      teaLogs: {},
      addTeaLog: (slug, rating, note) =>
        set((state) => {
          const log: TeaLog = {
            id: crypto.randomUUID(),
            rating,
            note,
            timestamp: new Date().toISOString(),
          };
          return {
            teaLogs: {
              ...state.teaLogs,
              [slug]: [log, ...(state.teaLogs[slug] || [])],
            },
          };
        }),
      editTeaLog: (slug, logId, rating, note) =>
        set((state) => ({
          teaLogs: {
            ...state.teaLogs,
            [slug]: (state.teaLogs[slug] || []).map((log) =>
              log.id === logId ? { ...log, rating, note } : log
            ),
          },
        })),
      deleteTeaLog: (slug, logId) =>
        set((state) => ({
          teaLogs: {
            ...state.teaLogs,
            [slug]: (state.teaLogs[slug] || []).filter((log) => log.id !== logId),
          },
        })),
      getAvgRating: (slug) => {
        const logs = get().teaLogs[slug];
        if (!logs || logs.length === 0) return null;
        const sum = logs.reduce((acc, log) => acc + log.rating, 0);
        return sum / logs.length;
      },
      hiddenTeas: [],
      hideTea: (slug) =>
        set((state) =>
          state.hiddenTeas.includes(slug)
            ? {}
            : { hiddenTeas: [...state.hiddenTeas, slug] }
        ),
      unhideTea: (slug) =>
        set((state) => ({
          hiddenTeas: state.hiddenTeas.filter((s) => s !== slug),
        })),
      theme: "cozy-dark",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "teapp-storage",
    }
  )
);