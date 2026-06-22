import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    react(),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor: React ecosystem
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router") || id.includes("node_modules/scheduler")) {
            return "vendor-react";
          }
          // Vendor: Recharts + d3 (only loaded by Monitor/chart apps)
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-") || id.includes("node_modules/internmap") || id.includes("node_modules/robust-predicates")) {
            return "vendor-recharts";
          }
          // Vendor: Radix UI primitives
          if (id.includes("node_modules/@radix-ui")) {
            return "vendor-radix";
          }
          // Vendor: tRPC + TanStack Query
          if (id.includes("node_modules/@trpc") || id.includes("node_modules/@tanstack")) {
            return "vendor-trpc";
          }
          // Vendor: misc utilities
          if (id.includes("node_modules/date-fns") || id.includes("node_modules/clsx") || id.includes("node_modules/tailwind-merge") || id.includes("node_modules/class-variance-authority")) {
            return "vendor-utils";
          }
          // Vendor: lucide icons
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          // Vendor: state + serialization
          if (id.includes("node_modules/zustand") || id.includes("node_modules/superjson")) {
            return "vendor-state";
          }
          // App chunks: split by category so unvisited categories cost 0 on initial load
          if (id.includes("/src/apps/security/")) return "apps-security";
          if (id.includes("/src/apps/internet/")) return "apps-internet";
          if (id.includes("/src/apps/productivity/")) return "apps-productivity";
          if (id.includes("/src/apps/media/")) return "apps-media";
          if (id.includes("/src/apps/dev/")) return "apps-dev";
          if (id.includes("/src/apps/games/")) return "apps-games";
          if (id.includes("/src/apps/agent/")) return "apps-agent";
        },
      },
    },
  },
});
