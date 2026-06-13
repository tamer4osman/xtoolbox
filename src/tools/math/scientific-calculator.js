export const toolConfig = {
  id: 'scientific-calculator',
  name: 'Scientific Calculator',
  category: 'math',
  description: 'Full scientific calculator with trig, log, sqrt, and more.',
  icon: '🔢',
  status: 'done'
};

export function calculate(value, operation) {
  const n = parseFloat(value);
  switch (operation) {
    case 'sqrt': return Math.sqrt(n);
    case 'pow': return Math.pow(n, 2);
    case 'cube': return Math.pow(n, 3);
    case 'cubert': return Math.cbrt(n);
    case 'inv': return 1 / n;
    case 'abs': return Math.abs(n);
    case 'sin': return Math.sin(n * Math.PI / 180);
    case 'cos': return Math.cos(n * Math.PI / 180);
    case 'tan': return Math.tan(n * Math.PI / 180);
    case 'asin': return Math.asin(n) * 180 / Math.PI;
    case 'acos': return Math.acos(n) * 180 / Math.PI;
    case 'atan': return Math.atan(n) * 180 / Math.PI;
    case 'log': return Math.log10(n);
    case 'ln': return Math.log(n);
    case 'exp': return Math.exp(n);
    case 'tenpow': return Math.pow(10, n);
    case 'factorial':
      const num = parseInt(value);
      let fact = 1;
      for (let i = 2; i <= num; i++) fact *= i;
      return fact;
    case 'pi': return Math.PI;
    case 'e': return Math.E;
    default: return null;
  }
}

export function render(container) {
  container.innerHTML = `
    <div class="calc-container">
      <div class="calc-display">
        <div class="calc-previous" id="previous"></div>
        <div class="calc-current" id="current">0</div>
      </div>
      <div class="calc-buttons">
        <button class="calc-btn function" data-action="clear">C</button>
        <button class="calc-btn function" data-action="backspace">⌫</button>
        <button class="calc-btn function" data-action="percent">%</button>
        <button class="calc-btn operator" data-action="/">÷</button>
        
        <button class="calc-btn" data-action="7">7</button>
        <button class="calc-btn" data-action="8">8</button>
        <button class="calc-btn" data-action="9">9</button>
        <button class="calc-btn operator" data-action="*">×</button>
        
        <button class="calc-btn" data-action="4">4</button>
        <button class="calc-btn" data-action="5">5</button>
        <button class="calc-btn" data-action="6">6</button>
        <button class="calc-btn operator" data-action="-">−</button>
        
        <button class="calc-btn" data-action="1">1</button>
        <button class="calc-btn" data-action="2">2</button>
        <button class="calc-btn" data-action="3">3</button>
        <button class="calc-btn operator" data-action="+">+</button>
        
        <button class="calc-btn zero" data-action="0">0</button>
        <button class="calc-btn" data-action=".">.</button>
        <button class="calc-btn equals" data-action="=">=</button>
        
        <button class="calc-btn func" data-action="sin">sin</button>
        <button class="calc-btn func" data-action="cos">cos</button>
        <button class="calc-btn func" data-action="tan">tan</button>
        <button class="calc-btn func" data-action="sqrt">√</button>
        
        <button class="calc-btn func" data-action="pow">x²</button>
        <button class="calc-btn func" data-action="log">log</button>
        <button class="calc-btn func" data-action="ln">ln</button>
        <button class="calc-btn func" data-action="pi">π</button>
        
        <button class="calc-btn func" data-action="exp">eˣ</button>
        <button class="calc-btn func" data-action="cube">x³</button>
        <button class="calc-btn func" data-action="cubert">∛</button>
        <button class="calc-btn func" data-action="factorial">n!</button>
        
        <button class="calc-btn func" data-action="asin">sin⁻¹</button>
        <button class="calc-btn func" data-action="acos">cos⁻¹</button>
        <button class="calc-btn func" data-action="atan">tan⁻¹</button>
        <button class="calc-btn func" data-action="tenpow">10ˣ</button>
        
        <button class="calc-btn func" data-action="e">e</button>
        <button class="calc-btn func" data-action="inv">1/x</button>
        <button class="calc-btn func" data-action="abs">|x|</button>
        <button class="calc-btn func" data-action="mod">mod</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .calc-container { max-width: 380px; margin: 0 auto; background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); }
    .calc-display { background: #1a1a2e; color: white; padding: var(--space-4); border-radius: var(--radius-lg); text-align: right; margin-bottom: var(--space-4); }
    .calc-previous { font-size: var(--text-sm); color: rgba(255,255,255,0.6); min-height: 1.5em; }
    .calc-current { font-size: 2rem; font-weight: 600; word-break: break-all; }
    .calc-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); }
    .calc-btn { padding: var(--space-3); font-size: var(--text-lg); border: none; border-radius: var(--radius-md); cursor: pointer; background: var(--color-bg); transition: all 0.2s; }
    .calc-btn:hover { transform: scale(1.05); }
    .calc-btn:active { transform: scale(0.95); }
    .calc-btn.operator { background: #f59e0b; color: white; }
    .calc-btn.function { background: #6b7280; color: white; }
    .calc-btn.func { background: #3b82f6; color: white; font-size: var(--text-sm); }
    .calc-btn.equals { background: #10b981; color: white; }
    .calc-btn.zero { grid-column: span 2; }
  `;
  container.appendChild(style);

  let current = '0';
  let previous = '';
  let operation = null;
  let newNumber = true;

  const UNARY_OPS = ['sqrt', 'pow', 'cube', 'cubert', 'factorial', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'exp', 'tenpow', 'inv', 'abs'];
  const BINARY_OPS = ['+', '-', '*', '/'];

  function updateDisplay() {
    container.querySelector('#current').textContent = current;
    container.querySelector('#previous').textContent = previous + (operation || '');
  }

  function handleDigit(action) {
    if (newNumber) {
      current = action;
      newNumber = false;
    } else if (action === '.' && current.includes('.')) {
      return;
    } else {
      current += action;
    }
  }

  function handleClear() {
    current = '0';
    previous = '';
    operation = null;
    newNumber = true;
  }

  function handleBinaryOp(action) {
    previous = current;
    operation = action;
    newNumber = true;
  }

  function handleEquals() {
    if (!previous || !operation) return;
    const a = parseFloat(previous);
    const b = parseFloat(current);
    const ops = { '+': a + b, '-': a - b, '*': a * b, '/': b !== 0 ? a / b : 'Error', 'mod': a % b };
    current = (ops[operation] ?? 'Error').toString();
    previous = '';
    operation = null;
    newNumber = true;
  }

  function handleUnaryOp(action) {
    const result = calculate(current, action);
    current = (result !== null && !isNaN(result) && isFinite(result)) ? result.toString() : 'Error';
    newNumber = true;
  }

  container.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const isDigit = !isNaN(action) || action === '.';

      if (isDigit) handleDigit(action);
      else if (action === 'clear') handleClear();
      else if (action === 'backspace') current = current.length > 1 ? current.slice(0, -1) : '0';
      else if (action === 'percent') { current = (parseFloat(current) / 100).toString(); newNumber = true; }
      else if (BINARY_OPS.includes(action)) handleBinaryOp(action);
      else if (action === '=') handleEquals();
      else if (UNARY_OPS.includes(action) || action === 'pi' || action === 'e') handleUnaryOp(action);

      updateDisplay();
    });
  });
}
