"use client";
import { useEffect } from "react";
import { useTeaStore } from "@/lib/store";

export default function StoreInit() {
  useEffect(() => {
    const store = useTeaStore.getState();
    // If old localStorage data exists, migrate it to Supabase first
    if (typeof window !== "undefined" && localStorage.getItem("teapp-storage")) {
      store.migrateFromLocalStorage().then(() => {
        store.syncFromSupabase();
      });
    } else {
      store.syncFromSupabase();
    }
  }, []);
  return null;
}