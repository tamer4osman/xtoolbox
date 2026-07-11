import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.js"]
  },
  root: ".",
  esbuild: {
    jsx: "automatic"
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html"
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/pdf-lib")) return "pdf-lib";
          if (id.includes("node_modules/pdfjs-dist")) return "pdfjs";
          if (id.includes("node_modules/@ffmpeg")) return "ffmpeg";
          if (id.includes("node_modules/onnxruntime-web")) return "onnx";
          if (id.includes("node_modules/tesseract.js")) return "tesseract";
          if (id.includes("node_modules/chart.js")) return "chart";
          if (id.includes("node_modules/mathjs")) return "math";
          if (id.includes("node_modules/fabric")) return "fabric";
          if (id.includes("node_modules/cropperjs")) return "cropper";
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    // Workaround: Avast holds persistent handles on dist/assets after a build,
    // preventing Vite from clearing the output directory (EPERM). Skip deletion;
    // stale hashed chunks are harmless. Remove once Avast excludes dist/.
    emptyOutDir: false
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },
  preview: {
    port: 4173,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },
  optimizeDeps: {
    include: []
  },
  // Workaround: Avast on this dev box holds persistent handles on
  // node_modules/.vite/deps/* after `npm install`. Move the cache out
  // so `npm run dev` can rebuild it. Revert to default once Avast
  // excludes D:\Projects\xtoolbox.
  cacheDir: "C:/Users/tamer/AppData/Local/Temp/vite-cache-xtoolbox"
});
