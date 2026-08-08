# MEMORY.md - Long-Term Memory

## Project Overview

- **ToolBox**: 279+ free online client-side tools
- **Tech**: Vite + vanilla JS, pdf-lib, jsPDF, ffmpeg.wasm, WASM modules
- **Philosophy**: 100% client-side, no server backend, no accounts

## Key Learnings

### Current WASM / Heavy Dependency Versions (2026-08-06)

> Always use these current versions when planning or building new tools.
> **Never** assume an older version from memory/training data. If unsure, read
> the actual installed version with `node -e "console.log(require('./node_modules/<pkg>/package.json').version)"`.

| Package           | Version    | How it's loaded at runtime                                                                                                                                                         | Notes                                                                             |
| ----------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `@ffmpeg/core`    | `^0.12.10` | Vendored to `public/ffmpeg-core/` via `scripts/copy-ffmpeg-core.mjs` (`predev`/`prebuild` hook). WASM loaded same-origin at `/ffmpeg-core/ffmpeg-core.wasm` to avoid COEP tainting | Newer ffmpeg.wasm core; verify VP9 if a tool needs WebM/VP9 output                |
| `@ffmpeg/ffmpeg`  | `^0.12.15` | npm package; `createFFmpeg`/`FFmpeg` from utils                                                                                                                                    | JS wrapper over the core WASM                                                     |
| `@ffmpeg/util`    | `^0.12.2`  | npm package (`fetchFile`, `toBlobURL`)                                                                                                                                             | Helpers for feeding files to ffmpeg                                               |
| `pdfjs-dist`      | `^6.2.108` | npm package; worker at `pdfjs-dist/build/pdf.worker.min.mjs?url`                                                                                                                   | Band 6 major line; `getDocument`/`render`/`getTextContent` API unchanged from 5.x |
| `pdf-lib`         | `^1.17.1`  | npm package                                                                                                                                                                        | PDF creation/editing                                                              |
| `jsPDF` (jspdf)   | `^4.2.1`   | npm package                                                                                                                                                                        | PDF generation                                                                    |
| `tesseract.js`    | `^7.0.0`   | npm package                                                                                                                                                                        | OCR                                                                               |
| `html2canvas`     | `^1.x`     | npm package                                                                                                                                                                        | DOM → canvas screenshots                                                          |
| `read-excel-file` | `^9.2.0`   | npm package                                                                                                                                                                        | Excel parsing                                                                     |
| `qrcode`          | `^1.5.4`   | npm package                                                                                                                                                                        | QR generation                                                                     |
| `html5-qrcode`    | `^2.3.8`   | npm package                                                                                                                                                                        | Camera/QR scanning                                                                |

**Source of truth:** `package.json` + `package-lock.json`. New tool-building sessions MUST read these
before choosing a library version, and MUST check for upgrades in `npm install` output.

### Deduplication Work (2026-06-14)

- **7 dead duplicate files** found in `src/tools/text/` — old versions rebuilt in `encoding/` and `fun/`
  - `text/base64-codec.js` → `encoding/base64-codec.js`
  - `text/hash-generator.js` → `encoding/hash-generator.js`
  - `text/html-entity-codec.js` → `encoding/html-entity-codec.js`
  - `text/morse-code.js` → `encoding/morse-code.js`
  - `text/url-codec.js` → `encoding/url-codec.js`
  - `text/uuid-generator.js` → `encoding/uuid-generator.js`
  - `text/random-picker.js` → `fun/random-picker.js`
- All had zero imports — confirmed dead code
- Neutralized to empty stubs (Avast file locks prevent deletion)

### image-to-pdf Unification (2026-06-14)

- `pdf/image-to-pdf.js` had standalone jsPDF implementation
- `pdf/jpg-to-pdf.js` and `pdf/png-to-pdf.js` used pdf-lib factory
- Unified all three to use `createImageToPdfTool` from `image-to-pdf-tool.js`
- Preserves backward compatibility (computes width/height from intrinsic dimensions)

### Functional Overlaps (Kept As-Is)

- `image-filters` vs `grayscale-sepia`: Different categories, different UX
- `word-frequency` vs `keyword-density`: Different audiences (general vs SEO)
- `remove-exif` vs `remove-metadata`: Different scopes (image-only vs multi-file)
- Removing would break existing URLs and registered tool entries

### Build & Test Commands

- `npm run build` — Vite production build
- `npm run test:unit` — Vitest unit tests
- `npm run test` — Playwright E2E tests
- Build output: `dist/` (primary), `dist-test/` (temp, clean up after)
- Pre-existing test failures: `cron-builder.test.js` (2 tests, unrelated to our work)

### File Lock Issues

- Avast antivirus holds handles on `dist/assets/*` and some `src/tools/text/*` files
- Workaround: Use `Remove-Item -Force` or neutralize with empty stubs
- Manual deletion needed when file locks release (reboot or close Vite dev server)

## User Context

- Junior full-stack JS engineer
- Prefers direct, honest feedback with "why" explanations
- Values learning and understanding over just getting answers

## ffmpeg.wasm VP9 Gotchas (Chroma Key Composer, 2026-08-03)

- **VP9 (`libvpx-vp9`) encoder is broken in ffmpeg.wasm core** — crashes with `RuntimeError: table index is out of bounds` / `memory access out of bounds` at random-ish frame boundaries. Observed at 0.12.6/0.12.9; whether it still affects **0.12.10 is unconfirmed** (see re-verify note below). `convert-video.js` WebM output (VP9) is affected at the versions where this reproduces.
- **VP8-alpha is the working path for transparency**: `-c:v libvpx -auto-alt-ref 0 -lag-in-frames 0 -pix_fmt yuva420p -c:a libopus out.webm` completes and preserves alpha.
- **ffprobe reports `yuv420p` for VP8-alpha WebM — this is a known ffprobe bug** (trac.ffmpeg.org/ticket/8344). It does NOT mean alpha was dropped. **Always verify alpha by rendering in a browser on a colored background and counting pixels** — never trust ffprobe for this.
- `@ffmpeg/core` upgraded to **0.12.10** (2026-08-06, when cargo upgrade was done). Relevant facts:
  - `public/ffmpeg-core/` is gitignored and holds a **vendored copy** (wasm 32232419 B). It is NOT edited by hand — it is auto-copied from `node_modules/@ffmpeg/core/dist/esm` by `scripts/copy-ffmpeg-core.mjs`, which runs via the `predev`/`prebuild` npm hooks. So the runtime WASM always mirrors the version declared in `package.json`. To update: bump `@ffmpeg/core` in package.json, run `npm install`, then build/dev — the copy happens automatically.
  - **OPEN RISK to re-verify:** the old "VP9 broken in 0.12.x" note was written for 0.12.6; whether `libvpx-vp9` encode still crashes at 0.12.10 is NOT yet confirmed. `convert-video.js` WebM (VP9) output should be smoke-tested against 0.12.10. Most video tools intentionally use VP8-alpha/`libvpx` (not VP9) for transparency, so they are unaffected regardless. Do not delete the VP9 warning below until this is re-tested.
- Pre-upgrade backups of the old 0.12.6 build: `C:\Users\tamer\AppData\Local\Temp\opencode\ffmpeg-core-0126.{js,wasm}.bak`.
- Chrome DevTools MCP + fixture foreground.mp4 (green bg + red ball) + blue-background pixel count is the canonical alpha test: expect blue≈216004, red≈14396, green=0 at t=1.5s.

## Codebase Patterns

- Factory pattern for deduplication (3+ similar tools → extract factory)
- `toolConfig` + `render(container)` export pattern
- `tools.json` as source of truth for registry
- `toolsList.json` kept in sync externally
- Categories: 21 categories across 22 folders (text has no category)
