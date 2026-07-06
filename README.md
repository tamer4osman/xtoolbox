# 🛠️ ToolBox: Free Online Tools

**311 free online tools (+33 planned). 100% client-side processing: your files never leave your device.**

## Quick Start

```bash
npm install
npm run dev        # → localhost:3000
npm run build      # → dist/
npm run preview    # → preview build
npm run test       # → Playwright tests
```

## Stack

- **Vite**: fast build tool
- **Vanilla JS**: no framework overhead
- **WebAssembly**: ffmpeg.wasm, ONNX Runtime, Tesseract.js, pdf-lib
- **Client-side**: zero server processing

## Build Progress

27 phases complete. Phase 28 in progress (Legacy Catch-Up).

| Phase | Status |
| ------- | -------- |
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
| Phase 24: Client-Side Privacy & Utility Expansion | ✅ Done (18 tools) |
| Phase 25: Most Wanted Tools | ✅ Done (23 tools) |
| Phase 26: Uncommon High-Demand Tools | ✅ Done (16 tools) |
| Phase 27: High-Demand Tools | ✅ Done (19 tools) |
| Phase 28: Legacy Catch-Up | 🟡 In Progress (0/37) |

**Total tools:** 344 (308 built, 36 planned).

## Categories

| Category | Built | Planned | Total | Key Libraries | Status |
| ---------- | ------- | --------- | ------- | --------------- | -------- |
| Image | 39 | +4 | **43** | Canvas API, Cropper.js, Pica, ONNX, potrace.js, heic2any | 39/43 |
| Developer | 34 | +6 | **40** | Custom JS | 34/40 |
| Text & Content | 35 | — | **35** | marked, turndown, js-yaml, SheetJS | ✅ |
| PDF | 33 | — | **33** | pdf-lib, PDF.js, jsPDF | ✅ |
| Video | 18 | +8 | **26** | ffmpeg.wasm | 18/26 |
| CSS & Web Design | 20 | — | **20** | Custom JS | ✅ |
| Audio | 15 | +2 | **17** | Web Audio API, lamejs, Wavesurfer.js, ONNX Runtime Web | 15/17 |
| Business | 15 | +1 | **16** | Custom JS | 15/16 |
| Finance | 12 | +4 | **16** | Chart.js | 12/16 |
| Productivity | 14 | +4 | **18** | Custom JS | 14/18 |
| Math | 10 | +3 | **13** | math.js | 10/13 |
| Health | 12 | — | **12** | Custom JS | ✅ |
| Encoding & Hashing | 9 | — | **9** | Web Crypto API | ✅ |
| Reference | 7 | +1 | **8** | Free Dictionary API, Open Library | 7/8 |
| SEO | 8 | — | **8** | Custom JS | ✅ |
| Fun & Games | 5 | +1 | **6** | Custom JS | 5/6 |
| Privacy & Security | 6 | +2 | **8** | Web Crypto API | 6/8 |
| QR & Barcode | 4 | — | **4** | qrcode, JsBarcode | ✅ |
| OCR | 4 | — | **4** | Tesseract.js | ✅ |
| Visualization | 4 | — | **4** | Chart.js, Papa Parse | ✅ |
| Weather | 4 | — | **4** | wttr.in, Open-Meteo | ✅ |

## Phase 21 Tools (Market Expansion — Complete)

### 📄 PDF Tools (+9)

| Tool | Description | Library |
| ------ | ------------- | --------- |
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
| ------ | ------------- | --------- |
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
| ------ | ------------- | --------- |
| GIF to MP4 | Convert animated GIF to MP4 (smaller) | ffmpeg.wasm ✅ |
| WEBM to MP4 | Convert WEBM to MP4 format | ffmpeg.wasm ✅ |
| MOV to MP4 | Convert iPhone MOV to MP4 | ffmpeg.wasm ✅ |
| Add Subtitles | Burn SRT/VTT subtitles into video | ffmpeg.wasm ✅ |
| Video Resizer | Change video resolution | ffmpeg.wasm ✅ |

### 📝 Text & File Tools (+3)

| Tool | Description | Library |
| ------ | ------------- | --------- |
| Excel to XML | Convert .xlsx spreadsheets to XML | SheetJS + DOMParser ✅ |
| XML to Excel | Convert XML files to .xlsx | DOMParser + SheetJS ✅ |
| CSV Splitter | Split large CSV by row count | Papa Parse + JSZip ✅ |

## Project Structure

```text
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
│   │   ├── image/                ← 39 image tools (+3 planned)
│   │   ├── video/                ← 18 video tools (+5 planned)
│   │   ├── audio/                ← 15 audio tools (+1 planned)
│   │   ├── ocr/                  ← 4 OCR tools
│   │   ├── qr/                   ← 4 QR tools
│   │   ├── privacy/              ← 6 privacy tools
│   │   ├── weather/              ← 4 weather tools
│   │   ├── reference/            ← 7 reference tools (+1 planned)
│   │   ├── finance/              ← 12 finance tools (+3 planned)
│   │   ├── math/                 ← 10 math tools (+3 planned)
│   │   ├── health/               ← 12 health tools
│   │   ├── text/                 ← 35 text tools
│   │   ├── encoding/             ← 9 encoding tools
│   │   ├── visualization/        ← 4 visualization tools
│   │   ├── css/                  ← 20 CSS tools
│   │   ├── dev/                  ← 34 developer tools (+6 planned)
│   │   ├── productivity/         ← 14 productivity tools (+1 planned)
│   │   ├── fun/                  ← 5 fun tools (+1 planned)
│   │   ├── business/             ← 15 business tools
│   │   └── seo/                  ← 8 SEO tools
│   │
│   ├── data/                     ← Static data
│   │   ├── tools.json            ← 332 tool definitions (308 built, 24 planned)
│   │   ├── categories.json       ← 21 categories
│   │   └── countries.json        ← 50 countries
│   │
│   └── sw.js                     ← Service worker
```

## Phase 22 Tools (Gap Fill I: Complete, 6 tools)

## Phase 23 Tools (Gap Fill II: Complete, 14 tools)

| # | Tool | File | Category | Confirmed absent because… |
| --- | ------ | ------ | ---------- | -------------------------- |
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

## Phase 24 Tools (Client-Side Privacy & Utility Expansion: Complete, 18 done)

| # | Tool | File | Category | Confirmed absent because… |
| --- | ------ | ------ | ---------- | -------------------------- |
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
| 18 | Changelog conventional commit Generator | `text/git-changelog-generator.js` | `text` | Compiles raw git logs into structured release changelogs using Conventional Commit parser keys. ✅ |

### 🧩 Phase 24 Enhancements (to existing tools)

| Tool | Enhancement | Existing tool |
| --- | --- | --- |
| OG Mock Visualizer | Add social platform preview mock (X, Facebook, LinkedIn) | `seo/og-generator.js` |
| VCard (.vcf) Generator | Add .vcf file download output option | `qr/qr-generator.js` (vCard QR mode) |

## Tool Criteria

All tools must follow the **100% client-side** philosophy — no server backend, no accounts, no API keys.

### ✅ Good fit

| Category | Details |
| ---------- | --------- |
| **Pure browser APIs** | Canvas, Web Audio, FileReader, Compression Streams, MediaRecorder, Barcode Detection, Web Workers, Geolocation, Performance API |
| **WASM modules** | pdf-lib, Tesseract, ffmpeg.wasm, sql.js, libarchive.js, OpenCV.js, opentype.js, Kaitai Struct WASM, Comlink |
| **Processing model** | Input → process → output pipeline |
| **Data source** | Self-contained or public API without API key |
| **Embedded ML** | Small ONNX models (≤100MB) for classification, detection, transcription. Modules: Transformers.js, SqueezeNet, MobileNet V2, YOLOv8n, DeepLabV3, all-MiniLM-L6-v2, DistilBERT SST-2, Whisper tiny, Moonshine tiny, BlazeFace |
| **Audience** | Developers, creators, or general users |

### ❌ Bad fit

| Restriction | Reason |
| ------------- | -------- |
| Requires server backend | Violates 100% client-side principle |
| Requires authentication/accounts | Adds friction, breaks privacy promise |
| Real-time multiplayer/collaboration | Needs server infrastructure |
| Generative AI / LLMs / Chatbots | Out of scope — use dedicated AI platforms |
| Niche industrial use cases | Too narrow for general audience |

### 🔍 API Research References

Use these sources to discover new tool ideas, free public APIs, and validate criteria compliance.

#### Primary Directories (GitHub)

| Source | Stars | Focus | Link |
| -------- | ------- | ------- | ------ |
| **public-apis/public-apis** | ⭐ 441k | 1,400+ free APIs, categorized, with auth info | github.com/public-apis/public-apis |
| **public-api-lists/public-api-lists** | ⭐ 14.7k | 48 categories, searchable, community-maintained | github.com/public-api-lists/public-api-lists |
| **marcelscruz/public-apis** | ⭐ 9.1k | Collaborative list, actively maintained | github.com/marcelscruz/public-apis |

#### Curated Web Directories (No-Auth Filtered)

| Source | # APIs | Features | Link |
| -------- | -------- | ---------- | ------ |
| **Mixed Analytics List** | 224 | All no-auth, tested, sample URLs | mixedanalytics.com/blog/list-actually-free-open-no-auth-needed-apis |
| **FreePublicAPIs.com** | 598 | Tested daily, health scores | freepublicapis.com |
| **publicapis.io** | 1,000+ | Searchable, category-filtered | publicapis.io |
| **Apipheny Free API List** | 90+ | Code examples in JS/Python | apipheny.io/free-api |

## Deploy

Designed for Cloudflare Pages (free tier). Push to GitHub, connect repo, deploy.

## License

MIT

## Phase 25 Tools (Most Wanted: 🟡 14/39 built, 25 remaining)

Source: `mostWantedTools.json` — Tools most requested by users across Reddit, HN, X, and dev communities.

### 🎨 CSS & Web Design (+4)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 1 | ~~SVG Optimizer & Minifier~~ ✅ | `css/svg-optimizer.js` | SVGO browser port / custom parser | SVGOMG is hugely popular; zero client-side coverage — shipped |
| 2 | ~~WCAG Color Contrast Checker~~ ✅ | `css/wcag-contrast-checker.js` | Pure JS (relative luminance) | EU Accessibility Act 2025 driving demand — shipped |
| 3 | CSS Sprite Sheet Generator | `css/css-sprite-generator.js` | Canvas API + CSS generation | Active demand from r/gamedev |
| 4 | Font Subsetter | `css/font-subsetter.js` | opentype.js | Zero free client-side options exist |

### 🖥️ Developer Tools (+12)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 5 | ~~Docker Compose Generator~~ ✅ | `dev/docker-compose-generator.js` | Pure JS YAML emitter | DevOps essential, compose.ajnart.dev popular — shipped |
| 6 | ~~NGINX Config Generator~~ ✅ | `dev/nginx-config-generator.js` | Pure JS form-to-config | 6k+ GitHub stars on nginxconfig.io — shipped |
| 7 | ~~Gitignore Generator~~ ✅ | `dev/gitignore-generator.js` | Bundled JSON templates | gitignore.io is one of most-used dev tools — shipped |
| 8 | ~~Environment Variable Editor~~ ✅ | `dev/env-editor.js` | Pure JS editor + custom syntax highlight | No browser-based .env builder exists — shipped |
| 9 | ~~LLM Token Counter~~ ✅ | `dev/llm-token-counter.js` | Pure JS heuristic | Strongest 2025 dev trend — shipped |
| 10 | Mock Data Generator | `dev/mock-data-generator.js` | @faker-js/faker | 798 upvotes on Reddit, most requested |
| 11 | SQL Playground | `dev/sql-playground.js` | sql.js (SQLite WASM) + CodeMirror | Unique — no competitor offers this |
| 12 | Database Schema Designer | `dev/database-schema-designer.js` | Canvas/SVG + sql.js | DrawDB trending, no free browser option |
| 13 | FFmpeg Command Generator | `dev/ffmpeg-command-generator.js` | Pure JS form-to-CLI | FFmpeg CLI notoriously complex |
| 14 | ~~Chmod Calculator~~ ✅ | `dev/chmod-calculator.js` | Pure JS bitwise ops | Every Linux admin uses it — shipped |
| 15 | Code Screenshot Generator | `dev/code-screenshot-generator.js` | Highlight.js + html2canvas | Carbon.sh is very popular |
| 16 | PWA Manifest Generator | `dev/pwa-manifest-generator.js` | JSON generation + Canvas API | PWA development growing |

### 📄 PDF (+1)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 17 | PDF Annotator | `pdf/pdf-annotator.js` | PDF.js + pdf-lib + Canvas | #1 PDF request on Reddit |

### 💼 Business (+6)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 18 | Invoice Generator | `business/invoice-generator.js` | jsPDF + pdf-lib | 200K+ monthly searches |
| 19 | Certificate Generator | `business/certificate-generator.js` | Canvas + jsPDF + Papa Parse | Most tools paywalled |
| 20 | NDA Generator | `business/nda-generator.js` | jsPDF + template engine | Currently $200-500 by lawyers |
| 21 | Freelancer Rate Calculator | `business/freelancer-rate-calculator.js` | Pure JS math | #1 question in freelancer groups |
| 22 | Freelancer Contract Generator | `business/freelancer-contract-generator.js` | jsPDF + template engine | Indy requires signup, LegalZoom $100+ |
| 23 | Privacy Policy Generator | `business/privacy-policy-generator.js` | Pure JS + jsPDF | Every website needs one, 50K+ searches |

### ⏱️ Productivity (+6)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 24 | Archive Extractor | `productivity/archive-extractor.js` | fflate + libarchive.js | Every competitor has this, ToolBox has ZERO |
| 25 | Pomodoro Timer | `productivity/pomodoro-timer.js` | Web Notifications + localStorage | 100K+ monthly searches |
| 26 | Habit Tracker | `productivity/habit-tracker.js` | Pure JS + localStorage + Canvas | Massive Reddit demand |
| 27 | Resume Builder | `productivity/resume-builder.js` | jsPDF + pure JS | 150K+ monthly searches |
| 28 | Email Signature Generator | `productivity/email-signature-generator.js` | HTML/CSS template builder | Huge SEO potential, one-time setup |
| 29 | 3D Model Viewer | `productivity/3d-model-viewer.js` | Three.js + WebGL | Opens entirely new category |

### 🎬 Video (+1)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 30 | Screen Recorder | `video/screen-recorder.js` | getDisplayMedia() + MediaRecorder | 123apps key differentiator |

### 🖼️ Image (+2)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 31 | EXIF Data Editor | `image/exif-editor.js` | piexifjs / exifr | Only desktop ExifTool exists |
| 32 | Open Graph Image Generator | `image/og-image-generator.js` | Canvas API + html2canvas | Canva is overkill for OG images |

### 📝 Text (+2)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 33 | Citation & Bibliography Generator | `text/citation-generator.js` | Pure JS string formatting | EasyBib now aggressive paywalls |
| 34 | Markdown Table Generator | `text/markdown-table-generator.js` | Pure JS string formatting | Creating MD tables by hand is tedious |

### 🔊 Audio (+1)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 35 | Sound Effect Generator | `audio/sound-effect-generator.js` | Web Audio API + WAV encoding | r/gamedev frequently needs SFX |

### 💰 Finance (+1)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 36 | Debt Payoff Visualizer | `finance/debt-payoff-visualizer.js` | Chart.js + pure JS | No good free visual tool exists |

### 🔐 Encoding (+1)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 37 | HMAC Generator & Verifier | `encoding/hmac-generator.js` | Web Crypto API | API developers need HMAC tools |

### 📚 Reference (+1)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 38 | World Clock & Time Zone Converter | `reference/world-clock.js` | Intl.DateTimeFormat API | Remote workers constantly need this |

### 🔍 SEO (+1)

| # | Tool | File | Library | Why |
| --- | ------ | ------ | --------- | ----- |
| 39 | Social Media Post Previewer | `seo/social-media-post-previewer.js` | Pure JS + CSS mockups | Marketers need to preview before publishing |

> Note: Tool #39 (social-media-post-previewer) is included in the 39 total planned tools. See categories.json for authoritative counts.

## Phase 26 Tools (Uncommon High-Demand Tools: 🟢 16/16 complete!)

Source: System 2 analytical framework + adversarial audit + API discovery (public-apis/public-apis + Mixed Analytics List). All 20 tools validated through the 7-step Tool Idea Generation Process.

| # | Tool | File | Category | Library | Demand |
| --- | ------ | ------ | ---------- | --------- | -------- |
| 1 | Food Nutrition Scanner | `reference/food-nutrition-scanner.js` | `reference` | Open Food Facts API | Very High |
| 2 | Passport / ID Photo Maker | `image/passport-photo-maker.js` | `image` | Canvas API + BlazeFace | Very High |
| 3 | Corrupted ZIP / Archive Repair | `productivity/archive-repair.js` | `productivity` | fflate + libarchive.js WASM | High |
| 4 | Screen Ruler & Color Picker Overlay | `dev/screen-ruler.js` | `dev` | Canvas API + EyeDropper API | High |
| 5 | Regex Visualizer & Debugger | `dev/regex-visualizer.js` | `dev` | Pure JS (railroad-diagram) | Very High |
| 6 | DNS Speed Test | `dev/dns-speed-test.js` | `dev` | Cloudflare DoH + Google DoH | High |
| 7 | Earthquake Monitor | `reference/earthquake-monitor.js` | `reference` | USGS Earthquake API | Medium |
| 8 | World Holiday Calendar & Planner | `reference/world-holidays.js` | `reference` | Nager.Date API | High |
| 9 | Link Preview Generator | `dev/link-preview-generator.js` | `dev` | Microlink API | High |
| 10 | Domain Intelligence | `dev/domain-intelligence.js` | `dev` | Cloudflare DoH + RDAP.org | Very High |
| 11 | Wireframe & Mockup Sketcher | `productivity/wireframe-sketcher.js` | `productivity` | Canvas API + SVG + jsPDF | Very High |
| 12 | Currency Exchange Calculator | `finance/currency-exchange.js` | `finance` | ExchangeRate-API | Very High |
| 13 | Pixel Art & Sprite Sheet Editor | `image/pixel-art-editor.js` | `image` | Canvas API + custom pixel grid | High |
| 14 | SVG Icon Editor & Optimizer | `css/svg-icon-editor.js` | `css` | Custom SVG parser + SVGO | High |
| 15 | Diff Viewer & Merge Tool | `dev/diff-merge.js` | `dev` | diff npm + custom merge UI | Very High |
| 16 | Accessibility Audit Visualizer | `dev/a11y-audit.js` | `dev` | Pure JS (DOM analysis + WCAG) | Very High |
