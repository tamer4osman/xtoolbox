import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "js-playground",
  name: "JavaScript Playground",
  category: "dev",
  description: "Interactive JavaScript editor with live output console.",
  icon: "⚡",
  keywords: ["javascript", "playground", "editor", "live", "code"],
  accept: ".js",
  maxSizeMB: 1
};

const TOOL_CSS = `
.jp-toolbar { display: flex; gap: var(--space-3); align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; }
.jp-status { margin-left: auto; font-size: var(--text-sm); color: var(--color-text-secondary); }
.jp-workspace { display: flex; height: 500px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; background: var(--color-surface); }
.jp-editor-pane { flex: 1; min-width: 200px; overflow: hidden; }
.jp-editor-pane .CodeMirror { height: 100%; }
.jp-divider { width: 6px; cursor: col-resize; background: var(--color-border); transition: background 0.15s; flex-shrink: 0; }
.jp-divider:hover, .jp-divider:active { background: var(--color-primary); }
.jp-console-pane { flex: 1; min-width: 200px; display: flex; flex-direction: column; border-left: 1px solid var(--color-border); }
.jp-console-header { padding: var(--space-2) var(--space-3); font-size: var(--text-sm); font-weight: 600; background: var(--color-bg); border-bottom: 1px solid var(--color-border); text-transform: uppercase; letter-spacing: 0.05em; }
.jp-console-output { flex: 1; overflow-y: auto; padding: var(--space-3); font-family: 'Fira Code', monospace; font-size: 13px; }
.jp-entry { padding: var(--space-1) var(--space-2); border-bottom: 1px solid var(--color-border); white-space: pre-wrap; word-break: break-word; }
.jp-entry-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.jp-entry-warn { background: rgba(234, 179, 8, 0.1); color: #eab308; }
.jp-entry-info { color: #3b82f6; }
.jp-entry-log, .jp-entry-dir { color: var(--color-text); }
.jp-timer { color: #8b5cf6; font-style: italic; }
.jp-group-start { font-weight: 600; padding-top: var(--space-2); }
.jp-group-end { padding-bottom: var(--space-2); border-bottom: 2px solid var(--color-border); }
.jp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.jp-table th, .jp-table td { padding: var(--space-1) var(--space-2); border: 1px solid var(--color-border); text-align: left; }
.jp-table th { background: var(--color-bg); font-weight: 600; }
.jp-dir { margin: 0; font-family: inherit; font-size: inherit; }
.jp-table-raw, .jp-empty-table { color: var(--color-text-secondary); font-style: italic; }
.jp-error { padding: var(--space-4); color: #ef4444; text-align: center; }
.jp-share-url { display: flex; gap: var(--space-2); align-items: center; margin-top: var(--space-3); }
.jp-share-url input { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: monospace; font-size: var(--text-sm); background: var(--color-bg); }
`;

const STORAGE_KEY = "js-playground-code";
const TIMEOUT_MS = 5000;

const SAMPLE_CODE = `// 1. Basic output
console.log("Hello, JavaScript Playground!");

// 2. Table
console.table([{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]);

// 3. Warning & Error
console.warn("This is a warning");
console.error("This is an error");

// 4. Timer
console.time("loop");
for (let i = 0; i < 1000000; i++) {}
console.timeEnd("loop");

// 5. Group
console.group("User Info");
console.log("Name: Alice");
console.log("Role: Admin");
console.groupEnd();

// 6. Dir
console.dir({ nested: { value: 42 } });
`;

let state = {
  editor: null,
  consoleEntries: [],
  resizeActive: false
};

export function render(container) {
  container.innerHTML = `
    <style>${TOOL_CSS}</style>
    <div class="tool-container">
      <div class="tool-header">
        <h1>${escapeHtml(toolConfig.name)}</h1>
        <p>${escapeHtml(toolConfig.description)}</p>
      </div>

      <div class="jp-toolbar">
        <button class="btn-primary" id="jp-run">▶ Run</button>
        <button class="btn-secondary" id="jp-clear">Clear</button>
        <button class="btn-secondary" id="jp-reset">Reset</button>
        <button class="btn-secondary" id="jp-share">Share</button>
        <span class="jp-status" id="jp-status"></span>
      </div>

      <div class="jp-workspace" id="jp-workspace">
        <div class="jp-editor-pane" id="jp-editor-pane">
          <div id="jp-editor"></div>
        </div>
        <div class="jp-divider" id="jp-divider"></div>
        <div class="jp-console-pane" id="jp-console-pane">
          <div class="jp-console-header">Console</div>
          <div class="jp-console-output" id="jp-console-output"></div>
        </div>
      </div>

      <div class="jp-share-url" id="jp-share-url" style="display:none">
        <input type="text" id="jp-share-input" readonly />
        <button class="btn-secondary" id="jp-copy-url">Copy</button>
      </div>
    </div>
  `;

  initEditor(container);
  bindEvents(container);
  initResizer(container);
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.crossOrigin = "anonymous";
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load " + url));
    document.head.appendChild(s);
  });
}

function loadCSS(url) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = url;
  l.crossOrigin = "anonymous";
  document.head.appendChild(l);
}

function initEditor(container) {
  const editorEl = container.querySelector("#jp-editor");
  const CDN = "https://cdn.jsdelivr.net/npm/codemirror@5.65.16";

  loadCSS(CDN + "/lib/codemirror.min.css");
  loadCSS(CDN + "/theme/material-darker.min.css");

  loadScript(CDN + "/lib/codemirror.min.js")
    .then(() => loadScript(CDN + "/mode/javascript/javascript.min.js"))
    .then(() => {
      const CM = window.CodeMirror;
      const textarea = document.createElement("textarea");
      editorEl.appendChild(textarea);

      state.editor = CM.fromTextArea(textarea, {
        mode: "javascript",
        theme: "material-darker",
        lineNumbers: true,
        indentUnit: 2,
        tabSize: 2,
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        extraKeys: {
          "Ctrl-Enter": () => runCode(container),
          "Cmd-Enter": () => runCode(container)
        }
      });

      state.editor.on("change", () => {
        saveToStorage(getEditorValue(state.editor));
      });

      if (loadFromURL()) {
        /* URL code already loaded */
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        setEditorValue(state.editor, saved || SAMPLE_CODE);
      }
    })
    .catch(err => {
      editorEl.innerHTML =
        '<div class="jp-error">Failed to load editor: ' + escapeHtml(err.message) + "</div>";
    });
}

function setEditorValue(editor, code) {
  if (!editor) return;
  editor.setValue(code);
}

function getEditorValue(editor) {
  if (!editor) return "";
  return editor.getValue();
}

function bindEvents(container) {
  container.querySelector("#jp-run").addEventListener("click", () => runCode(container));
  container.querySelector("#jp-clear").addEventListener("click", () => clearConsole(container));
  container.querySelector("#jp-reset").addEventListener("click", () => resetEditor(container));
  container.querySelector("#jp-share").addEventListener("click", () => toggleShare(container));
  container.querySelector("#jp-copy-url").addEventListener("click", () => copyShareURL(container));

  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runCode(container);
    }
  });
}

function runCode(container) {
  const code = getEditorValue(state.editor);
  if (!code.trim()) return;

  clearConsole(container);
  const output = container.querySelector("#jp-console-output");
  const status = container.querySelector("#jp-status");
  status.textContent = "Running...";

  const origMethods = {};
  const methods = [
    "log",
    "info",
    "warn",
    "error",
    "clear",
    "table",
    "time",
    "timeEnd",
    "timeEnd",
    "group",
    "groupEnd",
    "dir"
  ];

  methods.forEach(method => {
    origMethods[method] = console[method];
    console[method] = function (...args) {
      const serialized = args.map(arg => {
        if (arg === undefined) return "undefined";
        if (arg === null) return "null";
        if (typeof arg === "object") {
          try {
            return JSON.parse(JSON.stringify(arg));
          } catch (e) {
            return String(arg);
          }
        }
        return arg;
      });
      addConsoleEntry(output, method, serialized);
      if (origMethods[method]) origMethods[method].apply(console, args);
    };
  });

  const prevHandler = window.onerror;
  const prevRejection = window.onunhandledrejection;
  window.onerror = function (msg, url, line) {
    addConsoleEntry(output, "error", [msg + " (line " + line + ")"]);
  };
  window.onunhandledrejection = function (e) {
    addConsoleEntry(output, "error", [String(e.reason)]);
  };

  function cleanup() {
    methods.forEach(method => {
      if (origMethods[method]) console[method] = origMethods[method];
    });
    window.onerror = prevHandler;
    window.onunhandledrejection = prevRejection;
  }

  const timeoutId = setTimeout(() => {
    addConsoleEntry(output, "error", ["Execution timed out (>" + TIMEOUT_MS / 1000 + "s)"]);
    cleanup();
    status.textContent = "Done";
    setTimeout(() => {
      status.textContent = "";
    }, 2000);
  }, TIMEOUT_MS);

  try {
    const fn = new Function(code);
    fn();
  } catch (e) {
    addConsoleEntry(output, "error", [e.toString()]);
  }

  clearTimeout(timeoutId);
  cleanup();
  status.textContent = "Done";
  setTimeout(() => {
    status.textContent = "";
  }, 2000);
}

function addConsoleEntry(output, method, args) {
  const entry = document.createElement("div");
  entry.className = "jp-entry jp-entry-" + method;

  if (method === "clear") {
    output.innerHTML = "";
    return;
  }

  if (method === "table" && args.length > 0) {
    entry.innerHTML = renderTable(args[0]);
  } else if (method === "group") {
    entry.className += " jp-group-start";
    entry.textContent = args[0] || "";
  } else if (method === "groupEnd") {
    entry.className += " jp-group-end";
  } else if (method === "dir") {
    entry.innerHTML = '<pre class="jp-dir">' + escapeHtml(formatDir(args[0])) + "</pre>";
  } else if (method === "timeEnd" && args.length > 0) {
    entry.className += " jp-timer";
    entry.textContent = (args[0] || "") + ": " + (args[1] || "");
  } else {
    entry.textContent = args.map(a => formatArg(a)).join(" ");
  }

  output.appendChild(entry);
  output.scrollTop = output.scrollHeight;
}

export function formatArg(val) {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val, null, 2);
    } catch (e) {
      return String(val);
    }
  }
  return String(val);
}

export function formatDir(val) {
  if (typeof val === "object") {
    try {
      return JSON.stringify(val, null, 2);
    } catch (e) {
      return String(val);
    }
  }
  return String(val);
}

export function renderTable(data) {
  if (!Array.isArray(data)) {
    return '<pre class="jp-table-raw">' + escapeHtml(formatArg(data)) + "</pre>";
  }
  if (data.length === 0) return '<span class="jp-empty-table">(empty table)</span>';

  const keys = Object.keys(data[0]);
  let html = '<table class="jp-table"><thead><tr><th>(index)</th>';
  keys.forEach(k => {
    html += "<th>" + escapeHtml(k) + "</th>";
  });
  html += "</tr></thead><tbody>";
  data.forEach((row, i) => {
    html += "<tr><td>" + i + "</td>";
    keys.forEach(k => {
      const val = row[k];
      html += "<td>" + escapeHtml(formatArg(val)) + "</td>";
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  return html;
}

function clearConsole(container) {
  container.querySelector("#jp-console-output").innerHTML = "";
}

function resetEditor(container) {
  clearConsole(container);
  setEditorValue(state.editor, SAMPLE_CODE);
  localStorage.removeItem(STORAGE_KEY);
  history.replaceState(null, "", window.location.pathname + "#/tools/js-playground");
}

function toggleShare(container) {
  const shareUrl = container.querySelector("#jp-share-url");
  const visible = shareUrl.style.display !== "none";

  if (visible) {
    shareUrl.style.display = "none";
  } else {
    const code = getEditorValue(state.editor);
    const encoded = btoa(unescape(encodeURIComponent(code)));
    const url =
      window.location.origin + window.location.pathname + "#/tools/js-playground?code=" + encoded;
    container.querySelector("#jp-share-input").value = url;
    shareUrl.style.display = "flex";
  }
}

function copyShareURL(container) {
  const input = container.querySelector("#jp-share-input");
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = container.querySelector("#jp-copy-url");
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = "Copy";
    }, 2000);
  });
}

function saveToStorage(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch (e) {}
}

function loadFromURL() {
  const hash = window.location.hash;
  const match = hash.match(/[?&]code=([^&]+)/);
  if (match) {
    try {
      const code = decodeURIComponent(escape(atob(match[1])));
      setEditorValue(state.editor, code);
      saveToStorage(code);
      return true;
    } catch (e) {}
  }
  return false;
}

function initResizer(container) {
  const workspace = container.querySelector("#jp-workspace");
  const divider = container.querySelector("#jp-divider");
  const editorPane = container.querySelector("#jp-editor-pane");
  const consolePane = container.querySelector("#jp-console-pane");

  let startX, startEditorWidth;

  divider.addEventListener("mousedown", e => {
    e.preventDefault();
    state.resizeActive = true;
    startX = e.clientX;
    startEditorWidth = editorPane.getBoundingClientRect().width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", e => {
    if (!state.resizeActive) return;
    const dx = e.clientX - startX;
    const workspaceWidth = workspace.getBoundingClientRect().width;
    const newEditorWidth = Math.max(200, Math.min(workspaceWidth - 200, startEditorWidth + dx));
    const editorPercent = (newEditorWidth / workspaceWidth) * 100;
    editorPane.style.flex = "none";
    editorPane.style.width = editorPercent + "%";
    consolePane.style.flex = "1";
  });

  document.addEventListener("mouseup", () => {
    if (state.resizeActive) {
      state.resizeActive = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });
}
