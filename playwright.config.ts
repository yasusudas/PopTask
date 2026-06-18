import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:4173",
    // 自動浮遊を止めて操作を安定させつつ、reduced-motion時の動作も検証する
    contextOptions: { reducedMotion: "reduce" },
  },
  webServer: {
    command: "VITE_SKIP_AUTH=true npm run build && npm run preview -- --port 4173 --strictPort",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
