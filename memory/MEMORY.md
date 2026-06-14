# MEMORY.md - Long-Term Memory

## Project Overview
- **ToolBox**: 279+ free online client-side tools
- **Tech**: Vite + vanilla JS, pdf-lib, jsPDF, ffmpeg.wasm, WASM modules
- **Philosophy**: 100% client-side, no server backend, no accounts

## Key Learnings

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

## Codebase Patterns
- Factory pattern for deduplication (3+ similar tools → extract factory)
- `toolConfig` + `render(container)` export pattern
- `tools.json` as source of truth for registry
- `toolsList.json` kept in sync externally
- Categories: 21 categories across 22 folders (text has no category)
