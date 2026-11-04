import { defineConfig } from "vitest/config";
import path from "path";

// Standard test runner for teapp: `npm test` (vitest run).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
    setupFiles: ["src/lib/__tests__/setup.ts"],
  },
});