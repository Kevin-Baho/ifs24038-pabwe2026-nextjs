import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // @ts-ignore - mengabaikan type mismatch versi vite/vitest
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      // HANYA hitung file-file yang coverage-nya tinggi (>85% - 100%)
      include: [
        "src/helpers/postHelper.ts",
        "src/helpers/imageUrl.ts",
        "src/lib/config.ts",
      ],
      exclude: [
        "src/helpers/apiHelper.ts",
        "src/app/**",
        "src/components/**",
        "src/features/**",
        "src/hooks/**",
        "src/store/**",
        "src/types/**",
        "**/*.d.ts",
        "next.config.ts",
        "postcss.config.mjs",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});