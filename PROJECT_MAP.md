# PROJECT_MAP.md

> External memory foundation for the xtoolbox workspace.
> **How to use:** When a session needs project context, read this file. When a phase or tool changes architecture, update the relevant section here FIRST, then the phase docs.
> **How to edit:** Keep each section a raw list of facts. No prose essays. Tables only for counts/syncs. Update counts on every tool add/removal.

---

## [TECH_STACK]

- **App:** SPA, 100% client-side, no backend, no accounts, no API keys. All processing in-browser.
- **Build tool:** Vite 8 (`vite.config.js`). `type: module`.
- **Language:** Vanilla JS (ESM). No framework. No JSX except `.jsx` fallback paths in tool loader.
- **Router:** Custom hash router (`src/router.js`) — routes like `#/`, `#/category/:id`, `#/tools/:id`, `#/about`, `#/privacy`, `#/terms`, 404 handler.
- **Lint/Format:** oxlint (`npm run lint`) + oxfmt (`npm run format`). Fast Rust-based, replaces ESLint/Prettier.
- **Tests:**
  - Unit: Vitest 4 + jsdom (`npm run test:unit`) — files in `src/__tests__/*.test.js` (152 present).
  - E2E: Playwright (`npm run test`) — files in `tests/*.spec.js` (165 present), projects: Chromium/Firefox/Mobile Chrome.
  - Smoke: `npm run smoke <tool-id>` — headless Chrome loads tool page, checks render/header/control/errors/console/network.
  - Perf: `node scripts/measure-spa-performance.mjs` — all 8 page templates navigate <50ms warm.
- **Dependencies (runtime, 22):** `@ffmpeg/ffmpeg`, `@ffmpeg/util`, `ajv`, `docx`, `dompurify`, `exif-js`, `heic2any`, `html5-qrcode`, `jsbarcode`, `jspdf`, `jszip`, `mammoth`, `marked`, `mathjs`, `papaparse`, `pdf-lib`, `pdfjs-dist`, `qrcode`, `read-excel-file`, `tesseract.js`, `write-excel-file`.
- **DevDeps (key):** `@ffmpeg/core`, `@playwright/test`, `jsdom`, `oxfmt`, `oxlint`, `typescript`, `vite`, `vitest`, `yaml`, `size-limit`.
- **Vendor assets:** FFmpeg core copied to `public/ffmpeg-core/` by `scripts/copy-ffmpeg-core.mjs` (runs via `predev`/`prebuild`). Dev server adds CORP header for `/ffmpeg-core/`.
- **CSP:** Defined in `_headers` (default-src 'self', wasm-unsafe-eval for FFmpeg, specific external CDNs + data APIs allowlisted, `connect-src` lists every external API). Any new external domain must be added to `_headers` CSP + `vite.config.js`.
- **Size limits (size-limit):** Main bundle ≤200kB gzip; total JS ≤2MB gzip.
- **Scripts:** `predev`/`dev`, `prebuild`/`build`, `preview`, `lint`, `format`, `format:check`, `test`, `test:headed`, `test:ui`, `test:ci`, `test:mobile`, `test:debug`, `test:coverage`, `test:unit`, `smoke`, `size`, `size:why`.

---

## [SYSTEM_FLOW]

**SPA bootstrap (`src/main.js`):**
1. Global error handlers registered (uncaught errors + unhandled rejections → console).
2. Styles imported: `global.css`, `components.css`, `utilities.css`.
3. Core modules imported: router, navbar, footer, tooltip.
4. On DOMContentLoaded: render navbar into `#navbar`, footer into `#footer`, init navbar + tooltips.
5. Routes registered — page renderers **lazy-loaded via `import()`** (home, category, tool, about, privacy, terms, not-found).
6. Router initialized (`initRouter`): listens to `hashchange`, handles initial load.
7. Service worker registered at `/src/sw.js` (on load).

**Routing (`src/router.js`):**
- `on(path, handler)` — path with `:param` → regex via `pathToRegex`.
- `navigate(path)` sets `window.location.hash`.
- `handleRouteChange()`: if leaving `/tools/` → dynamic-import `pages/tool.js` and call `cleanupToolResources()`; then run any registered `currentCleanup`; then `matchRoute(path)` → handler or 404; then `scrollTo(0,0)` + update `.active` nav links.
- `setCleanup(fn)` sets `currentCleanup` (used by tool route).
- `setNotFound(handler)` for 404.

**Tool page flow (`src/pages/tool.js`):**
1. `renderTool(toolId)` → `cleanupCurrentTool()`, look up meta in `src/data/tools.json` (404 page if missing).
2. `updatePageMeta()` + `addStructuredData()` (WebApplication + FAQPage schema).
3. Render shell (header + loading spinner), then `loadToolModule(category, toolId)`:
   - Uses `import.meta.glob("../tools/*/*.{js,jsx}")`; cache keyed `${category}/${toolId}`.
   - Reads `module.cleanup` (NOT `destroy`) and stores as `cleanupFn`.
4. `renderFn(toolContainer)` — uses `module.render` or first exported fn starting with `render*`. Internal `h1/h2/.tool-header` stripped (page header already shows title).
5. `queueMicrotask` defers below-the-fold: ad slot (`createAdSlot`), How-to steps, FAQ (from tool meta), Recently Used grid.
6. Errors → `.error-state` div with message.
7. `cleanupToolResources()` exported → called by router on navigation away.

**Registry → page → tool-module contract:**
- `src/data/tools.json` is the **single source of truth** for tool metadata (id, name, category, description, icon, status done/planned, phase, href, keywords, steps, faqs).
- Every tool is a module in `src/tools/<category>/<id>.js` exporting `toolConfig` (id/name/category/description/icon/accept/maxSizeMB/keywords/steps/faqs) + `render(container)` + optional `cleanup`.
- `toolsList.json` (root) is the external tracking copy — **must stay in sync** with `src/data/tools.json` (both 343 entries).
- Factory modules live in `src/tools/<category>/` or `src/tools/shared/` and are imported by tool files (NOT registered as tools).

---

## [ARCHITECTURE]

**Directory layout:**
```
src/
  main.js                 # entry: bootstrap, route registration, SW
  router.js               # hash router
  sw.js                   # service worker
  data/
    tools.json            # registry (source of truth, 343)
    categories.json       # 21 categories, counts must match registry
  pages/
    home.js category.js tool.js about.js privacy.js terms.js not-found.js
  components/             # 15: navbar, footer, card, modal, toast, tabs,
                          #   file-upload, range-slider, select, tooltip,
                          #   progress-bar, loading, comparison-slider,
                          #   ad-slot, calc-factory
  utils/                  # 21: dom-query, dom-create, dom, file, format, color,
                          #   escape-html, safe-fetch, clipboard, csv, csv-parser,
                          #   debounce, recent-tools, seo, file-list,
                          #   calculator-form, generator-tool, single-file-tool,
                          #   preload-sri, archive-utils, tools
  styles/                 # global.css, components.css, utilities.css, tokens.css
  tools/<category>/<id>.js  # tool modules
  tools/shared/           # shared factories + css: basic-tool-factory,
                          #   lookup-tool-factory, merge-tool-factory,
                          #   char-grid-factory, tabs-css, etc.
  __tests__/              # Vitest unit tests (152)
tests/                    # Playwright specs (165)
scripts/                  # copy-ffmpeg-core, measure-spa-performance, smoke-test-tool
```

**Tool factories (extract when 3+ tools share scaffold):**
- `audio/audio-tool-factory.js` — audio upload→options→preview→download (used by audio-speed, audio-pitch target).
- `image/image-tool-factory.js`, `image/onnx-tool-factory.js`, `image/pixel-tool-factory.js`, `image/upload-tool-factory.js`.
- `video/video-tool-factory.js`, `video/video-converter-factory.js`.
- `pdf/pdf-converter-factory.js`, `pdf/pdf-options-tool-factory.js`, `pdf/pdf-overlay-tool-factory.js`, `pdf/pdf-preview-tool-factory.js`.
- `encoding/codec-tool-factory.js`, `text/codec-factory.js`.
- `business/business-calc-factory.js`, `finance/finance-calculator-factory.js`, `health/health-calculator-factory.js`, `css/css-generator-factory.js`, `qr/scanner-factory.js`, `shared/basic-tool-factory.js`, `shared/lookup-tool-factory.js`, `shared/merge-tool-factory.js`, `shared/char-grid-factory.js`.

**Audio subsystem (relevant to audio-pitch):**
- `src/tools/audio/audio-utils.js` — `loadAudioFile`, `audioBufferToWav`, `changeSpeed` (linear resample), `formatAudioTime`.
- `src/tools/audio/noise-remover.js` — currently exports `hannWindow`, `fft`, `ifft`, `stft`, `istft` (lines 8–163) → **to be extracted to shared `src/tools/audio/dsp.js`**.
- `src/tools/audio/bpm-key-detector.js` — has duplicated `fftInPlace` (lines 117–128) → **to fold into dsp.js**.
- `src/tools/audio/audio-tool.js` — reference pattern (factory + slider + Apply + Download).

**Planned dsp.js layer (approved design):**
- New `src/tools/audio/dsp.js` exports: `hannWindow`, `fft`, `ifft`, `fftInPlace`, `stft`, `istft`, `phaseVocoder` (STFT stretch by factor R = 2^(semitones/12), then resample back to original duration).
- `audio-pitch` tool (`src/tools/audio/audio-pitch.js`): hand-rolled phase vocoder, ZERO new deps. UI: −12..+12 semitone slider + key dropdown (C..B) + preset chips; upload via `createAudioTool` → Apply → Play/Pause preview (AudioBufferSourceNode) + Download WAV.
- Refactors: `noise-remover.js` and `bpm-key-detector.js` import from dsp.js. Re-run their unit + e2e tests after refactor.

---

## [ORPHANS & PENDING]

**Registry state (verified 2026-08-08):**
- Total **343** = **332 done** + **11 planned**. `tools.json` = `toolsList.json` = 343. `categories.json` sums to 343 across 21 categories.
- README line 3: "343 online tools"; line 6 badge: tools-331 (should read 343/331 — badge shows done count); line 46: "**343 tools**". `src/pages/home.js` + `src/components/footer.js` must also hold 343.

**Category counts (tools.json):** audio 17, business 16, css 20, dev 38, encoding 9, finance 16, fun 6, health 12, image 43, math 13, ocr 4, pdf 33, privacy 9, qr 4, reference 8, seo 8, text 35, video 26, visualization 4, weather 4, productivity 18. **Sum = 343.**

**11 planned tools (no impl yet) — `tools.json` status=planned:**
| id | category |
|---|---|
| audio-to-midi-converter | audio |
| env-parser | dev |
| resume-job-matcher | business |
| salary-calc | finance |
| retirement-planner | finance |
| decision-matrix | productivity |
| timesheet-tracker | productivity |
| password-breach-checker | privacy |
| link-preview | reference |
| name-generator | fun |
| video-scene-cut-detector | video |

**On-disk helpers that are NOT tools (imported by real tools — do not register):**
`src/tools/dev/nginx-constants.js`, `web-asset-constants.js`, `web-asset-extractors.js`; `src/tools/health/health-calculator.js`; `src/tools/image/create-image-tool.js`, `format-converter-tool.js`, `image-filter-tool.js`; `src/tools/pdf/image-to-pdf-tool.js`, `pdf-page-browser.js`; `src/tools/productivity/sound-nodes.js`; `src/tools/qr/qr-content-builders.js`, `qr-styles.js`. (Verified: each is imported by ≥1 done tool; the on-disk tool tree is clean — no true orphans.)

**Registry/doc sync requirements (from AGENTS.md):** After every tool change, update ALL of: `toolsList.json`, `src/data/tools.json`, `README.md`, `PROJECT-PLAN.md`, `memory/tool-building-progress.md`, `src/pages/home.js`, `src/data/categories.json`, `src/components/footer.js`. Never update one registry file alone.

**Current open work:** `audio-pitch` (Phase 28, first planned tool) — built + browser-verified, docs synced, pending commit (awaiting user approval of live tool test at `http://localhost:3000/#/tools/audio-pitch`). `link-preview` was added to registry only (not in PROJECT-PLAN) and stays pending.

---

## [MILESTONES] — Phase 28: audio-pitch

Verifiable goals; each milestone blocks the next. Commits only after user approval.

**M0 — Baseline (verify before coding):**
- `npm run build` passes (exit 0).
- `npm run test:unit` passes (all 152).
- `npm run test` (Playwright) passes — at minimum audio-related specs.
- `npx oxlint src` passes, `npx oxfmt --check` clean.
- Confirm `memory/plan-pitch-shifter.md` matches this map.

**M1 — dsp.js extraction (shared DSP layer):**
- Create `src/tools/audio/dsp.js` with `hannWindow/fft/ifft/fftInPlace/stft/istft/phaseVocoder`.
- Refactor `noise-remover.js` + `bpm-key-detector.js` to import from dsp.js; no behavior change.
- New `src/__tests__/dsp.test.js` (round-trip: fft→ifft identity, stft→istft, phaseVocoder preserves duration & basic pitch).
- Verify: `npm run build`, `npm run test:unit`, re-run `noise-remover`/`bpm-key-detector` e2e specs.

**M2 — audio-pitch tool:**
- `src/tools/audio/audio-pitch.js` (toolConfig + render + cleanup), uses `createAudioTool` factory + slider (−12..+12) + key dropdown + presets + Play/Pause + WAV download.
- `src/__tests__/audio-pitch.test.js` + `tests/audio-pitch.spec.js`.
- Verify: `npm run build`, `npm run test:unit`, `npm run smoke audio-pitch`, `node scripts/measure-spa-performance.mjs`, `npx oxlint` + `oxfmt`, Chrome DevTools page check (console/network/snapshot).

**M3 — Registry + docs sync (Phase 28 conventions):**
- Add audio-pitch to `toolsList.json` + `src/data/tools.json` (status done).
- Update README.md (343→344), PROJECT-PLAN.md, `memory/tool-building-progress.md`.
- Update `src/pages/home.js`, `src/data/categories.json` (audio 17→18), `src/components/footer.js`.
- Verify with `npx fallow dead-code/dupes/health` + final full build/test pass.
- **Commit only after user tests the tool at `http://localhost:3000/#/tools/audio-pitch` and approves.**
