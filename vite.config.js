import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// If you deploy to GitHub Pages under a repo path, set base to "/your-repo/".
// For Vercel / Netlify / custom domain, leave it as "/".
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-512.png",
      ],
      manifest: {
        name: "Bodly",
        short_name: "Bodly",
        description:
          "Lose weight, drink less, balance blood sugar, plan healthy meals, move daily, hydrate, and find calm — all in one place.",
        theme_color: "#0f1a14",
        background_color: "#0f1a14",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
});
