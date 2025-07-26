import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// Remove Replit‑specific plugins.  Only the standard React plugin is used.

export default defineConfig({
  plugins: [
    react(),
    // Additional development plugins can be added here
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
