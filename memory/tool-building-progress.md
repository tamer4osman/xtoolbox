# Tool Building Progress

## Current Status: 294 built, 7 planned = 301 total

## Phase 25: Most Wanted Tools (Planned)

Source: `mostWantedTools.json` — Added 2026-06-03

### CSS & Web Design (4 planned)
- [x] SVG Optimizer & Minifier (`svg-optimizer`)
- [x] WCAG Color Contrast Checker (`wcag-contrast-checker`)
- [x] CSS Sprite Sheet Generator (`css-sprite-generator`)
- [x] Font Subsetter (`font-subsetter`)

### Developer Tools (12 planned)
- [x] Docker Compose Generator (`docker-compose-generator`)
- [x] NGINX Config Generator (`nginx-config-generator`)
- [x] Gitignore Generator (`gitignore-generator`)
- [x] Environment Variable Editor (`env-editor`)
- [x] LLM Token Counter (`llm-token-counter`)
- [x] Mock Data Generator (`mock-data-generator`)
- [x] SQL Playground (`sql-playground`)
- [x] Database Schema Designer (`database-schema-designer`)
- [x] FFmpeg Command Generator (`ffmpeg-command-generator`)
- [x] Chmod Calculator (`chmod-calculator`)
- [x] Code Screenshot Generator (`code-screenshot-generator`)
- [x] PWA Manifest Generator (`pwa-manifest-generator`)

### PDF (1 planned)
- [x] PDF Annotator (`pdf-annotator`)

### Business (6 planned)
- [x] Invoice Generator (`invoice-generator`)
- [x] Certificate Generator (`certificate-generator`)
- [x] NDA Generator (`nda-generator`)
- [x] Freelancer Rate Calculator (`freelancer-rate-calculator`)
- [x] Freelancer Contract Generator (`freelancer-contract-generator`)
- [x] Privacy Policy Generator (`privacy-policy-generator`)

### Productivity (5 planned)
- [x] Archive Repair & Recovery (`archive-repair`)
- [x] Archive Extractor (`archive-extractor`)
- [ ] Pomodoro Timer (`pomodoro-timer`)
- [x] Habit Tracker (`habit-tracker`)
- [x] Resume Builder (`resume-builder`)
- [x] Email Signature Generator (`email-signature-generator`)
- [x] 3D Model Viewer (`3d-model-viewer`)

### Video (1 planned)
- [ ] Screen Recorder (`screen-recorder`)

### Image (2 planned)
- [x] EXIF Data Editor (`exif-editor`)
- [ ] Open Graph Image Generator (`og-image-generator`)

### Text (1 planned)
- [x] Citation & Bibliography Generator (`citation-generator`)
- [x] Markdown Table Generator (`markdown-table-generator`)

### Audio (1 planned)
- [ ] Sound Effect Generator (`sound-effect-generator`)

### Finance (1 planned)
- [ ] Debt Payoff Visualizer (`debt-payoff-visualizer`)

### Encoding (1 planned)
- [x] HMAC Generator & Verifier (`hmac-generator`)

### Reference (1 planned)
- [x] World Clock & Time Zone Converter (`world-clock`)

### SEO (1 planned)
- [ ] Social Media Post Previewer (`social-media-post-previewer`)

---

## Phase 26: Uncommon High-Demand Tools (Planned)

> Source: System 2 analytical framework + adversarial audit + API discovery
> Status: 🟢 Phase 26 complete! 16/16 built.

| # | Tool | File | Category | Library |
|---|------|------|----------|---------|
| 1 | Food Nutrition Scanner | `reference/food-nutrition-scanner.js` | `reference` | Open Food Facts API ✅ |
| 2 | Passport / ID Photo Maker | `image/passport-photo-maker.js` | `image` | Canvas API ✅ |
| 3 | Corrupted ZIP / Archive Repair | `productivity/archive-repair.js` | `productivity` | fflate + libarchive.js WASM |
| 4 | Screen Ruler & Color Picker Overlay | `dev/screen-ruler.js` | `dev` | Canvas API + EyeDropper API ✅ |
| 5 | Regex Visualizer & Debugger | `dev/regex-visualizer.js` | `dev` | Pure JS (railroad-diagram) — enhance existing `regex-tester` |
| 6 | DNS Speed Test | `dev/dns-speed-test.js` | `dev` | Cloudflare DoH + Google DoH ✅ |
| 7 | Earthquake Monitor | `reference/earthquake-monitor.js` | `reference` | USGS Earthquake API ✅ |
| 8 | World Holiday Calendar & Planner | `reference/world-holidays.js` | `reference` | Nager.Date API |
| 9 | Link Preview Generator | `dev/link-preview-generator.js` | `dev` | Microlink API |
| 10 | Domain Intelligence | `dev/domain-intelligence.js` | `dev` | Cloudflare DoH + RDAP.org |
| 11 | Wireframe & Mockup Sketcher | `productivity/wireframe-sketcher.js` | `productivity` | Canvas API + SVG + jsPDF ✅ |
| 12 | Currency Exchange Calculator | `finance/currency-converter.js` | `finance` | Static rates ✅ |
| 13 | Pixel Art & Sprite Sheet Editor | `image/pixel-art-editor.js` | `image` | Canvas API ✅ |
| 14 | SVG Icon Editor & Optimizer | `css/svg-icon-editor.js` | `css` | Custom SVG parser + SVG-optimizer.js ✅ |
| 15 | Diff Viewer & Merge Tool | `text/diff-merge.js` | `text` | enhance existing `text-diff` with merge ✅ |
| 16 | Accessibility Audit Visualizer | `dev/a11y-audit.js` | `dev` | DOM-based WCAG checker ✅ (Phase 26 complete!) |

---

## Phase 27: 20 High-Demand Tools (Planned)

> Source: User demand + market gap analysis + competitor benchmarking
> Status: 🟡 In progress. 2/16 built. (2 removed: duplicates of `upscale-image`, `remove-metadata`)

| # | Tool | File | Category | Library |
|---|------|------|----------|---------|
| 1 | Vocal / Stem Separator | `audio/stem-separator.js` | `audio` | ONNX Runtime + demucs-mini |
| - | **Pomodoro Timer** (`pomodoro-timer.js`) | `productivity` | ✅ Built (Phase 27) |
| 2 | Noise / Hiss Remover | `audio/noise-remover.js` | `audio` | ONNX Runtime + DeepFilterNet |
| 3 | BPM & Key Detector | `audio/bpm-key-detector.js` | `audio` | Essentia.js WASM |
| 4 | Audio EQ & Visualizer | `audio/audio-equalizer.js` | `audio` | Web Audio API + lamejs |
| 5 | Local Video Transcriber | `video/video-transcriber.js` | `video` | Transformers.js (Whisper tiny) |
| 6 | Video Silence Remover | `video/silence-remover.js` | `video` | ffmpeg.wasm |
| 7 | JSON Diff Viewer | `dev/json-diff-viewer.js` | `dev` | Pure JS |
| 8 | OpenAPI / Swagger Visualizer | `dev/openapi-visualizer.js` | `dev` | js-yaml + Redoc standalone |
| 9 | GraphQL Schema Explorer | `dev/graphql-schema-explorer.js` | `dev` | graphql browser build |
| 10 | Offline Text Translator | `text/offline-translator.js` | `text` | Transformers.js (NLLB-200) |
| 11 | Legal Clause Simplifier | `text/legal-simplifier.js` | `text` | Transformers.js (DistilBERT) |
| 12 | Text Sentiment Heatmap | `text/sentiment-heatmap.js` | `text` | Transformers.js (DistilBERT SST-2) |
| 13 | Meeting Cost Calculator | `productivity/meeting-cost-calculator.js` | `productivity` | Pure JS + jsPDF |
| 14 | Working Days Calculator | `productivity/working-days-calculator.js` | `productivity` | Intl + bundled holidays JSON |
| 15 | Net Worth Tracker | `finance/net-worth-tracker.js` | `finance` | Chart.js + localStorage |
| 16 | Symptom Onset Tracker | `health/symptom-tracker.js` | `health` | Pure JS + jsPDF + localStorage |
| 17 | Face Blur / Anonymizer | `image/face-blur.js` | `image` | ONNX Runtime + BlazeFace |

---

## Completed Phases

### Phase 24: Privacy & Utility Expansion (18 tools) ✅
- PDF Visual Redactor, Page Textbook Splitter, CSS Glassmorphism Studio, Fluid Typography (CSS Clamp), Organic SVG Blob & Wave Generator, CSS Neumorphism Studio, CSS Pure Triangle Code Generator, Sitemap XML Visualizer, Log File Sensitive Data Masker, Website Asset Extractor, SQL to JSON & Schema Converter, Hosts File Configurator, Security Headers Generator, Bulk UTM Campaign URL Builder, Ambient Focus Soundboard, SRT/VTT Subtitle Sync Shifter, XML Formatter & Validator, Changelog Generator

### Phase 23: Gap Fill II (14 tools) ✅
- Stopwatch with Lap Timer, Number to Words, IP Subnet/CIDR Calculator, CSS Animation Generator, Color Format Converter, Text to Table Converter, Image Filter Gallery, cURL Command Builder, Time Duration Calculator, Aspect Ratio Calculator, Roman Numeral Converter, Text Line Sorter, Palindrome Checker, URL Parser & Builder
