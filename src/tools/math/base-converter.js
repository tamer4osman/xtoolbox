export const toolConfig = {
  id: 'base-converter',
  name: 'Number Base Converter',
  category: 'math',
  description: 'Convert between decimal, binary, hexadecimal, and octal.',
  icon: '🔢',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="converter-container">
      <div class="converter-form">
        <div class="form-group">
          <label>Decimal (Base 10)</label>
          <input type="text" id="decimal" placeholder="Enter decimal" />
        </div>
        <div class="form-group">
          <label>Binary (Base 2)</label>
          <input type="text" id="binary" placeholder="Enter binary" />
        </div>
        <div class="form-group">
          <label>Hexadecimal (Base 16)</label>
          <input type="text" id="hex" placeholder="Enter hex" />
        </div>
        <div class="form-group">
          <label>Octal (Base 8)</label>
          <input type="text" id="octal" placeholder="Enter octal" />
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .converter-container { max-width: 500px; margin: 0 auto; }
    .converter-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .converter-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: monospace; font-size: var(--text-lg); }
  `;
  container.appendChild(style);

  const decimal = container.querySelector('#decimal');
  const binary = container.querySelector('#binary');
  const hex = container.querySelector('#hex');
  const octal = container.querySelector('#octal');

  decimal.addEventListener('input', () => {
    const d = parseInt(decimal.value, 10);
    if (!isNaN(d)) {
      binary.value = d.toString(2);
      hex.value = d.toString(16).toUpperCase();
      octal.value = d.toString(8);
    }
  });

  binary.addEventListener('input', () => {
    const b = parseInt(binary.value, 2);
    if (!isNaN(b)) {
      decimal.value = b.toString(10);
      hex.value = b.toString(16).toUpperCase();
      octal.value = b.toString(8);
    }
  });

  hex.addEventListener('input', () => {
    const h = parseInt(hex.value, 16);
    if (!isNaN(h)) {
      decimal.value = h.toString(10);
      binary.value = h.toString(2);
      octal.value = h.toString(8);
    }
  });

  octal.addEventListener('input', () => {
    const o = parseInt(octal.value, 8);
    if (!isNaN(o)) {
      decimal.value = o.toString(10);
      binary.value = o.toString(2);
      hex.value = o.toString(16).toUpperCase();
    }
  });
}
