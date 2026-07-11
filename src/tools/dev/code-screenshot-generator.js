import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "code-screenshot-generator",
  name: "Code Screenshot Generator",
  category: "dev",
  description:
    "Create beautiful code screenshots for social media. Supports JavaScript syntax highlighting.",
  icon: "📸",
  keywords: ["code", "screenshot", "carbon", "syntax", "highlight", "social"],
  accept: ".js,.ts,.py,.html,.css,.json",
  maxSizeMB: 1
};

let state = {
  code: 'console.log("Hello, World!");',
  language: "javascript",
  theme: 0,
  background: "#272822",
  foreground: "#f8f8f2",
  padding: 32,
  fontSize: 14
};

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" }
];

const themes = [
  {
    name: "Monokai",
    bg: "#272822",
    fg: "#f8f8f2",
    ak: "#a6e22e",
    bl: "#66d9ef",
    bn: "#f92672",
    gn: "#a6e22e",
    gy: "#75715e",
    ow: "#fd971f",
    pp: "#ae81ff",
    rd: "#f92672",
    sy: "#e6db74"
  },
  {
    name: "Dracula",
    bg: "#282a36",
    fg: "#f8f8f2",
    ak: "#8be9fd",
    bl: "#bd93f9",
    bn: "#ff5555",
    gn: "#50fa7b",
    gy: "#6272a4",
    ow: "#ffb86c",
    pp: "#bd93f9",
    rd: "#ff5555",
    sy: "#f1fa8c"
  },
  {
    name: "GitHub",
    bg: "#0d1117",
    fg: "#c9d1d9",
    ak: "#79c0ff",
    bl: "#d2a8ff",
    bn: "#ff7b72",
    gn: "#7ee787",
    gy: "#8b949e",
    ow: "#ffa657",
    pp: "#d2a8ff",
    rd: "#ff7b72",
    sy: "#d2a8ff"
  },
  {
    name: "Nord",
    bg: "#2e3440",
    fg: "#eceff4",
    ak: "#88c0d0",
    bl: "#81a1c1",
    bn: "#bf616a",
    gn: "#a3be8c",
    gy: "#4c566a",
    ow: "#d08770",
    pp: "#b48ead",
    rd: "#bf616a",
    sy: "#ebcb8b"
  },
  {
    name: "One Dark",
    bg: "#282c34",
    fg: "#abb2bf",
    ak: "#61afef",
    bl: "#c678dd",
    bn: "#e06c75",
    gn: "#98c379",
    gy: "#5c6370",
    ow: "#d19a66",
    pp: "#c678dd",
    rd: "#e06c75",
    sy: "#e5c07b"
  },
  {
    name: "VS Code",
    bg: "#1e1e1e",
    fg: "#d4d4d4",
    ak: "#9cdcfe",
    bl: "#c586c0",
    bn: "#f44747",
    gn: "#6a9955",
    gy: "#6a6a6a",
    ow: "#ce9178",
    pp: "#c586c0",
    rd: "#f44747",
    sy: "#dcdcaa"
  }
];

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p>${toolConfig.description}</p>
      </div>

      <div class="screenshot-tool">
        <div class="code-input-section">
          <h3>Code Input</h3>
          <div class="control-row">
            <label>Language</label>
            <select id="language">
              ${languages.map(l => `<option value="${l.value}">${l.label}</option>`).join("")}
            </select>
          </div>

          <div class="code-textarea-wrapper">
            <textarea id="codeInput" placeholder="Paste your code here...">${state.code}</textarea>
          </div>
        </div>

        <div class="preview-section">
          <h3>Preview</h3>
          <div class="screenshot-preview" id="screenshotPreview" style="background:${state.background};padding:${state.padding}px;">
            <pre id="codeBlock" style="color:${state.foreground};font-size:${state.fontSize}px;margin:0;line-height:1.5;font-family:monospace;white-space:pre-wrap;"></pre>
          </div>
        </div>

        <div class="settings-section">
          <h3>Theme</h3>
          <div class="theme-grid" id="themeGrid" style="display:flex;gap:8px;flex-wrap:wrap;">
            ${themes
              .map(
                (t, i) => `
              <button class="theme-btn" data-theme="${i}" style="background:${t.bg};color:${t.fg};padding:8px 12px;border:none;cursor:pointer;border-radius:4px;font-size:12px;">
                ${t.name}
              </button>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="settings-section">
          <h3>Settings</h3>
          <div class="control-row">
            <label>Padding</label>
            <input type="range" id="padding" min="16" max="64" value="${state.padding}">
            <span id="paddingVal">${state.padding}px</span>
          </div>
          <div class="control-row">
            <label>Font Size</label>
            <select id="fontSize">
              <option value="12">12px</option>
              <option value="14" selected>14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
            </select>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-primary" id="downloadBtn">Download Screenshot</button>
        </div>
      </div>
    </div>
  `;

  highlightCode(container);
  bindEvents(container);
}



function highlightCode(container, skipHighlight = false) {
  const code = container.querySelector("#codeInput").value;
  const block = container.querySelector("#codeBlock");
  const lang = container.querySelector("#language").value;
  const theme = themes[state.theme];

  if (skipHighlight || lang !== "javascript") {
    block.innerHTML = escapeHtml(code);
    return;
  }

  const highlighted = highlightJavaScript(code, theme);
  block.innerHTML = highlighted;
}

function highlightJavaScript(code, theme) {
  let result = escapeHtml(code);

  result = result.replace(/(\/\/.*$)/gm, `<span style="color:${theme.gy}">$1</span>`);
  result = result.replace(/(\/\*[\s\S]*?\*\/)/g, `<span style="color:${theme.gy}">$1</span>`);
  result = result.replace(/(["'][^"']*["'])/g, `<span style="color:${theme.sy}">$1</span>`);
  result = result.replace(/\b(\d+)\b/g, `<span style="color:${theme.pp}">$1</span>`);
  result = result.replace(
    /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|try|catch|throw)\b/g,
    `<span style="color:${theme.bn}">$1</span>`
  );
  result = result.replace(
    /\b(console|Array|Object|String|Number|Boolean|Date|Map|Set|Promise)\b/g,
    `<span style="color:${theme.ow}">$1</span>`
  );

  return result;
}

function bindEvents(container) {
  container.querySelector("#codeInput").addEventListener("input", () => highlightCode(container));
  container.querySelector("#language").addEventListener("change", () => highlightCode(container));

  container.querySelector("#padding").addEventListener("input", e => {
    state.padding = parseInt(e.target.value);
    container.querySelector("#paddingVal").textContent = state.padding + "px";
    container.querySelector("#screenshotPreview").style.padding = state.padding + "px";
  });

  container.querySelector("#fontSize").addEventListener("change", e => {
    state.fontSize = parseInt(e.target.value);
    container.querySelector("#codeBlock").style.fontSize = state.fontSize + "px";
  });

  container.querySelector("#themeGrid").addEventListener("click", e => {
    const btn = e.target.closest(".theme-btn");
    if (!btn) return;

    state.theme = parseInt(btn.dataset.theme);
    const theme = themes[state.theme];
    state.background = theme.bg;
    state.foreground = theme.fg;

    container.querySelectorAll(".theme-btn").forEach(b => (b.style.border = "none"));
    btn.style.border = "2px solid " + theme.sy;

    container.querySelector("#screenshotPreview").style.background = theme.bg;
    container.querySelector("#screenshotPreview").style.color = theme.fg;

    highlightCode(container);
  });

  container
    .querySelector("#downloadBtn")
    .addEventListener("click", () => downloadScreenshot(container));
}

async function downloadScreenshot(container) {
  const preview = container.querySelector("#screenshotPreview");
  const btn = container.querySelector("#downloadBtn");
  btn.textContent = "Generating...";

  if (!window.html2canvas) {
    await loadHtml2Canvas();
  }

  try {
    const canvas = await window.html2canvas(preview, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "code-screenshot.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      btn.textContent = "Downloaded!";
      setTimeout(() => (btn.textContent = "Download Screenshot"), 2000);
    }, "image/png");
  } catch (err) {
    console.error("Screenshot error:", err);
    btn.textContent = "Error";
    setTimeout(() => (btn.textContent = "Download Screenshot"), 2000);
  }
}

function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.6/dist/html2canvas.min.js";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
