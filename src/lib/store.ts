"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TeaStatus } from "./types";

interface TeaStateMap {
  [teaSlug: string]: TeaStatus;
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

interface SettingsState {
  theme: "cozy-dark" | "cozy-light" | "warm";
  setTheme: (theme: "cozy-dark" | "cozy-light" | "warm") => void;
}

interface TeaStore {
  teaStates: TeaStateMap;
  setTeaStatus: (slug: string, status: TeaStatus) => void;
  cycleTeaStatus: (slug: string) => void;
  getTeaStatus: (slug: string) => TeaStatus;
  customTeas: CustomTea[];
  addCustomTea: (tea: Omit<CustomTea, "id" | "created_at">) => void;
  removeCustomTea: (id: string) => void;
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
      theme: "cozy-dark",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "teapp-storage",
    }
  )
);