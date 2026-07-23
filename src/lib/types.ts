export interface Tea {
  id?: number;
  name: string;
  slug: string;
  phonetic_name: string;
  chinese_name: string;
  description: string;
  origin: string;
  tea_type: string;
  category: string;
  caffeine_level: string;
  brewing_temp_c: number | null;
  brewing_time_min: number | null;
  brewing_instructions: string;
  characteristics: string[];
  health_benefits: string[];
  color_hex: string;
  oxidation_level: number;
  roast_level: number;
  source: string;
  wikidata_qid: string | null;
  is_custom: boolean;
}

export type TeaStatus = "empty" | "have" | "tried";

export const TEA_TYPE_COLORS: Record<string, string> = {
  green: "#7BA05B",
  white: "#C8C4B0",
  black: "#8B4513",
  oolong: "#D4852A",
  "pu-erh": "#6B4226",
  yellow: "#E6C84E",
  tisane: "#9B7EBD",
  blend: "#5B9E9E",
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