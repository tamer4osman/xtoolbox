export const toolConfig = {
  id: 'scientific-calculator',
  name: 'Scientific Calculator',
  category: 'math',
  description: 'Perform scientific calculations with trigonometric, logarithmic, and exponential functions.',
  icon: '🧮',
  steps: ['Enter numbers', 'Select operation', 'Calculate']
};

export function render(container) {
  container.innerHTML = `
    <div class="calc-container">
      <input type="text" id="display" class="calc-display" readonly>
      <div class="calc-buttons">
        <button class="calc-btn function" data-func="sin">sin</button>
        <button class="calc-btn function" data-func="cos">cos</button>
        <button class="calc-btn function" data-func="tan">tan</button>
        <button class="calc-btn function" data-func="log">log</button>
        <button class="calc-btn function" data-func="ln">ln</button>
        <button class="calc-btn function" data-func="sqrt">√</button>
        <button class="calc-btn function" data-func="pow2">x²</button>
        <button class="calc-btn function" data-func="pow">xʸ</button>
        <button class="calc-btn" data-val="(">(</button>
        <button class="calc-btn" data-val=")">)</button>
        <button class="calc-btn" data-val="pi">π</button>
        <button class="calc-btn" data-val="e">e</button>
        <button class="calc-btn" data-val="7">7</button>
        <button class="calc-btn" data-val="8">8</button>
        <button class="calc-btn" data-val="9">9</button>
        <button class="calc-btn operator" data-val="/">÷</button>
        <button class="calc-btn clear" data-action="clear">C</button>
        <button class="calc-btn" data-val="4">4</button>
        <button class="calc-btn" data-val="5">5</button>
        <button class="calc-btn" data-val="6">6</button>
        <button class="calc-btn operator" data-val="*">×</button>
        <button class="calc-btn" data-val=".">.</button>
        <button class="calc-btn" data-val="1">1</button>
        <button class="calc-btn" data-val="2">2</button>
        <button class="calc-btn" data-val="3">3</button>
        <button class="calc-btn operator" data-val="-">−</button>
        <button class="calc-btn equals" data-action="equals">=</button>
        <button class="calc-btn" data-val="0">0</button>
        <button class="calc-btn" data-val="00">00</button>
        <button class="calc-btn" data-val="%">%</button>
        <button class="calc-btn operator" data-val="+">+</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .calc-container { max-width: 360px; margin: 0 auto; }
    .calc-display { width: 100%; padding: var(--space-4); font-size: 1.5rem; text-align: right; border: 2px solid #ddd; border-radius: var(--radius-lg); margin-bottom: var(--space-3); background: #fff; }
    .calc-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .calc-btn { padding: var(--space-3); font-size: 1.1rem; border: none; border-radius: var(--radius-md); background: #f5f5f5; cursor: pointer; transition: background 0.2s; }
    .calc-btn:hover { background: #e0e0e0; }
    .calc-btn.function { background: #e3f2fd; color: #1976d2; }
    .calc-btn.operator { background: #fff3e0; color: #e65100; }
    .calc-btn.clear { background: #ffebee; color: #c62828; }
    .calc-btn.equals { background: #1976d2; color: white; grid-row: span 2; }
    .calc-btn.equals:hover { background: #1565c0; }
  `;
  container.appendChild(style);

  const display = container.querySelector('#display');

  container.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      const func = btn.dataset.func;
      const action = btn.dataset.action;

      if (action === 'clear') {
        display.value = '';
      } else if (action === 'equals') {
        try {
          let expr = display.value
            .replace(/π/g, 'Math.PI')
            .replace(/e(?![xp])/g, 'Math.E')
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/log/g, 'Math.log10')
            .replace(/ln/g, 'Math.log')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/\^/g, '**');
          
          const result = eval(expr);
          display.value = Number.isFinite(result) ? result : 'Error';
        } catch (e) {
          display.value = 'Error';
        }
      } else if (func === 'sin' || func === 'cos' || func === 'tan' || func === 'log' || func === 'ln' || func === 'sqrt') {
        display.value += func + '(';
      } else if (func === 'pow2') {
        display.value += '**2';
      } else if (func === 'pow') {
        display.value += '**';
      } else if (val) {
        display.value += val;
      }
    });
  });

  return container;
}
