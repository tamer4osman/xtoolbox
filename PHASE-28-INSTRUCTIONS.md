# Phase 27 — Build Instructions (20 Tools)

> **These instructions are written to be followed literally, step by step, by an AI agent with no memory between steps.**
> Never skip a step. Never assume. Never invent a file path, library name, or API endpoint that is not explicitly written here.
> Every tool follows the same 11-step workflow from AGENTS.md, repeated inside each tool section so you never need to look it up.

---

## GLOBAL RULES — READ BEFORE TOUCHING ANY FILE

1. **Stack:** Vite + Vanilla JS. No React. No Vue. No framework.
2. **100% client-side.** Two tools in this phase (#9 Password Breach Checker, #16 Currency Converter) call a public, no-key API. This is explicitly allowed per `TOOLS.md` → "Data source: Self-contained or public API without API key." No other tool in this phase makes any network call.
3. **Every tool is one file** in `src/tools/<category>/<tool-id>.js`.
4. **Export one default function** named `init` that takes zero arguments and returns a DOM element.
5. **Use existing components** from `src/components/`. Do not rewrite toast, file-upload, progress-bar, tabs, or range-slider.
6. **Use existing utils** from `src/utils/file.js`, `src/utils/dom.js`, `src/utils/clipboard.js`, `src/utils/format.js`.
7. **CSS:** Use only tokens from `src/styles/tokens.css`. No inline colours that are not CSS variables, except where a tool's own logic computes a colour value (e.g. the color blindness simulator's pixel math).
8. **After every tool:** update `src/data/tools.json`, `toolsList.json`, `README.md`, `PROJECT-PLAN.md`, `src/pages/home.js`, `src/data/categories.json`, `src/components/footer.js`.
9. **Commit only after user approves** the tool via browser test at `http://localhost:3000/#/tools/<tool-id>`.
10. **Build must pass** (`npm run build`) before requesting user approval.
11. **Model size cap:** Basic Pitch ONNX (~2 MB — the smallest ML model in the entire project) is the only new model file in this phase. No other tool in Phase 27 needs a model.

---

## BUILD ORDER

Build in this exact order. Zero-dependency tools first, network-API tools next, WASM/ffmpeg tools after, ML last.

```
1.  color-blindness-simulator   ← pure Canvas math, no deps
2.  browser-fingerprint-checker ← pure browser APIs, zero network
3.  loan-amortization-calculator← Chart.js + jsPDF (already installed)
4.  expense-splitter            ← pure JS + localStorage
5.  mind-map-maker              ← SVG + pure JS + localStorage
6.  kanban-board                ← HTML5 Drag and Drop API + localStorage
7.  timesheet-tracker           ← localStorage + jsPDF (already installed)
8.  font-pairing-visualizer     ← Google Fonts CDN (link tag, no npm install)
9.  tts-reader                  ← Web Speech API, zero dependencies
10. voice-pitch-changer         ← Web Audio API, zero dependencies
11. currency-converter          ← fetch() to exchangerate.host (no key)
12. password-breach-checker     ← Web Crypto API + fetch() to HIBP Range API (no key)
13. chroma-key-composer         ← Canvas API + <video>, zero new deps
14. video-scene-cut-detector    ← ffmpeg.wasm (already installed)
15. video-stabilizer            ← ffmpeg.wasm (already installed)
16. podcast-loudness-normalizer ← ffmpeg.wasm (already installed)
17. panorama-stitcher           ← OpenCV.js (npm install opencv.js OR CDN script)
18. text-similarity-checker     ← @xenova/transformers (already installed)
19. resume-job-matcher          ← @xenova/transformers (already installed)
20. audio-to-midi-converter     ← onnxruntime-web + Basic Pitch ONNX (new model, ~2MB)
```

---

## TOOL 1 — Color Blindness Simulator

**Tool ID:** `color-blindness-simulator`
**File:** `src/tools/image/color-blindness-simulator.js`
**Category:** `image`
**New npm packages:** none

### Exact transform matrices (use these values verbatim — do not approximate)

These are the standard Brettel/Viénot LMS-based simulation matrices, applied directly in linear-RGB space:

```js
// src/tools/image/color-blindness-simulator.js

const CVD_MATRICES = {
  protanopia: [
    0.567, 0.433, 0.000,
    0.558, 0.442, 0.000,
    0.000, 0.242, 0.758
  ],
  deuteranopia: [
    0.625, 0.375, 0.000,
    0.700, 0.300, 0.000,
    0.000, 0.300, 0.700
  ],
  tritanopia: [
    0.950, 0.050, 0.000,
    0.000, 0.433, 0.567,
    0.000, 0.475, 0.525
  ],
  achromatopsia: [
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114
  ]
};

function applyMatrix(imageData, matrix) {
  const { data, width, height } = imageData;
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    out[i]   = matrix[0]*r + matrix[1]*g + matrix[2]*b;
    out[i+1] = matrix[3]*r + matrix[4]*g + matrix[5]*b;
    out[i+2] = matrix[6]*r + matrix[7]*g + matrix[8]*b;
    out[i+3] = data[i+3];
  }
  return new ImageData(out, width, height);
}

export default function init() {
  const container = document.createElement('div');
  container.className = 'tool-container';

  container.innerHTML = `
    <div class="tool-header">
      <h1>Color Blindness Simulator</h1>
      <p>See how your image looks to people with different types of color vision deficiency.</p>
    </div>
    <div class="cbs-dropzone" id="cbs-drop">
      <p>Drop an image here or click to browse</p>
      <input type="file" id="cbs-file" accept="image/*" style="display:none">
    </div>
    <div id="cbs-results" class="cbs-grid" style="display:none">
      <div class="cbs-cell"><div class="cbs-label">Original</div><canvas id="cbs-original"></canvas></div>
      <div class="cbs-cell"><div class="cbs-label">Protanopia (red-blind)</div><canvas id="cbs-protanopia"></canvas></div>
      <div class="cbs-cell"><div class="cbs-label">Deuteranopia (green-blind)</div><canvas id="cbs-deuteranopia"></canvas></div>
      <div class="cbs-cell"><div class="cbs-label">Tritanopia (blue-blind)</div><canvas id="cbs-tritanopia"></canvas></div>
      <div class="cbs-cell"><div class="cbs-label">Achromatopsia (full color blindness)</div><canvas id="cbs-achromatopsia"></canvas></div>
    </div>
  `;

  const dropzone = container.querySelector('#cbs-drop');
  const fileInput = container.querySelector('#cbs-file');

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) processFile(e.target.files[0]); });

  async function processFile(file) {
    const img = await createImageBitmap(file);
    const maxDim = 500; // keep previews fast
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = w; srcCanvas.height = h;
    srcCanvas.getContext('2d').drawImage(img, 0, 0, w, h);
    const baseData = srcCanvas.getContext('2d').getImageData(0, 0, w, h);

    container.querySelector('#cbs-results').style.display = '';

    const drawTo = (canvasId, imageData) => {
      const canvas = container.querySelector(canvasId);
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').putImageData(imageData, 0, 0);
    };

    drawTo('#cbs-original', baseData);
    for (const [name, matrix] of Object.entries(CVD_MATRICES)) {
      drawTo('#cbs-' + name, applyMatrix(baseData, matrix));
    }
  }

  return container;
}
```

### CSS to append to `src/styles/components.css`

```css
/* ── Color Blindness Simulator ──────────────────────────── */
.cbs-dropzone { border: 2px dashed var(--color-border); border-radius: var(--radius-lg); padding: var(--space-8); text-align: center; cursor: pointer; margin-bottom: var(--space-5); }
.cbs-dropzone.dragover { border-color: var(--color-primary); background: var(--color-surface); }
.cbs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); }
.cbs-cell { text-align: center; }
.cbs-label { font-size: var(--text-sm); font-weight: 600; margin-bottom: var(--space-2); }
.cbs-cell canvas { max-width: 100%; border-radius: var(--radius); border: 1px solid var(--color-border); }
```

### Registration — repeat for every tool (see full checklist at the end)

- Add entry to `src/data/tools.json` and `toolsList.json`:
```json
{
  "id": "color-blindness-simulator",
  "name": "Color Blindness Simulator",
  "description": "Preview an image as seen with protanopia, deuteranopia, tritanopia, or achromatopsia.",
  "category": "image",
  "icon": "👁️",
  "keywords": ["color blindness", "cvd", "accessibility", "protanopia", "deuteranopia", "tritanopia"],
  "file": "image/color-blindness-simulator.js",
  "status": "done",
  "phase": 27
}
```
- Import + route in `src/main.js`:
```js
import colorBlindnessSimulator from './tools/image/color-blindness-simulator.js';
// ... route map:
'color-blindness-simulator': colorBlindnessSimulator,
```
- Increment `image` count in `src/data/categories.json`, `home.js`, `footer.js`, `README.md`, `PROJECT-PLAN.md`.

### Build, test, commit

```bash
npm run build && npm run test:unit
npm run dev
# Visit http://localhost:3000/#/tools/color-blindness-simulator
```

Smoke test checklist:
- [ ] Drop a colorful photo → 5 canvases render (original + 4 simulations)
- [ ] Protanopia canvas visibly shifts reds toward brown/olive
- [ ] Achromatopsia canvas is fully grayscale
- [ ] No console errors

**Commit message:** `feat(color-blindness-simulator): add CVD simulator using Brettel/Viénot matrices`

---

## TOOL 2 — Browser Fingerprint Checker

**Tool ID:** `browser-fingerprint-checker`
**File:** `src/tools/privacy/browser-fingerprint-checker.js`
**Category:** `privacy`
**New npm packages:** none
**Network calls:** ZERO — this tool must never call `fetch()`.

### Exact fingerprinting checks to implement

```js
// src/tools/privacy/browser-fingerprint-checker.js

function getCanvasFingerprint() {
  const canvas = document.createElement('canvas');
  canvas.width = 200; canvas.height = 50;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(0, 0, 100, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('fingerprint-check-🔒', 2, 15);
  return canvas.toDataURL();
}

function getWebGLInfo() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return { vendor: 'unavailable', renderer: 'unavailable' };
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    vendor:   debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)   : gl.getParameter(gl.VENDOR),
    renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
  };
}

function detectAvailableFonts() {
  const testFonts = ['Arial','Verdana','Times New Roman','Courier New','Georgia','Comic Sans MS','Impact','Tahoma','Trebuchet MS','Segoe UI','Roboto','Helvetica Neue'];
  const baseFonts = ['monospace','sans-serif','serif'];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const span = document.createElement('span');
  span.style.fontSize = testSize;
  span.textContent = testString;
  document.body.appendChild(span);

  const baseWidths = {};
  for (const base of baseFonts) {
    span.style.fontFamily = base;
    baseWidths[base] = span.offsetWidth;
  }

  const detected = [];
  for (const font of testFonts) {
    let isDetected = false;
    for (const base of baseFonts) {
      span.style.fontFamily = `'${font}', ${base}`;
      if (span.offsetWidth !== baseWidths[base]) { isDetected = true; break; }
    }
    if (isDetected) detected.push(font);
  }
  document.body.removeChild(span);
  return detected;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(16);
}

async function buildFingerprint() {
  const canvasFp = getCanvasFingerprint();
  const webgl = getWebGLInfo();
  const fonts = detectAvailableFonts();

  const raw = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages ? navigator.languages.join(',') : '',
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    deviceMemory: navigator.deviceMemory || 'unknown',
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    touchSupport: 'ontouchstart' in window,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || 'unspecified',
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    canvasHash: simpleHash(canvasFp),
    fontsDetected: fonts.join(','),
    pluginsCount: navigator.plugins ? navigator.plugins.length : 0,
  };

  const combined = JSON.stringify(raw);
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(combined));
  const hashArray = Array.from(new Uint8Array(digest));
  const fingerprintHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);

  return { raw, fingerprintHash };
}

export default function init() {
  const container = document.createElement('div');
  container.className = 'tool-container';

  container.innerHTML = `
    <div class="tool-header">
      <h1>Browser Fingerprint Checker</h1>
      <p>See what a website could learn about your browser without cookies. Nothing here is sent anywhere — every check runs locally.</p>
    </div>
    <div class="bfc-privacy-notice">🔒 Zero network requests. All checks run entirely in this tab.</div>
    <button id="bfc-run" class="btn btn-primary">Run Fingerprint Check</button>
    <div id="bfc-results" style="display:none">
      <div class="bfc-hash-box">
        <div class="bfc-hash-label">Your fingerprint hash</div>
        <div id="bfc-hash-value" class="bfc-hash-value"></div>
      </div>
      <table class="bfc-table">
        <tbody id="bfc-table-body"></tbody>
      </table>
    </div>
  `;

  container.querySelector('#bfc-run').addEventListener('click', async () => {
    const { raw, fingerprintHash } = await buildFingerprint();
    container.querySelector('#bfc-hash-value').textContent = fingerprintHash;
    const tbody = container.querySelector('#bfc-table-body');
    tbody.innerHTML = Object.entries(raw).map(([key, val]) =>
      `<tr><td class="bfc-key">${escapeHtml(key)}</td><td class="bfc-val">${escapeHtml(String(val))}</td></tr>`
    ).join('');
    container.querySelector('#bfc-results').style.display = '';
  });

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return container;
}
```

### CSS

```css
/* ── Browser Fingerprint Checker ────────────────────────── */
.bfc-privacy-notice { background: var(--color-surface); padding: var(--space-3) var(--space-4); border-radius: var(--radius); font-size: var(--text-sm); margin-bottom: var(--space-4); }
.bfc-hash-box { background: var(--color-primary-light, #EEF2FF); border-radius: var(--radius); padding: var(--space-4); margin: var(--space-4) 0; text-align: center; }
.bfc-hash-label { font-size: var(--text-xs); color: var(--color-muted); }
.bfc-hash-value { font-family: var(--font-mono); font-size: var(--text-lg); font-weight: 700; margin-top: var(--space-1); }
.bfc-table { width: 100%; border-collapse: collapse; margin-top: var(--space-4); }
.bfc-table td { padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); }
.bfc-key { font-weight: 600; width: 220px; }
.bfc-val { font-family: var(--font-mono); word-break: break-all; }
```

**IMPORTANT:** Verify no `fetch()`, `XMLHttpRequest`, `WebSocket`, or `navigator.sendBeacon` call exists anywhere in this file before committing.

**Commit message:** `feat(browser-fingerprint-checker): add zero-network browser fingerprint inspector`

---

## TOOL 3 — Loan Amortization Calculator

**Tool ID:** `loan-amortization-calculator`
**File:** `src/tools/finance/loan-amortization-calculator.js`
**Category:** `finance`
**New npm packages:** none — Chart.js and jsPDF already installed

### Exact amortization formula

```js
function calculateAmortization(principal, annualRatePct, termMonths) {
  const monthlyRate = (annualRatePct / 100) / 12;
  const payment = monthlyRate === 0
    ? principal / termMonths
    : principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

  const schedule = [];
  let balance = principal;
  let totalInterest = 0;

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = payment - interestPayment;
    if (month === termMonths) principalPayment = balance; // clear rounding drift on last payment
    balance = Math.max(0, balance - principalPayment);
    totalInterest += interestPayment;
    schedule.push({
      month,
      payment: month === termMonths ? principalPayment + interestPayment : payment,
      principal: principalPayment,
      interest: interestPayment,
      balance
    });
  }

  return { monthlyPayment: payment, totalInterest, totalPaid: principal + totalInterest, schedule };
}
```

### UI skeleton

```js
import Chart from 'chart.js/auto';

export default function init() {
  const container = document.createElement('div');
  container.className = 'tool-container';

  container.innerHTML = `
    <div class="tool-header">
      <h1>Loan Amortization Calculator</h1>
      <p>See your full month-by-month payment schedule for any fixed-rate loan.</p>
    </div>
    <div class="lac-form">
      <div class="lac-field"><label>Loan amount</label><input type="number" id="lac-principal" value="300000" min="0"></div>
      <div class="lac-field"><label>Annual interest rate (%)</label><input type="number" id="lac-rate" value="6.5" step="0.01" min="0"></div>
      <div class="lac-field"><label>Term (years)</label><input type="number" id="lac-years" value="30" min="1" max="50"></div>
      <button id="lac-calc" class="btn btn-primary">Calculate</button>
    </div>
    <div id="lac-summary" class="lac-summary" style="display:none"></div>
    <canvas id="lac-chart" style="max-height:300px;display:none"></canvas>
    <div id="lac-table-wrap" style="display:none">
      <table class="lac-table">
        <thead><tr><th>#</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
        <tbody id="lac-table-body"></tbody>
      </table>
      <div class="lac-export-row">
        <button id="lac-export-pdf" class="btn btn-secondary">⬇ Export PDF</button>
        <button id="lac-export-csv" class="btn btn-secondary">⬇ Export CSV</button>
      </div>
    </div>
  `;

  let chart = null;
  let lastSchedule = [];
  let lastMeta = {};

  container.querySelector('#lac-calc').addEventListener('click', () => {
    const principal = parseFloat(container.querySelector('#lac-principal').value) || 0;
    const rate      = parseFloat(container.querySelector('#lac-rate').value) || 0;
    const years     = parseInt(container.querySelector('#lac-years').value) || 1;
    const months    = years * 12;

    const result = calculateAmortization(principal, rate, months);
    lastSchedule = result.schedule;
    lastMeta = { principal, rate, years };

    const fmt = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    container.querySelector('#lac-summary').style.display = '';
    container.querySelector('#lac-summary').innerHTML = `
      <div class="lac-stat"><div class="lac-stat-val">${fmt(result.monthlyPayment)}</div><div class="lac-stat-lbl">Monthly payment</div></div>
      <div class="lac-stat"><div class="lac-stat-val">${fmt(result.totalInterest)}</div><div class="lac-stat-lbl">Total interest</div></div>
      <div class="lac-stat"><div class="lac-stat-val">${fmt(result.totalPaid)}</div><div class="lac-stat-lbl">Total paid</div></div>
    `;

    const canvas = container.querySelector('#lac-chart');
    canvas.style.display = '';
    if (chart) chart.destroy();
    // Sample yearly points to keep chart light
    const yearlyPoints = result.schedule.filter((_, i) => (i+1) % 12 === 0);
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: yearlyPoints.map((_, i) => `Yr ${i+1}`),
        datasets: [
          { label: 'Remaining balance', data: yearlyPoints.map(p => p.balance), borderColor: '#3B82F6', tension: 0.2 }
        ]
      },
      options: { responsive: true, plugins: { legend: { display: true } } }
    });

    const tbody = container.querySelector('#lac-table-body');
    tbody.innerHTML = result.schedule.map(row =>
      `<tr><td>${row.month}</td><td>${fmt(row.payment)}</td><td>${fmt(row.principal)}</td><td>${fmt(row.interest)}</td><td>${fmt(row.balance)}</td></tr>`
    ).join('');
    container.querySelector('#lac-table-wrap').style.display = '';
  });

  container.querySelector('#lac-export-pdf').addEventListener('click', async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text('Loan Amortization Schedule', 14, 15);
    doc.setFontSize(10);
    doc.text(`Loan: $${lastMeta.principal.toLocaleString()} at ${lastMeta.rate}% for ${lastMeta.years} years`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [['#','Payment','Principal','Interest','Balance']],
      body: lastSchedule.map(r => [r.month, r.payment.toFixed(2), r.principal.toFixed(2), r.interest.toFixed(2), r.balance.toFixed(2)]),
      styles: { fontSize: 8 }
    });
    doc.save('amortization-schedule.pdf');
  });

  container.querySelector('#lac-export-csv').addEventListener('click', () => {
    const csv = 'month,payment,principal,interest,balance\n' +
      lastSchedule.map(r => `${r.month},${r.payment.toFixed(2)},${r.principal.toFixed(2)},${r.interest.toFixed(2)},${r.balance.toFixed(2)}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'amortization-schedule.csv';
    a.click();
  });

  return container;
}
```

**Note:** `jspdf-autotable` is already installed from Tool 5 of Phase 26 (Symptom Tracker). If it is not present, run `npm install jspdf-autotable` before building.

### CSS

```css
/* ── Loan Amortization Calculator ───────────────────────── */
.lac-form { display: flex; gap: var(--space-4); align-items: end; flex-wrap: wrap; margin-bottom: var(--space-5); }
.lac-field { display: flex; flex-direction: column; gap: var(--space-1); font-size: var(--text-sm); }
.lac-field input { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); width: 160px; }
.lac-summary { display: flex; gap: var(--space-4); margin-bottom: var(--space-5); flex-wrap: wrap; }
.lac-stat { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius); text-align: center; flex: 1; min-width: 140px; }
.lac-stat-val { font-size: var(--text-xl); font-weight: 700; color: var(--color-primary); }
.lac-stat-lbl { font-size: var(--text-xs); color: var(--color-muted); }
.lac-table { width: 100%; border-collapse: collapse; margin-top: var(--space-4); font-size: var(--text-sm); }
.lac-table th, .lac-table td { padding: var(--space-2); border-bottom: 1px solid var(--color-border); text-align: right; }
.lac-table th:first-child, .lac-table td:first-child { text-align: left; }
.lac-export-row { display: flex; gap: var(--space-2); margin-top: var(--space-4); }
```

**Commit message:** `feat(loan-amortization-calculator): add full amortization schedule with chart and PDF/CSV export`

---

## TOOL 4 — Expense Splitter (Bill Splitting Calculator)

**Tool ID:** `expense-splitter`
**File:** `src/tools/finance/expense-splitter.js`
**Category:** `finance`
**New npm packages:** none

### Data model

```js
// localStorage key: 'exs_v1'
// { people: [{id, name}], expenses: [{id, description, amount, paidBy, splitAmong: [personId,...]}] }
```

### Exact debt-simplification algorithm (minimum transaction settlement)

```js
function calculateBalances(people, expenses) {
  const balances = {};
  people.forEach(p => balances[p.id] = 0);

  for (const exp of expenses) {
    const share = exp.amount / exp.splitAmong.length;
    balances[exp.paidBy] += exp.amount;
    for (const personId of exp.splitAmong) {
      balances[personId] -= share;
    }
  }
  return balances; // positive = owed money, negative = owes money
}

function simplifyDebts(balances) {
  const creditors = [];
  const debtors = [];
  for (const [id, amount] of Object.entries(balances)) {
    if (amount > 0.01) creditors.push({ id, amount });
    else if (amount < -0.01) debtors.push({ id, amount: -amount });
  }
  creditors.sort((a,b) => b.amount - a.amount);
  debtors.sort((a,b) => b.amount - a.amount);

  const transactions = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].amount, debtors[di].amount);
    transactions.push({ from: debtors[di].id, to: creditors[ci].id, amount });
    creditors[ci].amount -= amount;
    debtors[di].amount -= amount;
    if (creditors[ci].amount < 0.01) ci++;
    if (debtors[di].amount < 0.01) di++;
  }
  return transactions;
}
```

### UI logic — write inside `init()`

1. Load state from `localStorage.getItem('exs_v1')`, default `{ people: [], expenses: [] }`.
2. "Add person" input + button → push `{id: crypto.randomUUID(), name}` to `people`.
3. "Add expense" form: description text, amount number, "paid by" select (populated from people), "split among" multi-checkbox (populated from people, all checked by default).
4. On save: push expense object, save to localStorage, re-render balances + settle-up list.
5. Render balances: green if positive (`+ owed $X`), red if negative (`owes $X`).
6. Render settle-up list from `simplifyDebts()`: "Alice pays Bob $42.50".
7. Delete buttons on each person and expense row (deleting a person also removes them from any expense's `splitAmong` and clears `paidBy` if they were the payer — show a confirm dialog).

**Privacy notice** (required at top of tool):
```html
<div class="exs-privacy">🔒 All data is stored only on this device. Nothing is sent anywhere.</div>
```

### CSS

```css
/* ── Expense Splitter ────────────────────────────────────── */
.exs-privacy { background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius); font-size: var(--text-sm); margin-bottom: var(--space-4); }
.exs-people-row { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-4); }
.exs-person-chip { background: var(--color-surface); padding: var(--space-2) var(--space-3); border-radius: 99px; font-size: var(--text-sm); display: flex; align-items: center; gap: var(--space-2); }
.exs-balance-positive { color: #065F46; font-weight: 600; }
.exs-balance-negative { color: #991B1B; font-weight: 600; }
.exs-settle-row { padding: var(--space-3); background: var(--color-surface); border-radius: var(--radius); margin-bottom: var(--space-2); font-size: var(--text-sm); }
```

**Commit message:** `feat(expense-splitter): add group bill-splitting calculator with debt simplification`

---

## TOOL 5 — Mind Map Maker

**Tool ID:** `mind-map-maker`
**File:** `src/tools/productivity/mind-map-maker.js`
**Category:** `productivity`
**New npm packages:** none

### Data model

```js
// localStorage key: 'mmm_v1'
// { nodes: [{id, x, y, text, color, parentId}] }
// parentId === null means it's the root node
```

### Exact SVG rendering pattern

```js
function renderMindMap(svg, nodes) {
  svg.innerHTML = '';
  // Draw connector lines first (so nodes render on top)
  for (const node of nodes) {
    if (node.parentId) {
      const parent = nodes.find(n => n.id === node.parentId);
      if (parent) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', parent.x); line.setAttribute('y1', parent.y);
        line.setAttribute('x2', node.x);   line.setAttribute('y2', node.y);
        line.setAttribute('stroke', '#CBD5E1'); line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
      }
    }
  }
  // Draw nodes
  for (const node of nodes) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-node-id', node.id);
    g.style.cursor = 'grab';

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const textWidth = Math.max(80, node.text.length * 8 + 20);
    rect.setAttribute('x', node.x - textWidth/2); rect.setAttribute('y', node.y - 18);
    rect.setAttribute('width', textWidth); rect.setAttribute('height', 36);
    rect.setAttribute('rx', 8);
    rect.setAttribute('fill', node.color || '#3B82F6');
    g.appendChild(rect);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x); text.setAttribute('y', node.y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white'); text.setAttribute('font-size', '13');
    text.textContent = node.text;
    g.appendChild(text);

    svg.appendChild(g);
  }
}
```

### Drag logic (pointer events on the SVG group)

```js
function attachDragHandlers(svg, nodes, onUpdate) {
  let dragging = null;
  let offsetX = 0, offsetY = 0;

  svg.addEventListener('pointerdown', e => {
    const g = e.target.closest('[data-node-id]');
    if (!g) return;
    dragging = nodes.find(n => n.id === g.getAttribute('data-node-id'));
    const rect = svg.getBoundingClientRect();
    offsetX = e.clientX - rect.left - dragging.x;
    offsetY = e.clientY - rect.top - dragging.y;
  });

  svg.addEventListener('pointermove', e => {
    if (!dragging) return;
    const rect = svg.getBoundingClientRect();
    dragging.x = e.clientX - rect.left - offsetX;
    dragging.y = e.clientY - rect.top - offsetY;
    renderMindMap(svg, nodes);
  });

  window.addEventListener('pointerup', () => {
    if (dragging) onUpdate();
    dragging = null;
  });
}
```

### UI wiring — inside `init()`

1. Load `nodes` from `localStorage.getItem('mmm_v1')`. Default: one root node `{id:'root', x:400, y:300, text:'Central Idea', color:'#1E40AF', parentId:null}`.
2. Toolbar: "Add child node" (adds a new node connected to the currently selected node, offset by +120,+60), "Delete selected", color swatches, "Export PNG", "Export SVG", "Clear all".
3. Click a node to select it (highlight with a stroke outline); double-click to rename via `prompt()`.
4. Save to localStorage on every change (`onUpdate` callback).
5. Export PNG: render the SVG to a canvas via `new Image()` + `canvas.drawImage()`, then `canvas.toBlob()`.
6. Export SVG: serialize the `<svg>` element with `new XMLSerializer().serializeToString(svg)`, wrap in a Blob, download.

**Commit message:** `feat(mind-map-maker): add freeform SVG mind map editor with localStorage persistence`

---

## TOOL 6 — Kanban Board (No Account)

**Tool ID:** `kanban-board`
**File:** `src/tools/productivity/kanban-board.js`
**Category:** `productivity`
**New npm packages:** none

### Data model

```js
// localStorage key: 'kb_v1'
// { columns: [{id, title, cardIds: [id,...]}], cards: {id: {id, text, label}} }
// Default: columns = [{id:'todo', title:'To Do', cardIds:[]}, {id:'doing', title:'In Progress', cardIds:[]}, {id:'done', title:'Done', cardIds:[]}]
```

### Exact HTML5 Drag and Drop wiring

```js
function makeCardDraggable(cardEl, cardId) {
  cardEl.draggable = true;
  cardEl.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
  });
}

function makeColumnDroppable(columnEl, columnId, state, onDrop) {
  columnEl.addEventListener('dragover', e => { e.preventDefault(); columnEl.classList.add('kb-dragover'); });
  columnEl.addEventListener('dragleave', () => columnEl.classList.remove('kb-dragover'));
  columnEl.addEventListener('drop', e => {
    e.preventDefault();
    columnEl.classList.remove('kb-dragover');
    const cardId = e.dataTransfer.getData('text/plain');
    // Remove card from whichever column currently holds it
    for (const col of state.columns) {
      col.cardIds = col.cardIds.filter(id => id !== cardId);
    }
    // Add to target column
    const targetCol = state.columns.find(c => c.id === columnId);
    targetCol.cardIds.push(cardId);
    onDrop();
  });
}
```

### UI wiring — inside `init()`

1. Load state from `localStorage.getItem('kb_v1')`, apply default above if missing.
2. Render each column as a `<div class="kb-column">` with a header (title, editable via click), a card list, and an "+ Add card" input at the bottom.
3. Each card: `<div class="kb-card" draggable="true">` with text and an optional colored label dot. Click to edit text via `prompt()`, small ✕ button to delete.
4. "+ Add column" button at the far right of the board.
5. Save to `localStorage` after every drag, add, edit, or delete operation.
6. "Clear board" button with confirm dialog.

### CSS

```css
/* ── Kanban Board ────────────────────────────────────────── */
.kb-board { display: flex; gap: var(--space-4); overflow-x: auto; padding-bottom: var(--space-4); }
.kb-column { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-3); min-width: 260px; flex-shrink: 0; }
.kb-column.kb-dragover { background: var(--color-primary-light, #EEF2FF); }
.kb-column-title { font-weight: 600; margin-bottom: var(--space-3); font-size: var(--text-sm); }
.kb-card { background: var(--color-background-primary); border-radius: var(--radius); padding: var(--space-3); margin-bottom: var(--space-2); cursor: grab; box-shadow: 0 1px 2px rgba(0,0,0,0.06); font-size: var(--text-sm); }
.kb-card:active { cursor: grabbing; }
.kb-add-card-input { width: 100%; padding: var(--space-2); border: 1px dashed var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-sm); margin-top: var(--space-2); }
```

**Commit message:** `feat(kanban-board): add drag-and-drop no-account kanban board with localStorage`

---

## TOOL 7 — Timesheet & Hours Tracker

**Tool ID:** `timesheet-tracker`
**File:** `src/tools/productivity/timesheet-tracker.js`
**Category:** `productivity`
**New npm packages:** none — jsPDF already installed

### Data model

```js
// localStorage key: 'tst_v1'
// { entries: [{id, project, clockIn: ISOString, clockOut: ISOString|null, notes}] }
```

### Core logic

```js
function startEntry(entries, project, notes) {
  entries.push({ id: crypto.randomUUID(), project, clockIn: new Date().toISOString(), clockOut: null, notes });
}

function stopEntry(entries, id) {
  const entry = entries.find(e => e.id === id);
  if (entry) entry.clockOut = new Date().toISOString();
}

function durationHours(entry) {
  if (!entry.clockOut) return (Date.now() - new Date(entry.clockIn)) / 3600000;
  return (new Date(entry.clockOut) - new Date(entry.clockIn)) / 3600000;
}

function weeklyTotal(entries, weekStartDate) {
  const weekEnd = new Date(weekStartDate); weekEnd.setDate(weekEnd.getDate() + 7);
  return entries
    .filter(e => new Date(e.clockIn) >= weekStartDate && new Date(e.clockIn) < weekEnd)
    .reduce((sum, e) => sum + durationHours(e), 0);
}
```

### UI wiring — inside `init()`

1. Project name input + Notes input + "▶ Clock In" button. When clicked, calls `startEntry`, disables itself, enables "⏹ Clock Out".
2. Live running timer while clocked in: `setInterval(1000)` updating a `HH:MM:SS` display using `durationHours`.
3. "⏹ Clock Out" calls `stopEntry`, re-enables Clock In.
4. Table of all entries: Project, Clock In, Clock Out, Duration, Notes, delete button.
5. Weekly summary card: total hours this week (Monday-start week).
6. Export PDF: use `jsPDF` + `jsPDF-AutoTable` — same import pattern as Tool 3 in this file.
7. Export CSV: same manual CSV-building pattern as Tool 4 in Phase 26 instructions.

**Commit message:** `feat(timesheet-tracker): add clock-in/out hours tracker with PDF/CSV export`

---

## TOOL 8 — Font Pairing Visualizer

**Tool ID:** `font-pairing-visualizer`
**File:** `src/tools/css/font-pairing-visualizer.js`
**Category:** `css`
**New npm packages:** none — loads fonts via a dynamically injected `<link>` tag to Google Fonts (no npm install)

### Exact Google Fonts loading pattern

```js
function loadGoogleFont(fontFamily) {
  const id = 'gf-' + fontFamily.replace(/\s+/g, '-').toLowerCase();
  if (document.getElementById(id)) return; // already loaded
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g,'+')}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}
```

### Curated pairing list (use exactly these — verified real Google Fonts pairs)

```js
const PAIRINGS = [
  { heading: 'Playfair Display', body: 'Source Sans Pro', vibe: 'Editorial / Elegant' },
  { heading: 'Poppins',          body: 'Inter',           vibe: 'Modern / Clean' },
  { heading: 'Merriweather',     body: 'Lato',             vibe: 'Classic / Readable' },
  { heading: 'Montserrat',       body: 'Open Sans',        vibe: 'Corporate / Friendly' },
  { heading: 'Oswald',           body: 'Roboto',           vibe: 'Bold / Technical' },
  { heading: 'Lora',             body: 'Nunito Sans',      vibe: 'Warm / Editorial' },
  { heading: 'Raleway',          body: 'Karla',            vibe: 'Minimal / Airy' },
  { heading: 'Abril Fatface',    body: 'Josefin Sans',     vibe: 'Fashion / Bold' },
];
```

### UI wiring — inside `init()`

1. Render a grid of pairing preview cards, one per entry in `PAIRINGS`.
2. Each card: heading text ("The quick brown fox") in the `heading` font at 28px bold, body paragraph ("Lorem ipsum...") in the `body` font at 15px, and the `vibe` label.
3. On render, call `loadGoogleFont()` for both fonts in every pairing (only 16 unique font families total — acceptable network cost, loaded once and cached by the browser).
4. Custom text input at the top: lets the user type their own heading/body text to preview across all pairings instead of the Lorem ipsum default.
5. "Copy CSS" button per card — copies:
```css
/* Heading */
font-family: 'Playfair Display', serif;
/* Body */
font-family: 'Source Sans Pro', sans-serif;
```
(use `navigator.clipboard.writeText`)

**Commit message:** `feat(font-pairing-visualizer): add curated Google Fonts pairing gallery with live preview`

---

## TOOL 9 — Text-to-Speech Reader (with Word Highlighting)

**Tool ID:** `tts-reader`
**File:** `src/tools/text/tts-reader.js`
**Category:** `text`
**New npm packages:** none — uses the built-in Web Speech API

### Exact Web Speech API usage with word-boundary highlighting

```js
export default function init() {
  const container = document.createElement('div');
  container.className = 'tool-container';

  container.innerHTML = `
    <div class="tool-header">
      <h1>Text-to-Speech Reader</h1>
      <p>Paste text and have it read aloud, with the current word highlighted as it's spoken.</p>
    </div>
    <div class="ttr-controls">
      <select id="ttr-voice" class="ttr-select"></select>
      <label>Speed <input type="range" id="ttr-rate" min="0.5" max="2" step="0.1" value="1"></label>
      <label>Pitch <input type="range" id="ttr-pitch" min="0" max="2" step="0.1" value="1"></label>
    </div>
    <textarea id="ttr-input" class="ttr-textarea" placeholder="Paste text here...">Paste or type any text you'd like read aloud.</textarea>
    <div class="ttr-btn-row">
      <button id="ttr-play" class="btn btn-primary">▶ Play</button>
      <button id="ttr-pause" class="btn btn-secondary" disabled>⏸ Pause</button>
      <button id="ttr-stop" class="btn btn-secondary" disabled>⏹ Stop</button>
    </div>
    <div id="ttr-display" class="ttr-display"></div>
  `;

  let voices = [];
  function populateVoices() {
    voices = speechSynthesis.getVoices();
    const select = container.querySelector('#ttr-voice');
    select.innerHTML = voices.map((v, i) => `<option value="${i}">${v.name} (${v.lang})</option>`).join('');
  }
  populateVoices();
  speechSynthesis.onvoiceschanged = populateVoices; // Chrome loads voices async

  let utterance = null;
  let words = [];

  container.querySelector('#ttr-play').addEventListener('click', () => {
    const text = container.querySelector('#ttr-input').value;
    if (!text.trim()) return;

    speechSynthesis.cancel(); // clear any prior utterance
    words = text.split(/(\s+)/); // keep whitespace tokens for accurate offset math
    renderWords();

    utterance = new SpeechSynthesisUtterance(text);
    const voiceIdx = container.querySelector('#ttr-voice').value;
    if (voices[voiceIdx]) utterance.voice = voices[voiceIdx];
    utterance.rate = parseFloat(container.querySelector('#ttr-rate').value);
    utterance.pitch = parseFloat(container.querySelector('#ttr-pitch').value);

    utterance.onboundary = (event) => {
      if (event.name !== 'word') return;
      highlightAtCharIndex(event.charIndex);
    };
    utterance.onend = () => {
      container.querySelector('#ttr-play').disabled = false;
      container.querySelector('#ttr-pause').disabled = true;
      container.querySelector('#ttr-stop').disabled = true;
    };

    speechSynthesis.speak(utterance);
    container.querySelector('#ttr-play').disabled = true;
    container.querySelector('#ttr-pause').disabled = false;
    container.querySelector('#ttr-stop').disabled = false;
  });

  container.querySelector('#ttr-pause').addEventListener('click', () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      container.querySelector('#ttr-pause').textContent = '▶ Resume';
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume();
      container.querySelector('#ttr-pause').textContent = '⏸ Pause';
    }
  });

  container.querySelector('#ttr-stop').addEventListener('click', () => {
    speechSynthesis.cancel();
    container.querySelector('#ttr-play').disabled = false;
    container.querySelector('#ttr-pause').disabled = true;
    container.querySelector('#ttr-stop').disabled = true;
  });

  function renderWords() {
    const display = container.querySelector('#ttr-display');
    display.innerHTML = words.map((w, i) => `<span data-idx="${i}">${escapeHtml(w)}</span>`).join('');
  }

  function highlightAtCharIndex(charIndex) {
    // Walk cumulative length to find which word token contains charIndex
    let cumulative = 0;
    let targetIdx = 0;
    for (let i = 0; i < words.length; i++) {
      if (charIndex < cumulative + words[i].length) { targetIdx = i; break; }
      cumulative += words[i].length;
    }
    container.querySelectorAll('#ttr-display span').forEach(span => span.classList.remove('ttr-current'));
    const el = container.querySelector(`#ttr-display span[data-idx="${targetIdx}"]`);
    if (el) el.classList.add('ttr-current');
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return container;
}
```

**IMPORTANT NOTE about `onboundary` reliability:** Chrome and Edge fire `word` boundary events reliably. Safari's support is inconsistent — if `onboundary` never fires within 2 seconds of `speak()` starting, the highlighting simply won't appear, but audio playback still works. Do not add a fallback timer-based highlighter — it will desync from actual speech and confuse users. Leave it as a graceful no-op on unsupported browsers.

### CSS

```css
/* ── Text-to-Speech Reader ──────────────────────────────── */
.ttr-controls { display: flex; gap: var(--space-4); align-items: center; flex-wrap: wrap; margin-bottom: var(--space-4); font-size: var(--text-sm); }
.ttr-select { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.ttr-textarea { width: 100%; height: 140px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius); font-size: var(--text-base); margin-bottom: var(--space-3); }
.ttr-btn-row { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
.ttr-display { line-height: 2; font-size: var(--text-lg); padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius); min-height: 60px; }
.ttr-current { background: #FEF3C7; border-radius: 3px; padding: 2px 0; }
```

**Commit message:** `feat(tts-reader): add text-to-speech reader with live word highlighting via Web Speech API`

---

## TOOL 10 — Voice Pitch Changer / Formant Shifter

**Tool ID:** `voice-pitch-changer`
**File:** `src/tools/audio/voice-pitch-changer.js`
**Category:** `audio`
**New npm packages:** none

### Exact approach — use a granular pitch-shift technique (NOT simple playbackRate)

`AudioBufferSourceNode.playbackRate` changes both pitch AND speed together — do not use it alone for this tool. Instead, implement a simple overlap-add (OLA) granular pitch shifter that resamples grains independently of playback speed.

```js
// Simplified granular pitch shifter — operates on an already-decoded AudioBuffer
function pitchShiftBuffer(audioBuffer, semitones, audioCtx) {
  const pitchRatio = Math.pow(2, semitones / 12);
  const grainSize = 2048;   // samples per grain
  const hopSize = Math.floor(grainSize / 4); // 75% overlap

  const inputData = audioBuffer.getChannelData(0);
  const outputLength = inputData.length;
  const output = new Float32Array(outputLength);
  const window = hannWindow(grainSize);

  let inputPos = 0;
  let outputPos = 0;

  while (inputPos + grainSize < inputData.length && outputPos + grainSize < outputLength) {
    // Extract grain, resample it by pitchRatio (changes pitch, not duration when placed at fixed hop)
    for (let i = 0; i < grainSize; i++) {
      const srcIndex = inputPos + i * pitchRatio;
      const srcIndexFloor = Math.floor(srcIndex);
      const frac = srcIndex - srcIndexFloor;
      const s0 = inputData[srcIndexFloor] || 0;
      const s1 = inputData[srcIndexFloor + 1] || 0;
      const sample = s0 + (s1 - s0) * frac; // linear interpolation
      if (outputPos + i < outputLength) {
        output[outputPos + i] += sample * window[i];
      }
    }
    inputPos += hopSize;
    outputPos += hopSize;
  }

  const outBuffer = audioCtx.createBuffer(1, outputLength, audioBuffer.sampleRate);
  outBuffer.copyToChannel(output, 0);
  return outBuffer;
}

function hannWindow(size) {
  const win = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    win[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
  }
  return win;
}
```

### UI wiring — inside `init()`

1. File drop zone for audio upload.
2. Slider: "Pitch shift (semitones)" range `-12` to `+12`, step `1`, default `0`.
3. Preset buttons: "Chipmunk (+7)", "Deep voice (-5)", "Normal (0)".
4. "Preview" button: decode audio → `pitchShiftBuffer()` → play via `AudioBufferSourceNode`.
5. "Download" button: encode the shifted buffer to WAV using the shared `src/utils/audio-encode.js` helper created in Phase 26 Tool 20 (`encodeWAV`). If that file does not exist yet in this build order, create it now with the same function body from Phase 26 instructions Tool 20.

**Warning about processing time:** For long audio files (>2 minutes), this pure-JS grain processing loop can take several seconds. Show a progress indicator and run it inside a `Worker` if the file is longer than 60 seconds, using `postMessage` to send the raw `Float32Array` and receive the processed result back.

**Commit message:** `feat(voice-pitch-changer): add granular pitch shifter for voice recordings`

---

## TOOL 11 — Currency Converter (Offline-Cached Rates)

**Tool ID:** `currency-converter`
**File:** `src/tools/finance/currency-converter.js`
**Category:** `finance`
**New npm packages:** none
**Network call:** `fetch('https://api.exchangerate-api.com/v4/latest/USD')` — free, no API key required

### Exact caching logic

```js
const CACHE_KEY = 'ccv_rates_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getRates() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
      return { rates: parsed.rates, fromCache: true, fetchedAt: parsed.fetchedAt };
    }
  }

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!res.ok) throw new Error('Rate fetch failed');
    const data = await res.json();
    const payload = { rates: data.rates, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    return { rates: data.rates, fromCache: false, fetchedAt: payload.fetchedAt };
  } catch (err) {
    // Network failed — fall back to stale cache if any exists, even if expired
    if (cached) {
      const parsed = JSON.parse(cached);
      return { rates: parsed.rates, fromCache: true, stale: true, fetchedAt: parsed.fetchedAt };
    }
    throw err;
  }
}
```

**IMPORTANT:** If `api.exchangerate-api.com` is unreachable at build time or rate-limits this project's traffic, use the alternative free endpoint `https://open.er-api.com/v6/latest/USD` instead — same response shape (`{ rates: {...} }`). Test both before shipping and use whichever responds successfully.

### UI wiring — inside `init()`

1. On load, call `getRates()`, show a loading spinner.
2. Two dropdowns (from-currency, to-currency) populated from `Object.keys(rates)`, defaulting to USD → EUR.
3. Amount input. On any change (amount, from, to), recompute: `result = amount * (rates[to] / rates[from])`.
4. Show "Rates last updated: [timestamp]" and, if `fromCache` is true, a small "📦 cached" badge; if `stale` is true, a "⚠ offline — showing last known rates" warning.
5. Swap button (⇄) to flip from/to currencies.

### CSS

```css
/* ── Currency Converter ─────────────────────────────────── */
.ccv-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); flex-wrap: wrap; }
.ccv-select, .ccv-amount { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-base); }
.ccv-result { font-size: var(--text-2xl); font-weight: 700; color: var(--color-primary); margin: var(--space-4) 0; }
.ccv-meta { font-size: var(--text-xs); color: var(--color-muted); }
.ccv-badge-cached { background: #F3F4F6; color: #374151; padding: 2px 8px; border-radius: 99px; font-size: var(--text-xs); }
.ccv-badge-stale { background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 99px; font-size: var(--text-xs); }
```

**Commit message:** `feat(currency-converter): add currency converter with 24h localStorage-cached exchange rates`

---

## TOOL 12 — Password Breach Checker (k-Anonymity)

**Tool ID:** `password-breach-checker`
**File:** `src/tools/privacy/password-breach-checker.js`
**Category:** `privacy`
**New npm packages:** none
**Network call:** `fetch('https://api.pwnedpasswords.com/range/{first5hexchars}')` — free, no API key required, k-anonymity model

### Exact k-anonymity implementation — this MUST be implemented precisely for user safety

```js
async function checkPasswordBreach(password) {
  // Step 1: SHA-1 hash the password entirely client-side
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fullHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

  // Step 2: split into prefix (first 5 chars) and suffix (remaining 35 chars)
  const prefix = fullHash.slice(0, 5);
  const suffix = fullHash.slice(5);

  // Step 3: send ONLY the 5-character prefix to the API — the real password
  // and its full hash NEVER leave the browser
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!res.ok) throw new Error('Breach check request failed');
  const text = await res.text();

  // Step 4: the API returns all suffixes that share this prefix, plus a count each
  // Format per line: "SUFFIX:COUNT"
  const lines = text.split('\n');
  for (const line of lines) {
    const [lineSuffix, countStr] = line.trim().split(':');
    if (lineSuffix === suffix) {
      return { breached: true, count: parseInt(countStr, 10) };
    }
  }
  return { breached: false, count: 0 };
}
```

### UI wiring — inside `init()`

```js
export default function init() {
  const container = document.createElement('div');
  container.className = 'tool-container';

  container.innerHTML = `
    <div class="tool-header">
      <h1>Password Breach Checker</h1>
      <p>Check if a password has appeared in a known data breach. Your real password never leaves this browser tab.</p>
    </div>
    <div class="pbc-privacy-notice">
      🔒 Uses k-anonymity: only the first 5 characters of your password's SHA-1 hash are ever sent over the network.
      Your actual password is hashed locally and never transmitted.
    </div>
    <div class="pbc-input-row">
      <input type="password" id="pbc-password" class="pbc-input" placeholder="Enter a password to check">
      <button id="pbc-toggle" class="btn-icon" title="Show/hide">👁</button>
      <button id="pbc-check" class="btn btn-primary">Check</button>
    </div>
    <div id="pbc-result" style="display:none"></div>
  `;

  const input = container.querySelector('#pbc-password');
  container.querySelector('#pbc-toggle').addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  container.querySelector('#pbc-check').addEventListener('click', async () => {
    const password = input.value;
    if (!password) return;

    const resultEl = container.querySelector('#pbc-result');
    resultEl.style.display = '';
    resultEl.innerHTML = '<p>Checking…</p>';

    try {
      const { breached, count } = await checkPasswordBreach(password);
      if (breached) {
        resultEl.innerHTML = `
          <div class="pbc-result-bad">
            ⚠ This password has appeared in <strong>${count.toLocaleString()}</strong> known data breaches.
            You should not use it anywhere. Choose a unique, strong password instead.
          </div>`;
      } else {
        resultEl.innerHTML = `
          <div class="pbc-result-good">
            ✅ Good news — this password was not found in any known breach database.
          </div>`;
      }
    } catch (err) {
      resultEl.innerHTML = `<div class="pbc-result-bad">⚠ Could not reach the breach-check service. Please try again later.</div>`;
    }
  });

  return container;
}
```

### CSS

```css
/* ── Password Breach Checker ─────────────────────────────── */
.pbc-privacy-notice { background: var(--color-surface); padding: var(--space-3) var(--space-4); border-radius: var(--radius); font-size: var(--text-sm); margin-bottom: var(--space-4); line-height: 1.6; }
.pbc-input-row { display: flex; gap: var(--space-2); align-items: center; }
.pbc-input { flex: 1; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-base); }
.pbc-result-bad  { background: #FEE2E2; color: #991B1B; padding: var(--space-4); border-radius: var(--radius); margin-top: var(--space-4); }
.pbc-result-good { background: #D1FAE5; color: #065F46; padding: var(--space-4); border-radius: var(--radius); margin-top: var(--space-4); }
```

**CRITICAL SAFETY CHECK before committing:** Search the file for any line that sends `password` or `fullHash` (not `prefix`) to `fetch()`. If found, this is a serious security bug — the full password hash must never be transmitted, only the 5-character prefix.

**Commit message:** `feat(password-breach-checker): add k-anonymity password breach checker using HIBP Range API`

---

## TOOL 13 — Chroma Key / Green Screen Composer

**Tool ID:** `chroma-key-composer`
**File:** `src/tools/video/chroma-key-composer.js`
**Category:** `video`
**New npm packages:** none

### Exact color-distance thresholding algorithm

```js
function applyChromaKey(imageData, keyColor, threshold, edgeSoftness) {
  const { data } = imageData;
  const [kr, kg, kb] = keyColor; // e.g. [0, 255, 0] for green

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const distance = Math.sqrt((r-kr)**2 + (g-kg)**2 + (b-kb)**2);
    const maxDistance = 441.7; // sqrt(255^2 * 3), theoretical max distance

    if (distance < threshold) {
      data[i+3] = 0; // fully transparent
    } else if (distance < threshold + edgeSoftness) {
      // soft edge feathering
      const alpha = (distance - threshold) / edgeSoftness;
      data[i+3] = Math.round(alpha * 255);
    }
    // else: leave fully opaque
  }
  return imageData;
}
```

### Processing pipeline — frame by frame using two `<video>` elements

```
1. Load foreground video (with green/blue screen) into hidden <video id="fg">
2. Load background: either a static image OR a second video into <video id="bg">
3. Create output canvas, size = foreground video dimensions
4. On each requestAnimationFrame (while playing):
   a. Draw background frame to canvas first (drawImage bg, 0, 0)
   b. Draw foreground frame to an offscreen canvas
   c. Get its ImageData, apply applyChromaKey()
   d. putImageData the keyed foreground onto a THIRD scratch canvas
   e. drawImage that scratch canvas onto the main output canvas (this composites transparency correctly)
5. Use MediaRecorder on the output canvas's captureStream() to record the composited result
6. Stop recording when foreground video ends; download the resulting WebM/MP4 blob
```

```js
async function recordComposite(fgVideo, bgSource, keyColor, threshold, edgeSoftness) {
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = fgVideo.videoWidth;
  outputCanvas.height = fgVideo.videoHeight;
  const outCtx = outputCanvas.getContext('2d');

  const scratchCanvas = document.createElement('canvas');
  scratchCanvas.width = fgVideo.videoWidth;
  scratchCanvas.height = fgVideo.videoHeight;
  const scratchCtx = scratchCanvas.getContext('2d');

  const stream = outputCanvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);

  const isVideo = bgSource instanceof HTMLVideoElement;

  return new Promise((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    recorder.start();
    fgVideo.play();
    if (isVideo) bgSource.play();

    function drawFrame() {
      if (fgVideo.ended || fgVideo.paused) { recorder.stop(); return; }

      // 1. background
      if (isVideo) outCtx.drawImage(bgSource, 0, 0, outputCanvas.width, outputCanvas.height);
      else outCtx.drawImage(bgSource, 0, 0, outputCanvas.width, outputCanvas.height); // works for <img> too

      // 2. foreground with chroma key applied
      scratchCtx.drawImage(fgVideo, 0, 0, scratchCanvas.width, scratchCanvas.height);
      const frame = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
      applyChromaKey(frame, keyColor, threshold, edgeSoftness);
      scratchCtx.putImageData(frame, 0, 0);
      outCtx.drawImage(scratchCanvas, 0, 0);

      requestAnimationFrame(drawFrame);
    }
    drawFrame();
  });
}
```

### UI wiring

1. Two drop zones: "Foreground video (green/blue screen)" and "Background image or video".
2. Color picker for the key color, defaulting to `#00FF00` (green).
3. Sliders: "Threshold" (0–200, default 80), "Edge softness" (0–100, default 30).
4. Live preview canvas showing the composited result at reduced resolution while adjusting sliders (single-frame preview, not full playback, to keep it responsive).
5. "Render Full Video" button → runs `recordComposite()`, shows a progress spinner ("Recording composite... this plays in real time"), then offers the resulting WebM for download.

**Important:** MediaRecorder-based compositing runs in real time (it must literally play through the video once). Warn the user: "Rendering takes as long as the video's actual duration."

**Commit message:** `feat(chroma-key-composer): add green/blue screen background compositing via Canvas and MediaRecorder`

---

## TOOL 14 — Video Scene-Cut Detector / Chapter Marker

**Tool ID:** `video-scene-cut-detector`
**File:** `src/tools/video/video-scene-cut-detector.js`
**Category:** `video`
**New npm packages:** none — ffmpeg.wasm already installed

### Exact ffmpeg scene-detection usage

```js
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

async function detectScenes(file, sensitivity = 0.4) {
  if (!ffmpeg.loaded) await ffmpeg.load();
  const inputName = 'input' + file.name.slice(file.name.lastIndexOf('.'));
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const timestamps = [];
  ffmpeg.on('log', ({ message }) => {
    // ffmpeg showinfo filter prints lines like: "pts_time:12.345"
    const match = message.match(/pts_time:([\d.]+)/);
    if (match) timestamps.push(parseFloat(match[1]));
  });

  await ffmpeg.exec([
    '-i', inputName,
    '-vf', `select='gt(scene,${sensitivity})',showinfo`,
    '-f', 'null', '-'
  ]);

  return timestamps; // array of second-offsets where scene changes were detected
}

function formatChapterList(timestamps) {
  // YouTube chapter format requires the FIRST entry to be 00:00
  const chapters = [{ time: 0, label: 'Chapter 1' }];
  timestamps.forEach((t, i) => {
    chapters.push({ time: t, label: `Chapter ${i + 2}` });
  });
  return chapters;
}

function toYouTubeChapterFormat(chapters) {
  return chapters.map(c => `${formatTimestamp(c.time)} ${c.label}`).join('\n');
}

function formatTimestamp(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${m}:${String(s).padStart(2,'0')}`;
}
```

### UI wiring — inside `init()`

1. Video drop zone.
2. Sensitivity slider (0.1–0.9, default 0.4) — lower = more scenes detected, higher = only hard cuts.
3. "Detect Scenes" button → runs `detectScenes()`, shows a progress spinner (ffmpeg logs can be used to estimate progress via `-progress` output, but a simple indeterminate spinner is acceptable here).
4. Render a results list: each detected scene change with its timestamp, and a thumbnail preview (seek the video element to that timestamp and capture a frame via Canvas, same pattern as Phase 26 Tool 6).
5. Editable chapter labels (user can rename "Chapter 2" to something meaningful).
6. Export buttons: "Copy YouTube chapters" (clipboard), "Download as .txt".

**Commit message:** `feat(video-scene-cut-detector): add automatic scene detection and chapter marker export`

---

## TOOL 15 — Video Stabilizer

**Tool ID:** `video-stabilizer`
**File:** `src/tools/video/video-stabilizer.js`
**Category:** `video`
**New npm packages:** none — ffmpeg.wasm already installed

### Exact two-pass vidstab usage

```js
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

async function stabilizeVideo(file, shakiness = 5, smoothing = 10, onProgress) {
  if (!ffmpeg.loaded) await ffmpeg.load();
  const inputName = 'input' + file.name.slice(file.name.lastIndexOf('.'));
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  ffmpeg.on('progress', ({ progress }) => onProgress(progress));

  // PASS 1: analyze motion, write transform data to a side file
  await ffmpeg.exec([
    '-i', inputName,
    '-vf', `vidstabdetect=shakiness=${shakiness}:accuracy=15:result=transforms.trf`,
    '-f', 'null', '-'
  ]);

  // PASS 2: apply the stabilization transform using the data from pass 1
  await ffmpeg.exec([
    '-i', inputName,
    '-vf', `vidstabtransform=input=transforms.trf:zoom=0:smoothing=${smoothing},unsharp=5:5:0.8:3:3:0.4`,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    'stabilized.mp4'
  ]);

  return ffmpeg.readFile('stabilized.mp4');
}
```

**IMPORTANT:** ffmpeg.wasm's default build does NOT include the `vid.stab` library by default — verify the ffmpeg.wasm core build used in this project (check `@ffmpeg/core` version in `package.json`) includes `libvidstab`. If the `vidstabdetect` filter throws "Unrecognized option" or "No such filter", the ffmpeg.wasm core must be swapped for a build compiled with `--enable-libvidstab`. Check `https://github.com/ffmpegwasm/ffmpeg.wasm` releases for a core build that lists `vidstab` in its enabled filters before proceeding. If no such build is available, document this limitation clearly to the user and defer the tool.

### UI wiring — inside `init()`

1. Video drop zone.
2. Sliders: "Shakiness" (1–10, default 5 — how shaky the input is), "Smoothing" (1–30, default 10 — how many frames to average).
3. "Stabilize" button → runs both passes sequentially, showing "Pass 1 of 2: Analyzing motion..." then "Pass 2 of 2: Applying stabilization...".
4. Before/after video player toggle so the user can compare.
5. Download button for the final MP4.

**Commit message:** `feat(video-stabilizer): add two-pass video stabilization using ffmpeg vidstab filters`

---

## TOOL 16 — Podcast Loudness Normalizer

**Tool ID:** `podcast-loudness-normalizer`
**File:** `src/tools/audio/podcast-loudness-normalizer.js`
**Category:** `audio`
**New npm packages:** none — ffmpeg.wasm already installed

### Exact two-pass EBU R128 loudnorm usage

```js
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

const PRESETS = {
  podcast:  { i: -16, tp: -1.5, lra: 11 }, // Apple Podcasts / Spotify podcast standard
  streaming:{ i: -14, tp: -1.0, lra: 11 }, // Spotify/YouTube music standard
  broadcast:{ i: -23, tp: -2.0, lra: 7  }, // EBU R128 broadcast standard
};

async function normalizeLoudness(file, preset = 'podcast', onProgress) {
  if (!ffmpeg.loaded) await ffmpeg.load();
  const { i, tp, lra } = PRESETS[preset];
  const inputName = 'input' + file.name.slice(file.name.lastIndexOf('.'));
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // PASS 1: measurement only — capture the JSON stats block from stderr log
  let measuredStats = null;
  const logHandler = ({ message }) => {
    // ffmpeg prints a JSON block after "Parsed_loudnorm" — accumulate lines between { and }
    if (message.includes('"input_i"')) {
      try { measuredStats = JSON.parse(extractJsonBlock(message)); } catch(_) {}
    }
  };
  ffmpeg.on('log', logHandler);

  await ffmpeg.exec([
    '-i', inputName,
    '-af', `loudnorm=I=${i}:TP=${tp}:LRA=${lra}:print_format=json`,
    '-f', 'null', '-'
  ]);

  // PASS 2: apply normalization using measured values for higher accuracy
  const measuredArgs = measuredStats
    ? `:measured_I=${measuredStats.input_i}:measured_TP=${measuredStats.input_tp}:measured_LRA=${measuredStats.input_lra}:measured_thresh=${measuredStats.input_thresh}:offset=${measuredStats.target_offset}`
    : '';

  await ffmpeg.exec([
    '-i', inputName,
    '-af', `loudnorm=I=${i}:TP=${tp}:LRA=${lra}${measuredArgs}:print_format=summary`,
    '-ar', '44100',
    'output.wav'
  ]);

  return { output: await ffmpeg.readFile('output.wav'), measuredStats };
}

function extractJsonBlock(message) {
  // The loudnorm JSON output may span multiple ffmpeg log lines; if a single
  // log callback doesn't capture the whole block, accumulate across calls
  // using a module-level buffer instead of assuming one line = one JSON object.
  const start = message.indexOf('{');
  const end = message.lastIndexOf('}');
  return message.slice(start, end + 1);
}
```

**IMPORTANT parsing note:** ffmpeg's `loudnorm` JSON output is frequently split across multiple `log` event calls (one per printed line). Do not assume a single `message` string contains the full `{...}` block. Instead, accumulate all log lines into a buffer string during pass 1, and run the JSON extraction/parse only after `ffmpeg.exec()` for pass 1 resolves:

```js
let logBuffer = '';
ffmpeg.on('log', ({ message }) => { logBuffer += message + '\n'; });
await ffmpeg.exec([...]); // pass 1
const jsonMatch = logBuffer.match(/\{[\s\S]*?"target_offset"[\s\S]*?\}/);
const measuredStats = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
```

### UI wiring — inside `init()`

1. Audio drop zone.
2. Preset selector: "Podcast (-16 LUFS)", "Streaming (-14 LUFS)", "Broadcast (-23 LUFS)".
3. "Normalize" button → runs both passes, shows "Pass 1: Measuring loudness..." then "Pass 2: Applying normalization...".
4. Results display: measured input loudness vs. target loudness, before/after comparison numbers.
5. Download button for the normalized WAV.

**Commit message:** `feat(podcast-loudness-normalizer): add two-pass EBU R128 loudness normalizer using ffmpeg loudnorm`

---

## TOOL 17 — Panorama Image Stitcher

**Tool ID:** `panorama-stitcher`
**File:** `src/tools/image/panorama-stitcher.js`
**Category:** `image`
**New npm packages:** `opencv.js` — load via CDN script tag (OpenCV.js is not commonly npm-installed; it is a large WASM+JS bundle typically loaded as a script)

### Exact OpenCV.js loading pattern

```js
function loadOpenCV() {
  return new Promise((resolve, reject) => {
    if (window.cv && window.cv.Mat) { resolve(window.cv); return; }
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.9.0/opencv.js';
    script.onload = () => {
      // opencv.js calls cv.onRuntimeInitialized when WASM is ready
      window.cv['onRuntimeInitialized'] = () => resolve(window.cv);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

**IMPORTANT:** `docs.opencv.org` may not always be reachable or may serve a different version than pinned. If this exact URL fails at build/test time, search for "opencv.js CDN" and use the current official OpenCV.js release URL, but always pin an explicit version number in the URL path (do not use an unversioned "latest" URL, since the API surface can change between versions).

### Exact stitching call using OpenCV.js's built-in Stitcher class

```js
async function stitchImages(imageBitmaps) {
  const cv = await loadOpenCV();

  const matVector = new cv.MatVector();
  for (const bitmap of imageBitmaps) {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0);
    const mat = cv.imread(canvas);
    matVector.push_back(mat);
  }

  const stitcher = new cv.Stitcher();
  const pano = new cv.Mat();
  const status = stitcher.stitch(matVector, pano);

  if (status !== cv.Stitcher_OK) {
    matVector.delete(); pano.delete(); stitcher.delete();
    throw new Error(`Stitching failed (status code ${status}). Try photos with more overlap (30-50%) and consistent exposure.`);
  }

  const outCanvas = document.createElement('canvas');
  cv.imshow(outCanvas, pano);

  matVector.delete(); pano.delete(); stitcher.delete();
  return outCanvas;
}
```

**Memory management warning:** OpenCV.js `Mat` objects are NOT garbage-collected by the JS engine — they live in WASM heap memory. Every `cv.Mat`, `cv.MatVector`, and `cv.Stitcher` instance created MUST have `.delete()` called explicitly, including in error paths (as shown above with `try/finally` semantics). Failing to do this will leak memory and eventually crash the tab on repeated use.

### UI wiring — inside `init()`

1. Multi-file drop zone (accept 2–10 images).
2. Thumbnail preview strip showing all uploaded photos in order, with drag-to-reorder (reuse the HTML5 Drag and Drop pattern from Tool 6 in this file).
3. "Stitch Panorama" button → shows "Loading OpenCV.js (first use only, ~10MB)..." then "Stitching..." progress states.
4. Result: full panorama image displayed with a download button.
5. Clear error message if stitching fails (common causes: insufficient overlap, too few matching features) — the message from the caught error above should be shown directly to the user.

### CSS

```css
/* ── Panorama Stitcher ───────────────────────────────────── */
.pst-thumb-strip { display: flex; gap: var(--space-2); overflow-x: auto; margin: var(--space-4) 0; }
.pst-thumb { width: 100px; height: 75px; object-fit: cover; border-radius: var(--radius-sm); cursor: grab; border: 2px solid transparent; }
.pst-thumb.dragging { opacity: 0.5; }
.pst-result-canvas { max-width: 100%; border-radius: var(--radius); margin-top: var(--space-4); }
```

**Commit message:** `feat(panorama-stitcher): add multi-photo panorama stitching using OpenCV.js`

---

## TOOL 18 — Text Similarity / Paraphrase Checker

**Tool ID:** `text-similarity-checker`
**File:** `src/tools/text/text-similarity-checker.js`
**Category:** `text`
**New npm packages:** none — `@xenova/transformers` already installed

### Exact embedding + cosine similarity implementation

```js
import { pipeline } from '@xenova/transformers';

let embedder = null;
async function getEmbedder(onProgress) {
  if (!embedder) {
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      { progress_callback: onProgress }
    );
  }
  return embedder;
}

async function getEmbedding(text) {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data); // 384-dimensional vector
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
  return dot; // already normalized vectors, so dot product = cosine similarity
}
```

### Sentence-level comparison

```js
function splitSentences(text) {
  return text.replace(/([.!?])\s+/g, '$1\n').split('\n').map(s => s.trim()).filter(s => s.length > 3);
}

async function compareTexts(textA, textB, onProgress) {
  const sentencesA = splitSentences(textA);
  const sentencesB = splitSentences(textB);

  const embeddingsA = [];
  const embeddingsB = [];
  const total = sentencesA.length + sentencesB.length;
  let done = 0;

  for (const s of sentencesA) { embeddingsA.push(await getEmbedding(s)); done++; onProgress(done, total); }
  for (const s of sentencesB) { embeddingsB.push(await getEmbedding(s)); done++; onProgress(done, total); }

  // For each sentence in A, find its best match in B
  const matches = sentencesA.map((sentA, i) => {
    let bestScore = -1, bestIdx = -1;
    embeddingsB.forEach((embB, j) => {
      const score = cosineSimilarity(embeddingsA[i], embB);
      if (score > bestScore) { bestScore = score; bestIdx = j; }
    });
    return { sentenceA: sentA, sentenceB: sentencesB[bestIdx], score: bestScore };
  });

  const overallEmbA = await getEmbedding(textA);
  const overallEmbB = await getEmbedding(textB);
  const overallScore = cosineSimilarity(overallEmbA, overallEmbB);

  return { matches, overallScore };
}
```

### UI wiring — inside `init()`

1. Two textareas side by side ("Text A", "Text B").
2. "Compare" button → runs `compareTexts()` with a progress bar.
3. Overall similarity score shown as a large percentage with a colour scale (red <40%, amber 40–70%, green >70%).
4. Per-sentence match table: Sentence A | Best match in B | Similarity %.
5. Highlight rows with similarity > 85% as "⚠ possible close paraphrase".

**Disclaimer to include:**
```html
<div class="tsc-disclaimer">
  ℹ This tool measures semantic similarity, not plagiarism in a legal sense. High similarity may indicate paraphrasing, quotation, or coincidental overlap — use judgment.
</div>
```

**Commit message:** `feat(text-similarity-checker): add local semantic similarity checker using all-MiniLM-L6-v2 embeddings`

---

## TOOL 19 — Resume ↔ Job Description Matcher

**Tool ID:** `resume-job-matcher`
**File:** `src/tools/business/resume-job-matcher.js`
**Category:** `business`
**New npm packages:** none — `@xenova/transformers` already installed (reuse the same model loaded in Tool 18 if both are open in the same session; otherwise load independently)

### Exact matching logic — combine embedding similarity with keyword overlap

```js
import { pipeline } from '@xenova/transformers';

let embedder = null;
async function getEmbedder(onProgress) {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { progress_callback: onProgress });
  }
  return embedder;
}

async function getEmbedding(text) {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

// Simple keyword extraction: lowercase, strip punctuation, remove common stopwords,
// keep words 3+ chars, count frequency
const STOPWORDS = new Set(['the','and','for','are','but','not','you','your','with','this','that','from','have','will','can','our','their','was','were','has','had']);

function extractKeywords(text) {
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOPWORDS.has(w));
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return freq;
}

function findMissingKeywords(resumeText, jobText, topN = 15) {
  const jobKeywords = extractKeywords(jobText);
  const resumeKeywords = extractKeywords(resumeText);

  const missing = Object.entries(jobKeywords)
    .filter(([word]) => !resumeKeywords[word])
    .sort((a, b) => b[1] - a[1]) // most frequent in job posting first
    .slice(0, topN)
    .map(([word]) => word);

  return missing;
}

async function matchResumeToJob(resumeText, jobText, onProgress) {
  onProgress('embedding');
  const resumeEmb = await getEmbedding(resumeText);
  const jobEmb = await getEmbedding(jobText);
  const semanticScore = cosineSimilarity(resumeEmb, jobEmb);

  onProgress('keywords');
  const missingKeywords = findMissingKeywords(resumeText, jobText);

  // Combined score: weight semantic similarity heavily, keyword coverage as a secondary signal
  const jobKeywordCount = Object.keys(extractKeywords(jobText)).length;
  const keywordCoverage = jobKeywordCount > 0 ? 1 - (missingKeywords.length / Math.min(jobKeywordCount, 15)) : 1;
  const combinedScore = semanticScore * 0.7 + keywordCoverage * 0.3;

  return { semanticScore, keywordCoverage, combinedScore, missingKeywords };
}
```

### UI wiring — inside `init()`

1. Two textareas: "Paste your resume text" and "Paste the job description".
2. "Analyze Match" button → runs `matchResumeToJob()` with a progress label ("Loading model…" → "Computing semantic match…" → "Scanning keywords…").
3. Big score display: `combinedScore` as a percentage with color coding (red <50%, amber 50–75%, green >75%).
4. "Missing keywords" list — chips showing each keyword the job posting emphasizes that the resume doesn't mention, e.g. `kubernetes`, `graphql`, `stakeholder`.
5. Disclaimer:
```html
<div class="rjm-disclaimer">
  ℹ This is a heuristic guide, not a guarantee of ATS outcomes. Real ATS systems vary — use this as a starting point to tailor your resume, not a final verdict.
</div>
```

**Commit message:** `feat(resume-job-matcher): add resume-to-job-description semantic and keyword matcher`

---

## TOOL 20 — Audio-to-MIDI Converter

**Tool ID:** `audio-to-midi-converter`
**File:** `src/tools/audio/audio-to-midi-converter.js`
**Category:** `audio`
**New npm packages:** none — onnxruntime-web already installed
**New model file:** Basic Pitch ONNX (~2 MB — smallest model in the whole project)

### Step 0 — Obtain the model file

Basic Pitch's official ONNX export is part of the `basic-pitch` PyPI/npm package assets. Before writing tool code:

```bash
# Option A: extract from the npm sibling package (if it bundles a browser-ready ONNX file)
npm view @spotify/basic-pitch versions
npm pack @spotify/basic-pitch
# inspect the extracted tarball for a .onnx file and copy it to public/models/basic-pitch.onnx

# Option B: convert from the Python package's TensorFlow SavedModel using tf2onnx
pip install basic-pitch tf2onnx --break-system-packages
python -c "
from basic_pitch import ICASSP_2022_MODEL_PATH
print(ICASSP_2022_MODEL_PATH)
"
# then run tf2onnx.convert on the printed SavedModel path, output to public/models/basic-pitch.onnx
```

**If neither option succeeds in this environment, do not fabricate a model file.** Document the blocker clearly to the user and pause this tool — do not guess at tensor shapes or invent placeholder inference logic. This is the one tool in Phase 27 most likely to require a manual model-preparation step outside the AI agent's own capability; flag it rather than hallucinating a working pipeline.

### Once the model file exists at `public/models/basic-pitch.onnx`, inspect it first

```js
import * as ort from 'onnxruntime-web';

async function inspectModel() {
  const session = await ort.InferenceSession.create('/models/basic-pitch.onnx');
  console.log('Input names:', session.inputNames);
  console.log('Output names:', session.outputNames);
}
```

Basic Pitch's expected input is a Constant-Q Transform (CQT) representation of the audio, NOT raw waveform samples directly — this is more complex than typical single-tensor ONNX models. The published model's actual preprocessing pipeline (harmonic stacking + CQT) is non-trivial to reimplement from scratch. Two implementation paths exist:

**Path A (safer, recommended):** Use the official `@spotify/basic-pitch` npm package if it exists and exposes a browser-compatible JS API that wraps both preprocessing and inference:

```bash
npm view @spotify/basic-pitch
```

If it exists and works in a Vite/browser context, import and use its public API directly rather than reimplementing CQT preprocessing by hand:

```js
import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly } from '@spotify/basic-pitch';

async function transcribeAudio(audioBuffer, onProgress) {
  const basicPitch = new BasicPitch('/models/basic-pitch.onnx'); // or the package's expected model URL
  const frames = [];
  const onsets = [];
  const contours = [];

  await basicPitch.evaluateModel(
    audioBuffer,
    (f, o, c) => { frames.push(...f); onsets.push(...o); contours.push(...c); },
    (percent) => onProgress(percent)
  );

  const notes = noteFramesToTime(
    addPitchBendsToNoteEvents(
      contours,
      outputToNotesPoly(frames, onsets, 0.25, 0.25, 5)
    )
  );

  return notes; // array of { startTimeSeconds, durationSeconds, pitchMidi, amplitude, pitchBends }
}
```

**Path B (only if the npm package is unavailable):** Defer this tool to a future sprint rather than reimplementing Basic Pitch's CQT + harmonic-stacking preprocessing from scratch — that reimplementation is genuinely complex (spectral transforms, multi-band harmonic analysis) and a wrong implementation would silently produce garbage MIDI output, which is worse than not shipping the tool. Flag this clearly to the user if Path A is not viable in the build environment.

### MIDI file writer — build this regardless of which path above is used

```js
function notesToMIDI(notes, ticksPerBeat = 480, bpm = 120) {
  // Minimal single-track Type 0 MIDI file writer — no external MIDI library needed
  const events = [];
  const secondsPerTick = (60 / bpm) / ticksPerBeat;

  for (const note of notes) {
    const startTick = Math.round(note.startTimeSeconds / secondsPerTick);
    const endTick = Math.round((note.startTimeSeconds + note.durationSeconds) / secondsPerTick);
    events.push({ tick: startTick, type: 'noteOn',  pitch: note.pitchMidi, velocity: Math.round(note.amplitude * 127) });
    events.push({ tick: endTick,   type: 'noteOff', pitch: note.pitchMidi, velocity: 0 });
  }
  events.sort((a, b) => a.tick - b.tick);

  const trackBytes = [];
  let lastTick = 0;
  for (const ev of events) {
    const delta = ev.tick - lastTick;
    lastTick = ev.tick;
    trackBytes.push(...writeVarLen(delta));
    if (ev.type === 'noteOn')  trackBytes.push(0x90, ev.pitch, ev.velocity);
    else                        trackBytes.push(0x80, ev.pitch, 0);
  }
  // End of track meta event
  trackBytes.push(0x00, 0xFF, 0x2F, 0x00);

  const header = [0x4D,0x54,0x68,0x64, 0,0,0,6, 0,0, 0,1, (ticksPerBeat>>8)&0xFF, ticksPerBeat&0xFF];
  const trackHeader = [0x4D,0x54,0x72,0x6B,
    (trackBytes.length>>24)&0xFF, (trackBytes.length>>16)&0xFF, (trackBytes.length>>8)&0xFF, trackBytes.length&0xFF];

  return new Uint8Array([...header, ...trackHeader, ...trackBytes]);
}

function writeVarLen(value) {
  const bytes = [value & 0x7F];
  value >>= 7;
  while (value > 0) {
    bytes.unshift((value & 0x7F) | 0x80);
    value >>= 7;
  }
  return bytes;
}
```

### UI wiring — inside `init()`

1. Audio drop zone with a note: "Works best with a single instrument or voice — polyphonic backing tracks may produce noisy results."
2. "Convert to MIDI" button → runs transcription with progress bar.
3. Simple piano-roll style visualization of detected notes on a `<canvas>` (x = time, y = pitch, using the returned `notes` array).
4. "Download MIDI" button using `notesToMIDI()` output as a Blob (`audio/midi` MIME type).

**Commit message:** `feat(audio-to-midi-converter): add audio-to-MIDI transcription using Basic Pitch ONNX`

---

## FINAL CHECKLIST — After all 20 tools are built

- [ ] `npm run build` passes with 0 errors
- [ ] `npm run test:unit` passes
- [ ] `npm run test` (Playwright) passes — each tool has at least one E2E test
- [ ] `src/data/tools.json` has exactly 20 new entries with status `"done"` (or `"blocked"` with a note, if Tool 20 could not obtain a working model)
- [ ] `toolsList.json` matches `tools.json` exactly
- [ ] `src/data/categories.json` counts are accurate
- [ ] `src/pages/home.js` and `src/components/footer.js` total counts updated
- [ ] `README.md` and `PROJECT-PLAN.md` have a Phase 27 section
- [ ] Confirmed **zero** network calls exist in `browser-fingerprint-checker.js` (search the file for `fetch`, `XMLHttpRequest`, `sendBeacon` — must find none)
- [ ] Confirmed `password-breach-checker.js` only ever sends the 5-character hash **prefix** to the network, never the full password or full hash
- [ ] Confirmed every `cv.Mat` / `cv.MatVector` / `cv.Stitcher` object in `panorama-stitcher.js` has a matching `.delete()` call, including in error/catch paths
- [ ] Confirmed `video-stabilizer.js`'s ffmpeg core build actually supports `vidstabdetect`/`vidstabtransform` before shipping — if not, the tool is documented as blocked rather than silently broken
- [ ] Confirmed Tool 20's model file is a real, working ONNX file — if no working model could be obtained, the tool is marked `"blocked"` in tools.json rather than shipped with fabricated inference logic
