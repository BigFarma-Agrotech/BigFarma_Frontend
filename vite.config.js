import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
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
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
