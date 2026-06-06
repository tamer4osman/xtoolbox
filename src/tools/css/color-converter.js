import { rgbToHex, hue2rgb } from '../../utils/color.js';

function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return { r: hue2rgb(p, q, h + 1 / 3) * 255, g: hue2rgb(p, q, h) * 255, b: hue2rgb(p, q, h - 1 / 3) * 255 };
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d !== 0) {
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round((mx === 0 ? 0 : d / mx) * 100), v: Math.round(mx * 100) };
}

function rgbToCmyk(r, g, b) {
  const cr = 1 - r / 255, cg = 1 - g / 255, cb = 1 - b / 255;
  const k = Math.min(cr, cg, cb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return { c: Math.round(((cr - k) / (1 - k)) * 100), m: Math.round(((cg - k) / (1 - k)) * 100), y: Math.round(((cb - k) / (1 - k)) * 100), k: Math.round(k * 100) };
}

function formatRgb(v) { return `rgb(${Math.round(v.r)}, ${Math.round(v.g)}, ${Math.round(v.b)})`; }
function formatHsl(v) { return `hsl(${v.h}, ${v.s}%, ${v.l}%)`; }
function formatHsv(v) { return `hsv(${v.h}, ${v.s}%, ${v.v}%)`; }
function formatCmyk(v) { return `cmyk(${v.c}%, ${v.m}%, ${v.y}%, ${v.k}%)`; }

export function convertColor(input) {
  let rgb = null;
  const trimmed = input.trim();

  const hexMatch = trimmed.match(/^#?([\da-f]{3}){1,2}$/i);
  if (hexMatch) {
    let h = trimmed.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    rgb = hexToRgb('#' + h);
    if (rgb) return { hex: '#' + h.toLowerCase(), rgb: formatRgb(rgb), hsl: formatHsl(rgbToHsl(rgb.r, rgb.g, rgb.b)), hsv: formatHsv(rgbToHsv(rgb.r, rgb.g, rgb.b)), cmyk: formatCmyk(rgbToCmyk(rgb.r, rgb.g, rgb.b)) };
  }

  const rgbMatch = trimmed.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]), g = parseInt(rgbMatch[2]), b = parseInt(rgbMatch[3]);
    if (r <= 255 && g <= 255 && b <= 255) {
      rgb = { r, g, b };
      return { hex: rgbToHex(r, g, b), rgb: formatRgb(rgb), hsl: formatHsl(rgbToHsl(r, g, b)), hsv: formatHsv(rgbToHsv(r, g, b)), cmyk: formatCmyk(rgbToCmyk(r, g, b)) };
    }
  }

  const hslMatch = trimmed.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/i);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]), s = parseInt(hslMatch[2]), l = parseInt(hslMatch[3]);
    if (h <= 360 && s <= 100 && l <= 100) {
      rgb = hslToRgb(h, s, l);
      return { hex: rgbToHex(rgb.r, rgb.g, rgb.b), rgb: formatRgb(rgb), hsl: formatHsl({ h, s, l }), hsv: formatHsv(rgbToHsv(rgb.r, rgb.g, rgb.b)), cmyk: formatCmyk(rgbToCmyk(rgb.r, rgb.g, rgb.b)) };
    }
  }

  return null;
}

export const toolConfig = {
  id: 'color-converter',
  name: 'Color Format Converter',
  category: 'css',
  description: 'Convert between HEX, RGB, HSL, HSV, and CMYK color formats.',
  icon: '🎨',
  accept: null,
  maxSizeMB: null,
  keywords: ['color converter', 'hex to rgb', 'rgb to hex', 'hsl', 'hsv', 'cmyk', 'color format'],
  steps: ['Enter a color value in any supported format', 'See conversions to all formats instantly', 'Copy any format with one click'],
  faqs: [
    { question: 'What color formats are supported?', answer: 'HEX (#ff0000), rgb(r,g,b), hsl(h,s%,l%), HSV, and CMYK.' },
    { question: 'How accurate are the conversions?', answer: 'Conversions use standard mathematical formulas. Some precision loss may occur between formats.' }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label>Enter Color</label>
        <div style="display:flex;gap:var(--space-2);">
          <input type="text" id="cc-input" class="text-input" placeholder="#ff0000, rgb(255,0,0), hsl(0,100%,50%)" value="#3498db" style="flex:1;">
          <input type="color" id="cc-picker" value="#3498db" style="width:48px;height:40px;padding:2px;">
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="cc-convert" style="width:100%;margin-bottom:var(--space-4);">Convert</button>
      <div id="cc-results" style="border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;"></div>
    </div>
  `;

  const input = container.querySelector('#cc-input');
  const picker = container.querySelector('#cc-picker');
  const convertBtn = container.querySelector('#cc-convert');
  const results = container.querySelector('#cc-results');

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function renderRow(label, value, isColor = false) {
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-3);border-bottom:1px solid var(--color-border);font-family:monospace;font-size:var(--text-sm);cursor:pointer;" class="cc-row" data-copy="${esc(value)}">
      <span style="color:var(--color-text-muted);">${label}</span>
      <span style="font-weight:600;">${isColor ? `<span style="display:inline-block;width:20px;height:20px;border-radius:4px;background:${esc(value)};vertical-align:middle;margin-right:6px;border:1px solid var(--color-border);"></span>` : ''}${esc(value)}</span>
    </div>`;
  }

  function render(color) {
    results.innerHTML = `
      <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4);background:${color.hex};">
        <div style="width:48px;height:48px;border-radius:8px;background:${color.hex};border:2px solid rgba(255,255,255,0.3);flex-shrink:0;"></div>
        <div>
          <div style="font-weight:700;font-size:var(--text-lg);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.5);">${color.hex}</div>
          <div style="font-size:var(--text-xs);color:rgba(255,255,255,0.8);text-shadow:0 1px 3px rgba(0,0,0,0.5);">Click any row to copy</div>
        </div>
      </div>
      ${renderRow('HEX', color.hex)}
      ${renderRow('RGB', color.rgb)}
      ${renderRow('HSL', color.hsl)}
      ${renderRow('HSV', color.hsv)}
      ${renderRow('CMYK', color.cmyk)}
    `;

    results.querySelectorAll('.cc-row').forEach(el => {
      el.addEventListener('click', () => {
        navigator.clipboard.writeText(el.dataset.copy).catch(() => {});
      });
    });
  }

  function convert() {
    const result = convertColor(input.value);
    if (result) {
      render(result);
      picker.value = result.hex;
    } else {
      results.innerHTML = `<div style="padding:var(--space-4);color:var(--color-danger);">Invalid color format. Try #ff0000, rgb(255,0,0), or hsl(0,100%,50%)</div>`;
    }
  }

  convertBtn.addEventListener('click', convert);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') convert(); });
  picker.addEventListener('input', () => { input.value = picker.value; convert(); });
  convert();
}

export function destroy() {}
