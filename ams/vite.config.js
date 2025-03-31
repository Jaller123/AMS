import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify",
    },
  },
  define: {
    global: "window", // 👈 Definierar `global` för att undvika felet
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "window", // 👈 Fixar kompatibilitet med Node.js-moduler
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
});
