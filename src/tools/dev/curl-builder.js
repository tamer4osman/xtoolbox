import { showToast } from "../../components/toast.js";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const BODY_TYPES = ["none", "JSON", "Form Data", "Raw Text"];

export const toolConfig = {
  id: "curl-builder",
  name: "cURL Command Builder",
  category: "dev",
  description:
    "Build cURL commands visually. Select method, add headers, set body, and copy the generated command.",
  icon: "🔗",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "curl",
    "curl command",
    "http request",
    "api testing",
    "rest client",
    "curl generator"
  ],
  steps: [
    "Choose HTTP method and enter URL",
    "Add headers (optional)",
    "Set request body (optional)",
    "Copy the generated curl command"
  ],
  faqs: [
    {
      question: "What HTTP methods are supported?",
      answer: "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS."
    },
    {
      question: "Can I add custom headers?",
      answer: 'Yes. Click "Add Header" to add key-value pairs. Remove any header with the × button.'
    },
    {
      question: "Is the command safe to use?",
      answer:
        "The tool generates standard curl syntax. Review the command before running it in your terminal."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:grid;grid-template-columns:1fr 3fr;gap:var(--space-3);">
        <div class="form-group" style="margin-bottom:0;">
          <label>Method</label>
          <select id="cb-method" class="text-input">${METHODS.map(m => `<option value="${m}">${m}</option>`).join("")}</select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>URL</label>
          <input type="url" id="cb-url" class="text-input" placeholder="https://api.example.com/resource" value="https://jsonplaceholder.typicode.com/posts">
        </div>
      </div>

      <div style="margin-top:var(--space-3);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <label style="margin-bottom:0;font-weight:600;">Headers</label>
          <button class="btn btn-sm btn-secondary" id="cb-add-header">+ Add Header</button>
        </div>
        <div id="cb-headers"></div>
      </div>

      <div class="form-group" style="margin-top:var(--space-2);">
        <label>Body Type</label>
        <select id="cb-body-type" class="text-input">
          ${BODY_TYPES.map(t => `<option value="${t.toLowerCase().replace(/\s+/g, "-")}">${t}</option>`).join("")}
        </select>
      </div>
      <div class="form-group" id="cb-body-group" style="display:none;">
        <label>Body Content</label>
        <textarea id="cb-body" class="text-input" rows="5" placeholder='{"key": "value"}' style="font-family:monospace;"></textarea>
      </div>

      <div style="margin-top:var(--space-4);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <label style="margin-bottom:0;font-weight:600;">Generated Command</label>
          <button class="btn btn-primary btn-sm" id="cb-copy">Copy</button>
        </div>
        <pre id="cb-output" style="background:var(--color-code-bg, #1e1e2e);color:#cdd6f4;padding:var(--space-3);border-radius:var(--radius-md);overflow-x:auto;font-size:var(--text-sm);line-height:1.6;white-space:pre-wrap;word-break:break-all;min-height:60px;font-family:monospace;"></pre>
      </div>
    </div>
  `;

  const method = container.querySelector("#cb-method");
  const url = container.querySelector("#cb-url");
  const headersDiv = container.querySelector("#cb-headers");
  const bodyType = container.querySelector("#cb-body-type");
  const bodyGroup = container.querySelector("#cb-body-group");
  const body = container.querySelector("#cb-body");
  const output = container.querySelector("#cb-output");
  const copyBtn = container.querySelector("#cb-copy");

  let headerRows = [];

  function escShell(s) {
    return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/`/g, "\\`").replace(/\$/g, "\\$");
  }

  function addHeaderRow(key = "", value = "") {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:var(--space-2);margin-bottom:var(--space-2);";
    row.innerHTML = `
      <input type="text" class="text-input h-key" placeholder="Header name" value="${key}" style="flex:1;font-family:monospace;font-size:var(--text-sm);">
      <input type="text" class="text-input h-value" placeholder="Value" value="${value}" style="flex:2;font-family:monospace;font-size:var(--text-sm);">
      <button class="btn btn-sm btn-secondary h-remove" style="flex-shrink:0;">×</button>
    `;
    row.querySelector(".h-remove").addEventListener("click", () => {
      row.remove();
      headerRows = headerRows.filter(r => r !== row);
      generate();
    });
    row.querySelectorAll("input").forEach(inp => inp.addEventListener("input", generate));
    headersDiv.appendChild(row);
    headerRows.push(row);
    generate();
  }

  function getHeaders() {
    return headerRows
      .map(row => ({
        key: row.querySelector(".h-key").value.trim(),
        value: row.querySelector(".h-value").value.trim()
      }))
      .filter(h => h.key);
  }

  function generate() {
    const m = method.value;
    const u = url.value.trim();
    const headers = getHeaders();
    const bt = bodyType.value;
    const bd = body.value.trim();

    let cmd = `curl -X ${m}`;

    headers.forEach(h => {
      cmd += ` \\\n  -H "${escShell(h.key)}: ${escShell(h.value)}"`;
    });

    if (bt !== "none" && bd) {
      if (bt === "json") {
        cmd += ` \\\n  -H "Content-Type: application/json"`;
        cmd += ` \\\n  -d '${bd.replace(/'/g, "'\\''")}'`;
      } else if (bt === "form-data") {
        cmd += ` \\\n  -H "Content-Type: application/x-www-form-urlencoded"`;
        cmd += ` \\\n  -d '${bd.replace(/'/g, "'\\''")}'`;
      } else if (bt === "raw-text") {
        cmd += ` \\\n  -d '${bd.replace(/'/g, "'\\''")}'`;
      }
    }

    cmd += ` \\\n  "${escShell(u)}"`;
    output.textContent = cmd || "Enter a URL to generate the command";
  }

  container.querySelector("#cb-add-header").addEventListener("click", () => addHeaderRow());

  method.addEventListener("change", generate);
  url.addEventListener("input", generate);
  bodyType.addEventListener("change", () => {
    bodyGroup.style.display = bodyType.value === "none" ? "none" : "block";
    const ph = {
      json: '{"key": "value"}',
      "form-data": "key1=value1&key2=value2",
      "raw-text": "Raw text body content"
    };
    body.placeholder = ph[bodyType.value] || "";
    generate();
  });
  body.addEventListener("input", generate);

  copyBtn.addEventListener("click", () => {
    const text = output.textContent;
    if (!text || text === "Enter a URL to generate the command") return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast({ message: "Copied!", type: "success" });
      })
      .catch(() => {});
  });

  addHeaderRow("Content-Type", "application/json");
  generate();
}

export function destroy() {}
