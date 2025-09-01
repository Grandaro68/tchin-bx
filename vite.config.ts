// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss"; // 👈 v4

export default defineConfig({
  plugins: [react()],
  css: {
    // On force Vite à n'utiliser que ce pipeline PostCSS (pas d'auto-plugins)
    postcss: {
      plugins: [tailwindcss()]
    }
  },
  server: {
    port: 5173,
    hmr: { overlay: true }
  }
});
