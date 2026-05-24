function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

function simplifyRatio(w, h) {
  const g = gcd(w, h);
  return { w: w / g, h: h / g };
}

export const toolConfig = {
  id: 'aspect-ratio',
  name: 'Aspect Ratio Calculator',
  category: 'math',
  description: 'Calculate aspect ratios from dimensions, find missing dimensions given a ratio, and see common presets.',
  icon: '🖼️',
  accept: null,
  maxSizeMB: null,
  keywords: ['aspect ratio', 'ratio calculator', '16:9', '4:3', 'dimensions', 'width height ratio', 'screen ratio'],
  steps: ['Enter width and height to find the aspect ratio', 'Or pick a common preset and set one dimension', 'See the result simplified and in decimal form'],
  faqs: [
    { question: 'What is an aspect ratio?', answer: 'It is the proportional relationship between width and height, expressed as W:H.' },
    { question: 'What are common aspect ratios?', answer: '16:9 (widescreen), 4:3 (standard), 1:1 (square), 21:9 (ultrawide), 3:2 (photo), 9:16 (portrait).' }
  ]
};

const PRESETS = [
  { label: '16:9 Widescreen', w: 16, h: 9 },
  { label: '4:3 Standard', w: 4, h: 3 },
  { label: '1:1 Square', w: 1, h: 1 },
  { label: '21:9 Ultrawide', w: 21, h: 9 },
  { label: '3:2 Photo', w: 3, h: 2 },
  { label: '9:16 Portrait', w: 9, h: 16 },
  { label: '5:4', w: 5, h: 4 },
  { label: '16:10', w: 16, h: 10 },
  { label: '32:9 Super Ultrawide', w: 32, h: 9 }
];

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div class="form-group">
          <label>Width</label>
          <input type="number" id="ar-width" class="text-input" placeholder="1920" value="1920" min="1">
        </div>
        <div class="form-group">
          <label>Height</label>
          <input type="number" id="ar-height" class="text-input" placeholder="1080" value="1080" min="1">
        </div>
      </div>

      <div style="display:flex;gap:var(--space-3);margin:var(--space-4) 0;">
        <button class="btn btn-primary" id="ar-calc" style="flex:1;">Calculate</button>
      </div>

      <div id="ar-result" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4);">
        <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-4);text-align:center;">
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Simplified Ratio</div>
          <div id="ar-ratio" style="font-size:var(--text-3xl);font-weight:700;margin-top:var(--space-2);">16:9</div>
        </div>
        <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-4);text-align:center;">
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Decimal</div>
          <div id="ar-decimal" style="font-size:var(--text-3xl);font-weight:700;margin-top:var(--space-2);">1.778</div>
        </div>
      </div>

      <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);">
        <div style="font-weight:600;margin-bottom:var(--space-3);">Calculate Missing Dimension</div>
        <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:var(--space-3);align-items:end;">
          <div class="form-group" style="margin-bottom:0;">
            <label>Ratio W</label>
            <input type="number" id="ar-rw" class="text-input" placeholder="16" value="16" min="1">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label>Ratio H</label>
            <input type="number" id="ar-rh" class="text-input" placeholder="9" value="9" min="1">
          </div>
          <div style="font-size:var(--text-xl);padding-bottom:var(--space-2);font-weight:700;">:</div>
          <div class="form-group" style="margin-bottom:0;">
            <label>Known <span id="ar-known-label">Width</span></label>
            <input type="number" id="ar-known" class="text-input" placeholder="1920" value="1920" min="1">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label id="ar-missing-label">Height</label>
            <div id="ar-missing-value" style="font-size:var(--text-lg);font-weight:700;padding:var(--space-2) 0;">1080</div>
          </div>
          <button class="btn btn-primary" id="ar-swap" style="padding:var(--space-2) var(--space-3);">⇄</button>
        </div>
      </div>

      <div class="form-group">
        <label>Common Presets</label>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:var(--space-2);">
          ${PRESETS.map(p => `<button class="btn btn-secondary ar-preset" data-w="${p.w}" data-h="${p.h}">${p.label}</button>`).join('')}
        </div>
      </div>
    </div>
  `;

  const width = container.querySelector('#ar-width');
  const height = container.querySelector('#ar-height');
  const ratioDisplay = container.querySelector('#ar-ratio');
  const decimalDisplay = container.querySelector('#ar-decimal');
  const calcBtn = container.querySelector('#ar-calc');

  const rw = container.querySelector('#ar-rw');
  const rh = container.querySelector('#ar-rh');
  const known = container.querySelector('#ar-known');
  const knownLabel = container.querySelector('#ar-known-label');
  const missingLabel = container.querySelector('#ar-missing-label');
  const missingValue = container.querySelector('#ar-missing-value');
  const swapBtn = container.querySelector('#ar-swap');
  let knownIsWidth = true;

  function calculateRatio() {
    const w = parseInt(width.value);
    const h = parseInt(height.value);
    if (!w || !h) return;
    const s = simplifyRatio(w, h);
    ratioDisplay.textContent = `${s.w}:${s.h}`;
    decimalDisplay.textContent = (w / h).toFixed(3);
  }

  function calculateMissing() {
    const rwVal = parseFloat(rw.value);
    const rhVal = parseFloat(rh.value);
    const knownVal = parseFloat(known.value);
    if (!rwVal || !rhVal || !knownVal) return;
    let result;
    if (knownIsWidth) {
      result = (knownVal / rwVal) * rhVal;
      missingValue.textContent = Math.round(result * 100) / 100;
    } else {
      result = (knownVal / rhVal) * rwVal;
      missingValue.textContent = Math.round(result * 100) / 100;
    }
  }

  function updateMissingLabels() {
    if (knownIsWidth) {
      knownLabel.textContent = 'Width';
      missingLabel.textContent = 'Height';
    } else {
      knownLabel.textContent = 'Height';
      missingLabel.textContent = 'Width';
    }
    calculateMissing();
  }

  calcBtn.addEventListener('click', calculateRatio);
  width.addEventListener('input', calculateRatio);
  height.addEventListener('input', calculateRatio);

  rw.addEventListener('input', calculateMissing);
  rh.addEventListener('input', calculateMissing);
  known.addEventListener('input', calculateMissing);

  swapBtn.addEventListener('click', () => {
    knownIsWidth = !knownIsWidth;
    updateMissingLabels();
  });

  container.querySelectorAll('.ar-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      width.value = btn.dataset.w;
      height.value = btn.dataset.h;
      calculateRatio();
    });
  });

  calculateRatio();
  calculateMissing();
}

export function destroy() {}
