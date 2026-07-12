import { defineConfig } from "vite";
import os from "os";
import path from "path";

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
    open: !process.env.CI && process.env.NODE_ENV !== "test",
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: blob: https://covers.openlibrary.org https://world.openfoodfacts.org https://api.coingecko.com; connect-src 'self' https://wttr.in https://api.coingecko.com https://api.dictionaryapi.dev https://earthquake.usgs.gov https://api.waqi.info https://date.nager.at https://openlibrary.org https://cloudflare-dns.com https://dns.google https://*.openfoodfacts.org; font-src 'self' https://fonts.gstatic.com; worker-src 'self' blob:; frame-src 'none'"
    }
  },
  preview: {
    port: 4173,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: blob: https://covers.openlibrary.org https://world.openfoodfacts.org https://api.coingecko.com; connect-src 'self' https://wttr.in https://api.coingecko.com https://api.dictionaryapi.dev https://earthquake.usgs.gov https://api.waqi.info https://date.nager.at https://openlibrary.org https://cloudflare-dns.com https://dns.google https://*.openfoodfacts.org; font-src 'self' https://fonts.gstatic.com; worker-src 'self' blob:; frame-src 'none'"
    }
  },
  optimizeDeps: {
    include: []
  },
  // Workaround: Avast on this dev box holds persistent handles on
  // node_modules/.vite/deps/* after `npm install`. Move the cache out
  // so `npm run dev` can rebuild it. Revert to default once Avast
  // excludes D:\Projects\xtoolbox.
  cacheDir: path.join(os.tmpdir(), "vite-cache-xtoolbox")
});
