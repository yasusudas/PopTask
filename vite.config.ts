import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 更新は自動適用せず、アプリ内で非破壊的な更新案内を表示する (仕様 15)
      registerType: "prompt",
      includeAssets: ["icon.svg"],
      // 静的な public/manifest.webmanifest をそのまま使用する
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,webmanifest}"],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
