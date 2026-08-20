import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  // Relative assets work on root domains, GitHub repository subpaths and
  // EdgeOne Pages without rebuilding for a different base URL.
  base: "./",
  plugins: [vue()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
