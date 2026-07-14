import { createCalc } from "../../components/calc-factory.js";

/**
 * Creates a health calculator UI: form (auto-generated from fields), calc button,
 * result panel, event binding, initial render, and shared CSS.
 *
 * @param {Object} config
 * @param {HTMLElement} config.container - DOM container
 * @param {string} config.containerClass - unique class for CSS scoping (e.g., 'bmi-container')
 * @param {Array} config.fields - field definitions: { id, label, type, value, min, max, options }
 *   type: 'number' | 'date' | 'select' | 'custom'
 *   custom fields use { type: 'custom', html: '...' } to render raw HTML
 * @param {string} [config.calcButtonLabel='Calculate'] - text for the calc button
 * @param {string} [config.extraCSS=''] - additional CSS for result panel / custom styling
 * @param {Function} config.onCalculate - (container, resultEl) => void; reads inputs, sets resultEl.innerHTML
 * @param {boolean} [config.autoCalc=true] - call onCalculate on every input change
 * @returns {{ run: Function, resultEl: HTMLElement }}
 */
export function createHealthCalculator({
  container,
  containerClass,
  fields,
  calcButtonLabel = "Calculate",
  extraCSS = "",
  onCalculate,
  autoCalc = true
}) {
  const { runCalc, resultEl } = createCalc({
    container,
    fields: fields.map(f => {
      if (f.type === "custom" || f.type === "html") {
        return { type: f.type, html: f.html };
      }
      if (f.type === "select") {
        return {
          id: f.id,
          label: f.label,
          type: "select",
          value: f.value,
          options: f.options || []
        };
      }
      return {
        id: f.id,
        label: f.label,
        type: f.type || "number",
        value: f.value,
        min: f.min,
        max: f.max
      };
    }),
    autoCalc,
    calcButtonLabel,
    onRender: onCalculate,
    extraCSS: `.${containerClass}{max-width:500px;margin:0 auto;} ${extraCSS}`
  });

  return { run: runCalc, resultEl };
}
