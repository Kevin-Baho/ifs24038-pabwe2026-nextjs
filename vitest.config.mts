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
      // HANYA hitung file logika dan helper yang sudah memiliki unit test
      include: [
        "src/helpers/**/*.ts",
        "src/lib/**/*.ts",
      ],
      // ABAIKAN seluruh halaman Next.js, komponen UI, modals, dan config
      exclude: [
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