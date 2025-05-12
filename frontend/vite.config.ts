import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Add these server configurations
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      // Proxy all API requests to Django
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Origin", "http://localhost:5173");
            proxyReq.setHeader(
              "Access-Control-Allow-Origin",
              "http://localhost:5173"
            );
            proxyReq.setHeader(
              "Access-Control-Allow-Methods",
              "GET, POST, PUT, DELETE, OPTIONS"
            );
            proxyReq.setHeader(
              "Access-Control-Allow-Headers",
              "Content-Type, Authorization"
            );
            proxyReq.setHeader("Access-Control-Allow-Credentials", "true");
          });
        },
      },
    },
    cors: {
      origin: "http://127.0.0.1:8000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  },

  // Optional: Configure build output for Django compatibility
  build: {
    outDir: "../backend/static/frontend", // Adjust path to your Django static files
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
  },
});
