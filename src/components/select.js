import { createElement } from '../utils/dom.js';

/**
 * Create a styled select component
 */
export function createSelect({ options, value, label, onChange }) {
  const wrapper = createElement('div', { className: 'form-group' });

  if (label) {
    const labelEl = createElement('label', { textContent: label });
    wrapper.appendChild(labelEl);
  }

  const select = createElement('select', { className: 'select-input' });
  options.forEach(opt => {
    const option = createElement('option', { value: opt.value, textContent: opt.label });
    if (opt.value === value) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    if (onChange) onChange(select.value);
  });

  wrapper.appendChild(select);

  return {
    element: wrapper,
    getValue: () => select.value,
    setValue: (v) => { select.value = v; }
  };
}
