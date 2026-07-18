// Copies the FFmpeg core (JS + WASM) from the installed @ffmpeg/core package
// into public/ffmpeg-core so it is served same-origin. Serving same-origin
// avoids Cross-Origin-Embedder-Policy tainting that breaks FFmpeg WASM when
// the core is loaded from a cross-origin CDN.
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const srcDir = resolve(root, "node_modules/@ffmpeg/core/dist/esm");
const destDir = resolve(root, "public/ffmpeg-core");

const files = ["ffmpeg-core.js", "ffmpeg-core.wasm"];

if (!existsSync(srcDir)) {
  console.error(
    "[copy-ffmpeg-core] @ffmpeg/core not found. Run `npm install` first."
  );
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });

for (const file of files) {
  const src = resolve(srcDir, file);
  const dest = resolve(destDir, file);
  if (!existsSync(src)) {
    console.error(`[copy-ffmpeg-core] missing source file: ${src}`);
    process.exit(1);
  }
  copyFileSync(src, dest);
  console.log(`[copy-ffmpeg-core] copied ${file}`);
}

console.log("[copy-ffmpeg-core] done");
