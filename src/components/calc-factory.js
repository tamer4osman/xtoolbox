/**
 * Universal Calculator Factory
 *
 * Creates form-based calculators from a schema definition.
 * Supports: number/text/select/custom fields, unit toggles,
 * live or button-triggered calculation, result cards, result grids.
 *
 * Usage:
 *   import { createCalc } from "../components/calc-factory.js";
 *   createCalc({
 *     container: document.getElementById("app"),
 *     fields: [
 *       { id: "price", label: "Price ($)", type: "number", value: 100 },
 *       { id: "rate", label: "Discount %", type: "number", value: 20 },
 *     ],
 *     calc({ price, rate }) {
 *       const saved = (price * rate) / 100;
 *       return {
 *         primary: { label: "You Save", value: "$" + saved.toFixed(2) },
 *         items: [{ label: "Final Price", value: "$" + (price - saved).toFixed(2) }],
 *       };
 *     },
 *   });
 */

import { escapeHtml } from "../utils/escape-html.js";

const CARD_COLORS = {
  emerald: ["#10b981", "#059669"],
  blue: ["#3b82f6", "#2563eb"],
  purple: ["#8b5cf6", "#7c3aed"],
  red: ["#ef4444", "#dc2626"],
  orange: ["#f59e0b", "#d97706"],
  cyan: ["#06b6d4", "#0891b2"]
};

function renderField(field) {
  if (field.type === "custom" || field.type === "html") return field.html;

  if (field.type === "select") {
    const opts = (field.options || [])
      .map(
        o =>
          `<option value="${escapeHtml(String(o.value))}"${String(o.value) === String(field.value) ? " selected" : ""}>${escapeHtml(o.label)}</option>`
      )
      .join("");
    return `<div class="cf-field"><label for="${escapeHtml(field.id)}">${escapeHtml(field.label)}</label><select id="${escapeHtml(field.id)}">${opts}</select></div>`;
  }

  const min = typeof field.min === "number" ? ` min="${field.min}"` : "";
  const max = typeof field.max === "number" ? ` max="${field.max}"` : "";
  const step = typeof field.step === "number" ? ` step="${field.step}"` : "";
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : "";
  const val = field.value !== undefined ? ` value="${escapeHtml(String(field.value))}"` : "";
  const suffix = field.suffix ? `<span class="cf-suffix">${escapeHtml(field.suffix)}</span>` : "";

  const inputType = field.type || "number";
  const input = `<input type="${escapeHtml(inputType)}" id="${escapeHtml(field.id)}"${val}${min}${max}${step}${placeholder} />`;

  return `<div class="cf-field"><label for="${escapeHtml(field.id)}">${escapeHtml(field.label)}</label><div class="cf-input-wrap">${input}${suffix}</div></div>`;
}

function renderUnitToggle(toggle) {
  const btns = toggle.options
    .map(
      (o, i) =>
        `<button type="button" class="cf-unit-btn${i === 0 ? " active" : ""}" data-value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</button>`
    )
    .join("");
  return `<div class="cf-unit-toggle" id="${escapeHtml(toggle.id)}">${btns}</div>`;
}

function buildStyles(resultCardColor, resultValueSize) {
  const [c1, c2] = CARD_COLORS[resultCardColor] || CARD_COLORS.emerald;
  return `
    .cf-container { max-width: 600px; margin: 0 auto; }
    .cf-header { text-align: center; margin-bottom: var(--space-6); }
    .cf-icon { font-size: 2.5rem; margin-bottom: var(--space-2); }
    .cf-title { font-size: var(--text-2xl); font-weight: 700; color: var(--color-text); margin: 0; }
    .cf-desc { color: var(--color-text-secondary); font-size: var(--text-sm); margin-top: var(--space-1); }
    .cf-form { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); margin-bottom: var(--space-6); }
    .cf-field { margin-bottom: var(--space-4); }
    .cf-field label { display: block; margin-bottom: var(--space-2); font-weight: 500; font-size: var(--text-sm); color: var(--color-text); }
    .cf-field input, .cf-field select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-text); font-size: var(--text-base); box-sizing: border-box; }
    .cf-field input:focus, .cf-field select:focus { outline: 2px solid var(--color-primary); outline-offset: -1px; border-color: var(--color-primary); }
    .cf-input-wrap { position: relative; }
    .cf-input-wrap input { padding-right: 2.5rem; }
    .cf-suffix { position: absolute; right: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--color-text-secondary); font-size: var(--text-sm); font-weight: 500; pointer-events: none; }
    .cf-unit-toggle { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
    .cf-unit-btn { flex: 1; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-text); font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .cf-unit-btn:hover { border-color: var(--color-primary); }
    .cf-unit-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .cf-calc-btn { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; font-size: var(--text-base); transition: background 0.15s; }
    .cf-calc-btn:hover { background: var(--color-primary-hover); }
    .cf-result { margin-top: var(--space-4); }
    .cf-result-card { background: linear-gradient(135deg, ${c1} 0%, ${c2} 100%); color: white; border-radius: var(--radius-xl); padding: var(--space-6) var(--space-8); text-align: center; margin-bottom: var(--space-4); }
    .cf-result-label { font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--space-2); }
    .cf-result-value { font-size: ${resultValueSize || "2.5rem"}; font-weight: 700; }
    .cf-result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); }
    .cf-result-item { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .cf-result-item .cf-ri-label { font-size: var(--text-xs); color: var(--color-text-secondary); margin-bottom: var(--space-1); }
    .cf-result-item .cf-ri-value { font-size: var(--text-lg); font-weight: 700; color: var(--color-text); }
    .cf-extras { margin-top: var(--space-4); }
    .cf-extras > * { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-4); }
    .cf-hidden { display: none !important; }
  `;
}

/**
 * @param {Object} config
 * @param {HTMLElement} config.container
 * @param {string} [config.icon]
 * @param {string} [config.title]
 * @param {string} [config.description]
 * @param {Array} [config.fields] - [{ id, label, type, value, suffix, min, max, step, placeholder, options, html }]
 * @param {Object} [config.unitToggle] - { id, options: [{ value, label }], groups: { group1: [fieldId, ...], group2: [...] } }
 * @param {boolean} [config.autoCalc=true] - live calc on every input change
 * @param {string|null} [config.calcButtonLabel='Calculate'] - null = no button (pure live calc)
 * @param {Function} config.calc - ({ ...fieldValues }) => { primary: {label, value}, items: [{label, value}], extras: string }
 * @param {Function} [config.onRender] - (container, resultEl) => void; custom result rendering (overrides calc return)
 * @param {string} [config.resultCardColor='emerald']
 * @param {string} [config.resultValueSize]
 * @param {string} [config.extraCSS]
 * @returns {{ el: HTMLElement, getValues: Function, runCalc: Function, resultEl: HTMLElement }}
 */
export function createCalc({
  container,
  icon = "",
  title = "",
  description = "",
  fields = [],
  unitToggle = null,
  autoCalc = true,
  calcButtonLabel = "Calculate",
  calc,
  onRender = null,
  resultCardColor = "emerald",
  resultValueSize = "2.5rem",
  extraCSS = ""
}) {
  if (!container) throw new Error("createCalc: container is required");
  if (!calc && !onRender) throw new Error("createCalc: calc or onRender function is required");

  const id = "cf-" + Math.random().toString(36).slice(2, 8);

  const headerHTML =
    icon || title
      ? `<div class="cf-header">
        ${icon ? `<div class="cf-icon">${icon}</div>` : ""}
        ${title ? `<h1 class="cf-title">${escapeHtml(title)}</h1>` : ""}
        ${description ? `<p class="cf-desc">${escapeHtml(description)}</p>` : ""}
      </div>`
      : "";

  const toggleHTML = unitToggle ? renderUnitToggle(unitToggle) : "";
  const fieldsHTML = fields.map(renderField).join("");
  const btnHTML =
    calcButtonLabel !== null
      ? `<button type="button" class="cf-calc-btn" id="${id}-btn">${escapeHtml(calcButtonLabel)}</button>`
      : "";

  container.innerHTML = `
    <div class="cf-container">
      ${headerHTML}
      <div class="cf-form">
        ${toggleHTML}
        ${fieldsHTML}
        ${btnHTML}
      </div>
      <div class="cf-result cf-hidden" id="${id}-result"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = buildStyles(resultCardColor, resultValueSize) + (extraCSS || "");
  container.appendChild(style);

  const root = container.querySelector(".cf-container");
  const resultEl = container.querySelector(`#${id}-result`);
  const formEl = container.querySelector(".cf-form");

  // Unit toggle wiring
  if (unitToggle && unitToggle.groups) {
    const toggleEl = container.querySelector(`#${unitToggle.id}`);
    if (toggleEl) {
      toggleEl.addEventListener("click", e => {
        const btn = e.target.closest(".cf-unit-btn");
        if (!btn) return;
        toggleEl.querySelectorAll(".cf-unit-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const activeValue = btn.dataset.value;
        const groups = unitToggle.groups;
        Object.entries(groups).forEach(([groupKey, fieldIds]) => {
          const show = groupKey === activeValue;
          fieldIds.forEach(fid => {
            const field = container.querySelector(`#${fid}`);
            if (field) {
              const wrap =
                field.closest(".cf-field") ||
                field.closest(".cf-input-wrap") ||
                field.parentElement;
              if (wrap) wrap.style.display = show ? "" : "none";
            }
          });
        });
      });
    }
  }

  function getValues() {
    const vals = {};
    fields.forEach(f => {
      if (f.type === "custom" || f.type === "html") return;
      const el = container.querySelector(`#${f.id}`);
      if (!el) return;
      vals[f.id] = f.type === "number" ? parseFloat(el.value) || 0 : el.value;
    });
    return vals;
  }

  function renderResult(result) {
    if (!result) {
      resultEl.classList.add("cf-hidden");
      return;
    }

    if (result.primary || result.items) {
      const primaryHTML = result.primary
        ? `<div class="cf-result-card">
          <div class="cf-result-label">${escapeHtml(result.primary.label)}</div>
          <div class="cf-result-value">${result.primary.value}</div>
        </div>`
        : "";

      const itemsHTML = (result.items || [])
        .map(
          item => `<div class="cf-result-item">
          <div class="cf-ri-label">${escapeHtml(item.label)}</div>
          <div class="cf-ri-value">${item.value}</div>
        </div>`
        )
        .join("");

      const gridHTML = itemsHTML ? `<div class="cf-result-grid">${itemsHTML}</div>` : "";

      const extrasHTML = result.extras ? `<div class="cf-extras">${result.extras}</div>` : "";

      resultEl.innerHTML = primaryHTML + gridHTML + extrasHTML;
    }

    resultEl.classList.remove("cf-hidden");
  }

  function runCalc() {
    if (onRender) {
      onRender(container, resultEl);
      resultEl.classList.remove("cf-hidden");
    } else if (calc) {
      const result = calc(getValues());
      renderResult(result);
    }
  }

  if (calcButtonLabel !== null) {
    const btn = container.querySelector(`#${id}-btn`);
    if (btn) btn.addEventListener("click", runCalc);
    formEl.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        runCalc();
      }
    });
  }

  if (autoCalc) {
    formEl.addEventListener("input", runCalc);
  }

  if (autoCalc || !calcButtonLabel) {
    runCalc();
  }

  return { el: root, getValues, runCalc, resultEl };
}
