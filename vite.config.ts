import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      // "prompt" (not "autoUpdate"): a new service worker installs in the
      // background but waits for the user's explicit confirmation via
      // UpdatePrompt.vue before it takes over — required so the "new
      // version available" message can actually be shown instead of the
      // app silently swapping itself out from under the user.
      registerType: "prompt",
      includeAssets: ["icons/*.png", "fonts/**/*"],
      manifest: {
        name: "ردیاب عادت‌ماهیانه",
        short_name: "ردیاب عادت‌ماهیانه",
        description: "ردیاب عادت‌ماهیانه",
        theme_color: "#f8fafc",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icons/icon-48.png", sizes: "48x48", type: "image/png" },
          { src: "icons/icon-72.png", sizes: "72x72", type: "image/png" },
          { src: "icons/icon-96.png", sizes: "96x96", type: "image/png" },
          { src: "icons/icon-144.png", sizes: "144x144", type: "image/png" },
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Without this, a waiting worker can be starved by open tabs and
        // "needRefresh" may never resolve after clicking update.
        clientsClaim: true,
        skipWaiting: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@domain": fileURLToPath(new URL("./src/domain", import.meta.url)),
      "@application": fileURLToPath(new URL("./src/application", import.meta.url)),
      "@infrastructure": fileURLToPath(new URL("./src/infrastructure", import.meta.url)),
      "@presentation": fileURLToPath(new URL("./src/presentation", import.meta.url)),
    },
  },
});
