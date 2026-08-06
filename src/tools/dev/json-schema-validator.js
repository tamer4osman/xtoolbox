import Ajv from "ajv";
import Ajv2020 from "ajv/dist/2020";
import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "json-schema-validator",
  name: "JSON Schema Validator",
  category: "dev",
  description: "Validate JSON data against JSON Schema Draft 07 and 2020-12.",
  icon: "🧩",
  keywords: ["json", "schema", "validate", "draft", "jsonschema", "validator"],
  status: "done"
};

const EXAMPLE_SCHEMA = `{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer", "minimum": 0 },
    "email": { "type": "string", "format": "email" },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 5
    }
  },
  "required": ["name", "email"],
  "additionalProperties": false
}`;

const EXAMPLE_DATA = `{
  "name": "Ada Lovelace",
  "age": 36,
  "email": "ada@example.com",
  "tags": ["math", "logic"]
}`;

export function parseJson(text, label) {
  if (!text.trim()) return { ok: false, error: `${label} is empty.` };
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: `${label} is not valid JSON: ${e.message}`, parseError: e };
  }
}

export function findKeyLine(text, key) {
  const search = `"${key}"`;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(search)) return i + 1;
  }
  return -1;
}

export function formatAjvError(error) {
  const path = error.instancePath || "/";
  const location = path === "/" ? "root" : path;
  let description = error.message || "fails the schema";
  if (error.params) {
    const p = error.params;
    if (p.additionalProperty) {
      description = `additional property "${p.additionalProperty}" not allowed`;
    } else if (p.limit !== undefined) {
      description = `${error.message} (${p.limit})`;
    } else if (p.allowedValues) {
      description = `must be one of: ${p.allowedValues.join(", ")}`;
    }
  }
  return { location: location, message: description, keyword: error.keyword };
}

export function validateWithSchema(schemaText, dataText, draft) {
  let AjvClass = draft === "2020-12" ? Ajv2020 : Ajv;
  let ajv;
  try {
    ajv = new AjvClass({ allErrors: true, strict: false });
  } catch (e) {
    return { ok: false, fatal: true, error: `Failed to initialise Ajv: ${e.message}` };
  }

  const schemaResult = parseJson(schemaText, "Schema");
  if (!schemaResult.ok) {
    return { ok: false, fatal: true, error: schemaResult.error };
  }
  const dataResult = parseJson(dataText, "Data");
  if (!dataResult.ok) {
    return { ok: false, fatal: true, error: dataResult.error };
  }

  try {
    const validate = ajv.compile(schemaResult.value);
    const valid = validate(dataResult.value);
    if (valid) {
      return { ok: true, valid: true, errors: [] };
    }
    const lines = dataText.split("\n");
    const errors = (validate.errors || []).map(err => {
      const formatted = formatAjvError(err);
      let line = -1;
      const pointer = formatted.location;
      if (pointer !== "root") {
        const segments = pointer.split("/").filter(Boolean);
        if (segments.length > 0) {
          const last = segments[segments.length - 1];
          if (!/^\d+$/.test(last)) {
            line = findKeyLine(dataText, last);
          }
        }
      }
      let column = 1;
      if (line > 0) {
        const raw = lines[line - 1];
        column =
          (raw.search(new RegExp(pointer.split("/").filter(Boolean).pop() || ".", "i")) || 1) + 1;
      }
      return { ...formatted, line, column };
    });
    return { ok: true, valid: false, errors };
  } catch (e) {
    return { ok: false, fatal: true, error: `Invalid schema: ${e.message}` };
  }
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p>${toolConfig.description}</p>
      </div>

      <div class="schema-controls">
        <label class="control" for="draftSelect">JSON Schema draft</label>
        <select id="draftSelect">
          <option value="2020-12">2020-12</option>
          <option value="07" selected>draft-07</option>
        </select>
        <label class="control auto-toggle">
          <input type="checkbox" id="autoValidate" />
          Validate as you type
        </label>
      </div>

      <div class="schema-grid">
        <div class="schema-pane">
          <div class="pane-header">
            <label for="schemaInput">Schema</label>
            <button class="btn-secondary btn-sm" id="loadExampleBtn">Load example</button>
          </div>
          <textarea id="schemaInput" class="schema-textarea" spellcheck="false" placeholder="Paste your JSON Schema here..."></textarea>
        </div>
        <div class="schema-pane">
          <div class="pane-header">
            <label for="dataInput">Data to validate</label>
          </div>
          <textarea id="dataInput" class="schema-textarea" spellcheck="false" placeholder="Paste your JSON data here..."></textarea>
        </div>
      </div>

      <div class="schema-actions">
        <button class="btn-primary" id="validateBtn">Validate</button>
        <button class="btn-secondary" id="clearBtn">Clear</button>
      </div>

      <div id="schemaResult" class="schema-result" aria-live="polite"></div>
      <div id="schemaErrors" class="schema-errors" role="list"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .schema-controls { display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-5); }
    .schema-controls .control { font-weight: 600; }
    .schema-controls select { padding: var(--space-2) var(--space-3); border-radius: var(--radius-lg); border: var(--color-border) ; background: var(--color-surface); }
    .auto-toggle { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-weight: 500; }
    .schema-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .schema-pane { display: flex; flex-direction: column; }
    .pane-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2); }
    .pane-header label { font-weight: 700; }
    .schema-textarea {
      width: 100%; height: 320px; padding: var(--space-3);
      border: 2px solid var(--color-border); border-radius: var(--radius-xl);
      background: var(--color-surface); font-family: 'Fira Code', monospace; font-size: var(--text-xs);
      resize: vertical; line-height: 1.5;
    }
    .schema-textarea:focus { outline: none; border-color: var(--color-primary); }
    .schema-actions { display: flex; gap: var(--space-3); margin: var(--space-5) 0; }
    .schema-result { padding: var(--space-4) var(--space-5); border-radius: var(--radius-xl); font-weight: 700; }
    .schema-result.valid { background: #dcfce7; color: #166534; }
    .schema-result.invalid { background: #fee2e2; color: #991b1b; }
    .schema-result.error { background: #fef3c7; color: #92400e; }
    .schema-errors { margin-top: var(--space-3); font-size: var(--text-xs); font-family: monospace; }
    .schema-error-item { padding: var(--space-2) var(--space-3); margin-bottom: var(--space-2); background: rgba(0,0,0,0.03); border-left: 3px solid var(--color-primary); border-radius: var(--radius-lg); }
    .schema-error-path { font-weight: 700; color: var(--color-primary); }
    .schema-error-msg { color: var(--color-foreground); }
    .schema-error-meta { color: #6b7280; margin-top: 2px; }
  `;
  container.appendChild(style);

  const schemaInput = container.querySelector("#schemaInput");
  const dataInput = container.querySelector("#dataInput");
  const resultBox = container.querySelector("#schemaResult");
  const errorsBox = container.querySelector("#schemaErrors");
  const draftSelect = container.querySelector("#draftSelect");
  const autoCheck = container.querySelector("#autoValidate");
  let debounceTimer = null;

  function clearErrors() {
    errorsBox.innerHTML = "";
  }

  function doValidate() {
    const draft = draftSelect.value;
    const res = validateWithSchema(schemaInput.value, dataInput.value, draft);
    clearErrors();

    if (res.fatal) {
      resultBox.className = "schema-result error";
      resultBox.textContent = res.error;
      return;
    }

    if (res.valid) {
      resultBox.className = "schema-result valid";
      resultBox.textContent = "✓ Data is valid against the schema";
      return;
    }

    resultBox.className = "schema-result invalid";
    resultBox.textContent = `✗ Data violates the schema (${res.errors.length} error${res.errors.length === 1 ? "" : "s"})`;

    const dataLines = dataInput.value.split("\n");
    res.errors.forEach(err => {
      const item = document.createElement("div");
      item.className = "schema-error";
      item.setAttribute("role", "listitem");
      let meta = "";
      if (err.line > 0 && err.line <= dataLines.length) {
        meta = `line ${err.line}${err.column > 1 ? `, column ${err.column}` : ""}`;
      }
      item.innerHTML =
        `<span class="schema-error-path">@ ${escapeHtml(err.location)}</span>` +
        (meta ? `<span class="schema-error-meta"> — ${escapeHtml(meta)}</span><br>` : "<br>") +
        `<span class="schema-error-msg">${escapeHtml(err.description)}</span>`;
      errorsBox.appendChild(item);
    });
  }

  container.querySelector("#validateBtn").addEventListener("click", doValidate);

  container.querySelector("#clearBtn").addEventListener("click", () => {
    schemaInput.value = "";
    dataInput.value = "";
    clearErrors();
    resultBox.className = "schema-result";
    resultBox.textContent = "";
  });

  container.querySelector("#loadExampleBtn").addEventListener("click", () => {
    schemaInput.value = EXAMPLE_SCHEMA;
    dataInput.value = EXAMPLE_DATA;
    clearErrors();
    resultBox.className = "schema-result";
    resultBox.textContent = "";
  });

  function scheduleAuto() {
    if (!autoCheck.checked) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doValidate, 400);
  }
  schemaInput.addEventListener("input", scheduleAuto);
  dataInput.addEventListener("input", scheduleAuto);
  draftSelect.addEventListener("change", () => {
    if (autoCheck.checked) doValidate();
  });
}
