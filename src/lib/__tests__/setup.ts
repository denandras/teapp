// Minimal in-memory localStorage for node-environment tests (store.ts caches
// an accent color there). Not a fake of PostgREST — that lives in fakeSupabase.ts.
const storage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (storage.has(k) ? storage.get(k)! : null),
  setItem: (k: string, v: string) => { storage.set(k, String(v)); },
  removeItem: (k: string) => { storage.delete(k); },
  key: (i: number) => Array.from(storage.keys())[i] ?? null,
  get length() { return storage.size; },
  clear: () => storage.clear(),
};