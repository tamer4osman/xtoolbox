# 🛠️ ToolBox — Free Online Tools

**We are the tools you need every day.**

150+ free online tools. 100% client-side processing — your files never leave your device.

## Quick Start

```bash
npm install
npm run dev        # → localhost:3000
npm run build      # → dist/
npm run preview    # → preview build
npm run test       # → Playwright tests
```

## Stack

- **Vite** — blazing fast build tool
- **Vanilla JS** — no framework overhead
- **WebAssembly** — ffmpeg.wasm, ONNX Runtime, Tesseract.js, pdf-lib
- **Client-side** — zero server processing

## Build Progress

All 20 phases complete. Project is production-ready.

| Phase | Status |
|-------|--------|
| Phase 1: Foundation | ✅ Done (60+ tools) |
| Phase 2: PDF Tools | ✅ Done (14 tools) |
| Phase 3: Image Tools | ✅ Done (16 tools) |
| Phase 4: Video Tools | ✅ Done (10 tools) |
| Phase 5: Audio Tools | ✅ Done (10 tools) |
| Phase 6: OCR & Document | ✅ Done (4 tools) |
| Phase 7: QR & Barcode | ✅ Done (4 tools) |
| Phase 8: Privacy & Security | ✅ Done (6 tools) |
| Phase 9: Weather & Location | ✅ Done (4 tools) |
| Phase 10: Reference & Dictionary | ✅ Done (4 tools) |
| Phase 11: Finance & Calculators | ✅ Done (8 tools) |
| Phase 12: Math & Converters | ✅ Done (8 tools) |
| Phase 13: Health & Personal | ✅ Done (11 tools) |
| Phase 14: Text & Content | ✅ Done (19 tools) |
| Phase 15: Encoding & Hashing | ✅ Done (7 tools) |
| Phase 16: Data Visualization | ✅ Done (4 tools) |
| Phase 17: CSS & Web Design | ✅ Done (7 tools) |
| Phase 18: Developer Tools | ✅ Done (7 tools) |
| Phase 19: SEO & Content | ✅ Done (5 tools) |
| Phase 20: Monetization & Launch | ✅ Done |

**Total tools:** 150+

## Categories

| Category | Tools | Key Libraries | Status |
|----------|-------|---------------|--------|
| PDF | 14 | pdf-lib, PDF.js, jsPDF | ✅ |
| Image | 16 | Canvas API, Cropper.js, Pica, ONNX | ✅ |
| Video | 10 | ffmpeg.wasm | ✅ |
| Audio | 10 | Web Audio API, lamejs, Wavesurfer.js | ✅ |
| OCR | 4 | Tesseract.js | ✅ |
| QR & Barcode | 4 | qrcode, JsBarcode | ✅ |
| Privacy & Security | 6 | Web Crypto API | ✅ |
| Weather | 4 | wttr.in, Open-Meteo | ✅ |
| Reference | 4 | Free Dictionary API, Open Library | ✅ |
| Finance | 8 | Chart.js | ✅ |
| Math | 8 | math.js | ✅ |
| Health | 11 | Custom JS | ✅ |
| Text & Content | 19 | marked, turndown, js-yaml | ✅ |
| Encoding & Hashing | 7 | Web Crypto API | ✅ |
| Visualization | 4 | Chart.js, Papa Parse | ✅ |
| CSS & Web Design | 7 | Custom JS | ✅ |
| Developer | 7 | Custom JS | ✅ |
| SEO | 5 | Custom JS | ✅ |

## Project Structure

```
toolbox/
├── index.html                    ← Entry point
├── vite.config.js                ← Build config
├── package.json
├── manifest.json                 ← PWA manifest
├── robots.txt / _headers         ← SEO + deploy
│
├── src/
│   ├── main.js                   ← App bootstrap
│   ├── router.js                 ← Hash-based SPA router
│   │
│   ├── styles/                   ← Design system
│   │   ├── tokens.css            ← Colors, spacing, fonts
│   │   ├── reset.css             ← CSS reset
│   │   ├── global.css            ← Global styles
│   │   ├── utilities.css         ← Utility classes
│   │   └── components.css        ← All component styles
│   │
│   ├── components/               ← 15 reusable components
│   │   ├── navbar.js / footer.js
│   │   ├── file-upload.js        ← Drag & drop
│   │   ├── toast.js / modal.js
│   │   ├── card.js / range-slider.js / select.js
│   │   ├── progress-bar.js / loading.js / tabs.js
│   │   ├── tooltip.js / comparison-slider.js / ad-slot.js
│   │
│   ├── utils/                    ← Shared utilities
│   │   ├── file.js / dom.js / debounce.js
│   │   ├── format.js / clipboard.js / seo.js
│   │
│   ├── pages/                    ← Page templates
│   │   ├── home.js / category.js / tool.js
│   │   ├── about.js / privacy.js / terms.js / not-found.js
│   │
│   ├── tools/                    ← Tool implementations
│   │   ├── pdf/                  ← 14 PDF tools ✅
│   │   ├── image/                ← 16 image tools (next)
│   │   └── ...
│   │
│   ├── data/                     ← Static data
│   │   ├── tools.json            ← 128 tool definitions
│   │   ├── categories.json       ← 17 categories
│   │   └── countries.json        ← 50 countries
│   │
│   └── sw.js                     ← Service worker
```

## Deploy

Designed for Cloudflare Pages (free tier). Push to GitHub, connect repo, deploy.

## License

MIT
