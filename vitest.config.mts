import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      exclude: [
        "node_modules/**",
        "src/app/**",
        "src/components/Providers.tsx",
        "src/setupTests.ts",
        "src/lib/config.ts",
        "src/types/**",
        "src/hooks/redux.ts",
        "src/server.ts",
        "vitest.config.mts",
        "next.config.ts",
        "postcss.config.mjs",
        "eslint.config.mjs",
        ".next/**",
      ],
    },
  },
});
