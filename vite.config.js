import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "/arkgrid-gem/" : "/";

export default defineConfig({
    plugins: [react()],
    base: basePath,
    build: {
        outDir: "docs",
        emptyOutDir: true,
    },
});
