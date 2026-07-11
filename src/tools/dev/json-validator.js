import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "json-validator",
  name: "JSON Validator & Formatter",
  category: "dev",
  description: "Validate, format, and minify JSON with error line numbers.",
  icon: "✅",
  status: "done"
};

export function render(container) {
  container.innerHTML = `
    <div class="validator-container">
      <h2>JSON Validator & Formatter</h2>
      <textarea id="jsonInput" class="json-textarea" placeholder="Paste your JSON here..."></textarea>
      <div class="action-buttons">
        <button id="validateBtn" class="btn btn-primary">Validate</button>
        <button id="formatBtn" class="btn btn-secondary">Format</button>
        <button id="minifyBtn" class="btn btn-secondary">Minify</button>
        <button id="clearBtn" class="btn btn-ghost">Clear</button>
      </div>
      <div class="result" id="result"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .validator-container { max-width: 900px; margin: 0 auto; }
    .validator-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .json-textarea { 
      width: 100%; 
      height: 300px; 
      padding: var(--space-4); 
      border: 2px solid var(--color-border); 
      border-radius: var(--radius-xl); 
      background: var(--color-surface); 
      font-family: 'Fira Code', monospace; 
      font-size: var(--text-sm); 
      resize: vertical;
    }
    .json-textarea:focus { outline: none; border-color: var(--color-primary); }
    .action-buttons { display: flex; gap: var(--space-3); margin: var(--space-4) 0; flex-wrap: wrap; }
    .action-buttons .btn { flex: 1; min-width: 100px; }
    .result { 
      padding: var(--space-6); 
      border-radius: var(--radius-xl); 
      text-align: center; 
      font-weight: 600;
      font-size: var(--text-lg);
    }
    .result.valid { background: #dcfce7; color: #166534; }
    .result.invalid { background: #fee2e2; color: #991b1b; }
    .result.format { background: #dbeafe; color: #1e40af; }
    .result.minify { background: #fef3c7; color: #92400e; }
    .error-line { 
      margin-top: var(--space-4); 
      padding: var(--space-4); 
      background: rgba(0,0,0,0.05); 
      border-radius: var(--radius-lg);
      font-size: var(--text-sm); 
      font-family: monospace; 
      text-align: left; 
      white-space: pre-wrap; 
      overflow-x: auto;
    }
    .error-location {
      display: block;
      font-weight: 700;
      color: #dc2626;
      margin-bottom: var(--space-2);
    }
  `;
  container.appendChild(style);

  const jsonInput = container.querySelector("#jsonInput");
  const result = container.querySelector("#result");

  function showResult(message, type, extra = "") {
    result.className = `result ${type}`;
    result.innerHTML = message + extra;
  }

  function parseErrorLine(error) {
    const match = error.message.match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1]);
      const lines = jsonInput.value.substring(0, pos).split("\n");
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;
      return `Error at line ${line}, column ${col}`;
    }
    return "";
  }

  container.querySelector("#validateBtn").addEventListener("click", () => {
    const json = jsonInput.value.trim();
    if (!json) {
      showResult("Please enter some JSON", "invalid");
      return;
    }
    try {
      JSON.parse(json);
      showResult("✓ Valid JSON", "valid");
    } catch (e) {
      const location = parseErrorLine(e);
      const extra = location
        ? `<div class="error-line"><span class="error-location">${location}</span>${escapeHtml(e.message)}</div>`
        : `<div class="error-line">${escapeHtml(e.message)}</div>`;
      showResult("✗ Invalid JSON", "invalid", extra);
    }
  });

  container.querySelector("#formatBtn").addEventListener("click", () => {
    const json = jsonInput.value.trim();
    if (!json) {
      showResult("Please enter some JSON to format", "invalid");
      return;
    }
    try {
      const parsed = JSON.parse(json);
      jsonInput.value = JSON.stringify(parsed, null, 2);
      showResult("✓ JSON formatted (pretty printed)", "format");
    } catch (e) {
      const location = parseErrorLine(e);
      const extra = location
        ? `<div class="error-line"><span class="error-location">${location}</span>${escapeHtml(e.message)}</div>`
        : `<div class="error-line">${escapeHtml(e.message)}</div>`;
      showResult("✗ Cannot format: Invalid JSON", "invalid", extra);
    }
  });

  container.querySelector("#minifyBtn").addEventListener("click", () => {
    const json = jsonInput.value.trim();
    if (!json) {
      showResult("Please enter some JSON to minify", "invalid");
      return;
    }
    try {
      const parsed = JSON.parse(json);
      jsonInput.value = JSON.stringify(parsed);
      showResult("✓ JSON minified (whitespace removed)", "minify");
    } catch (e) {
      const location = parseErrorLine(e);
      const extra = location
        ? `<div class="error-line"><span class="error-location">${location}</span>${escapeHtml(e.message)}</div>`
        : `<div class="error-line">${escapeHtml(e.message)}</div>`;
      showResult("✗ Cannot minify: Invalid JSON", "invalid", extra);
    }
  });

  container.querySelector("#clearBtn").addEventListener("click", () => {
    jsonInput.value = "";
    result.className = "result";
    result.innerHTML = "";
  });
}
