export function parseUrl(url) {
  try {
    const u = new URL(url);
    const params = {};
    u.searchParams.forEach((v, k) => {
      params[k] = v;
    });
    return {
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      port: u.port,
      host: u.host,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash.replace("#", ""),
      origin: u.origin,
      params,
      valid: true
    };
  } catch {
    return { valid: false };
  }
}

export function buildUrl(parts) {
  let url = `${parts.protocol || "https"}://${parts.hostname || "example.com"}`;
  if (parts.port) url += `:${parts.port}`;
  url += parts.pathname || "/";
  const params = new URLSearchParams();
  if (parts.params) {
    Object.entries(parts.params).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
  }
  const qs = params.toString();
  if (qs) url += `?${qs}`;
  if (parts.hash) url += `#${parts.hash}`;
  return url;
}

export const toolConfig = {
  id: "url-parser",
  name: "URL Parser & Builder",
  category: "dev",
  description:
    "Parse any URL into its components or build a URL from parts. View query parameters as a table.",
  icon: "🔍",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "url parser",
    "url builder",
    "parse url",
    "query parameters",
    "url components",
    "url encoder"
  ],
  steps: [
    "Enter a URL to parse its components",
    "Edit components to build a custom URL",
    "Copy the result"
  ],
  faqs: [
    {
      question: "What URL formats are supported?",
      answer: "Any valid URL with scheme (http://, https://, ftp://, etc.)."
    },
    {
      question: "Can I edit query parameters?",
      answer:
        "Yes. Parse a URL, edit the parameter values in the table, and the built URL updates automatically."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:grid;grid-template-columns:1fr auto;gap:var(--space-4);">
        <div class="form-group" style="margin-bottom:0;">
          <label>Enter URL</label>
          <input type="url" id="up-input" class="text-input" placeholder="https://example.com/path?key=value#section" value="https://www.example.com:8080/products?category=electronics&sort=price&page=2#reviews">
        </div>
        <button class="btn btn-primary" id="up-parse" style="margin-top:24px;">Parse</button>
      </div>

      <div id="up-result" style="display:none;margin-top:var(--space-4);">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-4);">
          <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Protocol</div>
            <div id="up-protocol" style="font-weight:600;font-family:monospace;"></div>
          </div>
          <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Host</div>
            <div id="up-host" style="font-weight:600;font-family:monospace;"></div>
          </div>
          <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Port</div>
            <div id="up-port" style="font-weight:600;font-family:monospace;"></div>
          </div>
          <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Path</div>
            <div id="up-path" style="font-weight:600;font-family:monospace;word-break:break-all;"></div>
          </div>
          <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Hash</div>
            <div id="up-hash" style="font-weight:600;font-family:monospace;"></div>
          </div>
          <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Origin</div>
            <div id="up-origin" style="font-weight:600;font-family:monospace;word-break:break-all;"></div>
          </div>
        </div>

        <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);">
          <div style="font-weight:600;margin-bottom:var(--space-3);">Query Parameters (<span id="up-param-count">0</span>)</div>
          <div id="up-params-table"></div>
        </div>

        <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
            <div style="font-weight:600;">Built URL</div>
            <button class="btn btn-primary btn-sm" id="up-copy">Copy</button>
          </div>
          <div id="up-built" style="font-family:monospace;font-size:var(--text-sm);word-break:break-all;background:var(--color-code-bg, #1e1e2e);color:#cdd6f4;padding:var(--space-3);border-radius:var(--radius-md);"></div>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector("#up-input");
  const parseBtn = container.querySelector("#up-parse");
  const resultDiv = container.querySelector("#up-result");
  const protocol = container.querySelector("#up-protocol");
  const host = container.querySelector("#up-host");
  const port = container.querySelector("#up-port");
  const path = container.querySelector("#up-path");
  const hash = container.querySelector("#up-hash");
  const origin = container.querySelector("#up-origin");
  const paramsTable = container.querySelector("#up-params-table");
  const paramCount = container.querySelector("#up-param-count");
  const built = container.querySelector("#up-built");
  const copyBtn = container.querySelector("#up-copy");

  let currentParts = null;

  function esc(s) {
    return s || "—";
  }

  function parse() {
    const result = parseUrl(input.value);
    if (!result.valid) {
      resultDiv.style.display = "block";
      resultDiv.innerHTML =
        '<div style="padding:var(--space-4);color:var(--color-danger);text-align:center;">Invalid URL. Make sure it starts with http:// or https://</div>';
      return;
    }

    resultDiv.style.display = "block";
    protocol.textContent = esc(result.protocol);
    host.textContent = esc(result.hostname);
    port.textContent = esc(result.port || "(default)");
    path.textContent = esc(result.pathname);
    hash.textContent = esc(result.hash || "(none)");
    origin.textContent = esc(result.origin);

    const entries = Object.entries(result.params);
    paramCount.textContent = entries.length;

    if (entries.length === 0) {
      paramsTable.innerHTML =
        '<div style="color:var(--color-text-muted);font-size:var(--text-sm);">No query parameters</div>';
    } else {
      paramsTable.innerHTML = entries
        .map(
          ([k, v], i) => `
        <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-2);">
          <input type="text" class="text-input up-pkey" value="${esc(k)}" placeholder="Key" style="flex:1;font-family:monospace;font-size:var(--text-sm);">
          <input type="text" class="text-input up-pval" value="${esc(v)}" placeholder="Value" style="flex:2;font-family:monospace;font-size:var(--text-sm);">
        </div>
      `
        )
        .join("");
    }

    currentParts = result;
    rebuild();
  }

  function rebuild() {
    if (!currentParts) return;
    const paramInputs = paramsTable.querySelectorAll(".up-pkey, .up-pval");
    const params = {};
    const keys = paramsTable.querySelectorAll(".up-pkey");
    const vals = paramsTable.querySelectorAll(".up-pval");
    keys.forEach((kEl, i) => {
      const k = kEl.value.trim();
      const v = vals[i]?.value.trim() || "";
      if (k) params[k] = v;
    });

    const parts = {
      protocol: protocol.textContent === "(default)" ? "https" : protocol.textContent,
      hostname: host.textContent,
      port: port.textContent === "(default)" ? "" : port.textContent,
      pathname: path.textContent,
      hash: hash.textContent === "(none)" ? "" : hash.textContent,
      params
    };
    built.textContent = buildUrl(parts);
  }

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") parse();
  });
  parseBtn.addEventListener("click", parse);

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(built.textContent).catch(() => {});
  });

  parse();
}

export function destroy() {}
