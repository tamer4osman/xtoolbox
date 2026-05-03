export const toolConfig = {
  id: 'base-converter',
  name: 'Number Base Converter',
  category: 'math',
  description: 'Convert numbers between binary, octal, decimal, and hexadecimal.',
  icon: '🔢',
  steps: ['Enter number', 'Select base', 'View converted values']
};

export function render(container) {
  container.innerHTML = `
    <div class="base-container">
      <div class="base-input-group">
        <label>Enter Number</label>
        <input type="text" id="base-input" placeholder="Enter a number...">
      </div>
      <div class="base-input-group">
        <label>Number Base</label>
        <select id="base-select">
          <option value="10">Decimal (10)</option>
          <option value="2">Binary (2)</option>
          <option value="8">Octal (8)</option>
          <option value="16">Hexadecimal (16)</option>
        </select>
      </div>
      <button class="base-convert">Convert</button>
      <div class="base-results">
        <div class="base-result">
          <span class="base-label">Binary (2)</span>
          <span class="base-value" id="res-binary">-</span>
        </div>
        <div class="base-result">
          <span class="base-label">Octal (8)</span>
          <span class="base-value" id="res-octal">-</span>
        </div>
        <div class="base-result">
          <span class="base-label">Decimal (10)</span>
          <span class="base-value" id="res-decimal">-</span>
        </div>
        <div class="base-result">
          <span class="base-label">Hexadecimal (16)</span>
          <span class="base-value" id="res-hex">-</span>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .base-container { max-width: 400px; margin: 0 auto; }
    .base-input-group { margin-bottom: var(--space-3); }
    .base-input-group label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .base-input-group input, .base-input-group select { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); font-size: var(--text-base); font-family: monospace; }
    .base-convert { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); font-size: var(--text-base); cursor: pointer; margin-bottom: var(--space-4); }
    .base-results { display: flex; flex-direction: column; gap: var(--space-2); }
    .base-result { display: flex; justify-content: space-between; padding: var(--space-3); background: #f5f5f5; border-radius: var(--radius-md); }
    .base-label { color: var(--color-text-secondary); font-size: var(--text-sm); }
    .base-value { font-family: monospace; font-weight: bold; }
  `;
  container.appendChild(style);

  container.querySelector('.base-convert').addEventListener('click', () => {
    const input = container.querySelector('#base-input').value.trim();
    const fromBase = parseInt(container.querySelector('#base-select').value);

    try {
      const decimal = parseInt(input, fromBase);
      
      if (isNaN(decimal)) throw new Error('Invalid number');
      
      container.querySelector('#res-binary').textContent = decimal.toString(2);
      container.querySelector('#res-octal').textContent = decimal.toString(8);
      container.querySelector('#res-decimal').textContent = decimal.toString(10);
      container.querySelector('#res-hex').textContent = decimal.toString(16).toUpperCase();
    } catch (e) {
      container.querySelector('#res-binary').textContent = 'Error';
      container.querySelector('#res-octal').textContent = 'Error';
      container.querySelector('#res-decimal').textContent = 'Error';
      container.querySelector('#res-hex').textContent = 'Error';
    }
  });

  return container;
}
