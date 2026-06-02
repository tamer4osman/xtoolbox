# 🛠️ ToolBox — Free Online Tools

**241 free online tools. 100% client-side processing — your files never leave your device.**

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

24 phases. Phases 1–23 complete. Phase 24 in progress.

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
| Phase 22: Format Converters | ✅ Done (11 tools: pptx-to-pdf, epub-to-pdf, remove-watermark-pdf, png-to-jpg, jpg-to-png, jpg-to-pdf, png-to-pdf, heic-to-jpg, pdf-to-csv, pdf-to-epub, delete-pdf-pages) |
| Phase 23: Gap Fill I | ✅ Done (6 tools) |
| Phase 23: Gap Fill II | ✅ Done (14 tools) |
| Phase 24: Client-Side Privacy & Utility Expansion | 🏗️ In Progress (17 done, 1 planned) |

**Total tools:** 243 unique verified tools (242 built, 1 planned).

## Categories

| Category | Existing | New | Total | Key Libraries | Status |
|----------|----------|-----|-------|---------------|--------|
| PDF | 31 | +2 | **33** | pdf-lib, PDF.js, jsPDF | 31/33 |
| Image | 34 | — | **34** | Canvas API, Cropper.js, Pica, ONNX, potrace.js, heic2any | ✅ |
| Video | 15 | — | **15** | ffmpeg.wasm | ✅ |
| Audio | 10 | — | **10** | Web Audio API, lamejs, Wavesurfer.js | ✅ |
| OCR | 4 | — | **4** | Tesseract.js | ✅ |
| QR & Barcode | 4 | — | **4** | qrcode, JsBarcode | ✅ |
| Privacy & Security | 6 | — | **6** | Web Crypto API | ✅ |
| Weather | 4 | — | **4** | wttr.in, Open-Meteo | ✅ |
| Reference | 4 | — | **4** | Free Dictionary API, Open Library | ✅ |
| Finance | 9 | — | **9** | Chart.js | ✅ |
| Math | 10 | — | **10** | math.js | ✅ |
| Health | 11 | — | **11** | Custom JS | ✅ |
| Text & Content | 27 | +2 | **29** | marked, turndown, js-yaml, SheetJS | 28/29 |
| Encoding & Hashing | 8 | — | **8** | Web Crypto API | ✅ |
| Visualization | 4 | — | **4** | Chart.js, Papa Parse | ✅ |
| CSS & Web Design | 14 | +5 | **19** | Custom JS | 15/19 |
| Developer | 10 | +6 | **16** | Custom JS | ✅ |
| Fun & Games | 5 | — | **5** | Custom JS | ✅ |
| Business | 8 | — | **8** | Custom JS | ✅ |
| SEO | 6 | +2 | **8** | Custom JS | 6/8 |
| Productivity | 3 | +3 | **6** | Custom JS | 5/6 |

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
| GIF to MP4 | Convert animated GIF to MP4 (smaller) | ffmpeg.wasm ✅ |
| WEBM to MP4 | Convert WEBM to MP4 format | ffmpeg.wasm ✅ |
| MOV to MP4 | Convert iPhone MOV to MP4 | ffmpeg.wasm ✅ |
| Add Subtitles | Burn SRT/VTT subtitles into video | ffmpeg.wasm ✅ |
| Video Resizer | Change video resolution | ffmpeg.wasm ✅ |

### 📝 Text & File Tools (+3)

| Tool | Description | Library |
|------|-------------|---------|
| Excel to XML | Convert .xlsx spreadsheets to XML | SheetJS + DOMParser ✅ |
| XML to Excel | Convert XML files to .xlsx | DOMParser + SheetJS ✅ |
| CSV Splitter | Split large CSV by row count | Papa Parse + JSZip ✅ |

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
│   │   ├── pdf/                  ← 33 PDF tools
│   │   ├── image/                ← 34 image tools
│   │   ├── video/                ← 15 video tools
│   │   ├── audio/                ← 10 audio tools
│   │   ├── ocr/                  ← 4 OCR tools
│   │   ├── qr/                   ← 4 QR tools
│   │   ├── privacy/              ← 6 privacy tools
│   │   ├── weather/              ← 4 weather tools
│   │   ├── reference/            ← 4 reference tools
│   │   ├── finance/              ← 9 finance tools
│   │   ├── math/                 ← 10 math tools
│   │   ├── health/               ← 11 health tools
│   │   ├── text/                 ← 27 text tools (+2 Phase 24)
│   │   ├── encoding/             ← 8 encoding tools
│   │   ├── visualization/        ← 4 visualization tools
│   │   ├── css/                  ← 13 CSS tools (+5 Phase 24)
│   │   ├── dev/                  ← 10 developer tools (+6 Phase 24)
│   │   ├── productivity/         ← 3 tools (+3 Phase 24)
│   │   ├── fun/                  ← 5 fun tools
│   │   ├── business/             ← 8 business tools
│   │   └── seo/                  ← 6 SEO tools (+2 Phase 24)
│   │
│   ├── data/                     ← Static data
│   │   ├── tools.json            ← 230+ tool definitions
│   │   ├── categories.json       ← 19 categories (productivity added in Phase 22)
│   │   └── countries.json        ← 50 countries
│   │
│   └── sw.js                     ← Service worker
```

## Phase 22 Tools (Gap Fill I — Complete, 6 tools)

---

## Phase 23 Tools (Gap Fill II — Complete, 14 tools)

| # | Tool | File | Category | Confirmed absent because… |
|---|------|------|----------|--------------------------|
| 1 | Stopwatch with Lap Timer | `productivity/stopwatch.js` | `productivity` | `presentation-timer` counts down; `pomodoro-timer` is cyclic. No start/pause/lap/reset stopwatch |
| 2 | Number to Words | `text/number-to-words.js` | `text` | 13 math tools and 20+ text tools — none converts numerals to written English ("1234" → "one thousand...") |
| 3 | IP Subnet / CIDR Calculator | `dev/subnet-calculator.js` | `dev` | `my-ip.js` shows your IP only. No subnet/network/broadcast/host-range calculator anywhere |
| 4 | CSS Animation Generator | `css/animation-generator.js` | `css` | 8 CSS tools: gradient/shadow/clip-path/grid/flexbox etc. Zero cover `@keyframes` |
| 5 | Color Format Converter | `css/color-converter.js` | `css` | `color-palette.js` generates harmonies; `image-color-picker` picks from images. No HEX↔RGB↔HSL↔HSV↔CMYK converter |
| 6 | Text to Table Converter | `text/text-to-table.js` | `text` | `table-generator.js` = manual row/col UI builder. No tool parses pasted CSV/TSV/pipe text → HTML or Markdown table |
| 7 | Image Filter Gallery | `image/image-filters.js` | `image` | `brightness-contrast.js` = sliders; `grayscale-sepia.js` = 2 effects. No named preset filter gallery (Warm/Cool/Fade/Vivid etc.) |
| 8 | cURL Command Builder | `dev/curl-builder.js` | `dev` | `nginx-generator.js` and `docker-generator.js` exist (Phase 44). No cURL builder anywhere in 44 phases |
| 9 | Time Duration Calculator | `math/duration-calculator.js` | `math` | `date-difference.js` = days between two dates. No tool adds/subtracts time durations (2h 30m + 1h 45m = 4h 15m) |
| 10 | Aspect Ratio Calculator | `math/aspect-ratio.js` | `math` | `resize-image.js` = pixel resizer. No tool simplifies a ratio or finds equivalent dimensions for a given ratio |
| 11 | Roman Numeral Converter | `text/roman-numerals.js` | `text` | `base-converter.js` handles binary/octal/hex/decimal — Roman numerals are non-positional and absent from all 44 phases |
| 12 | Text Line Sorter | `text/line-sorter.js` | `text` | All 20+ text tools are format converters or analyzers. No tool sorts lines alphabetically, numerically, by length, or randomly |
| 13 | Palindrome Checker | `fun/palindrome.js` | `fun` | Text, fun, student, and dev tools all checked — no palindrome detector in any of the 44 phases |
| 14 | URL Parser & Builder | `dev/url-parser.js` | `dev` | `url-codec.js` (Phase 15) percent-encodes strings. Completely different from parsing URL structure into protocol/host/port/path/query/hash |

**No new dependencies.** All 14 tools use only browser built-ins: `URL` API, `Date`, Canvas API, vanilla JS.

---

## Phase 24 Tools (Client-Side Privacy & Utility Expansion — In Progress, 17 done, 1 planned)

| # | Tool | File | Category | Confirmed absent because… |
|---|------|------|----------|--------------------------|
| 1 | PDF Visual Redactor | `pdf/pdf-secure-redact.js` | `pdf` | Draws black rectangles to visually hide sensitive text. Note: this is visual redaction only, not destructive. ✅ |
| 2 | Page Textbook Splitter | `pdf/textbook-splitter.js` | `pdf` | Splits dual landscape-scanned pages mathematically down the center into separate consecutive portrait pages. ✅ |
| 3 | CSS Glassmorphism Studio | `css/glassmorphism-generator.js` | `css` | Interactive studio for generating cross-browser glassmorphism styling with Safari fallbacks. ✅ |
| 4 | Fluid Typography (CSS Clamp) Generator | `css/css-clamp-generator.js` | `css` | Computes complex algebraic viewport scaling equations for responsive font clamp rules. ✅ |
| 5 | Organic SVG Blob & Wave Generator | `css/svg-blob-generator.js` | `css` | Visual path editor to generate organic SVG vector dividers and blobs offline. ✅ |
| 6 | CSS Neumorphism Studio | `css/neumorphism-generator.js` | `css` | Interactive tool to generate convex, concave, or pressed shadow sets based on a hue luminance offset. ✅ |
| 7 | CSS Pure Triangle Code Generator | `css/css-triangle-generator.js` | `css` | Simple editor to generate CSS border-based triangles in any direction. ✅ |
| 8 | Sitemap XML Visualizer | `dev/sitemap-visualizer.js` | `dev` | Formats and visualizes complex sitemap.xml hierarchies into collapsible tree diagrams. ✅ |
| 9 | Log File Sensitive Data Masker | `dev/log-anonymizer.js` | `dev` | Locally screens server logs using regex to mask IP addresses, tokens, and sensitive keys. ✅ |
| 10 | Website Asset Extractor | `dev/web-asset-extractor.js` | `dev` | Parses pasted HTML markup and extracts inline SVGs, styles, and external fonts for study. ✅ |
| 11 | SQL to JSON & Schema Converter | `dev/sql-to-json.js` | `dev` | Converts database table creation statements and insertions into structured JSON lists. ✅ |
| 12 | Hosts File Configurator | `dev/hosts-file-generator.js` | `dev` | Generates formatted local network alias hosts configurations from a simple visual key table. ✅ |
| 13 | Security Headers Generator | `dev/security-headers-generator.js` | `dev` | Evaluates site policies and generates secure CSP, HSTS, and referrer headers configurations. ✅ |
| 14 | Bulk UTM Campaign URL Builder | `seo/bulk-utm-builder.js` | `seo` | Builds multiple tracking URLs at once from lists, supporting presets and CSV export. ✅ |
| 15 | Ambient Focus Soundboard | `productivity/ambient-sound-mixer.js` | `productivity` | Customizes custom background sounds locally with multi-track loop mixing nodes. ✅ |
| 16 | SRT / VTT Subtitle Sync Shifter | `productivity/subtitle-time-shifter.js` | `productivity` | Offsets subtitle file timings in bulk via millisecond-level time-shifting regex. ✅ |
| 17 | XML Formatter & Validator | `text/xml-formatter.js` | `text` | Formats, validates, and highlights nested XML content without server transmissions. ✅ |
| 18 | Changelog conventional commit Generator | `text/git-changelog-generator.js` | `text` | Compiles raw git logs into structured release changelogs using Conventional Commit parser keys. |

### 🧩 Phase 24 Enhancements (to existing tools)

| Tool | Enhancement | Existing tool |
|------|-------------|---------------|
| OG Mock Visualizer | Add social platform preview mock (X, Facebook, LinkedIn) | `seo/og-generator.js` |
| VCard (.vcf) Generator | Add .vcf file download output option | `qr/qr-generator.js` (vCard QR mode) |

---

## Deploy

Designed for Cloudflare Pages (free tier). Push to GitHub, connect repo, deploy.

## License

MIT
