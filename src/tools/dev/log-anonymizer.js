export const toolConfig = {
  id: "log-anonymizer",
  name: "Log File Sensitive Data Masker",
  category: "dev",
  description:
    "Anonymize sensitive data (IPs, emails, tokens, keys) in server logs using secure client-side regex.",
  icon: "🕵️",
  accept: ".log,.txt",
  maxSizeMB: 10,
  keywords: ["log", "anonymize", "mask", "sanitize", "server", "security"],
  status: "done",
  steps: [
    "Paste or upload your server log text",
    "Select which data types to mask (IPs, emails, tokens, etc.)",
    'Click "Anonymize" to process the log',
    "Copy or download the sanitized output"
  ],
  faqs: [
    {
      question: "What types of sensitive data can this tool mask?",
      answer:
        "It can mask IP addresses (IPv4/IPv6), email addresses, API keys, tokens, database connection strings, passwords, and credit card numbers."
    },
    {
      question: "Is my log data sent to any server?",
      answer:
        "No, all processing happens entirely in your browser. Your log data never leaves your device."
    }
  ]
};

const patterns = {
  ipv4: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
  ipv6: /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  apiKey: /(?:api[_-]?key|apikey|token|secret|password|pwd|passwd)[:\s]*[=:\s]+[^\s,;"']+/gi,
  bearerToken: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g,
  dbConnection: /(?:mongodb|mysql|postgres|redis|amqp):\/\/[^\s]+/gi,
  creditCard: /\b(?:\d[ -]*?){13,19}\b/g,
  uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g
};

const masks = {
  ipv4: "[IP_V4]",
  ipv6: "[IP_V6]",
  email: "[EMAIL]",
  apiKey: "[API_KEY]",
  bearerToken: "[BEARER_TOKEN]",
  dbConnection: "[DB_CONN]",
  creditCard: "[CREDIT_CARD]",
  uuid: "[UUID]"
};

export function anonymizeLog(text, enabledPatterns = Object.keys(patterns)) {
  let result = text;
  const found = {};

  for (const key of enabledPatterns) {
    if (patterns[key]) {
      const matches = result.match(patterns[key]);
      if (matches) {
        found[key] = matches.length;
        result = result.replace(patterns[key], masks[key]);
      }
    }
  }

  return { result, found };
}

const LOG_CSS = `
    .anonymizer-container { max-width: 1000px; margin: 0 auto; }
    .input-section, .options-section, .output-section { margin-bottom: var(--space-6); }
    .log-textarea { width: 100%; height: 300px; padding: var(--space-4); border: 2px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); font-family: 'Fira Code', monospace; font-size: var(--text-sm); resize: vertical; }
    .log-textarea:focus { outline: none; border-color: var(--color-primary); }
    .log-textarea.output { background: var(--color-bg); cursor: default; }
    .file-input { display: block; padding: var(--space-3); border: 2px dashed var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); cursor: pointer; }
    .file-input:hover { border-color: var(--color-primary); }
    .checkbox-group { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-3); }
    .checkbox-label { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2); border-radius: var(--radius-md); cursor: pointer; }
    .checkbox-label:hover { background: var(--color-surface); }
    .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--color-primary); }
    .action-buttons { display: flex; gap: var(--space-3); margin: var(--space-6) 0; flex-wrap: wrap; }
    .action-buttons .btn { flex: 1; min-width: 150px; }
    .stats { padding: var(--space-4); margin-bottom: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg); display: none; }
    .stats.visible { display: block; }
    .stat-item { display: inline-block; padding: var(--space-2) var(--space-3); margin: var(--space-1); background: var(--color-primary-light); color: var(--color-primary); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 500; }`;

const LOG_HTML = `
    <div class="anonymizer-container">
      <div class="input-section">
        <div class="form-group"><label for="log-input">Server Log Input</label><textarea id="log-input" class="log-textarea" placeholder="Paste your server log here..."></textarea></div>
        <div class="form-group"><label for="file-upload">Or upload a log file:</label><input type="file" id="file-upload" accept=".log,.txt" class="file-input"></div>
      </div>
      <div class="options-section"><h3>Select data to mask:</h3>
        <div class="checkbox-group">
          <label class="checkbox-label"><input type="checkbox" id="mask-ipv4" checked> IP Addresses (IPv4)</label>
          <label class="checkbox-label"><input type="checkbox" id="mask-ipv6" checked> IP Addresses (IPv6)</label>
          <label class="checkbox-label"><input type="checkbox" id="mask-email" checked> Email Addresses</label>
          <label class="checkbox-label"><input type="checkbox" id="mask-apikey" checked> API Keys & Tokens</label>
          <label class="checkbox-label"><input type="checkbox" id="mask-bearer" checked> Bearer Tokens</label>
          <label class="checkbox-label"><input type="checkbox" id="mask-db" checked> Database Connections</label>
          <label class="checkbox-label"><input type="checkbox" id="mask-credit" checked> Credit Card Numbers</label>
          <label class="checkbox-label"><input type="checkbox" id="mask-uuid" checked> UUIDs</label>
        </div>
      </div>
      <div class="action-buttons">
        <button id="anonymize-btn" class="btn btn-primary">Anonymize Log</button>
        <button id="copy-btn" class="btn btn-secondary" disabled>Copy to Clipboard</button>
        <button id="download-btn" class="btn btn-secondary" disabled>Download Sanitized Log</button>
        <button id="clear-btn" class="btn btn-ghost">Clear</button>
      </div>
      <div class="output-section">
        <div id="stats" class="stats"></div>
        <div class="form-group"><label for="log-output">Sanitized Output</label><textarea id="log-output" class="log-textarea output" placeholder="Anonymized log will appear here..." readonly></textarea></div>
      </div>
    </div>`;

const MASK_CHECKBOX_MAP = [
  { id: "mask-ipv4", key: "ipv4" },
  { id: "mask-ipv6", key: "ipv6" },
  { id: "mask-email", key: "email" },
  { id: "mask-apikey", key: "apiKey" },
  { id: "mask-bearer", key: "bearerToken" },
  { id: "mask-db", key: "dbConnection" },
  { id: "mask-credit", key: "creditCard" },
  { id: "mask-uuid", key: "uuid" }
];

function getEnabledPatterns(container) {
  return MASK_CHECKBOX_MAP.filter(c => container.querySelector(`#${c.id}`).checked).map(c => c.key);
}

function bindLogEvents(
  container,
  { logInput, logOutput, stats, copyBtn, downloadBtn, fileUpload }
) {
  fileUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        logInput.value = ev.target.result;
      };
      reader.readAsText(file);
    }
  });
  container.querySelector("#anonymize-btn").addEventListener("click", () => {
    const text = logInput.value.trim();
    if (!text) {
      alert("Please paste or upload a log file first.");
      return;
    }
    const { result, found } = anonymizeLog(text, getEnabledPatterns(container));
    logOutput.value = result;
    const totalFound = Object.values(found).reduce((a, b) => a + b, 0);
    if (totalFound > 0) {
      stats.innerHTML =
        "<h4>Masked Items:</h4>" +
        Object.entries(found)
          .map(([key, count]) => `<span class="stat-item">${masks[key]}: ${count}</span>`)
          .join("");
    } else {
      stats.innerHTML = '<span class="stat-item">No sensitive data found</span>';
    }
    stats.classList.add("visible");
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
  });
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(logOutput.value);
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy to Clipboard";
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  });
  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([logOutput.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sanitized-log.txt";
    a.click();
    URL.revokeObjectURL(url);
  });
  container.querySelector("#clear-btn").addEventListener("click", () => {
    logInput.value = "";
    logOutput.value = "";
    stats.innerHTML = "";
    stats.classList.remove("visible");
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    fileUpload.value = "";
  });
}

export function render(container) {
  container.innerHTML = LOG_HTML;
  const style = document.createElement("style");
  style.textContent = LOG_CSS;
  container.appendChild(style);
  const logInput = container.querySelector("#log-input");
  const logOutput = container.querySelector("#log-output");
  const stats = container.querySelector("#stats");
  const copyBtn = container.querySelector("#copy-btn");
  const downloadBtn = container.querySelector("#download-btn");
  const fileUpload = container.querySelector("#file-upload");
  bindLogEvents(container, { logInput, logOutput, stats, copyBtn, downloadBtn, fileUpload });
}

export function destroy() {
  // No cleanup needed
}
