import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Browser navigations (page reloads, link clicks) include text/html in Accept.
// API fetch() calls do not. This bypass returns index.html for navigations so
// the SPA handles routing, while API requests are still proxied to the backend.
function spaBypass(req) {
  if (req.headers.accept?.includes("text/html")) return "/index.html";
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/patterns": {
        target: "http://localhost:8000",
        changeOrigin: true,
        bypass: spaBypass,
      },
      "/abbreviations": { target: "http://localhost:8000", changeOrigin: true },
      "/auth": { target: "http://localhost:8000", changeOrigin: true },
      "/media": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.js"],
    env: {
      VITE_API_URL: "http://localhost:8000",
    },
    include: ["tests/**/*.{test,spec}.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{js,jsx}"],
    },
  },
});
