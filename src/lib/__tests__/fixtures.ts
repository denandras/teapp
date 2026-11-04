import type { FakeTea } from "./fakeSupabase";

const TEA_TYPES = ["green", "white", "black", "oolong", "sheng_puerh", "shou_puerh", "dark", "yellow", "tisane", "blend"];

export const USER_ID = "test-user-0000-0000-0000-000000000000";

/**
 * Synthetic tea table exercising >1000-row behavior:
 * - 1500 rows (default; pass a different size)
 * - every 5th row repeats a shared display `name` (with a distinct slug/id) so
 *   page boundaries can land inside duplicate-key groups — proves the tiebreak
 *   keeps offset paging stable.
 * - attributes cycle through the real tea_type vocabulary to exercise ordering
 *   and the store's normalization paths.
 */
export function buildTeaDataset(n = 1500): FakeTea[] {
  const types = TEA_TYPES;
  const teas: FakeTea[] = [];
  for (let i = 0; i < n; i++) {
    const id = i + 1;
    const shared = i % 5 === 0;
    const name = shared
      ? `Shared Name ${String(Math.floor(i / 5) % 3).padStart(2, "0")}` // 3 shared-name groups, each hundreds of rows
      : `Test Tea ${String(id).padStart(4, "0")}`;
    teas.push({
      id,
      slug: `test-tea-${id}`,
      name,
      original_name: "测试茶" + id,
      translation: "Test Tea",
      description: `Synthetic regression-test tea ${id} (${name}).`,
      tea_type: types[i % types.length],
      category: "",
      origin: i % 2 ? "Yunnan" : "Zhejiang",
      caffeine_level: ["low", "medium", "high"][i % 3],
      source_type: "default",
      source: "Teapp",
      is_public: true,
      is_custom: false,
      owner_id: null,
      characteristics: ["floral"],
      flavor_x: 30 + (i % 40),
      flavor_y: 30 + ((i * 7) % 40),
    });
  }
  return teas;
}

/** Collected-status rows for a user, interleaved so no two pages are uniform. */
export function buildUserTeaRows(teas: FakeTea[], userId: string, count = 120, offset = 300): any[] {
  return Array.from({ length: count }, (_, i) => {
    const tea = teas[(offset + i * 3) % teas.length];
    return {
      id: i + 1,
      user_id: userId,
      tea_id: tea.id,
      status: (["empty", "tried", "have"] as const)[i % 3],
      hidden: i % 7 === 0,
    };
  });
}

/** Log rows for a user — deliberately >1000 so their paging must work too. */
export function buildTeaLogRows(teas: FakeTea[], userId: string, count = 1100): any[] {
  return Array.from({ length: count }, (_, i) => {
    const tea = teas[(i * 5 + 17) % teas.length];
    return {
      id: i + 1,
      user_id: userId,
      tea_id: tea.id,
      rating: (i % 5) + 1,
      note: `Log entry ${i + 1} — ${tea.name}`,
      created_at: new Date(Date.UTC(2026, 0, 1) + i * 3600_000).toISOString(),
    };
  });
}