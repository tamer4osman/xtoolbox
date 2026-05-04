# 🛠️ ToolBox — Free Online Tools

**We are the tools you need every day.**

180 free online tools. 100% client-side processing — your files never leave your device.

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

21 phases. All phases complete.

| Phase | Status |
|-------|--------|
| Phase 1: Foundation | ✅ Done (60+ tools) |
| Phase 2: PDF Tools | ✅ Done (28 tools) |
| Phase 3: Image Tools | ✅ Done (31 tools) |
| Phase 4: Video Tools | ✅ Done (15 tools) |
| Phase 5: Audio Tools | ✅ Done (10 tools) |
| Phase 6: OCR & Document | ✅ Done (4 tools) |
| Phase 7: QR & Barcode | ✅ Done (4 tools) |
| Phase 8: Privacy & Security | ✅ Done (5 tools) |
| Phase 9: Weather & Location | ✅ Done (4 tools) |
| Phase 10: Reference & Dictionary | ✅ Done (4 tools) |
| Phase 11: Finance & Calculators | ✅ Done (9 tools) |
| Phase 12: Math & Converters | ✅ Done (8 tools) |
| Phase 13: Health & Personal | ✅ Done (12 tools) |
| Phase 14: Text & Content | ✅ Done (21 tools) |
| Phase 15: Encoding & Hashing | ✅ Done (7 tools) |
| Phase 16: Data Visualization | ✅ Done (4 tools) |
| Phase 17: CSS & Web Design | ✅ Done (8 tools) |
| Phase 18: Developer Tools | ✅ Done (7 tools) |
| Phase 19: Fun & Games | ✅ Done (3 tools) |
| Phase 20: Monetization & Launch | ✅ Done |
| Phase 21: Market Expansion | ✅ Done (33 tools) |

**Total tools:** 178 unique verified tools.

## Categories

| Category | Existing | New | Total | Key Libraries | Status |
|----------|----------|-----|-------|---------------|--------|
| PDF | 19 | +9 | **28** | pdf-lib, PDF.js, jsPDF | ✅ |
| Image | 16 | +15 | **31** | Canvas API, Cropper.js, Pica, ONNX, potrace.js, heic2any | ✅ |
| Video | 10 | +5 | **15** | ffmpeg.wasm | ✅ |
| Audio | 10 | — | **10** | Web Audio API, lamejs, Wavesurfer.js | ✅ |
| OCR | 4 | — | **4** | Tesseract.js | ✅ |
| QR & Barcode | 4 | — | **4** | qrcode, JsBarcode | ✅ |
| Privacy & Security | 5 | — | **5** | Web Crypto API | ✅ |
| Weather | 4 | — | **4** | wttr.in, Open-Meteo | ✅ |
| Reference | 4 | — | **4** | Free Dictionary API, Open Library | ✅ |
| Finance | 9 | — | **9** | Chart.js | ✅ |
| Math | 8 | — | **8** | math.js | ✅ |
| Health | 4 | +8 | **12** | Custom JS | ✅ |
| Text & Content | 18 | +3 | **21** | marked, turndown, js-yaml, SheetJS | ✅ |
| Encoding & Hashing | 7 | — | **7** | Web Crypto API | ✅ |
| Visualization | 4 | — | **4** | Chart.js, Papa Parse | ✅ |
| CSS & Web Design | 8 | — | **8** | Custom JS | ✅ |
| Developer | 7 | — | **7** | Custom JS | ✅ |
| Fun & Games | 3 | — | **3** | Custom JS | ✅ |

## Phase 21 Tools (Market Expansion — Complete)

### 📄 PDF Tools (+9)

| Tool | Description | Library |
|------|-------------|---------|
| PDF to Word | Convert PDF to editable .docx | pdfjs-dist + docx |
| PDF to Excel | Extract tables from PDF to .xlsx | pdfjs-dist + SheetJS |
| PDF to PowerPoint | Convert PDF pages to .pptx slides | pdfjs-dist + pptxgenjs |
| PDF to CSV | Extract tabular data from PDF to CSV | pdfjs-dist + Papa Parse |
| PDF to EPUB | Convert PDF to e-book format | pdfjs-dist + epub-gen |
| Delete PDF Pages | Remove specific pages with visual selector | pdf-lib |
| PowerPoint to PDF | Convert .pptx presentations to PDF | JSZip + jsPDF |
| EPUB to PDF | Convert EPUB e-books to PDF | epubjs + jsPDF |
| PDF Watermark Remover | Remove overlay watermarks from PDFs | pdf-lib |

### 🖼️ Image Tools (+15)

| Tool | Description | Library |
|------|-------------|---------|
| HEIC to JPG | Convert iPhone HEIC photos to JPG | heic2any |
| PNG to JPG | Convert PNG to JPG with quality control | Canvas API |
| JPG to PNG | Convert JPG to lossless PNG | Canvas API |
| WebP to JPG | Convert WebP (Chrome) images to JPG | Canvas API |
| JPG to WebP | Convert JPG to WebP for smaller files | Canvas API |
| PNG to SVG | Vectorize raster images to SVG | potrace.js |
| SVG to PNG | Rasterize SVG vectors to PNG | Canvas API |
| Photo Colorizer | AI colorization of B&W photos | ONNX Runtime |
| Collage Maker | Multi-photo grid collages | Canvas API |
| Blur Background | Selective background blur | Canvas API |
| Add Border to Image | Colored borders and frames | Canvas API |
| Round Image Cropper | Circle/rounded crop for profile pics | Canvas API |
| Pixelate Image | Mosaic/pixelate for privacy | Canvas API |
| Image Sharpening | Unsharp mask sharpening | Canvas API |
| Remove Text from Image | OCR + inpainting to erase text | Tesseract.js + Canvas |

### 🎬 Video Tools (+5)

| Tool | Description | Library |
|------|-------------|---------|
| GIF to MP4 | Convert animated GIF to MP4 (smaller) | ffmpeg.wasm |
| WEBM to MP4 | Convert WEBM to MP4 format | ffmpeg.wasm |
| MOV to MP4 | Convert iPhone MOV to MP4 | ffmpeg.wasm |
| Add Subtitles | Burn SRT/VTT subtitles into video | ffmpeg.wasm |
| Video Resizer | Change video resolution | ffmpeg.wasm |

### 📝 Text & File Tools (+3)

| Tool | Description | Library |
|------|-------------|---------|
| Excel to XML | Convert .xlsx spreadsheets to XML | SheetJS + DOMParser |
| XML to Excel | Convert XML files to .xlsx | DOMParser + SheetJS |
| CSV Splitter | Split large CSV by row count | Papa Parse + JSZip |

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
│   │   ├── pdf/                  ← 28 PDF tools
│   │   ├── image/                ← 32 image tools
│   │   ├── video/                ← 15 video tools
│   │   ├── audio/                ← 10 audio tools
│   │   ├── ocr/                  ← 4 OCR tools
│   │   ├── qr/                   ← 4 QR tools
│   │   ├── privacy/              ← 5 privacy tools
│   │   ├── weather/              ← 4 weather tools
│   │   ├── reference/            ← 4 reference tools
│   │   ├── finance/              ← 9 finance tools
│   │   ├── math/                 ← 8 math tools
│   │   ├── health/               ← 4 health tools
│   │   ├── text/                 ← 21 text tools
│   │   ├── encoding/             ← 7 encoding tools
│   │   ├── visualization/        ← 4 visualization tools
│   │   ├── css/                  ← 8 CSS tools
│   │   ├── dev/                  ← 7 developer tools
│   │   └── fun/                  ← 3 fun tools
│   │
│   ├── data/                     ← Static data
│   │   ├── tools.json            ← 180 tool definitions
│   │   ├── categories.json       ← 18 categories
│   │   └── countries.json        ← 50 countries
│   │
│   └── sw.js                     ← Service worker
```

## Deploy

Designed for Cloudflare Pages (free tier). Push to GitHub, connect repo, deploy.

## License

MIT
