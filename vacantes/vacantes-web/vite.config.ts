import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const coreApiTarget = env.VITE_CORE_API_TARGET || "http://localhost:8082";
  const vacantesApiTarget = env.VITE_VACANTES_API_TARGET || "http://localhost:8081";

  return {
    plugins: [react()],
    server: {
      port: 5177,
      proxy: {
        "/api/auth": {
          target: "http://localhost:3300",
          changeOrigin: true,
        },
        "/api/core": {
          target: "http://localhost:3110",
          changeOrigin: true,
        },
        "/api/vacantes": {
          target: "http://localhost:3300",
          changeOrigin: true,
        },
      },
    },
  };
});
