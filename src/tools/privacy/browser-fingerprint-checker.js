export const toolConfig = {
  id: "browser-fingerprint-checker",
  name: "Browser Fingerprint Checker",
  category: "privacy",
  description:
    "See what a website can learn about your browser without cookies. All checks run locally.",
  icon: "🔍",
  accept: null,
  maxSizeMB: null,
  keywords: ["fingerprint", "browser", "privacy", "tracking", "canvas", "webgl", "navigator"],
  steps: [
    "Click the button to run all fingerprint checks",
    "Review the detected properties and your unique hash",
    "Copy the results to share or save"
  ],
  faqs: [
    {
      question: "What is a browser fingerprint?",
      answer:
        "A browser fingerprint is a set of attributes your browser reveals to websites — screen size, installed fonts, graphics card, timezone, and more. Combined, these can uniquely identify you even without cookies."
    },
    {
      question: "Does this tool send my data anywhere?",
      answer:
        "No. Every check runs entirely in this tab. Zero network requests are made. Your fingerprint stays on your device."
    },
    {
      question: "Why does my fingerprint hash change?",
      answer:
        "The hash changes when any fingerprint component changes — a browser update, new GPU driver, different screen resolution, or installing/removing fonts can all alter it."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p class="tool-description">${toolConfig.description}</p>
      </div>
      <div class="bfc-privacy">
        <span class="bfc-privacy-icon">🔒</span>
        <span>Zero network requests. All checks run entirely in this tab.</span>
      </div>
      <div class="bfc-actions">
        <button id="bfc-run" class="btn btn-primary btn-lg">Run Fingerprint Check</button>
      </div>
      <div id="bfc-results" style="display:none">
        <div class="bfc-hash-box">
          <div class="bfc-hash-label">Your fingerprint hash</div>
          <div id="bfc-hash-value" class="bfc-hash-value"></div>
        </div>
        <div class="bfc-table-wrap">
          <table class="bfc-table">
            <thead>
              <tr><th>Property</th><th>Value</th></tr>
            </thead>
            <tbody id="bfc-table-body"></tbody>
          </table>
        </div>
        <div class="bfc-copy-row">
          <button id="bfc-copy" class="btn btn-secondary">Copy Results</button>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .bfc-privacy {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      background: var(--color-surface);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius);
      font-size: var(--text-sm);
      margin-bottom: var(--space-5);
    }
    .bfc-privacy-icon { font-size: 1.25rem; }
    .bfc-actions { margin-bottom: var(--space-5); }
    .bfc-hash-box {
      background: var(--color-primary-light, #eef2ff);
      border: 1px solid var(--color-primary-border, #c7d2fe);
      border-radius: var(--radius);
      padding: var(--space-5);
      text-align: center;
      margin-bottom: var(--space-5);
    }
    .bfc-hash-label {
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary, #6b7280);
      margin-bottom: var(--space-2);
    }
    .bfc-hash-value {
      font-family: var(--font-mono);
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--color-primary);
      word-break: break-all;
    }
    .bfc-table-wrap { overflow-x: auto; }
    .bfc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }
    .bfc-table th {
      text-align: left;
      padding: var(--space-3);
      border-bottom: 2px solid var(--color-border);
      font-weight: 600;
      white-space: nowrap;
    }
    .bfc-table td {
      padding: var(--space-3);
      border-bottom: 1px solid var(--color-border);
      vertical-align: top;
    }
    .bfc-table td:first-child {
      font-weight: 500;
      white-space: nowrap;
      width: 220px;
    }
    .bfc-table td:last-child {
      font-family: var(--font-mono);
      word-break: break-all;
    }
    .bfc-table tr:hover { background: var(--color-surface); }
    .bfc-copy-row {
      display: flex;
      gap: var(--space-2);
      margin-top: var(--space-4);
    }
  `;
  container.appendChild(style);

  const runBtn = container.querySelector("#bfc-run");
  const results = container.querySelector("#bfc-results");

  runBtn.addEventListener("click", async () => {
    runBtn.disabled = true;
    runBtn.textContent = "Checking...";

    try {
      const fingerprint = await buildFingerprint();
      const hash = await computeHash(fingerprint.raw);

      container.querySelector("#bfc-hash-value").textContent = hash.slice(0, 16);

      const tbody = container.querySelector("#bfc-table-body");
      tbody.innerHTML = Object.entries(fingerprint.raw)
        .map(
          ([key, val]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(String(val))}</td></tr>`
        )
        .join("");

      results.style.display = "";
      runBtn.textContent = "Run Again";
    } catch {
      results.style.display = "";
      container.querySelector("#bfc-hash-value").textContent = "error";
      container.querySelector("#bfc-table-body").innerHTML =
        '<tr><td colspan="2">Fingerprint collection failed</td></tr>';
      runBtn.textContent = "Run Again";
    } finally {
      runBtn.disabled = false;
    }
  });

  container.querySelector("#bfc-copy").addEventListener("click", () => {
    const hash = container.querySelector("#bfc-hash-value").textContent;
    const rows = container.querySelectorAll("#bfc-table-body tr");
    const lines = Array.from(rows).map(
      tr => `${tr.cells[0].textContent}: ${tr.cells[1].textContent}`
    );
    const text = `Fingerprint: ${hash}\n\n${lines.join("\n")}`;
    navigator.clipboard.writeText(text).catch(() => {});
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function computeHash(raw) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(raw));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "canvas-unavailable";
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 100, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("fingerprint-check-\u{1F512}", 2, 15);
    return canvas.toDataURL();
  } catch {
    return "canvas-unavailable";
  }
}

function getWebGLInfo() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return { vendor: "unavailable", renderer: "unavailable" };
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      vendor: debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR),
      renderer: debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER)
    };
  } catch {
    return { vendor: "unavailable", renderer: "unavailable" };
  }
}

function detectAvailableFonts() {
  try {
    const testFonts = [
      "Arial",
      "Verdana",
      "Times New Roman",
      "Courier New",
      "Georgia",
      "Comic Sans MS",
      "Impact",
      "Tahoma",
      "Trebuchet MS",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue"
    ];
    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testString = "mmmmmmmmmmlli";
    const testSize = "72px";

    const span = document.createElement("span");
    span.style.fontSize = testSize;
    span.style.position = "absolute";
    span.style.left = "-9999px";
    span.textContent = testString;
    document.body.appendChild(span);

    const baseWidths = {};
    for (const base of baseFonts) {
      span.style.fontFamily = base;
      baseWidths[base] = span.offsetWidth;
    }

    const detected = [];
    for (const font of testFonts) {
      for (const base of baseFonts) {
        span.style.fontFamily = `'${font}', ${base}`;
        if (span.offsetWidth !== baseWidths[base]) {
          detected.push(font);
          break;
        }
      }
    }

    document.body.removeChild(span);
    return detected;
  } catch {
    return [];
  }
}

async function buildFingerprint() {
  const canvasFp = getCanvasFingerprint();
  const webgl = getWebGLInfo();
  const fonts = detectAvailableFonts();

  const raw = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages ? navigator.languages.join(", ") : "",
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
    deviceMemory: navigator.deviceMemory || "unknown",
    screenResolution: `${screen.width}x${screen.height}`,
    availableScreenResolution: `${screen.availWidth}x${screen.availHeight}`,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    touchSupport: "ontouchstart" in window,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || "unspecified",
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    canvasHash: simpleHash(canvasFp),
    fontsDetected: fonts.join(", "),
    pluginsCount: navigator.plugins ? navigator.plugins.length : 0,
    maxTouchPoints: navigator.maxTouchPoints || 0
  };

  return { raw };
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(16);
}
