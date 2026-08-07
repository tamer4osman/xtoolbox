import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "html-playground",
  name: "HTML Playground",
  category: "dev",
  description: "Live HTML/CSS/JS editor with instant sandboxed preview.",
  icon: "🌐",
  keywords: ["html", "playground", "editor", "live", "preview", "css", "javascript", "sandbox"],
  accept: ".html",
  maxSizeMB: 5
};

const CDN = "https://cdn.jsdelivr.net/npm/codemirror@5.65.16";
const CSS_FILES = [
  {
    url: CDN + "/lib/codemirror.min.css",
    integrity: "sha256-wXbzkGy3BhUd2/43t4VvF7TmEsbGWDpWopBWHJ9Zlqc="
  },
  {
    url: CDN + "/theme/material-darker.min.css",
    integrity: "sha256-BiggYobXKLXqapzF7oziVQMDu5oyr77FK5Z0EySsXws="
  },
  {
    url: CDN + "/addon/hint/show-hint.min.css",
    integrity: "sha256-BRMH3hWNPkiz8j0DlG5ilCfhuT1ZfLpOBwO8+LA6e98="
  }
];
const SCRIPT_FILES = [
  {
    url: CDN + "/lib/codemirror.min.js",
    integrity: "sha256-0jDkYU7YiWR9w1fjTzQ73lZpyjegoU0FEh4E0NWuQ1o="
  },
  {
    url: CDN + "/mode/xml/xml.min.js",
    integrity: "sha256-S5XAOegU8WxBlqNRTQQP6ypTeVRl2fcAy6pbOUsnCjI="
  },
  {
    url: CDN + "/mode/css/css.min.js",
    integrity: "sha256-8HCTH3HryJDP6F+7EHofiXcJSRMvPO/3Tc9YbTQh7R0="
  },
  {
    url: CDN + "/mode/javascript/javascript.min.js",
    integrity: "sha256-dFTgt8mNs1IMVhV2UlROtZvrEtzuscpPEVUSB/Psrv4="
  },
  {
    url: CDN + "/mode/htmlmixed/htmlmixed.min.js",
    integrity: "sha256-MKE5SnhibHmDfopyqGWsq2W6w/YNDHBUaJ3JP8JYUp0="
  },
  {
    url: CDN + "/addon/edit/matchbrackets.min.js",
    integrity: "sha256-GM70UIJr9ayaFzOpqxEiKFqV31MpinohPwIjyfQf5aY="
  },
  {
    url: CDN + "/addon/edit/closebrackets.min.js",
    integrity: "sha256-AST4ZC/cJiLNcpWldGzw2ebvXrXLYnJhr7dtzzpfyoc="
  },
  {
    url: CDN + "/addon/edit/matchtags.min.js",
    integrity: "sha256-gSdkWVIb/At1rNAGzqmGegVU4oj38Zri4rptJWqC4c0="
  },
  {
    url: CDN + "/addon/hint/show-hint.min.js",
    integrity: "sha256-0FqQC+7jYnitPvvpzZmkqtN/LI8K5SklLQSoJ7viE6w="
  },
  {
    url: CDN + "/addon/hint/anyword-hint.min.js",
    integrity: "sha256-kOY32qXvjQ7rM9K2a2O+kpPxj5BNzeYxVex0iYOCr6k="
  }
];

const STORAGE_KEY = "html-playground";
const PARAM_KEY = "html";

const SAMPLE = {
  html: `<main class="card">
  <h1>Hello, HTML Playground!</h1>
  <p>Edit the HTML, CSS and JS tabs on the left. The preview updates live.</p>
  <button id="btn">Click me</button>
  <p class="msg" id="msg"></p>
</main>`,
  css: `.card {
  font-family: system-ui, sans-serif;
  max-width: 420px;
  margin: 40px auto;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

button {
  padding: 8px 18px;
  border: 0;
  border-radius: 6px;
  background: #4f46e5;
  color: #fff;
  cursor: pointer;
}

.msg { color: #059669; }`,
  js: `document.getElementById("btn").addEventListener("click", () => {
  document.getElementById("msg").textContent = "Hello from user JS!";
});`
};

const TOOL_CSS = `
.hp-toolbar { display: flex; gap: var(--space-3); align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; }
.hp-toolbar .hp-divider { width: 1px; height: 24px; background: var(--color-border); margin: 0 var(--space-1); }
.hp-status { margin-left: auto; font-size: var(--text-xs); color: var(--color-text-secondary); }
.hp-share-link { display: none; margin-bottom: var(--space-3); }
.hp-share-link.visible { display: block; }
.hp-share-link input { width: 100%; font: var(--text-xs) 'Fira Code', monospace; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); background: var(--color-surface); }
.hp-workspace { display: flex; height: 560px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; background: var(--color-surface); }
.hp-editor-col { width: 50%; min-width: 260px; display: flex; flex-direction: column; }
.hp-tabbar { display: flex; background: var(--color-bg); border-bottom: 1px solid var(--color-border); }
.hp-tab { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); cursor: pointer; color: var(--color-text-secondary); border: 0; background: none; border-bottom: 2px solid transparent; }
.hp-tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: 600; }
.hp-editor-pane { flex: 1; overflow: hidden; }
.hp-editor-pane .CodeMirror { height: 100%; }

.hp-preview-col { flex: 1; min-width: 0; display: flex; flex-direction: column; border-left: 1px solid var(--color-border); }
.hp-preview-bar { display: flex; gap: var(--space-2); align-items: center; padding: var(--space-2) var(--space-3); background: var(--color-bg); border-bottom: 1px solid var(--color-border); flex-wrap: wrap; }
.hp-device-btn { padding: 4px 10px; font-size: var(--text-xs); border-radius: var(--radius-sm); }
.hp-device-btn.active { background: var(--color-primary); color: #fff; }
.hp-preview-stage { flex: 1; display: flex; align-items: stretch; background: repeating-conic-gradient(#222 0% 25%, #2a2a2a 0% 50%) 50%/18px 18px; padding: var(--space-3); overflow: auto; }
.hp-frame { width: 100%; height: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; transition: width 0.2s ease; }
.hp-frame.desktop { margin: 0 auto; }
.hp-frame.tablet { width: 768px; margin: 0 auto; flex: 0 0 auto; }
.hp-frame.mobile { width: 375px; margin: 0 auto; flex: 0 0 auto; }

.hp-console { border-top: 1px solid var(--color-border); background: var(--color-bg); max-height: 150px; overflow-y: auto; font-family: 'Fira Code', monospace; font-size: 12px; display: none; }
.hp-console.visible { display: block; }
.hp-console-head { padding: var(--space-1) var(--space-3); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); }
.hp-entry { padding: 2px var(--space-3); white-space: pre-wrap; word-break: break-word; }
.hp-entry-error { color: #f87171; }
.hp-entry-info { color: #60a5fa; }
.hp-error { padding: var(--space-4); color: #ef4444; text-align: center; }
`;

let state = {
  editors: { html: null, css: null, js: null },
  current: { html: "", css: "", js: "" },
  debounce: null,
  device: "desktop",
  container: null
};

const LISTENER_SRC = `(function () {
  function post(type, message) {
    try { parent.postMessage({ __hp: true, type: type, message: message }, "*"); } catch (err) {}
  }
  function formatArg(value) {
    if (typeof value === "string") return value;
    try { return JSON.stringify(value); } catch (err) { return String(value); }
  }
  if (window.console) {
    ["log", "info", "warn"].forEach(function (level) {
      var orig = console[level].bind(console);
      console[level] = function () {
        var parts = Array.prototype.map.call(arguments, formatArg);
        post("info", parts.join(" "));
        return orig.apply(null, arguments);
      };
    });
    var origError = console.error.bind(console);
    console.error = function () {
      var parts = Array.prototype.map.call(arguments, formatArg);
      post("error", parts.join(" "));
      return origError.apply(null, arguments);
    };
  }
  window.addEventListener("error", function (e) {
    post("error", e.message + " (line " + e.lineno + ")");
  });
  window.addEventListener("unhandledrejection", function (e) {
    post("error", "Unhandled rejection: " + e.reason);
  });
})();
`;

export function composeDocument({ html, css, scripts = [] }) {
  const bodyScript = scripts.map(src => `<script src="${src}"></script>`).join("\n");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${css || ""}</style>
</head>
<body>
${html || ""}
${bodyScript}
</body>
</html>`;
}

export function buildScript(js) {
  return js || "";
}

export function toScriptSrc(scriptCode) {
  return URL.createObjectURL(new Blob([scriptCode], { type: "text/javascript" }));
}

export function formatConsoleMessage(message) {
  if (message === "" || message == null) return "(empty message)";
  if (typeof message === "object") {
    try {
      return JSON.stringify(message, null, 2);
    } catch (e) {
      return String(message);
    }
  }
  return String(message);
}

export function encodePayload(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

export function decodePayload(str) {
  return JSON.parse(decodeURIComponent(escape(atob(str))));
}

export function render(container) {
  state.container = container;
  container.innerHTML = `
    <style>${TOOL_CSS}</style>
    <div class="tool-container">
      <div class="tool-header">
        <h1>${escapeHtml(toolConfig.name)}</h1>
        <p>${escapeHtml(toolConfig.description)}</p>
      </div>

      <div class="hp-toolbar">
        <button class="btn-secondary" id="hp-console-toggle">Console</button>
        <span class="hp-divider"></span>
        <button class="btn-secondary hp-device-btn active" data-device="desktop">Desktop</button>
        <button class="btn-secondary hp-device-btn" data-device="tablet">Tablet</button>
        <button class="btn-secondary hp-device-btn" data-device="mobile">Mobile</button>
        <span class="hp-divider"></span>
        <button class="btn-primary" id="hp-share">Share</button>
        <span class="hp-status" id="hp-status"></span>
      </div>
      <div class="hp-share-link" id="hp-share-link"><input type="text" readonly aria-label="Share link"></div>

      <div class="hp-workspace">
        <div class="hp-editor-col">
          <div class="hp-tabbar" role="tablist">
            <button class="hp-tab active" data-lang="html" role="tab">HTML</button>
            <button class="hp-tab" data-lang="css" role="tab">CSS</button>
            <button class="hp-tab" data-lang="js" role="tab">JS</button>
          </div>
          <div class="hp-editor-pane" id="hp-editor"></div>
        </div>

        <div class="hp-preview-col">
          <div class="hp-preview-bar">
            <span class="hp-status" id="hp-preview-status" style="font-size:var(--text-xs);color:var(--color-text-secondary)"></span>
          </div>
          <div class="hp-preview-stage" id="hp-stage">
            <iframe class="hp-frame desktop" id="hp-frame" sandbox="allow-scripts allow-same-origin" title="Live HTML preview"></iframe>
          </div>
          <div class="hp-console" id="hp-console">
            <div class="hp-console-head">Preview console</div>
            <div id="hp-console-out"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  loadCSSResources();
  loadScriptResources()
    .then(() => {
      loadSavedState();
      initEditors(container);
      bindEvents(container);
      renderPreview(container);
    })
    .catch(err => {
      container.querySelector("#hp-editor").innerHTML =
        '<div class="hp-error">Failed to load editor: ' + escapeHtml(err.message) + "</div>";
    });
}

function loadCSSResources() {
  CSS_FILES.forEach(f => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = f.url;
    l.integrity = f.integrity;
    l.crossOrigin = "anonymous";
    document.head.appendChild(l);
  });
}

async function loadScriptResources(container) {
  for (const f of SCRIPT_FILES) {
    await loadScript(f.url, f.integrity);
  }
}

function loadScript(url, integrity) {
  return new Promise((resolve, reject) => {
    if (window.CodeMirror && url.includes("/lib/codemirror")) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = url;
    s.integrity = integrity;
    s.crossOrigin = "anonymous";
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load " + url));
    document.head.appendChild(s);
  });
}

function createEditor(mode, value) {
  const CM = window.CodeMirror;
  const mount = document.getElementById("hp-editor");
  const textarea = document.createElement("textarea");
  mount.appendChild(textarea);
  const editor = CM.fromTextArea(textarea, {
    mode,
    theme: "material-darker",
    lineNumbers: true,
    indentUnit: 2,
    tabSize: 2,
    matchBrackets: true,
    autoCloseBrackets: true,
    lineWrapping: true,
    extraKeys: {
      "Ctrl-Space": "autocomplete"
    }
  });
  editor.setValue(value);
  editor.getWrapperElement().style.display = "none";
  editor.on("change", () => onEditorChange(editor));
  return editor;
}

function onEditorChange(editor) {
  const lang = state.editors.html === editor ? "html" : state.editors.css === editor ? "css" : "js";
  state.current[lang] = editor.getValue();
  saveState();
  scheduleRender();
}

function initEditors(container) {
  state.editors.html = createEditor("htmlmixed", state.current.html);
  state.editors.css = createEditor("css", state.current.css);
  state.editors.js = createEditor("javascript", state.current.js);
  showEditor("html");
}

function showEditor(lang) {
  state.editor = lang;
  document.querySelectorAll(".hp-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.lang === lang);
  });
  ["html", "css", "js"].forEach(l => {
    if (state.editors[l]) {
      state.editors[l].getWrapperElement().style.display = l === lang ? "block" : "none";
      state.editors[l].refresh();
    }
  });
}

function bindEvents(container) {
  container.querySelectorAll(".hp-tab").forEach(tab => {
    tab.addEventListener("click", () => showEditor(tab.dataset.lang));
  });

  container.querySelectorAll(".hp-device-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.device = btn.dataset.device;
      container.querySelectorAll(".hp-device-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const frame = container.querySelector("#hp-frame");
      frame.className = "hp-frame " + (state.device === "desktop" ? "desktop" : state.device);
    });
  });

  container.querySelector("#hp-console-toggle").addEventListener("click", () => {
    container.querySelector("#hp-console").classList.toggle("visible");
  });

  const shareBtn = container.querySelector("#hp-share");
  shareBtn.addEventListener("click", () => shareCode(container));

  window.addEventListener("message", event => {
    const data = event.data;
    if (!data || data.__hp !== true) return;
    if (data.type === "error" || data.type === "info") {
      appendConsole(container, data.message, data.type);
    }
  });
}

function appendConsole(container, message, type) {
  const out = container.querySelector("#hp-console-out");
  const entry = document.createElement("div");
  entry.className = "hp-entry hp-entry-" + type;
  entry.textContent = formatConsoleMessage(message);
  out.appendChild(entry);
  out.scrollTop = out.scrollHeight;
}

function scheduleRender(container) {
  const c = container || state.container;
  if (state.debounce) clearTimeout(state.debounce);
  state.debounce = setTimeout(() => renderPreview(c), 300);
}

function renderPreview(container) {
  const frame = container.querySelector("#hp-frame");
  const scripts = [toScriptSrc(LISTENER_SRC)];
  const userJs = buildScript(state.current.js).trim();
  if (userJs) {
    scripts.push(toScriptSrc(userJs));
  }
  frame.srcdoc = composeDocument({
    html: state.current.html,
    css: state.current.css,
    scripts
  });
  const status = container.querySelector("#hp-preview-status");
  status.textContent = "Rendered at " + new Date().toLocaleTimeString();
  container.querySelector("#hp-console-out").innerHTML = "";
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.current));
  } catch (e) {}
}

function loadSavedState() {
  if (loadFromURL()) {
    return;
  }
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    saved = null;
  }
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        state.current = {
          html: typeof parsed.html === "string" ? parsed.html : SAMPLE.html,
          css: typeof parsed.css === "string" ? parsed.css : SAMPLE.css,
          js: typeof parsed.js === "string" ? parsed.js : SAMPLE.js
        };
        return;
      }
    } catch (e) {}
  }
  state.current = { html: SAMPLE.html, css: SAMPLE.css, js: SAMPLE.js };
}

function shareCode(container) {
  const payload = encodePayload(state.current);
  const url =
    window.location.origin +
    window.location.pathname +
    "#/tools/html-playground?" +
    PARAM_KEY +
    "=" +
    encodeURIComponent(payload);
  const status = container.querySelector("#hp-status");
  const write =
    navigator.clipboard && typeof navigator.clipboard.writeText === "function"
      ? navigator.clipboard.writeText(url)
      : Promise.reject(new Error("Clipboard API unavailable"));
  write
    .then(() => {
      status.textContent = "Share link copied";
    })
    .catch(() => {
      status.textContent = "Copy blocked — copy the link manually";
      const field = container.querySelector("#hp-share-link input");
      field.value = url;
      field.select();
      container.querySelector("#hp-share-link").classList.add("visible");
    });
}

function loadFromURL() {
  const hash = window.location.hash;
  const match = hash.match(/[?&]html=([^&]+)/);
  if (match) {
    try {
      const parsed = decodePayload(decodeURIComponent(match[1]));
      if (parsed && typeof parsed === "object") {
        state.current = {
          html: typeof parsed.html === "string" ? parsed.html : "",
          css: typeof parsed.css === "string" ? parsed.css : "",
          js: typeof parsed.js === "string" ? parsed.js : ""
        };
        return true;
      }
    } catch (e) {}
  }
  return false;
}
