import { createElement } from '../utils/dom.js';

/**
 * Create a range slider component
 */
export function createRangeSlider({ min = 0, max = 100, value = 50, step = 1, label = '', unit = '', onChange = () => {} }) {
  let currentValue = value;

  const element = createElement('div', { className: 'range-slider-wrapper' });
  element.innerHTML = `
    <div class="range-slider-header">
      <label class="range-slider-label">${label}</label>
      <span class="range-slider-value">${value}${unit}</span>
    </div>
    <input type="range" class="range-slider-input" min="${min}" max="${max}" value="${value}" step="${step}">
    <div class="range-slider-bounds">
      <span>${min}${unit}</span>
      <span>${max}${unit}</span>
    </div>
  `;

  const input = element.querySelector('.range-slider-input');
  const display = element.querySelector('.range-slider-value');

  input.addEventListener('input', () => {
    currentValue = parseFloat(input.value);
    display.textContent = currentValue + unit;
    onChange(currentValue);
  });

  return {
    element,
    getValue: () => currentValue,
    setValue: (v) => {
      currentValue = v;
      input.value = v;
      display.textContent = v + unit;
    }
  };
}
