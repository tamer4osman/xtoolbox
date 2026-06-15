# Phase 27 — Blueprint: 20 High-Demand Tools

> **Stack:** Vite + Vanilla JS + ONNX / WASM / Web APIs  
> **Rule:** 100% client-side. No server. No accounts. No API keys.  
> **Workflow:** For each tool follow the 11-step AGENTS.md sequence:  
> create → unit test → Playwright test → build → test → fallow → DevTools smoke → user confirm → docs → home page counts → commit.

---

## Tools at a Glance

| # | Title | File | Category | Key library |
|---|-------|------|----------|-------------|
| 1 | Vocal / Stem Separator | `audio/stem-separator.js` | audio | ONNX Runtime + demucs-mini |
| 2 | Noise / Hiss Remover | `audio/noise-remover.js` | audio | ONNX Runtime + DeepFilterNet |
| 3 | BPM & Key Detector | `audio/bpm-key-detector.js` | audio | Essentia.js WASM |
| 4 | Audio EQ & Visualizer | `audio/audio-equalizer.js` | audio | Web Audio API + lamejs |
| 5 | Video Screenshot Extractor | `video/video-screenshot-extractor.js` | video | Canvas API + JSZip |
| 6 | Local Video Transcriber | `video/video-transcriber.js` | video | Transformers.js (Whisper tiny) |
| 7 | Video Silence Remover | `video/silence-remover.js` | video | ffmpeg.wasm |
| 8 | JSON Diff Viewer | `dev/json-diff-viewer.js` | dev | Pure JS |
| 9 | OpenAPI / Swagger Visualizer | `dev/openapi-visualizer.js` | dev | js-yaml + Redoc standalone |
| 10 | GraphQL Schema Explorer | `dev/graphql-schema-explorer.js` | dev | graphql browser build |
| 11 | Offline Text Translator | `text/offline-translator.js` | text | Transformers.js (NLLB-200) |
| 12 | Legal Clause Simplifier | `text/legal-simplifier.js` | text | Transformers.js (DistilBERT) |
| 13 | Text Sentiment Heatmap | `text/sentiment-heatmap.js` | text | Transformers.js (DistilBERT SST-2) |
| 14 | Meeting Cost Calculator | `productivity/meeting-cost-calculator.js` | productivity | Pure JS + jsPDF |
| 15 | Working Days Calculator | `productivity/working-days-calculator.js` | productivity | Intl + bundled holidays JSON |
| 16 | AI Image Upscaler (4×) | `image/ai-image-upscaler.js` | image | ONNX Runtime + Real-ESRGAN-tiny |
| 17 | Metadata Stripper | `privacy/metadata-stripper.js` | privacy | pdf-lib + piexifjs + JSZip |
| 18 | Net Worth Tracker | `finance/net-worth-tracker.js` | finance | Chart.js + localStorage |
| 19 | Symptom Onset Tracker | `health/symptom-tracker.js` | health | Pure JS + jsPDF + localStorage |
| 20 | Face Blur / Anonymizer | `image/face-blur.js` | image | ONNX Runtime + BlazeFace |

---

## Tool 1 — Vocal / Stem Separator

**File:** `src/tools/audio/stem-separator.js`  
**Tool ID:** `stem-separator`  
**Category:** `audio`

### What it does

Split any MP3/WAV/OGG/FLAC file into up to 4 stems — **Vocals, Drums, Bass, Other** — entirely in the browser using a quantised Demucs ONNX model. Each stem is exported as a 16-bit WAV and bundled into a ZIP.

### Why it's rare

Every competitor (LALAL.AI, Moises, Splitter.ai) caps free use at 1 track/day and requires sign-up. There is no free, unlimited, 100% client-side option anywhere on the internet. This tool would be a category-defining differentiator.

### Input → Process → Output

```
[MP3/WAV drop zone]
       ↓  FileReader → AudioContext.decodeAudioData → Float32Array
       ↓  Demucs-mini ONNX model (4-stem, ~85 MB)
       ↓  4 × Float32Array (one per stem)
       ↓  WAV encode (PCM 16-bit, 44.1 kHz)
       ↓  JSZip → stems.zip download
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Drop audio file here (MP3, WAV, OGG, FLAC)     │
│  [or click to browse]                           │
├─────────────────────────────────────────────────┤
│  ⚙️  Model loading: [████████░░░░] 68%           │  ← shown once per session
├────────────┬────────────┬────────────┬──────────┤
│ 🎤 Vocals  │ 🥁 Drums   │ 🎸 Bass    │ 🎹 Other │
│ ▶ preview  │ ▶ preview  │ ▶ preview  │ ▶ preview│
│ [Download] │ [Download] │ [Download] │ [Download│
└────────────┴────────────┴────────────┴──────────┘
│  [⬇ Download all stems as ZIP]                  │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Load model once and cache via `sessionStorage` flag; re-use `InferenceSession` for subsequent files.
- Use a `Worker` thread (`Comlink`) so the main thread stays responsive during inference.
- Model path: `public/models/demucs-mini.onnx` — bundle at build time so it's served from Cloudflare CDN.
- WAV encoding: write PCM header manually (no dependency) — 44 bytes header + `Int16Array` samples.
- Preview: pipe each stem `Float32Array` into a temporary `AudioBuffer` → `AudioBufferSourceNode` for in-page playback.

### Libraries

```json
"@xenova/transformers": "^2.x",   // for ONNX Runtime Web (shared with other ML tools)
"jszip": "^3.10"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ ONNX model runs in browser |
| No API key | ✅ |
| No account | ✅ |
| Model ≤ 100 MB | ✅ demucs-mini ≈ 85 MB (quantised INT8) |
| Existing duplicate | ❌ none in 279 tools |

---

## Tool 2 — Noise / Hiss Remover

**File:** `src/tools/audio/noise-remover.js`  
**Tool ID:** `noise-remover`  
**Category:** `audio`

### What it does

Remove background hiss, room rumble, fan noise, and AC hum from any voice recording. Uses **DeepFilterNet** (a real-time speech enhancement ONNX model) to process audio frame-by-frame in the browser.

### Why it's rare

Every free noise-removal tool (Adobe Podcast, Krisp, NVIDIA RTX Voice) requires sign-up or a desktop install. Zero browser-based tools run fully offline. This is one of the most-requested audio features among podcasters, teachers, and remote workers.

### Input → Process → Output

```
[MP3/WAV/OGG drop zone]
       ↓  AudioContext.decodeAudioData → Float32Array
       ↓  Resample to 16 kHz (mono) using OfflineAudioContext
       ↓  Frame into 32 ms chunks with 50% overlap
       ↓  DeepFilterNet ONNX model (speech enhancement, ~18 MB)
       ↓  Overlap-add reconstruction → Float32Array
       ↓  Resample back to original sample rate
       ↓  WAV encode → download
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Drop recording (MP3, WAV, OGG, M4A)            │
├────────────┬────────────────────────────────────┤
│ Strength   │ ●──────────────── 75%              │  ← range slider
├────────────┴────────────────────────────────────┤
│  Before: [▶ ──────────────────────] waveform    │
│  After:  [▶ ──────────────────────] waveform    │
│  [⬇ Download clean audio]                       │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Use `OfflineAudioContext` for resampling (no extra library).
- Strength slider maps to a DeepFilterNet `atten_lim` parameter (0–100 → 0 dB to 40 dB attenuation).
- Show a before/after waveform using `Canvas API` (draw `Float32Array` peaks).
- Model path: `public/models/deepfilternet.onnx` (~18 MB).

### Libraries

```json
"onnxruntime-web": "^1.18",
"lamejs": "^1.2"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ |
| Model ≤ 100 MB | ✅ ~18 MB |
| Existing duplicate | ❌ `normalize-audio.js` only changes volume — different |

---

## Tool 3 — BPM & Key Detector

**File:** `src/tools/audio/bpm-key-detector.js`  
**Tool ID:** `bpm-key-detector`  
**Category:** `audio`

### What it does

Detect the **tempo (BPM)** and **musical key** (e.g. A minor, C# major) of any audio file. Fully client-side using **Essentia.js** WASM, which includes RhythmExtractor2013 and KeyExtractor algorithms.

### Input → Process → Output

```
[Audio file drop zone]
       ↓  AudioContext.decodeAudioData → Float32Array (mono, 44.1 kHz)
       ↓  Essentia.js WASM: RhythmExtractor2013 → BPM + beat positions
       ↓  Essentia.js WASM: KeyExtractor → key + scale + strength
       ↓  Display results + tap-tempo overlay
```

### UI layout

```
┌──────────────────────────────────┐
│  Drop audio file                  │
├──────────┬───────────────────────┤
│   128    │   A minor             │
│   BPM    │   Key                 │
├──────────┴───────────────────────┤
│  Beat confidence: ████████░░ 81% │
│  Key confidence:  ██████░░░░ 63% │
│  [▶ Play with beat flash]        │
└──────────────────────────────────┘
```

### Key implementation notes

- Load `essentia-wasm.module.js` + `essentia.js` from `public/libs/` (bundled; ~4 MB WASM).
- Mix stereo to mono before passing to Essentia: `(L + R) / 2`.
- Beat flash: schedule `setTimeout` bursts at detected beat intervals and flash a colored div.
- Essentia CDN: `https://cdn.jsdelivr.net/npm/essentia.js/dist/essentia-wasm.es.js`

### Libraries

```
essentia.js (WASM, ~4 MB) — bundled in public/libs/
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ WASM |
| No API key | ✅ |
| Existing duplicate | ❌ none |

---

## Tool 4 — Audio EQ & Visualizer

**File:** `src/tools/audio/audio-equalizer.js`  
**Tool ID:** `audio-equalizer`  
**Category:** `audio`

### What it does

A **10-band parametric EQ** with a real-time frequency spectrum visualiser. Load any audio file, adjust bands (32 Hz → 16 kHz), preview in real time, then export the equalised file as MP3 or WAV.

### Input → Process → Output

```
[Audio file]
       ↓  AudioContext → AudioBufferSourceNode
       ↓  Chain of 10 × BiquadFilterNode (peaking)
       ↓  AnalyserNode (FFT 2048) → Canvas spectrum display
       ↓  Export: OfflineAudioContext renders processed buffer → WAV/MP3
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  [▶ Play]  [⏹ Stop]   [Reset EQ]               │
│                                                  │
│  Spectrum: [live FFT canvas]                     │
│                                                  │
│  32Hz 64Hz 125Hz 250Hz 500Hz 1K 2K 4K 8K 16K   │
│   │    │    │    │    │   │  │  │  │   │        │
│  [sliders — vertical, ±12 dB range]             │
│                                                  │
│  Presets: [Flat] [Bass Boost] [Vocal Clarity]   │
│                                                  │
│  [⬇ Export as WAV]  [⬇ Export as MP3]          │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- All 10 `BiquadFilterNode` nodes are `type: 'peaking'` with fixed centre frequencies.
- `AnalyserNode.getByteFrequencyData()` feeds the Canvas spectrum every `requestAnimationFrame`.
- MP3 export uses `lamejs` — encode `Float32Array` from `OfflineAudioContext`.
- Presets stored as plain `const` objects (`{ freq: gain }` maps).
- EQ sliders are `<input type="range" min="-12" max="12" step="0.5">` with labels.

### Libraries

```json
"lamejs": "^1.2"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ Web Audio API |
| Existing duplicate | ❌ `normalize-audio.js` and `boost-audio.js` do volume only |

---

## Tool 5 — Video Screenshot Extractor

**File:** `src/tools/video/video-screenshot-extractor.js`  
**Tool ID:** `video-screenshot-extractor`  
**Category:** `video`

### What it does

Extract still frames from any local video file at:

- **Custom interval** (e.g., every 5 seconds)
- **Specific timestamps** (comma-separated list)
- **Every frame** (max 1000 frames safety cap)

Download all frames as a ZIP of numbered PNGs — or individually.

### Input → Process → Output

```
[Video file drop zone]
       ↓  <video> element src = URL.createObjectURL(file)
       ↓  seeked + drawImage(video, 0, 0) on Canvas per timestamp
       ↓  canvas.toBlob('image/png') → Blob array
       ↓  JSZip.file() → frames.zip → download
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Drop video file (MP4, MOV, WEBM, AVI)          │
├─────────────────────────────────────────────────┤
│  Mode: ◉ Every N seconds  ○ Specific timestamps │
│  Every: [5] seconds  (or list: 0:05, 1:30, 2:00)│
│  Format: [PNG ▾]   Quality: [95%]               │
│  [Extract Frames]                                │
├─────────────────────────────────────────────────┤
│  [thumbnail grid — 3×N — click to download one] │
│  Extracted: 48 frames                           │
│  [⬇ Download all as ZIP]                        │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Create a hidden `<video>` element. Seek with `video.currentTime = t` and await the `seeked` event.
- Batch-seek using an async queue (one `seeked` → resolve → next seek) to avoid race conditions.
- Render 3-column thumbnail grid using `<img src="dataURL">` for previews.
- Safety cap: warn user if > 1000 frames would be extracted and ask for confirmation.

### Libraries

```json
"jszip": "^3.10"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ Canvas API |
| No upload | ✅ `createObjectURL` |
| Existing duplicate | ❌ `video-to-images.js` exists but converts at fixed FPS via ffmpeg — different UX |

---

## Tool 6 — Local Video Transcriber

**File:** `src/tools/video/video-transcriber.js`  
**Tool ID:** `video-transcriber`  
**Category:** `video`

### What it does

Transcribe any video or audio file to text **entirely in the browser** using **Whisper tiny** (via Transformers.js). Export the transcript as `.txt`, `.srt` (with timestamps), or `.vtt`.

### Why it's rare

Every transcription tool (Otter.ai, Rev, Descript) sends audio to a cloud server. There is no free, unlimited, 100% offline option. `Whisper tiny` (~40 MB) fits in the allowed model budget.

### Input → Process → Output

```
[Video/Audio file drop zone]
       ↓  ffmpeg.wasm: extract mono 16 kHz WAV from any video
       ↓  Transformers.js pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny')
       ↓  Streaming chunks with timestamps
       ↓  Build transcript array [{start, end, text}]
       ↓  Render scrollable transcript
       ↓  Export as .txt / .srt / .vtt
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Drop file (MP4, MOV, MP3, WAV, M4A…)          │
│  Language: [Auto-detect ▾]                      │
├─────────────────────────────────────────────────┤
│  ⚙ Loading Whisper model… [████████░░░] 78%     │
├─────────────────────────────────────────────────┤
│  00:00 → 00:05  Hello and welcome to…          │
│  00:05 → 00:11  Today we're going to cover…    │
│  [searchable, click timestamp to seek player]   │
├─────────────────────────────────────────────────┤
│  [⬇ .txt]  [⬇ .srt]  [⬇ .vtt]  [📋 Copy all] │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- First extract audio with `ffmpeg.wasm` → `mono_16k.wav` to ensure Whisper compatibility.
- Use `pipeline` with `return_timestamps: true` to get word-level timestamps for SRT export.
- Stream results using the `chunk_callback` option so transcript lines appear as inference runs.
- SRT formatter: pad timecodes to `HH:MM:SS,mmm` format per spec.
- Model caches via `@xenova/transformers` built-in IndexedDB caching — no re-download on reload.

### Libraries

```json
"@xenova/transformers": "^2.x",
"@ffmpeg/ffmpeg": "^0.12"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ Whisper tiny ONNX |
| Model ≤ 100 MB | ✅ Whisper tiny ≈ 39 MB |
| Existing duplicate | ❌ `transcribe-audio.js` exists but is for audio only; this handles video + richer export |

---

## Tool 7 — Video Silence Remover

**File:** `src/tools/video/silence-remover.js`  
**Tool ID:** `video-silence-remover`  
**Category:** `video`

### What it does

Automatically detect and cut silent sections from a video — producing a tighter, faster-paced output. Ideal for lecture recordings, screen casts, and podcast video. Powered by **ffmpeg.wasm** using the `silencedetect` filter.

### Input → Process → Output

```
[Video file drop zone]
       ↓  ffmpeg.wasm: silencedetect filter → parse [silence_end] timestamps
       ↓  Build list of non-silent segments
       ↓  ffmpeg.wasm: concat filter → output video (no re-encode for speed)
       ↓  Download output.mp4
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Drop video (MP4, MOV, WEBM)                    │
├─────────────────────────────────────────────────┤
│  Silence threshold: [−30 dB ▾]                  │
│  Minimum silence: [0.5 s ──●──────] 0.5s        │
│  Padding: [0.1 s ──●──────] 0.1s                │
│  [Remove Silences]                              │
├─────────────────────────────────────────────────┤
│  Original: 12:34   →   Output: 8:21 (−33%)     │
│  Segments cut: 47                               │
│  [⬇ Download trimmed video]                     │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Run `ffmpeg -af silencedetect=noise=-30dB:d=0.5 -f null -` → capture stderr to get timestamps.
- Parse `[silencedetect @ …] silence_end: X.XXX` lines to build keep-segments.
- Concat with `-c copy` (stream copy, no re-encode) for speed. If streams are incompatible, fall back to `-c:v libx274 -c:a aac`.
- Show a visual timeline with kept (green) vs cut (gray) segments.

### Libraries

```json
"@ffmpeg/ffmpeg": "^0.12",
"@ffmpeg/util": "^0.12"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ ffmpeg.wasm |
| Existing duplicate | ❌ `trim-video.js` is manual trim; this is auto-silence detection |

---

## Tool 8 — JSON Diff Viewer

**File:** `src/tools/dev/json-diff-viewer.js`  
**Tool ID:** `json-diff-viewer`  
**Category:** `dev`

### What it does

Paste two JSON objects (or upload two `.json` files) and see a **colour-coded side-by-side diff** — added keys in green, removed in red, changed values in amber. Deep diff for nested structures.

### Why it's rare

`diffchecker.com` paywalls JSON diff. `jsondiff.com` sends data to a server. A clean, 100% offline JSON differ with tree-level colour coding is missing from every free tool site.

### Input → Process → Output

```
[Two paste areas / file pickers]
       ↓  JSON.parse() both inputs → validate
       ↓  Deep diff algorithm (recursive object walk)
       ↓  Annotate each key: 'added' | 'removed' | 'changed' | 'unchanged'
       ↓  Render side-by-side syntax-highlighted view
```

### UI layout

```
┌──────────────────────┬──────────────────────┐
│  JSON A              │  JSON B              │
│  [paste or upload]   │  [paste or upload]   │
├──────────────────────┴──────────────────────┤
│  [Compare]     [Swap A ↔ B]  [Clear]        │
├──────────────────────┬──────────────────────┤
│  {                   │  {                   │
│    "name": "Alice"   │    "name": "Alice"   │
│  - "age": 30         │  + "age": 31         │  ← amber: changed
│    "city": "Paris"   │    "city": "Paris"   │
│                      │  + "email": "a@b.c"  │  ← green: added
│  - "role": "admin"   │                      │  ← red: removed
│  }                   │  }                   │
└──────────────────────┴──────────────────────┘
│  Summary: 1 changed · 1 added · 1 removed   │
│  [📋 Copy diff as JSON patch]                │
└─────────────────────────────────────────────┘
```

### Key implementation notes

- Deep diff: recursively compare objects. Arrays: diff by index.
- Render with a `<pre>` block using `<span class="diff-added|removed|changed">` wrapping.
- Output a `JSON Patch` (RFC 6902) array of `{op, path, value}` operations for download.
- No external diff library needed — a ~60-line recursive diff function covers all cases.
- Handle parse errors gracefully with inline error messages below each paste area.

### Libraries

Pure vanilla JS — zero dependencies.

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ |
| Existing duplicate | ❌ `text-diff.js` exists but is plain-text line diff only |

---

## Tool 9 — OpenAPI / Swagger Visualizer

**File:** `src/tools/dev/openapi-visualizer.js`  
**Tool ID:** `openapi-visualizer`  
**Category:** `dev`

### What it does

Paste or upload an **OpenAPI 3.x YAML or JSON spec** and see an interactive tree of all endpoints, HTTP methods, parameters, request bodies, and response schemas — all rendered client-side. No Swagger UI server required.

### Input → Process → Output

```
[YAML/JSON paste area or file upload]
       ↓  js-yaml.load() or JSON.parse()
       ↓  Validate: check openapi: '3.x.x' key
       ↓  Walk paths → methods → parameters + requestBody + responses
       ↓  Render collapsible endpoint list
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Paste OpenAPI YAML/JSON  [or upload .yaml/.json]│
│  [Visualize]                                    │
├─────────────────────────────────────────────────┤
│  🔍 Search endpoints…    [Expand all / Collapse] │
│                                                  │
│  ▼ /users                                       │
│    ├─ GET  /users         → 200 [UserList]       │
│    ├─ POST /users         → 201 [User]           │
│    └─ ▼ /users/{id}                             │
│         ├─ GET  /users/{id}  → 200 [User]       │
│         ├─ PUT  /users/{id}  → 200 [User]       │
│         └─ DELETE /users/{id}→ 204              │
│                                                  │
│  Click endpoint to expand: params, body, schemas │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Parse YAML with `js-yaml` (already in most Vite projects; ~20 kB).
- Resolve `$ref` pointers against the spec's `components.schemas` in-memory.
- Method badges: colour-coded pills — GET=blue, POST=green, PUT=amber, DELETE=red, PATCH=purple.
- Schema inline rendering: recursively render JSON Schema objects as definition tables.
- `js-yaml` CDN: `https://cdn.jsdelivr.net/npm/js-yaml/dist/js-yaml.min.js`.

### Libraries

```json
"js-yaml": "^4.1"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ |
| Existing duplicate | ❌ none |

---

## Tool 10 — GraphQL Schema Explorer

**File:** `src/tools/dev/graphql-schema-explorer.js`  
**Tool ID:** `graphql-schema-explorer`  
**Category:** `dev`

### What it does

Paste a **GraphQL SDL schema** (`.graphql` / `.gql`) and browse all **Types, Queries, Mutations, Subscriptions, Enums, and Scalars** in a collapsible, searchable tree — no live endpoint required.

### Input → Process → Output

```
[SDL paste area or .graphql file upload]
       ↓  graphql.buildSchema(sdl) → GraphQL schema object
       ↓  Walk schema.getTypeMap()
       ↓  Categorise: Query / Mutation / Subscription / Types / Enums / Scalars
       ↓  Render collapsible panel per category
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Paste GraphQL SDL  [or upload .graphql]         │
│  [Parse Schema]                                 │
├─────────────────────────────────────────────────┤
│  🔍 Search types / fields…                       │
│                                                  │
│  ▼ Queries (8)                                  │
│    user(id: ID!): User                          │
│    users(limit: Int): [User]                    │
│                                                  │
│  ▼ Mutations (3)                                │
│    createUser(input: UserInput!): User          │
│                                                  │
│  ▼ Types (5)                                    │
│    User { id name email posts: [Post] }         │
│                                                  │
│  ▼ Enums (2)  ▼ Scalars (4)                    │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Import `buildSchema` from the `graphql` package browser build (UMD from jsDelivr, ~90 kB min+gz).
- Filter out built-in types (names starting with `__`).
- Click a type name to jump-highlight it in the tree — useful for following relations.
- `graphql` CDN: `https://cdn.jsdelivr.net/npm/graphql/index.js` (UMD build).

### Libraries

```
graphql (browser UMD, ~90 kB min+gz) from cdn.jsdelivr.net
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ |
| Existing duplicate | ❌ none |

---

## Tool 11 — Offline Text Translator

**File:** `src/tools/text/offline-translator.js`  
**Tool ID:** `offline-translator`  
**Category:** `text`

### What it does

Translate text between **50+ languages** entirely in the browser using **NLLB-200-distilled** (Meta's multilingual model) via Transformers.js. No API key, no server call, works offline after the model downloads once (cached via IndexedDB).

### Why it's rare

Google Translate and DeepL send every text string to their servers — unacceptable for medical records, legal documents, or private communications. A fully local translator is genuinely rare.

### Input → Process → Output

```
[Source textarea]
       ↓  Select source language / Auto-detect
       ↓  Select target language
       ↓  Transformers.js pipeline('translation', 'Xenova/nllb-200-distilled-600M')
       ↓  Translated string
       ↓  Display in output textarea
```

### UI layout

```
┌──────────────────────────────────────────────────┐
│  [🌐 Auto-detect ▾]   ⇄   [Spanish ▾]           │
├────────────────────────┬─────────────────────────┤
│  Type or paste text…   │  Translation appears…   │
│                        │                         │
│  250 / 512 chars       │  [📋 Copy]              │
└────────────────────────┴─────────────────────────┘
│  ⚙ Model loaded (600M NLLB) · 🔒 100% offline   │
└──────────────────────────────────────────────────┘
```

### Key implementation notes

- NLLB-200 distilled 600M: `Xenova/nllb-200-distilled-600M` — ~1.2 GB. This exceeds the model cap note in TOOLS.md ("≤100MB"). Consider the smaller `Xenova/opus-mt-*` family (~50–80 MB per language pair) as a fallback for specific language pairs, or use `nllb-200-distilled-350M` (~600 MB quantised). Add a prominent first-run warning: "This tool downloads a ~600 MB model once and caches it locally."
- Alternatively: use a family of small `Helsinki-NLP/opus-mt-{src}-{tgt}` models (~80 MB each) loaded on demand per language pair.
- **Recommended approach:** lazy-load per language pair using `opus-mt` models. 50+ language pairs covered with individual small models each ≤ 100 MB.
- Show a first-run download progress bar.
- Auto-detect: run `Xenova/language-detection` model (~5 MB) on first 200 chars.

### Libraries

```json
"@xenova/transformers": "^2.x"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ |
| Model ≤ 100 MB (per pair) | ✅ opus-mt models |
| Existing duplicate | ❌ none |

---

## Tool 12 — Legal Clause Simplifier

**File:** `src/tools/text/legal-simplifier.js`  
**Tool ID:** `legal-clause-simplifier`  
**Category:** `text`

### What it does

Paste dense legal text (contract clauses, terms of service, NDAs) and get a **plain-English summary** per paragraph — using a `DistilBART` summarisation model running fully in the browser via Transformers.js.

### Input → Process → Output

```
[Large textarea — paste legal text]
       ↓  Split into paragraphs
       ↓  For each paragraph → Transformers.js summarization pipeline
       ↓  Render: original paragraph + plain-English summary side-by-side
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Paste legal text (contract, TOS, NDA…)         │
│  [Simplify]                                     │
├─────────────────────────────────────────────────┤
│  ┌─ Clause 1 ──────────────────────────────────┐│
│  │ Original: "The Licensee shall indemnify…"   ││
│  │ Plain English: "You must pay for any legal  ││
│  │  costs if your actions cause problems."     ││
│  └─────────────────────────────────────────────┘│
│  ┌─ Clause 2 ──────────────────────────────────┐│
│  │ …                                           ││
│  └─────────────────────────────────────────────┘│
│  [📋 Copy simplified version]  [⬇ Export TXT]  │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Model: `Xenova/distilbart-cnn-6-6` (~250 MB quantised) or `Xenova/bart-large-cnn` — pick based on RAM budget.
- Split text by double newline (`\n\n`) or numbered list pattern.
- Summarise paragraphs in sequence; update UI progressively (one block at a time).
- Add a clear disclaimer: "This is a plain-English aid, not legal advice. Always consult a lawyer."
- Warn on first load: model download ~250 MB, cached after first use.

### Libraries

```json
"@xenova/transformers": "^2.x"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ |
| Existing duplicate | ❌ none |
| No LLM/chatbot pattern | ✅ summarisation only, no conversational loop |

---

## Tool 13 — Text Sentiment Heatmap

**File:** `src/tools/text/sentiment-heatmap.js`  
**Tool ID:** `sentiment-heatmap`  
**Category:** `text`

### What it does

Paste a document, transcript, or article and see a **sentence-by-sentence sentiment heatmap** — positive sentences highlighted green, negative red, neutral gray — inline in the original text. Uses **DistilBERT SST-2** (already in your ONNX whitelist).

### Input → Process → Output

```
[Textarea — paste document]
       ↓  Split into sentences (regex: (?<=[.!?])\s+)
       ↓  For each sentence → DistilBERT SST-2 ONNX classifier
       ↓  label: POSITIVE/NEGATIVE + score
       ↓  Render sentences with coloured background
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Paste text (article, transcript, review…)      │
│  [Analyse Sentiment]                            │
├─────────────────────────────────────────────────┤
│  Legend: 🟢 Positive  ⚪ Neutral  🔴 Negative   │
│  Overall: 63% positive  24% neutral  13% negative│
│                                                  │
│  "The product is excellent and easy to use."   ← green bg
│  "However, the battery drains very fast."      ← red bg
│  "The price is standard for this category."   ← gray bg
├─────────────────────────────────────────────────┤
│  [Chart: sentiment over document]               │  ← mini line chart
│  [📋 Copy report]  [⬇ Export CSV]              │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Model: `Xenova/distilbert-base-uncased-finetuned-sst-2-english` (~67 MB — within whitelist).
- Sentence splitter: `text.split(/(?<=[.!?!])\s+/)` — handle edge cases (Mr., Dr., etc.) with a small abbreviation set.
- Colour intensity: map confidence score (0.5–1.0) to opacity (0.15–0.50) so high-confidence sentences are more vivid.
- Mini line chart: `Chart.js` (already in use in other tools) — plot sentiment score per sentence index.
- CSV export: `sentence, label, score` per row.

### Libraries

```json
"@xenova/transformers": "^2.x",
"chart.js": "^4.x"     // already used in project
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ DistilBERT SST-2 ONNX |
| Model ≤ 100 MB | ✅ ~67 MB |
| Existing duplicate | ❌ `readability-score.js` measures reading level only |

---

## Tool 14 — Meeting Cost Calculator

**File:** `src/tools/productivity/meeting-cost-calculator.js`  
**Tool ID:** `meeting-cost-calculator`  
**Category:** `productivity`

### What it does

Enter meeting participants (with annual salary / hourly rate), meeting duration, and see the **real dollar cost** ticking up in real time like a clock. Export a printable cost report as PDF.

### Why it's rare

This tool goes viral on LinkedIn every time someone builds it. The top Google result is ad-heavy or broken. A clean, no-account version is missing from every major toolbox site.

### Input → Process → Output

```
[Participant list with salary inputs]
       ↓  Compute: hourly rate = salary / 2080
       ↓  cost per second = sum(hourly rates) / 3600
       ↓  setInterval(100ms) → update running total
       ↓  jsPDF → export summary report
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Meeting participants                           │
│  ┌─────────────────┬──────────┬─────────────┐  │
│  │ Role            │ Salary   │ # people    │  │
│  │ [Senior Dev   ] │[$120,000]│ [3        ] │  │
│  │ [Product Mgr  ] │[$100,000]│ [1        ] │  │
│  │ [Designer     ] │[$90,000 ]│ [2        ] │  │
│  └─────────────────┴──────────┴─────────────┘  │
│  [+ Add row]           Currency: [USD ▾]        │
│                                                  │
│  Duration: [00:45:00]  [▶ Start timer]          │
├─────────────────────────────────────────────────┤
│         💰 $312.50                              │
│         cost so far (and counting…)            │
│                                                  │
│  At this rate: $416.67/hour                     │
│  Equivalent to: 1.5 dev-days                   │
├─────────────────────────────────────────────────┤
│  [⬇ Export PDF report]  [📋 Copy summary]      │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Live ticker: `setInterval(100)` → add `costPerSecond / 10` every tick → format with `Intl.NumberFormat`.
- Salary presets: common roles with median US salaries pre-filled (editable).
- Currency: store a `CURRENCY_RATES` constant object for display conversion only — no API.
- PDF report: meeting summary table (attendees, rates, duration, total cost) via `jsPDF`.
- Viral feature: big animated money counter — use CSS counter animation via `requestAnimationFrame`.

### Libraries

```json
"jspdf": "^2.5"    // already in project
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ pure JS math |
| Existing duplicate | ❌ none |

---

## Tool 15 — Working Days Calculator

**File:** `src/tools/productivity/working-days-calculator.js`  
**Tool ID:** `working-days-calculator`  
**Category:** `productivity`

### What it does

Calculate **business days** between two dates, excluding weekends and public holidays for **50+ countries** — with a bundled holiday dataset (no API). Also: "Add N working days to a date."

### Input → Process → Output

```
[Date A]  [Date B]  [Country selector]
       ↓  Generate all dates in range
       ↓  Filter: exclude Sat/Sun
       ↓  Filter: exclude holiday dates from bundled JSON
       ↓  Count remaining dates
       ↓  Display result + holiday list
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Mode: ◉ Days between dates  ○ Add working days │
│                                                  │
│  From: [2025-01-15]   To: [2025-03-31]          │
│  Country: [🇩🇪 Germany ▾]                        │
│  [Calculate]                                    │
├─────────────────────────────────────────────────┤
│  📅 Working days: 53                            │
│  Calendar days: 75   Weekends: 20   Holidays: 2 │
│                                                  │
│  Holidays in range:                             │
│  • 2025-01-01 New Year's Day                   │
│  • 2025-04-18 Good Friday                      │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Bundle `src/data/holidays.json` — a compact map of `{ "DE": { "2025": ["2025-01-01", "2025-04-18"] } }`. Use a public domain dataset (e.g. `date-holidays` package data, MIT licensed) trimmed to the 50 most-used countries.
- Year data: bundle current year + 2 future years; warn user if asking for years outside bundled data.
- Weekend logic: `date.getDay() === 0 || date.getDay() === 6`.
- "Add N working days" mode: iterate forward from start date, counting only working days.
- Locale-aware: some countries have Friday/Saturday weekends (Middle East) — include in JSON config.

### Libraries

Pure vanilla JS + bundled `holidays.json`.

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ |
| Existing duplicate | ❌ `date-difference.js` counts calendar days only |

---

## Tool 16 — AI Image Upscaler (4×)

**File:** `src/tools/image/ai-image-upscaler.js`  
**Tool ID:** `ai-image-upscaler`  
**Category:** `image`

### What it does

Upscale any image up to **4× its original resolution** using a **Real-ESRGAN tiny** ONNX model. Zero upload, works fully offline. Produces noticeably sharper results than bicubic interpolation.

### Why it's rare

waifu2x requires a server. Topaz Gigapixel is $200. Adobe Super Resolution requires Creative Cloud. A free, private, client-side AI upscaler is one of the most-requested tools on the web.

### Input → Process → Output

```
[Image drop zone (JPG, PNG, WebP)]
       ↓  Canvas API: decode to ImageData (RGBA Float32)
       ↓  Tile into 128×128 patches (with 8px overlap)
       ↓  ONNX Runtime: Real-ESRGAN-tiny (each tile 128→512)
       ↓  Stitch tiles with overlap blending
       ↓  canvas.toBlob('image/png') → download
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Drop image (JPG, PNG, WebP)                    │
├────────────────────────┬────────────────────────┤
│  Original (800×600)    │  Upscaled (3200×2400)  │
│  [Before image]        │  [After image]         │
│  ← drag slider →       │                        │
└────────────────────────┴────────────────────────┘
│  Scale: ◉ 2×  ○ 4×    Format: [PNG ▾]          │
│  [Upscale]   Progress: [████████░░░░] 72%       │
│  [⬇ Download]                                   │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Model: `realesrgan-x4plus-anime` or the general `realesrgan-x4` ONNX (both ~16 MB quantised INT8).
- **Tile processing is mandatory** — full 4× upscale of a 4K image at once would OOM. Use 128×128 input tiles with 8 px padding → 512×512 output tiles, blend overlaps.
- Use a `Worker` + `Comlink` for tiling loop so UI stays responsive.
- Show tile-by-tile progress: "Processing tile 12 / 48…".
- Before/after comparison slider: reuse the `comparison-slider.js` component that already exists in the project.
- Model path: `public/models/realesrgan-x4.onnx` — already noted in README file structure.

### Libraries

```json
"onnxruntime-web": "^1.18"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ |
| Model ≤ 100 MB | ✅ ~16 MB |
| Already in model list | ✅ README lists `realesrgan-x4.onnx` in `public/models/` |
| Existing duplicate | ❌ `upscale-image.js` exists but uses bicubic (Canvas) — this is AI-powered |

---

## Tool 17 — Metadata Stripper (All File Types)

**File:** `src/tools/privacy/metadata-stripper.js`  
**Tool ID:** `metadata-stripper`  
**Category:** `privacy`

### What it does

Drop **any file** (image, PDF, DOCX, MP3, MP4) and strip all embedded metadata before sharing — EXIF tags, XMP data, document properties (author, company, revision history), ID3 audio tags, MP4 atoms. Downloads a clean copy.

### Why it's rare

`remove-metadata.js` already strips EXIF from images. This tool extends to **PDF, DOCX, MP3** — no single browser tool covers all four types. Journalists, lawyers, and privacy-conscious users urgently need this.

### Input → Process → Output

```
[Multi-file drop zone]
       ↓  Detect file type by MIME / extension
       ├─ .jpg/.png → piexifjs: zero out all EXIF tags
       ├─ .pdf → pdf-lib: remove Info dict, XMP metadata stream
       ├─ .docx → JSZip: open zip, rewrite docProps/core.xml and app.xml with blank values
       ├─ .mp3 → id3 parser: strip ID3v1 and ID3v2 tags
       └─ .mp4 → strip moov.udta atom using ArrayBuffer manipulation
       ↓  Download cleaned file (same name + "_clean" suffix)
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Drop files to strip metadata                   │
│  Supported: JPG, PNG, PDF, DOCX, MP3            │
├─────────────────────────────────────────────────┤
│  photo.jpg     ✅ Stripped 47 EXIF tags         │
│  contract.pdf  ✅ Removed author, creation date │
│  report.docx   ✅ Cleared 6 document properties │
│  podcast.mp3   ✅ Removed ID3 tags (artist,…)  │
├─────────────────────────────────────────────────┤
│  [⬇ Download all (ZIP)]                        │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Route each file through a typed handler function: `stripImage`, `stripPDF`, `stripDOCX`, `stripMP3`.
- DOCX: `docProps/core.xml` contains `dc:creator`, `dc:description`, `cp:lastModifiedBy` — blank them. `docProps/app.xml` has `Company`, `Template` — blank them. Re-zip with `JSZip`.
- MP3 ID3: use a tiny parser to find ID3 header (`ID3\x03` at byte 0) and overwrite or truncate before the audio frame.
- PDF: `pdf-lib` — `pdfDoc.setTitle('')`, `setAuthor('')`, `setSubject('')`, `setCreator('')`, `setProducer('')`, `setKeywords([])` + remove `XMP` metadata stream if present.
- This tool differs from `remove-metadata.js` (image-only EXIF only). Maintain both — this is the multi-format version.

### Libraries

```json
"piexifjs": "^1.0",
"pdf-lib": "^1.17",   // already in project
"jszip": "^3.10"       // already in project
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ |
| Existing duplicate | ⚠️ `remove-metadata.js` handles images — this adds PDF/DOCX/MP3 |

---

## Tool 18 — Net Worth / Personal Balance Sheet

**File:** `src/tools/finance/net-worth-tracker.js`  
**Tool ID:** `net-worth-tracker`  
**Category:** `finance`

### What it does

A private, **no-account personal balance sheet** — list assets (savings, investments, property, vehicles) and liabilities (mortgage, loans, credit cards), see real-time net worth and asset allocation chart. Data saved to `localStorage` only, never leaves the device.

### Why it's rare

Mint shut down in 2023. Personal Capital (now Empower) requires linking bank accounts. No free, private, no-account net worth tool exists in any major toolbox.

### Input → Process → Output

```
[Assets table] + [Liabilities table]
       ↓  sum(assets) - sum(liabilities) = net worth
       ↓  Asset allocation: pie chart (Cash / Investments / Property / Other)
       ↓  All stored in localStorage under key 'nwt_data'
       ↓  Export: CSV or PDF snapshot
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  💰 Net Worth: $284,500                         │
│  Assets: $420,000   Liabilities: $135,500       │
├──────────────────────┬──────────────────────────┤
│  Assets              │  [Pie chart]             │
│  + Savings  $25,000  │                          │
│  + 401(k)   $85,000  │  Cash 6%                 │
│  + Home    $310,000  │  Investments 20%         │
│  [+ Add asset]       │  Property 74%            │
├──────────────────────┴──────────────────────────┤
│  Liabilities                                    │
│  − Mortgage $120,000                            │
│  − Car loan  $15,500                            │
│  [+ Add liability]                             │
├─────────────────────────────────────────────────┤
│  [⬇ Export CSV]  [⬇ Export PDF]  [🗑 Clear data]│
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Data schema: `{ assets: [{name, category, value}], liabilities: [{name, value}], lastUpdated }` in `localStorage`.
- Pie chart: `Chart.js` doughnut with 5 category colours.
- Inline editing: each row's value is an `<input type="number">` — changes auto-save to `localStorage`.
- Privacy notice at top: "All data is stored locally on your device. Nothing is sent anywhere."
- Export PDF: snapshot of current balance sheet using `jsPDF` (already in project).

### Libraries

```json
"chart.js": "^4.x",   // already in project
"jspdf": "^2.5"        // already in project
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ localStorage only |
| Existing duplicate | ❌ none (crypto-prices.js shows market data; this is personal finance) |

---

## Tool 19 — Symptom Onset / Duration Tracker

**File:** `src/tools/health/symptom-tracker.js`  
**Tool ID:** `symptom-tracker`  
**Category:** `health`

### What it does

Log symptoms with onset date/time, severity (1–10), duration, and free-text notes. Generate a **printable symptom timeline PDF** to bring to a doctor's appointment. All data stored in `localStorage` — never uploaded.

### Why it's rare

Doctors consistently ask "when did this start?" and patients can't remember. No free, private, no-account symptom log exists. This directly relieves suffering — patients with chronic illness, post-viral conditions, or diagnostic journeys have no good digital tool.

### Input → Process → Output

```
[Add symptom form: name, onset, severity, duration, notes]
       ↓  Store array in localStorage['symptoms']
       ↓  Render chronological timeline
       ↓  jsPDF: generate printable report grouped by symptom
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Add symptom                                    │
│  Symptom: [Headache           ]                 │
│  Onset:   [2025-06-01] [14:30 ]                 │
│  Severity:[● ● ● ● ● ● ○ ○ ○ ○] 6/10           │
│  Duration:[3 hours  ]   Still ongoing? [☐]      │
│  Notes:   [Started after lunch, left temple…]   │
│  [+ Log Symptom]                               │
├─────────────────────────────────────────────────┤
│  Timeline — 12 entries                         │
│                                                  │
│  📅 Jun 3, 2025                                │
│     🔴 Headache  •  Severity 6  •  3 hrs       │
│     🟡 Fatigue   •  Severity 4  •  All day      │
│                                                  │
│  📅 Jun 1, 2025                                │
│     🔴 Chest pain •  Severity 8  •  20 min     │
├─────────────────────────────────────────────────┤
│  [⬇ Export PDF for doctor]  [⬇ Export CSV]     │
│  [🗑 Clear all data]                            │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- Severity colour: ≤3 green, 4–6 amber, 7–10 red.
- PDF report: cover page with date range + patient-written summary (optional free-text field), then one section per symptom with all logged events in table format.
- Group timeline entries by date (descending) for easy scanning.
- Export CSV: `date, time, symptom, severity, duration, notes` per row.
- Warn user clearly: "This is a personal log tool, not a medical device."
- Privacy banner: "Data never leaves your device."

### Libraries

```json
"jspdf": "^2.5",    // already in project
"jspdf-autotable": "^3.x"   // for PDF tables
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ localStorage |
| Existing duplicate | ❌ `bmi-calculator.js`, `calorie-counter.js` etc. are calculators — no symptom log |

---

## Tool 20 — Face Blur / Anonymizer

**File:** `src/tools/image/face-blur.js`  
**Tool ID:** `face-blur`  
**Category:** `image`

### What it does

Detect all faces in an image automatically using **BlazeFace** (already in your ONNX whitelist) and apply a Gaussian blur or pixelation mosaic over each face. Download the anonymised image. Zero upload.

### Why it's rare

Every face blur tool (BunnyPic, FacePixelizer) sends the image to a server. **BlazeFace is already in your project's allowed ONNX model list.** This is a zero-friction addition that fills a genuine privacy need for journalists, educators, HR, and protesters.

### Input → Process → Output

```
[Image drop zone (JPG, PNG)]
       ↓  Canvas API: draw image → ImageData
       ↓  BlazeFace ONNX: detect face bounding boxes
       ↓  For each box: apply box blur or pixelate via Canvas
       ↓  canvas.toBlob() → download anonymised image
```

### UI layout

```
┌─────────────────────────────────────────────────┐
│  Drop image (JPG, PNG, WebP)                    │
├────────────────────────┬────────────────────────┤
│  Original              │  Anonymised preview    │
│  [Image with boxes]    │  [Image with blur]     │
│  ← drag slider →       │                        │
└────────────────────────┴────────────────────────┘
│  Effect: ◉ Blur  ○ Pixelate  ○ Black box        │
│  Strength: [●──────────────────] 80%            │
│  Faces detected: 3  ✅                          │
│  [Re-detect]  [⬇ Download anonymised image]    │
└─────────────────────────────────────────────────┘
```

### Key implementation notes

- BlazeFace: load `blazeface.onnx` from `public/models/`. Input: `[1, 3, 128, 128]` float32. Output: bounding boxes `[x1, y1, x2, y2, confidence]`.
- Pre-process: resize canvas to 128×128, normalise to `[-1, 1]`, run inference, map boxes back to original resolution.
- Box blur implementation: for each detected face region, iterate pixels in a square kernel (radius = strength × 10). Pure Canvas `ImageData` manipulation — no library.
- Pixelate: divide region into `NxN` cells, fill each cell with the average colour.
- Manual adjustment: let users drag the detected boxes to correct misses (add `mousedown/mousemove` on canvas).
- Reuse the existing `comparison-slider.js` component for before/after.

### Libraries

```json
"onnxruntime-web": "^1.18"
```

### Constraint check

| Criterion | Status |
|-----------|--------|
| 100% client-side | ✅ |
| BlazeFace in whitelist | ✅ listed in AGENTS.md and TOOLS.md |
| Existing duplicate | ❌ `pixelate-image.js` pixelates the whole image; this detects + targets faces |

---

## Phase 27 — tools.json entries

Add these entries to `src/data/tools.json` and `toolsList.json`. Status starts as `"planned"`, change to `"done"` after each tool ships.

```json
[
  { "id": "stem-separator",        "title": "Vocal / Stem Separator",       "category": "audio",        "file": "audio/stem-separator.js",          "status": "planned", "phase": 27 },
  { "id": "noise-remover",         "title": "Noise / Hiss Remover",          "category": "audio",        "file": "audio/noise-remover.js",           "status": "planned", "phase": 27 },
  { "id": "bpm-key-detector",      "title": "BPM & Key Detector",            "category": "audio",        "file": "audio/bpm-key-detector.js",        "status": "planned", "phase": 27 },
  { "id": "audio-equalizer",       "title": "Audio EQ & Visualizer",         "category": "audio",        "file": "audio/audio-equalizer.js",         "status": "planned", "phase": 27 },
  { "id": "video-screenshot-extractor", "title": "Video Screenshot Extractor", "category": "video",    "file": "video/video-screenshot-extractor.js","status": "planned", "phase": 27 },
  { "id": "video-transcriber",     "title": "Local Video Transcriber",       "category": "video",        "file": "video/video-transcriber.js",       "status": "planned", "phase": 27 },
  { "id": "video-silence-remover", "title": "Video Silence Remover",         "category": "video",        "file": "video/silence-remover.js",         "status": "planned", "phase": 27 },
  { "id": "json-diff-viewer",      "title": "JSON Diff Viewer",              "category": "dev",          "file": "dev/json-diff-viewer.js",          "status": "planned", "phase": 27 },
  { "id": "openapi-visualizer",    "title": "OpenAPI / Swagger Visualizer",  "category": "dev",          "file": "dev/openapi-visualizer.js",        "status": "planned", "phase": 27 },
  { "id": "graphql-schema-explorer","title": "GraphQL Schema Explorer",      "category": "dev",          "file": "dev/graphql-schema-explorer.js",   "status": "planned", "phase": 27 },
  { "id": "offline-translator",    "title": "Offline Text Translator",       "category": "text",         "file": "text/offline-translator.js",       "status": "planned", "phase": 27 },
  { "id": "legal-clause-simplifier","title": "Legal Clause Simplifier",      "category": "text",         "file": "text/legal-simplifier.js",         "status": "planned", "phase": 27 },
  { "id": "sentiment-heatmap",     "title": "Text Sentiment Heatmap",        "category": "text",         "file": "text/sentiment-heatmap.js",        "status": "planned", "phase": 27 },
  { "id": "meeting-cost-calculator","title": "Meeting Cost Calculator",       "category": "productivity", "file": "productivity/meeting-cost-calculator.js","status":"planned","phase":27},
  { "id": "working-days-calculator","title": "Working Days Calculator",       "category": "productivity", "file": "productivity/working-days-calculator.js","status":"planned","phase":27},
  { "id": "ai-image-upscaler",     "title": "AI Image Upscaler (4×)",        "category": "image",        "file": "image/ai-image-upscaler.js",       "status": "planned", "phase": 27 },
  { "id": "metadata-stripper",     "title": "Metadata Stripper",             "category": "privacy",      "file": "privacy/metadata-stripper.js",     "status": "planned", "phase": 27 },
  { "id": "net-worth-tracker",     "title": "Net Worth Tracker",             "category": "finance",      "file": "finance/net-worth-tracker.js",     "status": "planned", "phase": 27 },
  { "id": "symptom-tracker",       "title": "Symptom Onset Tracker",         "category": "health",       "file": "health/symptom-tracker.js",        "status": "planned", "phase": 27 },
  { "id": "face-blur",             "title": "Face Blur / Anonymizer",        "category": "image",        "file": "image/face-blur.js",               "status": "planned", "phase": 27 }
]
```

---

## Build order recommendation

Build in this order to avoid bottlenecks (heavy ML models last):

1. **Tool 8** — JSON Diff Viewer (zero dependencies, fastest to ship)
2. **Tool 14** — Meeting Cost Calculator (zero dependencies, high virality)
3. **Tool 15** — Working Days Calculator (only JSON data file needed)
4. **Tool 18** — Net Worth Tracker (Chart.js already in project)
5. **Tool 19** — Symptom Tracker (jsPDF already in project)
6. **Tool 5** — Video Screenshot Extractor (Canvas + JSZip, no new deps)
7. **Tool 4** — Audio EQ & Visualizer (Web Audio API only)
8. **Tool 9** — OpenAPI Visualizer (js-yaml, small dep)
9. **Tool 10** — GraphQL Schema Explorer (graphql UMD, ~90 kB)
10. **Tool 17** — Metadata Stripper (pdf-lib + JSZip already in project)
11. **Tool 7** — Video Silence Remover (ffmpeg.wasm already in project)
12. **Tool 13** — Sentiment Heatmap (DistilBERT SST-2 — in whitelist, ~67 MB)
13. **Tool 20** — Face Blur (BlazeFace — in whitelist)
14. **Tool 3** — BPM & Key Detector (Essentia.js WASM, new dep)
15. **Tool 16** — AI Image Upscaler (Real-ESRGAN ONNX ~16 MB — already in public/models/)
16. **Tool 2** — Noise Remover (DeepFilterNet ONNX ~18 MB)
17. **Tool 12** — Legal Clause Simplifier (DistilBART ~250 MB, warn user)
18. **Tool 11** — Offline Translator (opus-mt per language pair ~80 MB each)
19. **Tool 6** — Video Transcriber (Whisper tiny ~39 MB)
20. **Tool 1** — Vocal Stem Separator (Demucs-mini ~85 MB — largest, most complex)

---

## New dependencies summary

| Package | Used by | Notes |
|---------|---------|-------|
| `@xenova/transformers` | Tools 1, 2, 6, 11, 12, 13 | Already needed for Whisper in transcribe-audio |
| `onnxruntime-web` | Tools 1, 2, 16, 20 | Shared with @xenova/transformers |
| `essentia.js` | Tool 3 | WASM, bundle in `public/libs/` |
| `jszip` | Tools 1, 5, 17 | Likely already in project |
| `lamejs` | Tools 4, 2 | Already in project (audio tools) |
| `js-yaml` | Tool 9 | Small, ~20 kB |
| `graphql` (UMD) | Tool 10 | Load from CDN at runtime |
| `jspdf-autotable` | Tool 19 | Companion to jsPDF |
| **No new deps** | Tools 7, 8, 14, 15, 18 | Pure browser APIs + already-installed packages |

---

*Generated for Phase 27 of xtoolbox. Follow the 11-step AGENTS.md workflow for each tool.*
