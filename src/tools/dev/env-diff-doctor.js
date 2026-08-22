import { copyToClipboard } from "../../utils/clipboard.js";
import { escapeHtml } from "../../utils/escape-html.js";

export const SECRET_KEY_RE = /(PASSWORD|PASSWD|SECRET|TOKEN|API_?KEY|PRIVATE|CREDENTIAL)/i;

const KEY_RE = /^[A-Za-z_][A-Za-z0-9_.]*$/;
const INTERP_RE = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

function idxUnescapedClose(str) {
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '"' && str[i - 1] !== "\\") return i;
  }
  return -1;
}

function processEscapes(raw) {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

export function parseEnv(content) {
  const lines = String(content).split(/\r?\n/);
  const entries = [];
  const errors = [];
  let i = 0;
  while (i < lines.length) {
    const lineNo = i + 1;
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith("#")) {
      i++;
      continue;
    }
    let work = trimmed;
    const exp = /^export\s+/.exec(work);
    if (exp) work = work.slice(exp[0].length);
    const eq = work.indexOf("=");
    if (eq <= 0) {
      errors.push({ line: lineNo, type: "syntax", message: "Expected KEY=value" });
      i++;
      continue;
    }
    const key = work.slice(0, eq).trim();
    if (!KEY_RE.test(key)) {
      errors.push({ line: lineNo, type: "syntax", message: `Invalid key "${key.slice(0, 40)}"` });
      i++;
      continue;
    }
    let rest = work.slice(eq + 1).trimStart();
    const quote = rest[0] === '"' || rest[0] === "'" ? rest[0] : null;
    if (!quote) {
      const hash = /(^|\s)#/.exec(rest);
      if (hash) rest = rest.slice(0, hash.index).trimEnd();
      entries.push({ key, value: rest, line: lineNo });
      i++;
      continue;
    }
    let acc = rest.slice(1);
    let consumed = i;
    let found = quote === '"' ? idxUnescapedClose(acc) : acc.indexOf(quote);
    while (found === -1 && consumed + 1 < lines.length) {
      consumed++;
      acc += "\n" + lines[consumed];
      found = quote === '"' ? idxUnescapedClose(acc) : acc.indexOf(quote);
    }
    if (found === -1) {
      errors.push({
        line: lineNo,
        type: "syntax",
        message: `Unclosed ${quote === '"' ? "double" : "single"} quote`
      });
      i = consumed + 1;
      continue;
    }
    const body = acc.slice(0, found);
    entries.push({ key, value: quote === '"' ? processEscapes(body) : body, line: lineNo });
    i = consumed + 1;
  }
  return { entries, errors };
}

export function diffEnvs(refEntries, tgtEntries) {
  const refMap = new Map(refEntries.map(e => [e.key, e.value]));
  const tgtMap = new Map(tgtEntries.map(e => [e.key, e.value]));
  const missing = [...refMap.keys()].filter(k => !tgtMap.has(k));
  const extra = [...tgtMap.keys()].filter(k => !refMap.has(k));
  const changed = [];
  let sameCount = 0;
  for (const [k, v] of refMap) {
    if (!tgtMap.has(k)) continue;
    if (tgtMap.get(k) !== v) changed.push({ key: k, refValue: v, tgtValue: tgtMap.get(k) });
    else sameCount++;
  }
  return { missing, extra, changed, sameCount };
}

function isWeakSecret(value) {
  if (value === "") return true;
  if (/^(changeme|change_me|change-me|xxxx+|placeholder|dummy|todo|fixme)$/i.test(value))
    return true;
  if (/^<(.*>|)$/.test(value)) return true;
  if (/^your[-_]/i.test(value)) return true;
  if (/^\$\{[^}]*\}$/.test(value)) return true;
  return value.length < 8;
}

export function lintEnv(entries, knownKeys) {
  const seen = new Map();
  const issues = [];
  const defined = new Set([...entries.map(e => e.key), ...knownKeys]);
  for (const e of entries) {
    if (seen.has(e.key)) {
      issues.push({
        file: "",
        line: e.line,
        key: e.key,
        severity: "error",
        rule: "duplicate-key",
        message: `"${e.key}" is defined more than once (last one wins in most loaders)`
      });
    }
    seen.set(e.key, true);
    if (e.value === "") {
      issues.push({
        file: "",
        line: e.line,
        key: e.key,
        severity: "warn",
        rule: "empty-value",
        message: `"${e.key}" has an empty value`
      });
    } else if (!/^["']/.test(String(e.value)) && /[ \t]/.test(e.value)) {
      issues.push({
        file: "",
        line: e.line,
        key: e.key,
        severity: "warn",
        rule: "unquoted-space",
        message: `"${e.key}" has an unquoted value containing spaces`
      });
    }
    if (/[a-z]/.test(e.key[0])) {
      issues.push({
        file: "",
        line: e.line,
        key: e.key,
        severity: "info",
        rule: "lowercase-key",
        message: `"${e.key}" uses lowercase; convention prefers UPPER_SNAKE_CASE`
      });
    }
    if (SECRET_KEY_RE.test(e.key) && isWeakSecret(e.value)) {
      issues.push({
        file: "",
        line: e.line,
        key: e.key,
        severity: "error",
        rule: "weak-secret",
        message: `"${e.key}" looks like a secret but holds a placeholder or short value`
      });
    }
    INTERP_RE.lastIndex = 0;
    let m;
    while ((m = INTERP_RE.exec(e.value)) !== null) {
      if (!defined.has(m[1])) {
        issues.push({
          file: "",
          line: e.line,
          key: e.key,
          severity: "warn",
          rule: "unresolved-interp",
          message: `"${e.key}" references \${${m[1]}} which is not defined in either file`
        });
      }
    }
  }
  return issues;
}

export function findSharedSecrets(refEntries, tgtEntries) {
  const refMap = new Map(refEntries.map(e => [e.key, e]));
  const out = [];
  for (const t of tgtEntries) {
    const r = refMap.get(t.key);
    if (r && SECRET_KEY_RE.test(t.key) && t.value !== "" && r.value === t.value) {
      out.push({
        line: r.line,
        key: t.key,
        severity: "error",
        rule: "shared-secret",
        message: `"${t.key}" has the SAME real value in both files — the example/template may contain a live secret`
      });
    }
  }
  return out;
}

export function analyzePair(refText, targetText) {
  const ref = parseEnv(refText);
  const target = parseEnv(targetText);
  const knownKeys = [...new Set([...ref.entries, ...target.entries].map(e => e.key))];
  const refIssues = lintEnv(ref.entries, knownKeys).map(x => ({ ...x, file: "reference" }));
  const tgtIssues = lintEnv(target.entries, knownKeys).map(x => ({ ...x, file: "target" }));
  const refErrors = ref.errors.map(x => ({ ...x, file: "reference", severity: "error", rule: "syntax", key: "" }));
  const tgtErrors = target.errors.map(x => ({ ...x, file: "target", severity: "error", rule: "syntax", key: "" }));
  const diff = diffEnvs(ref.entries, target.entries);
  const sharedSecrets = findSharedSecrets(ref.entries, target.entries);
  const issues = [...refErrors, ...tgtErrors, ...sharedSecrets, ...refIssues, ...tgtIssues].sort(
    (a, b) =>
      ({ error: 0, warn: 1, info: 2 })[a.severity] - { error: 0, warn: 1, info: 2 }[b.severity] ||
      a.line - b.line
  );
  return { ref, target, ...diff, issues };
}

export function maskValue(value) {
  if (!value) return "(empty)";
  return "•".repeat(Math.min(Math.max(value.length, 4), 12));
}

const SEV_ICON = { error: "⛔", warn: "⚠️", info: "ℹ️" };

export function buildMarkdownReport(result, { masked = true } = {}) {
  const fmt = masked ? maskValue : v => JSON.stringify(v ?? "");
  const L = [];
  L.push("# Env Diff & Doctor Report");
  L.push("");
  L.push(`- Missing in target: **${result.missing.length}**`);
  L.push(`- Extra in target: **${result.extra.length}**`);
  L.push(`- Changed values: **${result.changed.length}**`);
  L.push(`- Findings: **${result.issues.length}**`);
  if (result.missing.length) {
    L.push("", "## Missing in Target", "");
    result.missing.forEach(k => L.push(`- ${k}`));
  }
  if (result.extra.length) {
    L.push("", "## Extra in Target", "");
    result.extra.forEach(k => L.push(`- ${k}`));
  }
  if (result.changed.length) {
    L.push("", "## Changed Values", "", "| Key | Reference | Target |", "| --- | --- | --- |");
    result.changed.forEach(c =>
      L.push(`| ${c.key} | \`${fmt(c.refValue)}\` | \`${fmt(c.tgtValue)}\` |`)
    );
  }
  if (result.issues.length) {
    L.push("", "## Findings", "");
    result.issues.forEach(i =>
      L.push(`- **[${i.severity}]** (${i.file}, line ${i.line}) ${i.message}`)
    );
  }
  if (
    !result.missing.length &&
    !result.extra.length &&
    !result.changed.length &&
    !result.issues.length
  ) {
    L.push("", "✅ Files are in sync and healthy.");
  }
  return L.join("\n") + "\n";
}

export const SAMPLE_REF = `# Application template
APP_NAME="Demo Service"
API_URL=https://api.example.com/v1
PORT=8080
MAX_RETRIES=3
LOG_LEVEL=info

# Infrastructure
DATABASE_URL=postgres://localhost:5432/demo
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_live_replace_me_in_target

# Auth
JWT_SECRET=super-secret-dev-only
`;

export const SAMPLE_TGT = `APP_NAME="Demo Service"
API_URL=https://api.staging.example.com/v2
PORT=3000
MAX_RETRIES=5
LOG_LEVEL=info
LOG_LEVEL=debug
DEBUG=*,-express:*

# App config
APP_NAME_LOCAL = My Cool App
debug_mode=true
SESSION_DRIVER=\${UNDEFINED_VAR}
DATABASE_URL=postgres://localhost:5432/demo
CACHE_URL=\${REDIS_URL}/cache
STRIPE_SECRET_KEY=sk_live_replace_me_in_target

JWT_SECRET=changeme
DB_PASSWORD=
BROKEN LINE WITHOUT EQUALS
`;

export const toolConfig = {
  id: "env-diff-doctor",
  name: "Env Diff & Doctor",
  category: "dev",
  description:
    "Compare two .env files for missing, extra, or changed keys and lint common issues like duplicate keys, unquoted spaces, empty secrets, and weak defaults.",
  icon: "🩺",
  keywords: ["env", "diff", "dotenv", "compare", "lint", "environment", "config"],
  steps: [
    "Paste your .env.example into the Reference box and your actual .env into the Target box.",
    "Review the summary chips: missing keys, extra keys, changed values, and doctor findings.",
    "Expand any section to inspect details — values stay masked until you toggle Reveal.",
    "Click Copy report to grab a Markdown summary for your PR description."
  ],
  faqs: [
    {
      question: "Are my secrets uploaded anywhere?",
      answer:
        "No. Everything runs locally in your browser. Values are masked by default and nothing leaves the page."
    },
    {
      question: "Which parsing rules does the doctor follow?",
      answer:
        "The dotenv convention: KEY=value pairs, # comments, optional export prefix, double quotes with \\n escapes, literal single quotes, and multi-line quoted values."
    },
    {
      question: "Why is a secret flagged when both files match?",
      answer:
        "If a secret-looking key holds the same real-looking value in your template and your local file, the template may contain a live credential that could get committed."
    },
    {
      question: "What counts as a weak secret?",
      answer:
        "Empty values, obvious placeholders like changeme or <paste-here>, ${VAR}-only references, or anything shorter than 8 characters on a secret-named key."
    }
  ]
};

let debounceTimer = null;

export function cleanup() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
}

export function render(container) {
  cleanup();
  container.innerHTML = `
    <style>
      .edd-toolbar { display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center; margin-bottom: var(--space-3); }
      .edd-toolbar label { display: flex; align-items: center; gap: 6px; font-size: var(--text-sm); font-weight: 600; cursor: pointer; }
      .edd-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: var(--space-3); align-items: start; }
      @media (max-width: 860px) { .edd-grid { grid-template-columns: 1fr; } .edd-swap-row { justify-content: center; } }
      .edd-col h3 { margin: 0 0 var(--space-2); font-size: var(--text-sm); }
      .edd-textarea { width: 100%; min-height: 220px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; resize: vertical; box-sizing: border-box; }
      .edd-swap-row { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding-top: 34px; }
      .edd-summary { display: flex; gap: var(--space-2); flex-wrap: wrap; margin: var(--space-4) 0; }
      .edd-chip { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 999px; padding: 4px 14px; font-size: var(--text-sm); font-weight: 600; }
      .edd-chip.bad { border-color: #dc2626; color: #dc2626; }
      .edd-chip.warn { border-color: #d97706; color: #d97706; }
      .edd-section { background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); margin-bottom: var(--space-3); }
      .edd-section h4 { margin: 0 0 var(--space-2); font-size: var(--text-sm); }
      .edd-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
      .edd-list li { font-size: var(--text-sm); display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
      .edd-kbd { font-family: ui-monospace, monospace; background: rgba(127,127,127,.12); border-radius: 4px; padding: 1px 6px; }
      .edd-val { font-family: ui-monospace, monospace; opacity: .85; word-break: break-all; }
      .edd-sev-error { color: #dc2626; }
      .edd-sev-warn { color: #d97706; }
      .edd-sev-info { color: var(--color-text-muted, #888); }
      .edd-ok { background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.4); color: #059669; border-radius: var(--radius-md); padding: var(--space-3); font-weight: 600; }
      .edd-hint { color: var(--color-text-muted, #888); font-size: var(--text-sm); }
    </style>
    <div class="edd-toolbar">
      <button type="button" class="btn-secondary" id="edd-sample">Load sample</button>
      <label><input type="checkbox" id="edd-mask" checked> Mask values</label>
      <button type="button" class="btn-secondary" id="edd-copy">Copy report</button>
    </div>
    <div class="edd-grid">
      <div class="edd-col">
        <h3>Reference <span class="edd-hint">(.env.example)</span></h3>
        <textarea class="edd-textarea" id="edd-ref" spellcheck="false" placeholder="# paste .env.example here"></textarea>
      </div>
      <div class="edd-swap-row">
        <button type="button" class="btn-secondary" id="edd-swap" title="Swap files">⇄</button>
      </div>
      <div class="edd-col">
        <h3>Target <span class="edd-hint">(.env)</span></h3>
        <textarea class="edd-textarea" id="edd-tgt" spellcheck="false" placeholder="# paste your .env here"></textarea>
      </div>
    </div>
    <div id="edd-results"><p class="edd-hint">Paste both files to see the comparison.</p></div>
  `;
  if (!container.isConnected) return;

  const $ = id => container.querySelector("#" + id);
  const refEl = $("edd-ref");
  const tgtEl = $("edd-tgt");
  const maskEl = $("edd-mask");
  const resultsEl = $("edd-results");

  function chip(label, n, cls) {
    return `<span class="edd-chip ${cls || ""}">${escapeHtml(label)}: ${n}</span>`;
  }

  function valHtml(v) {
    const shown = maskEl.checked ? maskValue(v) : JSON.stringify(v ?? "");
    return `<code class="edd-val">${escapeHtml(shown)}</code>`;
  }

  function section(title, inner) {
    return `<div class="edd-section"><h4>${title}</h4>${inner}</div>`;
  }

  function list(items) {
    return `<ul class="edd-list">${items.join("")}</ul>`;
  }

  function analyze() {
    if (!container.isConnected) return;
    const refText = refEl.value.trim();
    const tgtText = tgtEl.value.trim();
    if (!refText && !tgtText) {
      resultsEl.innerHTML = `<p class="edd-hint">Paste both files to see the comparison.</p>`;
      return;
    }
    const result = analyzePair(refText, tgtText);
    const parts = [];
    const totalFindings = result.issues.length;
    const errCount = result.issues.filter(i => i.severity === "error").length;
    parts.push(
      `<div class="edd-summary">` +
        chip("Missing", result.missing.length, result.missing.length ? "warn" : "") +
        chip("Extra", result.extra.length, result.extra.length ? "warn" : "") +
        chip("Changed", result.changed.length, result.changed.length ? "warn" : "") +
        chip("Findings", totalFindings, errCount ? "bad" : totalFindings ? "warn" : "") +
        chip("In sync", result.sameCount) +
        `</div>`
    );
    if (result.missing.length)
      parts.push(
        section(
          "Missing in Target",
          list(result.missing.map(k => `<li><span class="edd-kbd">${escapeHtml(k)}</span></li>`))
        )
      );
    if (result.extra.length)
      parts.push(
        section(
          "Extra in Target",
          list(
            result.extra.map(
              k =>
                `<li><span class="edd-kbd">${escapeHtml(k)}</span> <span class="edd-hint">not in reference</span></li>`
            )
          )
        )
      );
    if (result.changed.length)
      parts.push(
        section(
          "Changed Values",
          list(
            result.changed.map(
              c =>
                `<li><span class="edd-kbd">${escapeHtml(c.key)}</span> ${valHtml(c.refValue)} → ${valHtml(c.tgtValue)}</li>`
            )
          )
        )
      );
    if (result.issues.length)
      parts.push(
        section(
          "Doctor Findings",
          list(
            result.issues.map(
              i =>
                `<li class="edd-sev-${i.severity}">${SEV_ICON[i.severity]} <strong>[${i.severity}]</strong> <span class="edd-hint">${escapeHtml(i.file)}:L${i.line}</span> ${escapeHtml(i.message)}</li>`
            )
          )
        )
      );
    const clean =
      !result.missing.length && !result.extra.length && !result.changed.length && !totalFindings;
    if (clean) parts.unshift(`<div class="edd-ok">✅ Files are in sync and healthy.</div>`);
    resultsEl.innerHTML = parts.join("");
  }

  function scheduleAnalyze() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(analyze, 250);
  }

  refEl.addEventListener("input", scheduleAnalyze);
  tgtEl.addEventListener("input", scheduleAnalyze);
  maskEl.addEventListener("change", analyze);

  $("edd-swap").addEventListener("click", () => {
    const a = refEl.value;
    refEl.value = tgtEl.value;
    tgtEl.value = a;
    analyze();
  });

  $("edd-sample").addEventListener("click", () => {
    refEl.value = SAMPLE_REF;
    tgtEl.value = SAMPLE_TGT;
    analyze();
  });

  $("edd-copy").addEventListener("click", async () => {
    const refText = refEl.value.trim();
    const tgtText = tgtEl.value.trim();
    if (!refText && !tgtText) return;
    const report = buildMarkdownReport(analyzePair(refText, tgtText), { masked: maskEl.checked });
    await copyToClipboard(report, $("edd-copy"));
  });

  analyze();
}
