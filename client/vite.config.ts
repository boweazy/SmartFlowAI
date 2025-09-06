import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server:{host:true,allowedHosts:['.replit.dev']},
  resolve:{ alias:{ '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
