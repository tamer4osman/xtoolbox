import { rgbToHex, hue2rgb } from "../../utils/color.js";

export { rgbToHex };

export function parseColor(input) {
  const trimmed = input.trim().toLowerCase();

  const hexMatch = trimmed.match(/^#?([\da-f]{3}){1,2}$/i);
  if (hexMatch) {
    let h = trimmed.replace("#", "");
    if (h.length === 3)
      h = h
        .split("")
        .map(c => c + c)
        .join("");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }

  const rgbMatch = trimmed.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
  }

  const hslMatch = trimmed.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  return null;
}

export function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function checkWcag(ratio) {
  return {
    aa_normal: ratio >= 4.5,
    aa_large: ratio >= 3,
    aaa_normal: ratio >= 7,
    aaa_large: ratio >= 4.5
  };
}

export function suggestFix(fg, bg, targetRatio) {
  const fgLum = relativeLuminance(fg.r, fg.g, fg.b);
  const bgLum = relativeLuminance(bg.r, bg.g, bg.b);
  const bgLighter = bgLum > fgLum;

  let best = null;
  for (let step = 0; step <= 255; step += 5) {
    for (const channel of ["r", "g", "b"]) {
      const tryColor = { ...fg };
      tryColor[channel] = bgLighter
        ? Math.max(0, fg[channel] - step)
        : Math.min(255, fg[channel] + step);
      const ratio = contrastRatio(tryColor, bg);
      if (ratio >= targetRatio) {
        if (!best || step < best.step) {
          best = { color: tryColor, step, ratio };
        }
      }
    }
  }
  return best ? best.color : null;
}

export function simulateColorBlindness(rgb, type) {
  const { r, g, b } = rgb;
  const m = {
    protanopia: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758]
    ],
    deuteranopia: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7]
    ],
    tritanopia: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525]
    ],
    achromatopsia: [
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114]
    ]
  };
  const matrix = m[type];
  if (!matrix) return rgb;
  return {
    r: Math.min(
      255,
      Math.max(0, Math.round(matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b))
    ),
    g: Math.min(
      255,
      Math.max(0, Math.round(matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b))
    ),
    b: Math.min(
      255,
      Math.max(0, Math.round(matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b))
    )
  };
}

export const toolConfig = {
  id: "wcag-contrast-checker",
  name: "WCAG Color Contrast Checker",
  category: "css",
  description:
    "Check color contrast ratios against WCAG 2.1 AA/AAA standards. Includes colorblind simulation preview.",
  icon: "♿",
  accept: null,
  maxSizeMB: null,
  keywords: ["wcag", "contrast", "accessibility", "color", "a11y", "aa", "aaa", "contrast checker"],
  steps: [
    "Enter foreground and background colors",
    "See contrast ratio and WCAG pass/fail results",
    "Preview colorblind simulation"
  ],
  faqs: [
    {
      question: "What is WCAG?",
      answer:
        "Web Content Accessibility Guidelines (WCAG) define standards for accessible web content. Contrast ratios ensure text is readable for people with visual impairments."
    },
    {
      question: "What are AA and AAA levels?",
      answer:
        "AA is the minimum standard (4.5:1 for normal text, 3:1 for large text). AAA is the enhanced standard (7:1 for normal text, 4.5:1 for large text)."
    },
    {
      question: "What counts as large text?",
      answer: "Large text is 18pt (24px) or larger, or 14pt (18.66px) bold or larger."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4);">
        <div class="form-group">
          <label>Foreground (Text)</label>
          <div style="display:flex;gap:var(--space-2);">
            <input type="text" id="wcag-fg" class="text-input" placeholder="#000000" value="#000000" style="flex:1;">
            <input type="color" id="wcag-fg-picker" value="#000000" style="width:48px;height:40px;padding:2px;">
          </div>
        </div>
        <div class="form-group">
          <label>Background</label>
          <div style="display:flex;gap:var(--space-2);">
            <input type="text" id="wcag-bg" class="text-input" placeholder="#ffffff" value="#ffffff" style="flex:1;">
            <input type="color" id="wcag-bg-picker" value="#ffffff" style="width:48px;height:40px;padding:2px;">
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="wcag-check" style="width:100%;margin-bottom:var(--space-4);">Check Contrast</button>
      <div id="wcag-results"></div>
    </div>
  `;

  const fgInput = container.querySelector("#wcag-fg");
  const bgInput = container.querySelector("#wcag-bg");
  const fgPicker = container.querySelector("#wcag-fg-picker");
  const bgPicker = container.querySelector("#wcag-bg-picker");
  const checkBtn = container.querySelector("#wcag-check");
  const results = container.querySelector("#wcag-results");

  function renderResults(fg, bg, ratio, checks) {
    const ratioStr = ratio.toFixed(2);
    const makeBadge = pass =>
      pass
        ? '<span style="background:#10b981;color:#fff;padding:2px 8px;border-radius:9999px;font-size:12px;font-weight:600;">PASS</span>'
        : '<span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:9999px;font-size:12px;font-weight:600;">FAIL</span>';

    const fgHex = rgbToHex(fg.r, fg.g, fg.b);
    const bgHex = rgbToHex(bg.r, bg.g, bg.b);

    const simTypes = [
      { key: "none", label: "Normal Vision", fg: fg, bg: bg },
      {
        key: "protanopia",
        label: "Protanopia (Red-Blind)",
        fg: simulateColorBlindness(fg, "protanopia"),
        bg: simulateColorBlindness(bg, "protanopia")
      },
      {
        key: "deuteranopia",
        label: "Deuteranopia (Green-Blind)",
        fg: simulateColorBlindness(fg, "deuteranopia"),
        bg: simulateColorBlindness(bg, "deuteranopia")
      },
      {
        key: "tritanopia",
        label: "Tritanopia (Blue-Blind)",
        fg: simulateColorBlindness(fg, "tritanopia"),
        bg: simulateColorBlindness(bg, "tritanopia")
      },
      {
        key: "achromatopsia",
        label: "Achromatopsia (Mono)",
        fg: simulateColorBlindness(fg, "achromatopsia"),
        bg: simulateColorBlindness(bg, "achromatopsia")
      }
    ];

    results.innerHTML = `
      <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;margin-bottom:var(--space-4);">
        <div style="background:${bgHex};padding:var(--space-8);text-align:center;">
          <span style="color:${fgHex};font-size:28px;font-weight:700;">Sample Text</span><br>
          <span style="color:${fgHex};font-size:18px;">Large text sample (18pt+)</span>
        </div>
        <div style="padding:var(--space-4);display:flex;align-items:center;justify-content:center;gap:var(--space-6);flex-wrap:wrap;">
          <div style="text-align:center;">
            <div style="font-size:36px;font-weight:800;color:var(--color-text);">${ratioStr}</div>
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Contrast Ratio</div>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-4);">
        <div style="padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
            <span style="font-weight:600;font-size:var(--text-sm);">AA Normal Text</span>
            ${makeBadge(checks.aa_normal)}
          </div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Requires ≥ 4.5:1</div>
        </div>
        <div style="padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
            <span style="font-weight:600;font-size:var(--text-sm);">AA Large Text</span>
            ${makeBadge(checks.aa_large)}
          </div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Requires ≥ 3:1</div>
        </div>
        <div style="padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
            <span style="font-weight:600;font-size:var(--text-sm);">AAA Normal Text</span>
            ${makeBadge(checks.aaa_normal)}
          </div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Requires ≥ 7:1</div>
        </div>
        <div style="padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
            <span style="font-weight:600;font-size:var(--text-sm);">AAA Large Text</span>
            ${makeBadge(checks.aaa_large)}
          </div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Requires ≥ 4.5:1</div>
        </div>
      </div>
      <div style="margin-bottom:var(--space-2);font-weight:600;font-size:var(--text-sm);">Colorblind Simulation</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--space-3);">
        ${simTypes
          .map(
            s => `
          <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;text-align:center;">
            <div style="background:${rgbToHex(s.bg.r, s.bg.g, s.bg.b)};padding:var(--space-4);">
              <span style="color:${rgbToHex(s.fg.r, s.fg.g, s.fg.b)};font-weight:700;font-size:14px;">Aa</span>
            </div>
            <div style="padding:var(--space-2);font-size:11px;color:var(--color-text-muted);">${s.label}</div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  function check() {
    const fg = parseColor(fgInput.value);
    const bg = parseColor(bgInput.value);
    if (!fg || !bg) {
      results.innerHTML =
        '<div style="padding:var(--space-4);color:var(--color-error);">Invalid color format. Use #hex, rgb(), or hsl().</div>';
      return;
    }
    const ratio = contrastRatio(fg, bg);
    const checks = checkWcag(ratio);
    renderResults(fg, bg, ratio, checks);
  }

  checkBtn.addEventListener("click", check);
  fgInput.addEventListener("keydown", e => {
    if (e.key === "Enter") check();
  });
  bgInput.addEventListener("keydown", e => {
    if (e.key === "Enter") check();
  });
  fgPicker.addEventListener("input", () => {
    fgInput.value = fgPicker.value;
    check();
  });
  bgPicker.addEventListener("input", () => {
    bgInput.value = bgPicker.value;
    check();
  });
  check();
}

export function destroy() {}
