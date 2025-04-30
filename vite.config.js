// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        minify: "terser", // Ensure minification for all outputs
        terserOptions: {
            compress: {
                drop_console: false, // Remove console logs
                drop_debugger: true, // Remove debugger statements
            },
            format: {
                comments: false, // Remove comments
                beautify: false, // Force minification
            },
        },
        lib: {
            entry: resolve(__dirname, "main.js"),
            name: "ElevensCookieThough",
            //formats: ["cjs"], // Ensure all formats are built
        },
        rollupOptions: {
            output: [
                {
                    format: "cjs",
                    entryFileNames: "elevens-cookie-though.js",
                    compact: true,
                },
            ],
        },
    },
});
