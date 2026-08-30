export interface Tea {
  id?: number;
  name: string;
  slug: string;
  phonetic_name: string;
  original_name: string;
  description: string;
  origin: string;
  tea_type: string;
  category: string;
  caffeine_level: string;
  brewing_temp_c: number | null;
  brewing_time_min: number | null;
  brewing_num_brews: number;
  brewing_instructions: string;
  characteristics: string[];
  health_benefits: string[];
  color_hex: string;
  oxidation_level: number;
  roast_level: number;
  flavor_x: number;
  flavor_y: number;
  source: string;
  wikidata_qid: string | null;
  is_custom: boolean;
  // Source attribution — which kind of source this tea came from.
  // `source` is the display text: 'Teapp' for default, custom text for user,
  // teahouse name for teahouse teas.
  source_type?: TeaSourceType;
  owner_id?: string | null;
  is_public?: boolean;
}

export type TeaSourceType = "default" | "user" | "teahouse";

export type TeaStatus = "empty" | "have" | "tried";

export interface TeaLog {
  id: string;
  rating: number;
  note: string;
  timestamp: string;
}

export const TEA_TYPE_COLORS: Record<string, string> = {
  green: "#7BA05B",
  white: "#C8C4B0",
  black: "#8B4513",
  oolong: "#D4852A",
  "pu-erh": "#6B4226",
  yellow: "#E6C84E",
  tisane: "#C0856A",
  blend: "#B07D56",
};

export const TEA_TYPE_LABELS: Record<string, string> = {
  green: "Green",
  white: "White",
  black: "Black",
  oolong: "Oolong",
  "pu-erh": "Pu-erh",
  yellow: "Yellow",
  tisane: "Tisane/Herbal",
  blend: "Blend",
};

export const ALL_TEA_TYPES = ["green", "white", "black", "oolong", "pu-erh", "yellow", "tisane", "blend"];

export const CAFFEINE_LABELS: Record<number, string> = {
  0: "None",
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
};

export const ACCENT_COLORS: string[] = [
  "#c4853f", // Amber
  "#7BA05B", // Green
  "#c44a5f", // Rose
  "#5b8ac4", // Blue
  "#9b6bc4", // Purple
  "#4ab8a0", // Teal
  "#c4a050", // Gold
  "#e8704a", // Coral
  "#b8a0d4", // Lavender
  "#8aab6b", // Sage
  "#4a8ab8", // Ocean
  "#c44a6f", // Ruby
];

export const SOURCE_LABELS: Record<TeaSourceType, string> = {
  default: "Teapp",
  user: "User",
  teahouse: "Tea House",
};

export const SOURCE_COLORS: Record<TeaSourceType, string> = {
  default: "var(--muted)",
  user: "#7BA05B",
  teahouse: "#c4853f",
};