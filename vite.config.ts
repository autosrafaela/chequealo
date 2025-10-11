import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isGhPages =
    mode === 'ghpages' ||
    process.env.VITE_DEPLOY_TARGET === 'ghpages' ||
    process.env.GITHUB_PAGES === 'true';
  
  const isLovable = process.env.LOVABLE_DEPLOY === 'true';
  
  return {
    base: (isGhPages && !isLovable) ? '/chequealo/' : '/',
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
  };
});
