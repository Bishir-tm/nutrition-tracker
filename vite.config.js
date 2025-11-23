import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/nutrition-tracker/",
    plugins: [react()],
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(
        env.VITE_API_URL ||
          "https://nutrition-tracker-backend-psi.vercel.app/api"
      ),
    },
    server: {
      host: true,
    },
    preview: {
      host: true,
      https: true,
    },
  };
});
