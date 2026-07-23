"use client";
import { useEffect } from "react";
import { useTeaStore } from "@/lib/store";

export default function StoreInit() {
  useEffect(() => {
    // Purge stale Supabase auth session keys from the old auth-based version.
    // The app no longer uses Supabase auth, but old tokens may still linger
    // in browsers that visited the previous deployment.
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        // Supabase auth stores keys like: sb.<project-ref>.access_token,
        // sb.<project-ref>.refresh_token, sb.<project-ref>.expires_at, etc.
        // Also the older format: supabase.auth.token
        if (
          key.startsWith("sb.") ||
          key.startsWith("supabase.auth.") ||
          key.includes("ikitllhvepqkghrajoox")
        ) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    }

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