import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // SERVER_URL is the bare backend host; tolerate a trailing slash or /api/v1
  const serverUrl = (env.SERVER_URL || "https://bigfarma-backend.onrender.com")
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/, "");

  // Forward /api/v1 to the backend so the browser only ever talks to this origin.
  // In production vercel.json does the same.
  const proxy = {
    "/api/v1": {
      target: serverUrl,
      changeOrigin: true,
      secure: true,
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
    build: {
      outDir: "dist",
      rollupOptions: {
        output: {
          // Split big libraries into their own files so they're cached across
          // deploys and only downloaded by the pages that use them
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) return "react";
            if (/[\\/]node_modules[\\/](@tanstack|axios)[\\/]/.test(id)) return "query";
            if (/[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/.test(id)) return "charts";
            if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return "motion";
            if (/[\\/]node_modules[\\/]swiper[\\/]/.test(id)) return "swiper";
          },
        },
      },
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
