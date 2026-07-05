import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";

export const toolConfig = {
  id: "openapi-visualizer",
  name: "OpenAPI / Swagger Visualizer",
  category: "dev",
  description: "Visualize OpenAPI 3.x specs as interactive endpoint trees.",
  icon: "🗺️",
  accept: ".json,.yaml,.yml",
  maxSizeMB: 5,
  keywords: ["openapi", "swagger", "api", "visualize", "yaml", "rest"],
  steps: [
    "Upload or paste an OpenAPI 3.x spec",
    "Browse endpoints by tag",
    "View request/response schemas",
  ],
  faqs: [
    {
      question: "What formats are supported?",
      answer: "OpenAPI 3.0 and 3.1 in JSON or YAML format.",
    },
    {
      question: "Does it work with Swagger 2.0?",
      answer: "No, only OpenAPI 3.x specs are supported.",
    },
  ],
};

export function parseYAML(text) {
  const lines = text.split("\n");
  const root = {};
  const stack = [{ obj: root, indent: -1, parentKey: null, grandparent: null }];

  function parseValue(str) {
    const s = str.trim();
    if (s === "" || s === "null" || s === "~") return null;
    if (s === "true") return true;
    if (s === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
      return s.slice(1, -1);
    if (s.startsWith("[")) {
      try {
        return JSON.parse(s);
      } catch {
        return s;
      }
    }
    return s;
  }

  for (const line of lines) {
    if (/^\s*#/.test(line) || line.trim() === "") continue;
    const indent = line.search(/\S/);
    const trimmed = line.trim();

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const frame = stack[stack.length - 1];
    const parent = frame.obj;

    if (trimmed.startsWith("- ")) {
      const val = parseValue(trimmed.slice(2));
      if (frame.parentKey && frame.grandparent) {
        const ref = frame.grandparent[frame.parentKey];
        if (typeof ref === "object" && !Array.isArray(ref) && Object.keys(ref).length === 0) {
          frame.grandparent[frame.parentKey] = [];
        }
        if (Array.isArray(frame.grandparent[frame.parentKey])) {
          frame.grandparent[frame.parentKey].push(val);
          if (typeof val === "object" && val !== null) {
            stack.push({ obj: val, indent, parentKey: null, grandparent: null });
          }
          continue;
        }
      }
      if (Array.isArray(parent)) {
        parent.push(val);
      }
    } else if (trimmed.includes(":")) {
      const colonIdx = trimmed.indexOf(":");
      const key = trimmed.slice(0, colonIdx).trim();
      const valStr = trimmed.slice(colonIdx + 1).trim();
      if (valStr === "" || valStr.startsWith("|") || valStr.startsWith(">")) {
        parent[key] = {};
        stack.push({ obj: parent[key], indent, parentKey: key, grandparent: parent });
      } else {
        parent[key] = parseValue(valStr);
        frame.parentKey = null;
        frame.grandparent = null;
      }
    }
  }
  return root;
}

export function parseSpecText(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  return parseYAML(trimmed);
}

export function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

export function parseOpenAPI(spec) {
  const endpoints = [];
  const paths = spec.paths || {};
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (["get", "post", "put", "patch", "delete", "head", "options"].includes(method)) {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          operationId: operation.operationId || "",
          summary: operation.summary || operation.description || "",
          tags: operation.tags && operation.tags.length > 0 ? operation.tags : ["Untagged"],
          parameters: operation.parameters || [],
          requestBody: operation.requestBody || null,
          responses: operation.responses || {},
        });
      }
    }
  }
  return endpoints;
}

export function groupByTag(endpoints) {
  const groups = {};
  for (const ep of endpoints) {
    for (const tag of ep.tags) {
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(ep);
    }
  }
  return groups;
}

export function getMethodColor(method) {
  const colors = {
    GET: "#61affe",
    POST: "#49cc90",
    PUT: "#fca130",
    PATCH: "#50e3c2",
    DELETE: "#f93e3e",
    HEAD: "#9012fe",
    OPTIONS: "#0d5aa7",
  };
  return colors[method] || "#999";
}

export function render(container) {
  let spec = null;

  const upload = createFileUpload({
    accept: ".json,.yaml,.yml",
    multiple: false,
    maxSizeMB: 5,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      try {
        const text = await files[0].text();
        spec = parseSpecText(text);
        renderTree();
        showToast({ message: `Loaded: ${spec.info?.title || "OpenAPI spec"}`, type: "success" });
      } catch {
        showToast({ message: "Failed to parse spec. Check file format.", type: "error" });
      }
    },
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="paste-area" style="display:none;">
        <div class="form-group">
          <label for="spec-input">Or paste JSON/YAML</label>
          <textarea id="spec-input" class="text-input" rows="10" placeholder='{"openapi": "3.0.0", ...}'></textarea>
        </div>
        <button class="btn btn-primary" id="parse-paste-btn">Parse</button>
      </div>
      <div id="tree-area" style="display:none;"></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const pasteArea = container.querySelector("#paste-area");
  const specInput = container.querySelector("#spec-input");
  const parsePasteBtn = container.querySelector("#parse-paste-btn");
  const treeArea = container.querySelector("#tree-area");

  pasteArea.style.display = "block";

  parsePasteBtn.addEventListener("click", () => {
    try {
      spec = parseSpecText(specInput.value);
      renderTree();
      showToast({ message: `Loaded: ${spec.info?.title || "OpenAPI spec"}`, type: "success" });
    } catch {
      showToast({ message: "Invalid JSON or YAML. Check syntax.", type: "error" });
    }
  });

  function renderTree() {
    if (!spec) return;
    const endpoints = parseOpenAPI(spec);
    const groups = groupByTag(endpoints);
    const info = spec.info || {};

    treeArea.innerHTML = `
      <div style="margin-bottom:var(--space-4);">
        <h2 style="font-size:var(--text-xl);font-weight:700;">${escapeHtml(info.title || "API")}</h2>
        <p style="color:var(--color-text-muted);">${escapeHtml(info.description || "")}</p>
        <div style="font-size:var(--text-sm);color:var(--color-text-muted);">Version: ${escapeHtml(info.version || "N/A")} | Endpoints: ${endpoints.length}</div>
      </div>
      ${Object.entries(groups)
        .map(
          ([tag, eps]) => `
        <details open style="margin-bottom:var(--space-3);">
          <summary style="font-weight:600;cursor:pointer;padding:var(--space-2);background:var(--color-bg-secondary);border-radius:var(--radius-md);">
            ${escapeHtml(tag)} (${eps.length})
          </summary>
          <div style="margin-top:var(--space-2);">
            ${eps
              .map(
                (ep) => `
              <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-1);">
                <span style="background:${getMethodColor(ep.method)};color:white;padding:2px 8px;border-radius:var(--radius-sm);font-size:var(--text-xs);font-weight:700;min-width:50px;text-align:center;">${ep.method}</span>
                <code style="font-size:var(--text-sm);">${escapeHtml(ep.path)}</code>
                <span style="color:var(--color-text-muted);font-size:var(--text-sm);margin-left:auto;">${escapeHtml(ep.summary)}</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </details>
      `,
        )
        .join("")}
    `;
    treeArea.style.display = "block";
  }
}

export function destroy() {}
