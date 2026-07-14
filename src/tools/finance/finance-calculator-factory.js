import { createCalc } from "../../components/calc-factory.js";

/**
 * Creates a finance calculator with form, result card, result grid, and extras area.
 *
 * @param {Object} config
 * @param {HTMLElement} config.container
 * @param {string} config.toolId
 * @param {string} config.icon
 * @param {string} config.title
 * @param {string} config.description
 * @param {string} [config.formHTML=''] - raw HTML for form fields
 * @param {Function} config.calculate - (values) => { primary: {label, value}, items: [{label, value}], extras: string }
 * @param {string} [config.cardColor='emerald']
 * @param {string} [config.resultValueSize='2.5rem']
 */
export function createFinanceCalculator({
  container,
  toolId: _toolId,
  icon,
  title,
  description,
  formHTML = "",
  calculate,
  cardColor = "emerald",
  resultValueSize = "2.5rem"
}) {
  if (!calculate) throw new Error("createFinanceCalculator: calculate function is required");

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = formHTML;
  const fields = [];
  tempDiv.querySelectorAll("input, select").forEach(el => {
    fields.push({
      id: el.id,
      label: el.closest(".form-group")?.querySelector("label")?.textContent || el.id,
      type: el.tagName === "SELECT" ? "select" : el.type || "number",
      value: el.value,
      min: el.min ? parseFloat(el.min) : undefined,
      max: el.max ? parseFloat(el.max) : undefined,
      step: el.step ? parseFloat(el.step) : undefined,
      placeholder: el.placeholder,
      options:
        el.tagName === "SELECT"
          ? Array.from(el.options).map(o => ({ value: o.value, label: o.textContent }))
          : undefined
    });
  });

  const calcFn = fields.length > 0 ? calculate : null;

  createCalc({
    container,
    icon,
    title,
    description,
    fields,
    autoCalc: false,
    calcButtonLabel: "Calculate",
    calc: calcFn
      ? () => {
          const vals = {};
          fields.forEach(f => {
            const el = container.querySelector(`#${f.id}`);
            if (el) vals[f.id] = el.value;
          });
          return calculate(vals);
        }
      : undefined,
    onRender:
      fields.length === 0
        ? (c, r) => {
            const form = c.querySelector(".cf-form");
            if (formHTML && !form.dataset.migrated) {
              const wrapper = document.createElement("div");
              wrapper.innerHTML = formHTML;
              const header = c.querySelector(".cf-header");
              if (header) header.insertAdjacentElement("afterend", wrapper);
              else form.insertAdjacentHTML("afterbegin", formHTML);
              form.dataset.migrated = "true";
            }
            const vals = {};
            c.querySelectorAll("input, select").forEach(el => {
              if (el.id) vals[el.id] = el.type === "number" ? parseFloat(el.value) || 0 : el.value;
            });
            const out = calculate(vals);
            r.innerHTML = "";

            if (out.primary) {
              r.innerHTML += `<div class="cf-result-card"><div class="cf-result-label">${out.primary.label}</div><div class="cf-result-value">${out.primary.value}</div></div>`;
            }
            if (out.items && out.items.length) {
              r.innerHTML += `<div class="cf-result-grid">${out.items.map(i => `<div class="cf-result-item"><div class="cf-ri-label">${i.label}</div><div class="cf-ri-value">${i.value}</div></div>`).join("")}</div>`;
            }
            if (out.extras) {
              r.innerHTML += `<div class="cf-extras">${out.extras}</div>`;
            }
            r.classList.remove("cf-hidden");
          }
        : undefined,
    resultCardColor: cardColor,
    resultValueSize
  });
}
