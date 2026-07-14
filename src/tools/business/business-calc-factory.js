import { createCalc } from "../../components/calc-factory.js";

/**
 * Creates a reactive business calculator with live calculation on input change.
 *
 * @param {HTMLElement} container
 * @param {Object} config
 * @param {string} config.title
 * @param {Array} config.inputs - [{ id, placeholder, value }]
 * @param {string} config.resultHTML - HTML template with element IDs to update
 * @param {Function} config.calc - ({ get, el }) => void; get(id) returns number, el(id) returns element
 */
export function initBusinessCalc(container, { title, inputs, resultHTML, calc }) {
  const fields = inputs.map(i => ({
    id: i.id,
    label: i.placeholder,
    type: "number",
    value: i.value,
    placeholder: i.placeholder
  }));

  createCalc({
    container,
    title,
    fields,
    autoCalc: true,
    calcButtonLabel: null,
    onRender: (c, r) => {
      const get = id => {
        const el = c.querySelector(`#${id}`);
        return el ? parseFloat(el.value) || 0 : 0;
      };
      const el = id => c.querySelector(`#${id}`);
      r.innerHTML = `<div class="cf-result-grid" style="grid-template-columns:1fr;">${resultHTML}</div>`;
      calc({ get, el });
      r.classList.remove("cf-hidden");
    }
  });
}
