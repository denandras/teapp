"use client";
import { useEffect } from "react";

export default function StoreInit() {
  useEffect(() => {
    // Purge old teapp-storage localStorage if it exists (data migration handled by AuthProvider)
    if (typeof window !== "undefined") {
      // Clean up any old non-auth localStorage that's no longer used
      // Auth tokens are managed by supabase-js directly
    }
  }, []);
  return null;
}