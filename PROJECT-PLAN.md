# Client-Side Tool Website — Project Plan

> **Purpose:** This file guides AI in generating initial plans for building new tools. It contains tool criteria, API research references, detailed tool specs (UI layouts, implementation notes, library choices), and current project status.

> **Goal:** 345+ professional tools, 100% client-side, monetized with Google AdSense
> **Stack:** Vite + Vanilla JS + WASM libraries
> **Hosting:** Cloudflare Pages (free tier)
> **Cost:** ~$10/year (domain only)

## Tool Criteria

All tools must follow the **100% client-side** philosophy: no server backend, no accounts, no API keys.

### ✅ Good fit

| Category | Details |
|----------|---------|
| **Pure browser APIs** | Canvas, Web Audio, FileReader, Compression Streams, MediaRecorder, Barcode Detection, Web Workers, Geolocation, Performance API |
| **WASM modules** | pdf-lib, Tesseract, ffmpeg.wasm, sql.js, libarchive.js, OpenCV.js, opentype.js, Kaitai Struct WASM, Comlink |
| **Processing model** | Input → process → output pipeline |
| **Data source** | Self-contained or public API without API key |
| **Embedded ML** | Small ONNX models (≤100MB) for classification, detection, transcription. Modules: Transformers.js, SqueezeNet, MobileNet V2, YOLOv8n, DeepLabV3, all-MiniLM-L6-v2, DistilBERT SST-2, Whisper tiny, Moonshine tiny, BlazeFace |
| **Audience** | Developers, creators, or general users |

### ❌ Bad fit

| Restriction | Reason |
|-------------|--------|
| Requires server backend | Violates 100% client-side principle |
| Requires authentication/accounts | Adds friction, breaks privacy promise |
| Real-time multiplayer/collaboration | Needs server infrastructure |
| Generative AI / LLMs / Chatbots | Out of scope — use dedicated AI platforms |
| Niche industrial use cases | Too narrow for general audience |

### 🔍 API Research References

Use these sources to discover new tool ideas, free public APIs, and validate criteria compliance.

#### Primary Directories (GitHub)

| Source | Stars | Focus | Link |
|--------|-------|-------|------|
| **public-apis/public-apis** | ⭐ 441k | 1,400+ free APIs, categorized, with auth info | github.com/public-apis/public-apis |
| **public-api-lists/public-api-lists** | ⭐ 14.7k | 48 categories, searchable, community-maintained | github.com/public-api-lists/public-api-lists |
| **marcelscruz/public-apis** | ⭐ 9.1k | Collaborative list, actively maintained | github.com/marcelscruz/public-apis |
| **dspinellis/awesome-rest-apis** | ⭐ 3.5k | Curated REST API list | github.com/dspinellis/awesome-rest-apis |
| **APIs-guru/graphql-apis** | ⭐ 4.7k | Public GraphQL APIs | github.com/APIs-guru/graphql-apis |

#### Curated Web Directories (No-Auth Filtered)

| Source | # APIs | Features | Link |
|--------|--------|----------|------|
| **Mixed Analytics List** | 224 | All no-auth, tested, sample URLs | mixedanalytics.com/blog/list-actually-free-open-no-auth-needed-apis |
| **FreePublicAPIs.com** | 598 | Tested daily, health scores | freepublicapis.com |
| **publicapis.io** | 1,000+ | Searchable, category-filtered | publicapis.io |
| **public-apis.io** | 1,000+ | REST APIs, categorized | public-apis.io |
| **Apipheny Free API List** | 90+ | Code examples in JS/Python | apipheny.io/free-api |
| **FreeAPIHub.com** | 193 | APIs + AI models | freeapihub.com |

#### Tool Idea Generation Process

1. **Discover** — Browse `public-apis/public-apis` for categories matching tool gaps
2. **Cross-reference** — Check `Mixed Analytics List` (no-auth only) for verified free APIs
3. **Deduplicate** — Check if any existing tool already covers this (avoid duplicates)
4. **Validate against Tool Criteria** — Must pass ALL of these:

   **✅ Good fit (must match at least one):**
   - Pure browser API (Canvas, Web Audio, FileReader, Compression Streams, MediaRecorder, Barcode Detection, Web Workers, Geolocation, Performance API)
   - WASM module (pdf-lib, Tesseract, ffmpeg.wasm, sql.js, libarchive.js, OpenCV.js, opentype.js, Kaitai Struct WASM, Comlink)
   - Input → process → output pipeline
   - Self-contained or public API without API key
   - Small ONNX model (≤100MB) for classification, detection, transcription (Transformers.js, SqueezeNet, MobileNet V2, YOLOv8n, DeepLabV3, all-MiniLM-L6-v2, DistilBERT SST-2, Whisper tiny, Moonshine tiny, BlazeFace)
   - Useful to developers, creators, or general users

   **❌ Bad fit (must NOT match any):**
   - Requires server backend (violates 100% client-side)
   - Requires authentication/accounts (adds friction, breaks privacy)
   - Real-time multiplayer/collaboration (needs server infrastructure)
   - Generative AI / LLMs / Chatbots (out of scope)
   - Niche industrial use cases (too narrow for general audience)

5. **Technical check**: API returns JSON, supports CORS, no binary streams
6. **Demand check**: Estimate user demand (search volume, community requests)
7. **Build**: Create tool following the tool-building workflow in AGENTS.md

## Current Status

**Total tools:** 344 (308 built, 36 planned)

### Categories (with actual tool counts)

| Category | Tools |
|----------|-------|
| Image | 43 |
| Dev | 40 |
| Text | 35 |
| PDF | 33 |
| Video | 26 |
| Audio | 17 |
| Finance | 16 |
| Business | 16 |
| CSS | 20 |
| Productivity | 18 |
| Math | 13 |
| Health | 12 |
| Encoding | 9 |
| Reference | 8 |
| SEO | 8 |
| Fun | 6 |
| Privacy | 8 |
| QR | 4 |
| OCR | 4 |
| Visualization | 4 |
| Weather | 4 |

### Planned Tools (36)

See `src/data/tools.json` for the full list. Key planned tools:

**Phase 28 — Legacy Catch-Up (24 original + 12 new from instructions review):**
- Image basics: image-blur, image-compare, image-meme
- Video basics: video-crop, video-rotate, video-volume, video-reverse, video-metadata-editor, chroma-key-composer, video-scene-cut-detector, video-stabilizer
- Audio: audio-pitch, audio-to-midi-converter
- Dev playgrounds: js-playground, html-playground, json-schema-validator, env-parser, timezone-converter, regex-visualizer
- Finance: salary-calc, savings-calc, retirement-planner, expense-splitter
- Math: equation-solver, matrix-calc, stats-calc
- Productivity: decision-matrix, mind-map-maker, kanban-board, timesheet-tracker
- Privacy: browser-fingerprint-checker, password-breach-checker
- Business: resume-job-matcher
- Reference: link-preview
- Fun: name-generator

## Planned Tool Specs

Detailed specs for upcoming tools with UI layouts, implementation notes, and library choices.

### Phase 27: AI/ML Tools ✅ COMPLETE

> **Libraries:** Transformers.js, ONNX Runtime Web, ffmpeg.wasm, Essentia.js
> **Pattern:** Input file → WASM/ONNX processing → output file

#### noise-remover

- **File:** `src/tools/audio/noise-remover.js`
- **Category:** audio
- **Purpose:** Remove background noise from audio recordings
- **Library:** RNNoise (ONNX port) or simple spectral gating
- **UI:**
  1. File upload (accept `.mp3,.wav,.m4a`)
  2. Noise profile: "Auto" or "Manual" (capture noise sample)
  3. Strength slider (0-100%)
  4. Before/after waveform comparison
  5. Play processed audio + download
- **Implementation notes:**
  - Spectral gating: FFT → identify noise floor → subtract
  - Web Worker for FFT processing
  - Real-time preview if audio < 30s

#### bpm-key-detector

- **File:** `src/tools/audio/bpm-key-detector.js`
- **Category:** audio
- **Purpose:** Detect beats per minute and musical key from audio files
- **Library:** Essentia.js WASM (music analysis algorithms)
- **UI:**
  1. File upload (drag & drop, accept `.mp3,.wav,.flac,.ogg`)
  2. "Analyze" button with progress indicator
  3. Results display: BPM (large), Musical Key (e.g., "C major"), Confidence percentage
  4. Beat visualization: waveform with beat markers overlaid
  5. Copy results / Download as TXT
- **Implementation notes:**
  - Load Essentia.js WASM backend (~20MB) with lazy initialization
  - Extract BPM using RhythmExtractor2013 algorithm
  - Detect key using KeyExtractor (HPCP-based chroma analysis)
  - Process in Web Worker to avoid UI blocking
  - Support batch analysis for multiple files

#### audio-equalizer

- **File:** `src/tools/audio/audio-equalizer.js`
- **Category:** audio
- **Purpose:** 10-band parametric equalizer with real-time spectrum visualizer
- **Library:** Web Audio API (BiquadFilterNode, AnalyserNode)
- **UI:**
  1. File upload (accept `.mp3,.wav,.m4a,.ogg`)
  2. 10 frequency band sliders (31Hz, 62Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz)
  3. Preamp master gain slider
  4. Preset dropdown: Flat, Bass Boost, Treble Boost, Vocal, Rock, Jazz, Classical
  5. Real-time spectrum analyzer display (canvas-based)
  6. A/B compare toggle (original vs processed)
  7. Download processed audio
- **Implementation notes:**
  - Chain 10 BiquadFilterNode instances in AudioContext
  - Use AnalyserNode for real-time FFT visualization
  - Animate spectrum via requestAnimationFrame
  - Process via OfflineAudioContext for export
  - Store custom presets in localStorage

#### screen-recorder

- **File:** `src/tools/video/screen-recorder.js`
- **Category:** video
- **Purpose:** Record screen, webcam, or both
- **Library:** MediaRecorder API (native)
- **UI:**
  1. Source selector: Screen, Webcam, Both
  2. Quality: 720p, 1080p, 4K
  3. Audio: System audio, Microphone, Both, None
  4. "Start Recording" button with timer
  5. Live preview of recording area
  6. Stop → preview → download as WebM
- **Implementation notes:**
  - `navigator.mediaDevices.getDisplayMedia()` for screen
  - `navigator.mediaDevices.getUserMedia()` for webcam
  - Combine streams with `MediaStream` constructor
  - MediaRecorder with `video/webm;codecs=vp9`

#### video-transcriber

- **File:** `src/tools/video/video-transcriber.js`
- **Category:** video
- **Purpose:** Extract audio from video and generate timestamped transcript
- **Library:** Whisper tiny via Transformers.js + ffmpeg.wasm
- **UI:**
  1. Video file upload (accept `.mp4,.webm,.mov`)
  2. Language selector (auto-detect + manual)
  3. "Transcribe" button with progress
  4. Results: timestamped transcript (click timestamp to seek video)
  5. Export: TXT, SRT, VTT subtitles
- **Implementation notes:**
  - ffmpeg.wasm extracts audio track
  - Whisper tiny model (~75MB) runs in browser
  - Process in 30-second chunks for memory efficiency
  - Use Web Worker for inference

#### silence-remover

- **File:** `src/tools/video/silence-remover.js`
- **Category:** video
- **Purpose:** Automatically detect and cut silent sections from video
- **Library:** ffmpeg.wasm (silencedetect + trim filters)
- **UI:**
  1. Video file upload (accept `.mp4,.webm,.mov`)
  2. Silence threshold slider (-60dB to -20dB, default -30dB)
  3. Minimum silence duration input (default 1s)
  4. Preview mode: show timeline with detected silent regions highlighted
  5. Manual override: click to toggle silence/speech regions
  6. "Remove Silence" button with progress
  7. Download trimmed video
- **Implementation notes:**
  - Use ffmpeg.wasm `silencedetect` filter to find silence regions
  - Generate trim filter complex for removing gaps
  - Render preview timeline with silence markers on canvas
  - Support real-time threshold adjustment with re-detection
  - Handle large files via chunked processing

#### openapi-visualizer

- **File:** `src/tools/dev/openapi-visualizer.js`
- **Category:** dev
- **Purpose:** Visualize OpenAPI 3.x specifications as interactive documentation
- **Library:** js-yaml (YAML parsing), custom renderer
- **UI:**
  1. Input area: Paste JSON/YAML or file upload (`.json,.yaml,.yml`)
  2. "Parse & Visualize" button
  3. Navigation sidebar: Endpoints grouped by tags, expandable
  4. Main panel: Endpoint details with method badge, path, parameters, request/response schemas
  5. Schema tree viewer: collapsible object/array structures
  6. "Try It" panel: fill parameters, see example request
  7. Export as standalone HTML
- **Implementation notes:**
  - Parse OpenAPI 3.0/3.1 specs with js-yaml
  - Build recursive schema renderer for `$ref` resolution
  - Color-code HTTP methods (GET=green, POST=blue, PUT=orange, DELETE=red)
  - Validate spec structure and show warnings for issues
  - Support both JSON and YAML input with auto-detection

#### graphql-schema-explorer

- **File:** `src/tools/dev/graphql-schema-explorer.js`
- **Category:** dev
- **Purpose:** Browse and explore GraphQL SDL schemas with type relationships
- **Library:** graphql (SDL parsing, schema introspection)
- **UI:**
  1. Input area: Paste SDL schema string or file upload (`.graphql,.gql`)
  2. "Parse Schema" button
  3. Type navigation sidebar: Queries, Mutations, Subscriptions, Types, Enums, Interfaces
  4. Type detail panel: fields, arguments, return types with clickable links
  5. Relationship graph: visual node-edge diagram of type connections (canvas)
  6. Search: filter types and fields by name
  7. Export schema as SDL or JSON
- **Implementation notes:**
  - Use `graphql.parse()` to build AST from SDL
  - Traverse AST to extract types, fields, directives
  - Build adjacency list for type relationship graph
  - Render graph with force-directed layout on canvas
  - Support SDL comments and descriptions

#### offline-translator

- **File:** `src/tools/text/offline-translator.js`
- **Category:** text
- **Purpose:** Translate 50+ languages offline without API keys
- **Library:** Transformers.js (facebook/nllb-200-distilled-600M)
- **UI:**
  1. Source language dropdown (auto-detect option)
  2. Target language dropdown
  3. Source text textarea
  4. "Translate" button with progress
  5. Translated output textarea
  6. Swap languages button
  7. Copy translation / Download as TXT
  8. Model download status indicator (~600MB on first use)
- **Implementation notes:**
  - Load NLLB-200 distilled model (~600MB) via Transformers.js
  - Cache model in IndexedDB for offline reuse
  - Process text in 512-token chunks
  - Show download progress on first load
  - Support right-to-left languages (Arabic, Hebrew)

#### legal-clause-simplifier

- **File:** `src/tools/text/legal-clause-simplifier.js`
- **Category:** text
- **Purpose:** Simplify complex legal text into plain language summaries
- **Library:** Transformers.js (DistilBART summarization)
- **UI:**
  1. Text input area (paste or type legal text)
  2. File upload option (`.txt,.pdf`)
  3. Simplification level: Basic, Detailed, Bullet Points
  4. "Simplify" button with progress
  5. Output panel: simplified text with key terms highlighted
  6. Side-by-side comparison view
  7. Export simplified text as TXT/MD
- **Implementation notes:**
  - Use DistilBART for abstractive summarization (~120MB)
  - Pre-process text: split into clauses, preserve structure
  - Post-process: highlight defined terms, preserve definitions
  - Chunk long documents (process in sections)
  - Add glossary sidebar for detected legal terms

#### sentiment-heatmap

- **File:** `src/tools/text/sentiment-heatmap.js`
- **Category:** text
- **Purpose:** Generate sentence-by-sentence sentiment heatmap from text
- **Library:** Transformers.js (DistilBERT SST-2 sentiment model)
- **UI:**
  1. Text input area (paste or type text)
  2. File upload (`.txt,.md,.docx`)
  3. "Analyze Sentiment" button with progress
  4. Heatmap display: sentences colored green (positive) to red (negative)
  5. Summary panel: overall sentiment score, positive/negative/neutral counts
  6. Hover tooltip: exact score per sentence
  7. Export heatmap as PNG or HTML
- **Implementation notes:**
  - Load DistilBERT SST-2 (~67MB) for sentiment scoring
  - Score each sentence independently
  - Map scores to color gradient (HSL interpolation)
  - Use canvas for heatmap rendering with text wrapping
  - Support documents up to 50,000 words

#### meeting-cost-calculator

- **File:** `src/tools/productivity/meeting-cost-calculator.js`
- **Category:** productivity
- **Purpose:** Calculate real-time meeting cost based on participant salaries
- **UI:**
  1. Participant list: name, hourly rate (or annual salary + currency)
  2. Add/remove participant rows
  3. Meeting duration input (hours:minutes)
  4. Real-time cost ticker that updates as duration increases
  5. Results: total cost, cost per minute, cost breakdown bar chart
  6. "Export Report" button (CSV/JSON)
  7. Save/load participant lists (localStorage)
- **Implementation notes:**
  - Auto-calculate hourly rate from annual salary (÷ 2080 hours)
  - Currency selector with symbol display
  - Use setInterval for live cost ticker during meetings
  - Store participant presets for recurring teams
  - Generate shareable cost report

#### working-days-calculator

- **File:** `src/tools/productivity/working-days-calculator.js`
- **Category:** productivity
- **Purpose:** Calculate business days between dates for 50+ countries
- **UI:**
  1. Start date picker
  2. End date picker
  3. Country/region selector (grouped by continent)
  4. "Calculate" button
  5. Results: working days count, weekend days, public holidays
  6. Holiday list: expandable list of holidays in date range
  7. Exclude custom dates (add specific non-working days)
- **Implementation notes:**
  - Include 2024-2027 holiday data for 50+ countries
  - Handle weekday-based holidays (e.g., US Thanksgiving)
  - Support country-specific working week (Mon-Fri vs Sun-Thu)
  - Allow custom holiday exclusion for company-specific days
  - Calculate duration in multiple units (days, weeks, months)

#### net-worth-tracker

- **File:** `src/tools/finance/net-worth-tracker.js`
- **Category:** finance
- **Purpose:** Private net worth tracker with portfolio visualization
- **Library:** Chart.js (line/doughnut charts), localStorage
- **UI:**
  1. Asset categories: Cash, Investments, Real Estate, Vehicles, Other
  2. Liability categories: Loans, Credit Cards, Mortgage, Other
  3. Add/edit/delete entries with amount and date
  4. Net worth summary: total assets, total liabilities, net worth
  5. Portfolio breakdown: doughnut chart by category
  6. Historical trend: line chart over time
  7. Export data as JSON (import/export for backup)
- **Implementation notes:**
  - All data stored in localStorage (100% private)
  - No external API calls — manual entry only
  - Auto-save on every change
  - Chart.js for responsive visualizations
  - Support multiple currency display

#### face-blur

- **File:** `src/tools/image/face-blur.js`
- **Category:** image
- **Purpose:** Auto-detect and blur faces in images for privacy
- **Library:** BlazeFace ONNX model via ONNX Runtime Web
- **UI:**
  1. Image upload (drag & drop, accept `.jpg,.png,.webp`)
  2. Blur strength slider (1-50, default 15)
  3. Detection confidence threshold slider (0.3-0.9)
  4. Face preview: bounding boxes overlaid on image
  5. Manual mode: draw additional rectangles to blur
  6. "Blur Faces" button
  7. Download processed image
- **Implementation notes:**
  - Load BlazeFace model (~5MB) via ONNX Runtime Web
  - Run detection on canvas, get bounding boxes
  - Apply Gaussian blur to detected face regions via canvas
  - Use `getImageData` / `putImageData` for pixel manipulation
  - Support batch processing for multiple images

#### symptom-tracker

- **File:** `src/tools/health/symptom-tracker.js`
- **Category:** health
- **Purpose:** Log symptoms with timeline visualization and PDF export
- **Library:** jsPDF (PDF generation), Chart.js (timeline chart)
- **UI:**
  1. Symptom entry form: name, severity (1-10 slider), date/time, notes
  2. Quick-add common symptoms (headache, fatigue, nausea, etc.)
  3. Timeline view: chronological symptom log with severity chart
  4. Filter by symptom type or date range
  5. Export: PDF report (charts + log table) or CSV
  6. Local storage for all data (no cloud sync)
  7. Medication/treatment log alongside symptoms
- **Implementation notes:**
  - Store entries in localStorage with unique IDs
  - Chart.js line chart for severity over time
  - jsPDF generates formatted PDF with embedded charts
  - Support recurring symptom patterns
  - Optional color-coding by body system (digestive, neurological, etc.)

### Phase 28: Legacy Catch-Up Tools

> **Pattern:** Simple tools using Canvas API, basic DOM, or free public APIs
> **Goal:** Fill gaps in image/video/audio basic operations + finance/math/dev utilities

#### Image Basics (9 tools)

All follow the scaffold using `image-tool-factory.js`.

#### image-flip

- **File:** `src/tools/image/image-flip.js`
- **Category:** image
- **Purpose:** Flip image horizontally or vertically
- **Library:** Canvas API (image-tool-factory)
- **UI:**
  1. Upload area (drag & drop, accept `image/*`)
  2. Flip direction: Horizontal / Vertical / Both (radio buttons or icon toggles)
  3. Live preview with before/after overlay slider
  4. Output format selector (original, PNG, JPEG, WebP)
  5. Download button
- **Implementation notes:**
  - Use `image-tool-factory` scaffold with `renderPreview` callback applying `ctx.scale(-1, 1)` or `ctx.scale(1, -1)`
  - Apply flip via `ctx.translate` + `ctx.scale` before `ctx.drawImage`
  - Preserve EXIF orientation from original image
  - Support undo/redo with simple state stack

#### image-rotate

- **File:** `src/tools/image/image-rotate.js`
- **Category:** image
- **Purpose:** Rotate image by preset angles or arbitrary degrees
- **Library:** Canvas API (image-tool-factory)
- **UI:**
  1. Upload area (drag & drop, accept `image/*`)
  2. Preset buttons: 90 CW, 90 CCW, 180, Flip H, Flip V
  3. Custom degree input (0-360) with live dial preview
  4. Background color picker for non-90 rotations (to fill empty corners)
  5. Live preview with before/after toggle
  6. Download button
- **Implementation notes:**
  - 90/180 rotations: swap canvas dimensions and redraw
  - Arbitrary angles: calculate new bounding box (`w|cos(t)| + h|sin(t)|`)
  - Use `ctx.rotate(angle)` after `ctx.translate` to center
  - Allow user to set fill color for exposed corners

#### image-grayscale

- **File:** `src/tools/image/image-grayscale.js`
- **Category:** image
- **Purpose:** Convert image to grayscale using pixel manipulation
- **Library:** Canvas API (image-tool-factory)
- **UI:**
  1. Upload area (drag & drop, accept `image/*`)
  2. Method selector: Luminosity (default), Average, Desaturate
  3. Strength slider (0-100%) for partial grayscale effect
  4. Live preview with before/after overlay
  5. Download button
- **Implementation notes:**
  - Luminosity: `0.299R + 0.587G + 0.114B`
  - Average: `(R + G + B) / 3`
  - Desaturate: `(max(R,G,B) + min(R,G,B)) / 2`
  - Use `getImageData`/`putImageData` for per-pixel processing
  - Strength slider blends original and grayscale pixels

#### image-sepia

- **File:** `src/tools/image/image-sepia.js`
- **Category:** image
- **Purpose:** Apply warm sepia tone filter to images
- **Library:** Canvas API (image-tool-factory)
- **UI:**
  1. Upload area (drag & drop, accept `image/*`)
  2. Sepia intensity slider (0-100%)
  3. Warmth adjustment (cool to warm)
  4. Live preview with before/after overlay
  5. Download button
- **Implementation notes:**
  - Standard sepia matrix: `R' = 0.393R + 0.769G + 0.189B`, `G' = 0.349R + 0.686G + 0.168B`, `B' = 0.272R + 0.534G + 0.131B`
  - Clamp each channel to 0-255
  - Strength slider linearly interpolates between original and sepia pixels
  - Can optionally apply slight vignette for vintage effect

#### image-sharpen

- **File:** `src/tools/image/image-sharpen.js`
- **Category:** image
- **Purpose:** Sharpen images using unsharp mask with convolution kernel
- **Library:** Canvas API (image-tool-factory)
- **UI:**
  1. Upload area (drag & drop, accept `image/*`)
  2. Amount slider (0-200%) — strength of sharpening
  3. Radius slider (0.5-5px) — blur radius for unsharp mask
  4. Threshold slider (0-255) — min brightness difference to sharpen
  5. Live preview with before/after overlay
  6. Download button
- **Implementation notes:**
  - Unsharp mask: `sharpened = original + amount * (original - blurred)`
  - Use Gaussian blur for the blur component
  - Convolution kernel approach for direct sharpening: `[[0,-1,0],[-1,5,-1],[0,-1,0]]`
  - Threshold prevents sharpening smooth areas (reduces noise amplification)

#### image-watermark

- **File:** `src/tools/image/image-watermark.js`
- **Category:** image
- **Purpose:** Add text or image watermark with opacity control
- **Library:** Canvas API (image-tool-factory)
- **UI:**
  1. Upload area (drag & drop, accept `image/*`)
  2. Watermark type: Text / Image toggle
  3. Text mode: text input, font selector, size, color
  4. Image mode: upload watermark image (PNG with transparency)
  5. Position grid (9-point selector: top-left, center, bottom-right, etc.)
  6. Opacity slider (0-100%)
  7. Rotation slider (-180 to 180)
  8. Tiling toggle (repeat watermark across image)
  9. Live preview
  10. Download button
- **Implementation notes:**
  - Draw base image, then overlay watermark with `globalAlpha` for opacity
  - For tiling, calculate grid positions and draw multiple instances
  - Text watermarks: use `ctx.font` and `ctx.fillStyle`
  - Support custom font upload for text watermarks

#### image-compare

- **File:** `src/tools/image/image-compare.js`
- **Category:** image
- **Purpose:** Side-by-side or overlay image comparison
- **Library:** Canvas API (no factory needed — unique UI)
- **UI:**
  1. Two upload areas (Image A and Image B) with drag & drop
  2. Comparison modes: Side-by-side, Overlay (swipe), Difference, Pixel diff
  3. Swipe slider (for overlay mode) to reveal before/after
  4. Synchronized zoom and pan controls
  5. Difference view highlights changed pixels in red
  6. Side-by-side synchronized scrolling
  7. Export diff as PNG
- **Implementation notes:**
  - Side-by-side: two canvas elements with synced scroll/zoom
  - Overlay: single canvas, clip left half to Image A, right half to Image B
  - Difference mode: `abs(pixelA - pixelB)` per channel, highlight nonzero
  - Handle different image sizes by scaling smaller to match larger
  - Use `AbortController` for cancelling ongoing diff operations on large images

#### image-meme

- **File:** `src/tools/image/image-meme.js`
- **Category:** image
- **Purpose:** Add top and bottom text to images for meme creation
- **Library:** Canvas API (image-tool-factory)
- **UI:**
  1. Upload area (drag & drop, accept `image/*`)
  2. Top text input
  3. Bottom text input
  4. Font selector (Impact, Arial Black, custom)
  5. Text color picker + outline color picker
  6. Text size slider (auto-fit vs manual)
  7. All-caps toggle
  8. Live preview
  9. Download button
- **Implementation notes:**
  - Use Canvas text rendering with `ctx.strokeText` for outline effect
  - Auto-size: measure text width, scale font size to fit image width
  - Default to Impact font with white fill and black 3px stroke (classic meme style)
  - Add slight vertical padding for text placement
  - Support multiline text with manual line breaks

#### Video Basics (6 tools)

All use ffmpeg.wasm for processing.

#### video-crop

- **File:** `src/tools/video/video-crop.js`
- **Category:** video
- **Purpose:** Crop video to a selected rectangular region
- **Library:** ffmpeg.wasm
- **UI:**
  1. Video file upload (accept `.mp4,.webm,.mov,.avi`)
  2. Video preview with draggable crop rectangle overlay
  3. Crop coordinates inputs (X, Y, Width, Height) with lock aspect ratio toggle
  4. Preset ratios: Free, 16:9, 4:3, 1:1, 9:16
  5. Apply Crop button with progress indicator
  6. Preview cropped result
  7. Download button
- **Implementation notes:**
  - Extract first frame as thumbnail for crop overlay positioning
  - Use `ffmpeg -i input -vf crop=W:H:X:Y output` for processing
  - Handle seek to middle frame for accurate crop preview
  - Warn user if crop region extends beyond video bounds

#### video-rotate

- **File:** `src/tools/video/video-rotate.js`
- **Category:** video
- **Purpose:** Rotate or flip video by preset or custom angles
- **Library:** ffmpeg.wasm
- **UI:**
  1. Video file upload (accept `.mp4,.webm,.mov`)
  2. Preset buttons: 90 CW, 90 CCW, 180, Horizontal Flip, Vertical Flip
  3. Custom rotation input (degrees, 0-360)
  4. Background color picker for non-90 rotations
  5. Rotate button with progress indicator
  6. Preview and download
- **Implementation notes:**
  - Use `ffmpeg -i input -vf transpose=1` for 90 CW, `transpose=2` for CCW
  - Custom angles: `rotate=angle:fillcolor=color`
  - Horizontal flip: `hflip`, vertical flip: `vflip`
  - Handle metadata rotation (set display matrix correctly)

#### video-speed-ctrl

- **File:** `src/tools/video/video-speed-ctrl.js`
- **Category:** video
- **Purpose:** Change video playback speed with optional pitch preservation
- **Library:** ffmpeg.wasm
- **UI:**
  1. Video file upload (accept `.mp4,.webm,.mov`)
  2. Speed selector: 0.25x, 0.5x, 0.75x, 1.5x, 2x, 3x, 4x, Custom
  3. Custom speed slider (0.25x - 4x)
  4. Audio pitch preservation toggle (keep pitch when speeding up/slowing down)
  5. Duration estimate display
  6. Process button with progress
  7. Preview and download
- **Implementation notes:**
  - Video speed: `setpts=PTS/speed`
  - Audio speed without pitch change: `atempo` filter (0.5x-100x range, chain for >2x)
  - Audio speed with pitch change: `asetrate` + `atempo`
  - Show estimated output duration before processing

#### video-volume

- **File:** `src/tools/video/video-volume.js`
- **Category:** video
- **Purpose:** Adjust, boost, or mute the audio track of a video
- **Library:** ffmpeg.wasm
- **UI:**
  1. Video file upload (accept `.mp4,.webm,.mov`)
  2. Volume slider (0-200%, where 100% = original)
  3. Mute toggle button
  4. Audio boost checkbox (for quiet videos, amplifies up to 200%)
  5. Normalize loudness toggle
  6. Waveform visualization of audio levels
  7. Apply button with progress
  8. Preview and download
- **Implementation notes:**
  - Volume: `volume` filter with gain value
  - Mute: `anull` filter (removes audio track)
  - Normalize: use `loudnorm` filter for EBU R128 normalization
  - Waveform: extract audio samples via ffmpeg and render on canvas

#### video-reverse

- **File:** `src/tools/video/video-reverse.js`
- **Category:** video
- **Purpose:** Reverse video playback (forwards to backwards)
- **Library:** ffmpeg.wasm
- **UI:**
  1. Video file upload (accept `.mp4,.webm,.mov`)
  2. Reverse video checkbox (default: on)
  3. Reverse audio checkbox (default: on)
  4. Reverse button with progress indicator
  5. Duration display (same as input)
  6. Preview and download
- **Implementation notes:**
  - Use `ffmpeg -i input -vf reverse -af reverse output`
  - For video-only reversal: omit `-af reverse`
  - For audio-only reversal: omit `-vf reverse`
  - Large files may require significant memory; show warning for >100MB files
  - Processing time scales linearly with duration

#### video-metadata-editor

- **File:** `src/tools/video/video-metadata-editor.js`
- **Category:** video
- **Purpose:** View and edit video metadata tags (title, author, description, etc.)
- **Library:** ffmpeg.wasm
- **UI:**
  1. Video file upload (accept `.mp4,.webm,.mov,.avi`)
  2. Current metadata display (read-only fields from file)
  3. Editable fields: Title, Artist, Album, Year, Genre, Description, Copyright
  4. Custom metadata key-value pairs (add/remove)
  5. Poster/thumbnail image upload (for supported formats)
  6. Save Metadata button
  7. Download file with updated metadata
- **Implementation notes:**
  - Use `ffmpeg -i input -metadata key=value output`
  - For MP4: `title`, `artist`, `album`, `genre`, `date`, `comment`
  - For WebM/MKV: supports arbitrary tags
  - Preserve all video/audio streams when remuxing
  - Show file size difference before/after

#### Audio Basics (4 tools)

#### audio-normalize

- **File:** `src/tools/audio/audio-normalize.js`
- **Category:** audio
- **Purpose:** Normalize audio volume to consistent levels
- **Library:** Web Audio API
- **UI:**
  1. Audio file upload (accept `.mp3,.wav,.ogg,.flac,.m4a`)
  2. Normalization target: -14 LUFS (Spotify), -16 LUFS (Podcast), -23 LUFS (Broadcast), Custom
  3. Peak limit slider (-1 to 0 dBTP)
  4. Before/after waveform comparison
  5. LUFS meter display
  6. Normalize button with progress
  7. Download normalized audio
- **Implementation notes:**
  - Decode audio via AudioContext.decodeAudioData
  - Calculate RMS loudness per block (400ms windows, 75% overlap)
  - Apply gain to match target LUFS
  - Peak limiting to prevent clipping
  - Output as WAV (or MP3 if lamejs available)

#### audio-pitch

- **File:** `src/tools/audio/audio-pitch.js`
- **Category:** audio
- **Purpose:** Shift audio pitch without changing speed
- **Library:** Web Audio API + optional phase vocoder
- **UI:**
  1. Audio file upload (accept `.mp3,.wav,.ogg,.flac`)
  2. Pitch shift slider (-12 to +12 semitones)
  3. Fine-tune cents input (-100 to +100 cents)
  4. Formant preservation toggle (prevents chipmunk effect)
  5. Preview playback with pitch applied
  6. Process button
  7. Download processed audio
- **Implementation notes:**
  - Simple approach: AudioBufferSourceNode.playbackRate (changes speed too)
  - Correct approach: phase vocoder (STFT, time-stretch, pitch-shift, ISTFT)
  - Formant preservation: detect and shift formants separately from pitch
  - Process in overlapping frames (50% overlap, Hann window)

#### audio-wav-mp3

- **File:** `src/tools/audio/audio-wav-mp3.js`
- **Category:** audio
- **Purpose:** Convert WAV audio files to MP3 format
- **Library:** lamejs
- **UI:**
  1. WAV file upload (accept `.wav`)
  2. Bitrate selector: 128kbps, 192kbps, 256kbps, 320kbps
  3. Channel mode: Stereo / Joint Stereo / Mono
  4. Quality indicator (file size estimate)
  5. Convert button with progress
  6. Before/after file size comparison
  7. Download MP3
- **Implementation notes:**
  - Use lamejs.Mp3Encoder for encoding
  - Read WAV header to get sample rate, channels, bit depth
  - Process in chunks (1152 samples per frame) for progress reporting
  - Support 16-bit and 24-bit WAV input

#### audio-mp3-wav

- **File:** `src/tools/audio/audio-mp3-wav.js`
- **Category:** audio
- **Purpose:** Convert MP3 audio files to WAV format
- **Library:** Web Audio API (native decoding)
- **UI:**
  1. MP3 file upload (accept `.mp3`)
  2. Output sample rate: 22050, 44100, 48000 Hz
  3. Bit depth: 16-bit / 24-bit
  4. Channel: Mono / Stereo
  5. Convert button with progress
  6. Before/after file size comparison
  7. Download WAV
- **Implementation notes:**
  - Use AudioContext.decodeAudioData to decode MP3
  - Resample if output sample rate differs from source
  - Write WAV header manually (RIFF/WAVE format)
  - WAV files are significantly larger than MP3 — show size warning

#### Dev Playgrounds (6 tools)

#### js-playground

- **File:** `src/tools/dev/js-playground.js`
- **Category:** dev
- **Purpose:** Sandboxed JavaScript editor with live console output
- **Library:** Monaco Editor + sandboxed iframe
- **UI:**
  1. Split pane: Monaco editor (left) + Console output (right)
  2. Run button (also Ctrl+Enter shortcut)
  3. Console shows: logs, errors, return values with color coding
  4. Auto-run toggle (run on type, debounced 1s)
  5. Share button (encode code to URL hash)
  6. Clear Console button
  7. Example snippets dropdown
- **Implementation notes:**
  - Execute code in sandboxed iframe (sandbox='allow-scripts')
  - Override console.log/error/warn in iframe to capture output
  - Use postMessage for iframe and parent communication
  - URL hash sharing: compress code with LZ-string, encode to base64
  - Timeout execution after 5s to prevent infinite loops

#### html-playground

- **File:** `src/tools/dev/html-playground.js`
- **Category:** dev
- **Purpose:** Live HTML/CSS/JS editor with real-time preview
- **Library:** Monaco Editor + iframe
- **UI:**
  1. Three-panel editor: HTML (top-left), CSS (top-right), JS (bottom-left)
  2. Live preview iframe (right panel, updates on type)
  3. Debounced preview update (300ms)
  4. Viewport size presets: Desktop, Tablet, Mobile
  5. Share button (encode all three panels to URL hash)
  6. Console toggle (shows JS errors in preview)
  7. Fullscreen preview mode
- **Implementation notes:**
  - Compose HTML document from three editor panels
  - Inject into sandboxed iframe via srcdoc or blob: URL
  - Debounce updates to avoid excessive re-renders
  - Capture iframe console errors and display in tool console
  - Handle relative URL resolution for linked assets

#### json-schema-validator

- **File:** `src/tools/dev/json-schema-validator.js`
- **Category:** dev
- **Purpose:** Validate JSON data against JSON Schema
- **Library:** ajv (Another JSON Validator)
- **UI:**
  1. Two Monaco editors side by side: Schema (left) + Data (right)
  2. Validate button
  3. Results: green checkmark (valid) or list of errors with line numbers
  4. Support JSON Schema draft-07 and 2020-12
  5. Load example schema button
  6. Copy errors to clipboard
  7. Auto-validate on type toggle
- **Implementation notes:**
  - Use Ajv with { allErrors: true } for comprehensive error reporting
  - Each error includes: instancePath, schemaPath, params, message
  - Map error paths back to Monaco editor line numbers
  - Support $ref resolution for nested schemas
  - Handle parse errors gracefully (show JSON syntax error first)

#### env-parser

- **File:** `src/tools/dev/env-parser.js`
- **Category:** dev
- **Purpose:** Parse and validate .env files with syntax checking
- **Library:** Pure JS (custom parser)
- **UI:**
  1. Text editor area for pasting .env content
  2. File upload button (accept `.env,.env.*`)
  3. Parsed results table: Key, Value, Line number, Status
  4. Error indicators: invalid syntax, duplicate keys, empty values
  5. Export parsed JSON button
  6. Export as shell export statements
  7. Copy to clipboard button
- **Implementation notes:**
  - Parse line-by-line: handle KEY=value, KEY= value with spaces, KEY='single quotes'
  - Support comments (#), blank lines, multi-line values with \
  - Detect common errors: missing =, unbalanced quotes, special characters
  - Show warnings for potential issues: keys with spaces, values that look like numbers but should be strings
  - Handle variable interpolation syntax ($VAR or ${VAR}) for display purposes

#### timezone-converter

- **File:** `src/tools/dev/timezone-converter.js`
- **Category:** dev
- **Purpose:** Convert dates and times between world timezones
- **Library:** Intl API (native)
- **UI:**
  1. Date/time input (with calendar picker)
  2. Source timezone dropdown (searchable, shows current time)
  3. Target timezone(s) — add multiple for batch conversion
  4. Results list: timezone name, converted time, UTC offset, abbreviation
  5. Add to favorites button (persist in localStorage)
  6. Current time in selected zones display
  7. Daylight saving time indicator
- **Implementation notes:**
  - Use Intl.DateTimeFormat with timeZone option for conversion
  - Get timezone list from Intl.supportedValuesOf('timeZone') (500+ zones)
  - Show UTC offset dynamically (accounts for DST)
  - Favorite timezones stored in localStorage
  - Handle edge cases: midnight crossover, date changes across timezones

#### regex-visualizer

- **File:** `src/tools/dev/regex-visualizer.js`
- **Category:** dev
- **Purpose:** Visualize regular expressions as railroad diagrams
- **Library:** railroad-diagram (SVG generation)
- **UI:**
  1. Regex input field with flags checkboxes (g, i, m, s, u)
  2. Railroad diagram SVG rendering (auto-generated)
  3. Test string input area
  4. Match results: highlighted matches, capture groups, match indices
  5. Common regex patterns dropdown (email, phone, URL, etc.)
  6. Copy regex to clipboard
  7. Explanation panel (plain English description of each part)
- **Implementation notes:**
  - Parse regex AST from string, render as SVG railroad diagram
  - Use regexp-tree or manual parser for regex AST
  - Railroad diagram: sequence, alternation, repetition, optional, character class
  - Highlight matches in test string with colored spans
  - Generate human-readable explanation from AST nodes

#### Finance Tools (3 tools)

#### salary-calc

- **File:** `src/tools/finance/salary-calc.js`
- **Category:** finance
- **Purpose:** Multi-country salary calculator with tax data
- **Library:** Pure JS (pre-built tax data JSON)
- **UI:**
  1. Country selector (dropdown with flag emojis, search-as-you-type)
  2. Annual gross salary input
  3. Pay frequency toggle: Annual / Monthly / Weekly / Hourly
  4. Calculate button
  5. Results: Net monthly take-home, donut chart (Gross vs Tax vs SS vs Net)
  6. Tax bracket breakdown table
  7. Social security breakdown
  8. Comparison mode: Add country for side-by-side comparison
- **Implementation notes:**
  - Pre-built tax data JSON files for 20+ countries with progressive tax brackets
  - Social security rates per country (employee + employer portions)
  - Support currency formatting per locale
  - Handle special deductions (401k, pension, health insurance)
  - Country data: US, UK, Canada, Germany, France, Australia, Japan, India, Brazil, etc.

#### savings-calc

- **File:** `src/tools/finance/savings-calc.js`
- **Category:** finance
- **Purpose:** Compound interest calculator with growth visualization
- **Library:** Pure JS + Canvas chart
- **UI:**
  1. Target amount input
  2. Initial deposit input
  3. Monthly contribution input
  4. Annual interest rate input (with APY helper)
  5. Compounding frequency: Monthly / Quarterly / Annually
  6. Results: Time to reach goal, total contributed, total interest earned
  7. Growth curve line chart (balance over time)
  8. Milestone markers on chart (25%, 50%, 75%, 100%)
- **Implementation notes:**
  - Formula: FV = PV(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]
  - Render chart using Canvas API (line chart with grid, labels, tooltip)
  - Show monthly breakdown table below chart
  - Animate chart growth on load
  - Handle edge cases: 0 interest rate, very long time horizons

#### retirement-planner

- **File:** `src/tools/finance/retirement-planner.js`
- **Category:** finance
- **Purpose:** Retirement projection with FIRE (Financial Independence, Retire Early) number
- **Library:** Pure JS + Canvas chart
- **UI:**
  1. Current age input
  2. Retirement age input
  3. Current savings input
  4. Monthly savings input
  5. Expected annual return rate input
  6. Inflation rate input
  7. Desired annual spending input
  8. Results: FIRE number (25x annual spending), projected fund, years funded
  9. Wealth accumulation curve chart
  10. Safe withdrawal zone overlay on chart
- **Implementation notes:**
  - FIRE number: Desired Annual Spending x 25 (4% rule)
  - Project fund growth with compound interest minus withdrawals
  - Chart shows: savings accumulation phase + drawdown phase
  - Inflation-adjusted values displayed alongside nominal
  - Monte Carlo simulation (optional) for range of outcomes

#### Math Tools (3 tools)

#### equation-solver

- **File:** `src/tools/math/equation-solver.js`
- **Category:** math
- **Purpose:** Solve algebraic equations step by step
- **Library:** math.js + KaTeX for LaTeX rendering
- **UI:**
  1. Equation input field (supports standard notation and LaTeX)
  2. Variable selector (for equations with multiple variables)
  3. Solve button
  4. Step-by-step solution display with LaTeX rendering
  5. Final answer highlighted
  6. Common equations dropdown (quadratic, linear systems, etc.)
  7. Copy solution as LaTeX
- **Implementation notes:**
  - Use math.js simplify() and solve() for symbolic solving
  - Support: linear equations, quadratic equations, systems of 2 equations
  - KaTeX renders each step as formatted math
  - Step-by-step: isolate variable, simplify, solve
  - Handle edge cases: no solution, infinite solutions, complex roots

#### matrix-calc

- **File:** `src/tools/math/matrix-calc.js`
- **Category:** math
- **Purpose:** Matrix operations (add, multiply, determinant, inverse, transpose)
- **Library:** math.js
- **UI:**
  1. Matrix A input area (adjustable size: 2x2 to 6x6)
  2. Matrix B input area (adjustable size: 2x2 to 6x6)
  3. Operation buttons: A+B, A-B, AxB, A transpose, A inverse, det(A)
  4. Result matrix display
  5. Size lock toggle (constrain B to compatible dimensions)
  6. Copy result to clipboard
  7. Clear matrices button
- **Implementation notes:**
  - Use math.js add(), subtract(), multiply(), transpose(), inv(), det()
  - Validate matrix dimensions before operation (show error for incompatible sizes)
  - Handle singular matrices (no inverse) with clear error message
  - Format result with proper matrix brackets and alignment
  - Support identity matrix and zero matrix quick-fill buttons

#### stats-calc

- **File:** `src/tools/math/stats-calc.js`
- **Category:** math
- **Purpose:** Calculate descriptive statistics from a dataset
- **Library:** Pure JS + Canvas chart
- **UI:**
  1. Number input area (comma or newline separated)
  2. File upload for CSV/TXT data
  3. Calculate button
  4. Results: Mean, Median, Mode, Standard Deviation, Variance, Range, Quartiles, Percentiles
  5. Histogram chart (auto-binned)
  6. Box plot visualization
  7. Copy results as JSON or text
- **Implementation notes:**
  - Parse input: split by comma, newline, or space; handle mixed delimiters
  - Sort data for median, quartiles, percentiles
  - Mode: handle multimodal datasets (return all modes)
  - Histogram: auto-calculate bin count using Sturges' rule or square root choice
  - Box plot: show Q1, median, Q3, whiskers (1.5x IQR), outliers

#### Productivity Tools (1 tool)

#### decision-matrix

- **File:** `src/tools/productivity/decision-matrix.js`
- **Category:** productivity
- **Purpose:** Weighted decision matrix maker for comparing options
- **Library:** Pure JS + Canvas chart
- **UI:**
  1. Options list (add/remove rows, e.g., Apartment A, Apartment B)
  2. Criteria list (add/remove columns, e.g., Cost, Location, Size)
  3. Weight inputs per criterion (1-10 or percentage)
  4. Score inputs per option-criterion cell (1-10)
  5. Calculate button
  6. Results: weighted scores per option, winner highlighted
  7. Radar chart comparing options across criteria
  8. Export as CSV or JSON
- **Implementation notes:**
  - Weighted score: sum(score * weight) / sum(weights) per option
  - Normalize weights to sum to 100% if using percentage mode
  - Radar chart: Canvas-based, one polygon per option, overlapping with transparency
  - Highlight winning option (highest total weighted score)
  - Allow saving/loading matrices to localStorage

#### QR Code Tools (2 tools)

#### qr-business-card

- **File:** `src/tools/qr/qr-business-card.js`
- **Category:** qr
- **Purpose:** Generate vCard QR codes for contact sharing
- **Library:** QR code generator (qrcode.js or similar)
- **UI:**
  1. Form fields: First Name, Last Name, Phone, Email, Organization, Title, Website, Address
  2. QR code preview (live updating)
  3. QR code style: Standard, Rounded, Dot
  4. Color picker for QR foreground
  5. Logo upload (centered in QR code)
  6. Download: PNG, SVG, PDF
  7. Test scan button (shows decoded vCard data)
- **Implementation notes:**
  - Generate vCard 3.0 format string: BEGIN:VCARD\nVERSION:3.0\n...
  - Encode vCard string into QR code matrix
  - Logo embedding: reserve center area (typically 30% of QR size)
  - Ensure QR error correction level H (30%) when using logo
  - Validate QR scannability before download

#### qr-wifi

- **File:** `src/tools/qr/qr-wifi.js`
- **Category:** qr
- **Purpose:** Generate QR codes for WiFi network credentials
- **Library:** QR code generator (qrcode.js or similar)
- **UI:**
  1. Network name (SSID) input
  2. Password input with show/hide toggle
  3. Security type: WPA/WPA2, WEP, None (open)
  4. QR code preview (live updating)
  5. Hidden network checkbox
  6. Download: PNG, SVG
  7. Copy WiFi string to clipboard
- **Implementation notes:**
  - WiFi QR format: WIFI:T:WPA;S:NetworkName;P:Password;;
  - Escape special characters in SSID and password (;, ,, :, \, )
  - Handle edge cases: very long passwords, unicode SSIDs
  - Show plain-text WiFi string alongside QR for manual entry
  - Test decode to verify scannability

#### Reference Tools (2 tools)

#### world-holidays

- **File:** `src/tools/reference/world-holidays.js`
- **Category:** reference
- **Purpose:** Browse public holidays for 50+ countries
- **Library:** Pure JS (pre-built holiday data JSON)
- **UI:**
  1. Country selector (multi-select, search-as-you-type)
  2. Year selector (current year +/- 5 years)
  3. Month filter tabs (All, Jan-Dec)
  4. Holiday list: name, date, type (public, observance, bank)
  5. Calendar view toggle (list vs calendar grid)
  6. Days until next holiday countdown
  7. Export as .ics (iCalendar) for selected holidays
- **Implementation notes:**
  - Pre-built JSON data for 50+ countries with fixed and variable dates
  - Variable holidays calculated by algorithm (Easter, Thanksgiving, etc.)
  - Group holidays by month for easy browsing
  - iCalendar export: generate .ics file with VEVENT entries
  - Filter out past holidays by default (show upcoming only)

#### link-preview

- **File:** `src/tools/reference/link-preview.js`
- **Category:** reference
- **Purpose:** Generate Open Graph preview images from URLs
- **Library:** Canvas API (for image generation)
- **UI:**
  1. URL input field
  2. Fetch metadata button
  3. Metadata display: title, description, image, site name
  4. Preview template selector: Standard, Minimal, Dark, Tech, Blog
  5. Customization: background color, font, layout
  6. Generated preview image display
  7. Download as PNG (1200x630 for social media)
- **Implementation notes:**
  - Fetch URL metadata via CORS proxy or direct fetch (if CORS-enabled)
  - Parse meta tags: og:title, og:description, og:image, og:site_name
  - Render preview image using Canvas: background, logo, title, description
  - Generate at 1200x630 (standard OG image size)
  - Handle missing metadata gracefully (show fallback placeholder)

#### Fun Tools (1 tool)

#### name-generator

- **File:** `src/tools/fun/name-generator.js`
- **Category:** fun
- **Purpose:** Generate random names by culture/gender
- **Library:** Pure JS (name data JSON)
- **UI:**
  1. Culture/region selector: Japanese, Korean, Chinese, Arabic, Indian, African, Nordic, Celtic, Slavic, Latin, Greek, Hebrew, Hawaiian, etc.
  2. Gender filter: Male, Female, Any
  3. Quantity selector (1-20 names)
  4. Generate button
  5. Results list with: name, pronunciation (if applicable), meaning
  6. Copy individual names or full list
  7. Favorites (save to localStorage)
- **Implementation notes:**
  - Pre-built name datasets per culture (100+ names each)
  - Include phonetic pronunciation guide for non-Latin names
  - Name meanings sourced from public domain etymology data
  - Shuffle algorithm for random selection (Fisher-Yates)
  - Allow filtering by first letter or name length

### New Planned Tools (from Phase 28 Instructions Review)

#### browser-fingerprint-checker

- **File:** `src/tools/privacy/browser-fingerprint-checker.js`
- **Category:** privacy
- **Purpose:** See what a website could learn about your browser without cookies
- **Library:** Pure browser APIs (zero network requests)
- **UI:**
  1. Run Fingerprint Check button
  2. Fingerprint hash display (SHA-256 truncated)
  3. Results table: userAgent, language, platform, screen resolution, WebGL vendor/renderer, canvas hash, fonts detected, etc.
  4. Privacy notice: "Zero network requests. All checks run entirely in this tab."
- **Implementation notes:**
  - Canvas fingerprint: draw text/shapes, toDataURL, hash result
  - WebGL: getExtension('WEBGL_debug_renderer_info') for vendor/renderer
  - Font detection: measure span offsetWidth against base font families
  - SHA-256 hash via crypto.subtle.digest
  - CRITICAL: No fetch(), XMLHttpRequest, WebSocket, or sendBeacon calls allowed

#### expense-splitter

- **File:** `src/tools/finance/expense-splitter.js`
- **Category:** finance
- **Purpose:** Split group bills and calculate minimum transactions to settle debts
- **Library:** Pure JS + localStorage
- **UI:**
  1. Add person chips
  2. Add expense form: description, amount, paid by (select), split among (checkboxes)
  3. Balance display: green (owed money) / red (owes money)
  4. Settle-up list from debt simplification algorithm
  5. Delete buttons on persons and expenses
  6. Privacy notice: all data stored locally only
- **Implementation notes:**
  - localStorage key: 'exs_v1'
  - Debt simplification: greedy matching of creditors/debtors for minimum transactions
  - Threshold of $0.01 to avoid floating-point noise
  - Confirm dialog before deleting a person (removes from all expenses)

#### mind-map-maker

- **File:** `src/tools/productivity/mind-map-maker.js`
- **Category:** productivity
- **Purpose:** Freeform SVG mind map editor with drag-and-drop nodes
- **Library:** SVG + pure JS + localStorage
- **UI:**
  1. SVG canvas with draggable nodes
  2. Toolbar: add child node, delete selected, color swatches
  3. Double-click to rename node
  4. Export PNG / Export SVG buttons
  5. Clear all button
- **Implementation notes:**
  - localStorage key: 'mmm_v1'
  - Data model: nodes array with id, x, y, text, color, parentId
  - Pointer events for drag: pointerdown, pointermove, pointerup
  - Export PNG: render SVG to canvas via Image + canvas.drawImage()
  - Export SVG: XMLSerializer.serializeToString(svg)

#### kanban-board

- **File:** `src/tools/productivity/kanban-board.js`
- **Category:** productivity
- **Purpose:** Drag-and-drop kanban board with no account required
- **Library:** HTML5 Drag and Drop API + localStorage
- **UI:**
  1. Board with columns (To Do, In Progress, Done default)
  2. Draggable cards with text and optional colored labels
  3. + Add card input per column
  4. + Add column button
  5. Edit card text on click, delete with ✕
  6. Clear board button
- **Implementation notes:**
  - localStorage key: 'kb_v1'
  - Data model: columns array + cards object
  - HTML5 drag events: dragstart, dragover, dragleave, drop
  - Save after every drag/add/edit/delete

#### timesheet-tracker

- **File:** `src/tools/productivity/timesheet-tracker.js`
- **Category:** productivity
- **Purpose:** Clock in/out hours tracker with PDF/CSV export
- **Library:** jsPDF + jsPDF-AutoTable (already installed)
- **UI:**
  1. Project name + Notes inputs + Clock In button
  2. Live running timer (HH:MM:SS) while clocked in
  3. Clock Out button
  4. Table of entries: project, clock in, clock out, duration, notes, delete
  5. Weekly summary card (Monday-start week)
  6. Export PDF / Export CSV buttons
- **Implementation notes:**
  - localStorage key: 'tst_v1'
  - setInterval(1000) for live timer display
  - durationHours = (clockOut - clockIn) / 3600000
  - jsPDF + AutoTable for PDF export

#### password-breach-checker

- **File:** `src/tools/privacy/password-breach-checker.js`
- **Category:** privacy
- **Purpose:** Check if a password has appeared in known data breaches (k-anonymity)
- **Library:** Web Crypto API + fetch() to HIBP Range API (no key needed)
- **UI:**
  1. Password input with show/hide toggle
  2. Check button
  3. Result: breach count or "not found" message
  4. Privacy notice: "Only the first 5 characters of your SHA-1 hash are sent"
- **Implementation notes:**
  - k-anonymity: SHA-1 hash password, send only first 5 hex chars to HIBP Range API
  - CRITICAL: Full hash must NEVER leave the browser
  - API: fetch('https://api.pwnedpasswords.com/range/{prefix}')
  - Parse response lines: "SUFFIX:COUNT"
  - Safety check: grep file for any line sending fullHash to fetch()

#### chroma-key-composer

- **File:** `src/tools/video/chroma-key-composer.js`
- **Category:** video
- **Purpose:** Green/blue screen background compositing using Canvas and MediaRecorder
- **Library:** Canvas API + <video>, zero new deps
- **UI:**
  1. Two drop zones: foreground video (green/blue screen) + background image/video
  2. Key color picker (default #00FF00)
  3. Threshold slider (0-200, default 80)
  4. Edge softness slider (0-100, default 30)
  5. Live preview canvas at reduced resolution
  6. Render Full Video button → real-time recording via MediaRecorder
- **Implementation notes:**
  - applyChromaKey: Euclidean distance in RGB, threshold + edge softness feathering
  - Pipeline: draw bg → draw fg to offscreen → apply chroma key → composite
  - MediaRecorder on outputCanvas.captureStream(30)
  - Real-time rendering (video plays through once during recording)
  - Output: WebM blob download

#### video-scene-cut-detector

- **File:** `src/tools/video/video-scene-cut-detector.js`
- **Category:** video
- **Purpose:** Automatic scene detection and YouTube chapter marker export
- **Library:** ffmpeg.wasm (already installed)
- **UI:**
  1. Video drop zone
  2. Sensitivity slider (0.1-0.9, default 0.4)
  3. Detect Scenes button with progress spinner
  4. Results list with timestamps, thumbnails, editable chapter labels
  5. Export: Copy YouTube chapters (clipboard), Download .txt
- **Implementation notes:**
  - ffmpeg filter: select='gt(scene,{sensitivity})',showinfo
  - Parse pts_time from ffmpeg log output
  - YouTube chapter format requires first entry at 00:00
  - Thumbnail preview via video seek + canvas capture

#### video-stabilizer

- **File:** `src/tools/video/video-stabilizer.js`
- **Category:** video
- **Purpose:** Two-pass video stabilization using ffmpeg vidstab filters
- **Library:** ffmpeg.wasm (already installed)
- **UI:**
  1. Video drop zone
  2. Shakiness slider (1-10, default 5)
  3. Smoothing slider (1-30, default 10)
  4. Stabilize button with "Pass 1/2" and "Pass 2/2" progress
  5. Before/after video player toggle
  6. Download MP4 button
- **Implementation notes:**
  - Pass 1: vidstabdetect → writes transforms.trf
  - Pass 2: vidstabtransform + unsharp → output stabilized.mp4
  - CRITICAL: Verify ffmpeg.wasm core includes libvidstab before shipping
  - If vidstab not available, mark tool as "blocked" in tools.json

#### resume-job-matcher

- **File:** `src/tools/business/resume-job-matcher.js`
- **Category:** business
- **Purpose:** Semantic + keyword matcher between resume and job description
- **Library:** @xenova/transformers (already installed, all-MiniLM-L6-v2)
- **UI:**
  1. Two textareas: resume text, job description
  2. Analyze Match button with progress states
  3. Combined score display (semantic 70% + keyword 30%)
  4. Missing keywords list as chips
  5. Disclaimer: heuristic guide, not ATS guarantee
- **Implementation notes:**
  - Embedding via pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  - Cosine similarity for semantic score
  - Keyword extraction: lowercase, strip punctuation, remove stopwords, count frequency
  - findMissingKeywords: job keywords not in resume, sorted by frequency
  - Combined score = semantic × 0.7 + keywordCoverage × 0.3

#### audio-to-midi-converter

- **File:** `src/tools/audio/audio-to-midi-converter.js`
- **Category:** audio
- **Purpose:** Audio-to-MIDI transcription using Basic Pitch ONNX model
- **Library:** onnxruntime-web (already installed), Basic Pitch ONNX model (~2MB)
- **UI:**
  1. Audio drop zone with "single instrument works best" note
  2. Convert to MIDI button with progress bar
  3. Piano-roll canvas visualization of detected notes
  4. Download MIDI button
- **Implementation notes:**
  - Model: Basic Pitch ONNX from @spotify/basic-pitch or converted
  - Path A (recommended): Use @spotify/basic-pitch npm API directly
  - Path B (fallback): Defer if npm package unavailable (CQT preprocessing is complex)
  - MIDI writer: single-track Type 0, 480 ticks/beat, variable-length encoding
  - CRITICAL: Do not ship fabricated inference logic — mark as "blocked" if no working model

## Dependencies for Planned Tools

```bash
npm install monaco-editor ajv mathjs katex
```

| Package | License | Size | Purpose |
|---------|---------|------|---------|
| monaco-editor | MIT | 2MB | Code editor (playgrounds) |
| ajv | MIT | 150KB | JSON Schema validation |
| mathjs | Apache-2.0 | 500KB | Math operations |
| katex | MIT | 250KB | LaTeX rendering |

Additional dependencies (already installed or needed per tool):
- `transformers.js` — AI/ML inference in browser (resume-job-matcher, text-similarity-checker)
- `onnxruntime-web` — ONNX model execution (audio-to-midi-converter)
- `ffmpeg.wasm` — Video/audio processing (video-scene-cut-detector, video-stabilizer)
- `jspdf` + `jspdf-autotable` — PDF export (timesheet-tracker, loan-amortization-calculator)
- `@spotify/basic-pitch` — Audio transcription ONNX model (audio-to-midi-converter)
- `lamejs` — MP3 encoding
- `mammoth` — DOCX to HTML
- `xlsx` — Excel read/write
