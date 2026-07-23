"use client";
import { useEffect } from "react";
import { useTeaStore } from "@/lib/store";

export default function StoreInit() {
  useEffect(() => {
    useTeaStore.getState().syncFromSupabase();
  }, []);
  return null;
}