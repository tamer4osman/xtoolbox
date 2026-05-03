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

  function updateDisplay() {
    container.querySelector('#current').textContent = current;
    container.querySelector('#previous').textContent = previous + (operation || '');
  }

  container.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      
      if (!isNaN(action) || action === '.') {
        if (newNumber) {
          current = action;
          newNumber = false;
        } else if (action === '.' && current.includes('.')) {
          return;
        } else {
          current += action;
        }
      } else if (action === 'clear') {
        current = '0';
        previous = '';
        operation = null;
        newNumber = true;
      } else if (action === 'backspace') {
        current = current.length > 1 ? current.slice(0, -1) : '0';
      } else if (action === 'percent') {
        current = (parseFloat(current) / 100).toString();
        newNumber = true;
      } else if (action === '+' || action === '-' || action === '*' || action === '/') {
        previous = current;
        operation = action;
        newNumber = true;
      } else if (action === '=') {
        if (previous && operation) {
          const a = parseFloat(previous);
          const b = parseFloat(current);
          let result;
          switch (operation) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': result = b !== 0 ? a / b : 'Error'; break;
            case 'mod': result = a % b; break;
          }
          current = result.toString();
          previous = '';
          operation = null;
          newNumber = true;
        }
      } else if (action === 'sqrt') {
        current = Math.sqrt(parseFloat(current)).toString();
        newNumber = true;
      } else if (action === 'pow') {
        current = Math.pow(parseFloat(current), 2).toString();
        newNumber = true;
      } else if (action === 'cube') {
        current = Math.pow(parseFloat(current), 3).toString();
        newNumber = true;
      } else if (action === 'cubert') {
        current = Math.cbrt(parseFloat(current)).toString();
        newNumber = true;
      } else if (action === 'factorial') {
        const n = parseInt(current);
        let fact = 1;
        for (let i = 2; i <= n; i++) fact *= i;
        current = fact.toString();
        newNumber = true;
      } else if (action === 'sin') {
        current = Math.sin(parseFloat(current) * Math.PI / 180).toString();
        newNumber = true;
      } else if (action === 'cos') {
        current = Math.cos(parseFloat(current) * Math.PI / 180).toString();
        newNumber = true;
      } else if (action === 'tan') {
        current = Math.tan(parseFloat(current) * Math.PI / 180).toString();
        newNumber = true;
      } else if (action === 'asin') {
        current = (Math.asin(parseFloat(current)) * 180 / Math.PI).toString();
        newNumber = true;
      } else if (action === 'acos') {
        current = (Math.acos(parseFloat(current)) * 180 / Math.PI).toString();
        newNumber = true;
      } else if (action === 'atan') {
        current = (Math.atan(parseFloat(current)) * 180 / Math.PI).toString();
        newNumber = true;
      } else if (action === 'log') {
        current = Math.log10(parseFloat(current)).toString();
        newNumber = true;
      } else if (action === 'ln') {
        current = Math.log(parseFloat(current)).toString();
        newNumber = true;
      } else if (action === 'tenpow') {
        current = Math.pow(10, parseFloat(current)).toString();
        newNumber = true;
      } else if (action === 'exp') {
        current = Math.exp(parseFloat(current)).toString();
        newNumber = true;
      } else if (action === 'pi') {
        current = Math.PI.toString();
        newNumber = true;
      } else if (action === 'e') {
        current = Math.E.toString();
        newNumber = true;
      } else if (action === 'inv') {
        current = (1 / parseFloat(current)).toString();
        newNumber = true;
      } else if (action === 'abs') {
        current = Math.abs(parseFloat(current)).toString();
        newNumber = true;
      }
      updateDisplay();
    });
  });
}
