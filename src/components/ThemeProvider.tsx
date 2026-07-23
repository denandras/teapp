"use client";

import { useEffect } from "react";
import { useTeaStore } from "@/lib/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTeaStore((s) => s.theme);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("theme-cozy-dark", "theme-cozy-light", "theme-warm");
    body.classList.add(`theme-${theme}`);
  }, [theme]);

  return <>{children}</>;
}