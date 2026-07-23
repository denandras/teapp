"use client";

import { Check, X } from "lucide-react";
import { TeaStatus } from "@/lib/types";

interface Props {
  slug: string;
  status: TeaStatus;
  onCycle: () => void;
}

export default function StatusCheckbox({ status, onCycle }: Props) {
  const config = {
    empty: {
      icon: X,
      bg: "var(--border)",
      color: "var(--muted)",
      label: "Not in collection",
    },
    have: {
      icon: Check,
      bg: "#7BA05B",
      color: "#fff",
      label: "Currently have",
    },
    tried: {
      icon: Check,
      bg: "#c4853f",
      color: "#fff",
      label: "Have tried",
    },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onCycle(); }}
      className="flex items-center gap-2 group"
      title={c.label}
    >
      <span
        className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
        style={{ backgroundColor: c.bg, color: c.color }}
      >
        <Icon size={12} strokeWidth={3} />
      </span>
      <span className="text-xs text-muted group-hover:text-accent transition-colors">{c.label}</span>
    </button>
  );
}