export const toolConfig = {
  id: 'fraction-calculator',
  name: 'Fraction Calculator',
  category: 'math',
  description: 'Add, subtract, multiply, and divide fractions with steps.',
  icon: '½',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="calc-container">
      <div class="fraction-inputs">
        <div class="fraction-group">
          <input type="number" id="n1" value="1" placeholder="Num" />
          <span class="fraction-line"></span>
          <input type="number" d1="4" placeholder="Den" />
        </div>
        <div class="operators">
          <button class="op-btn active" data-op="+">+</button>
          <button class="op-btn" data-op="-">−</button>
          <button class="op-btn" data-op="*">×</button>
          <button class="op-btn" data-op="/">÷</button>
        </div>
        <div class="fraction-group">
          <input type="number" n2" value="1" placeholder="Num" />
          <span class="fraction-line"></span>
          <input d2="2" placeholder="Den" />
        </div>
      </div>
      <button id="calc-btn" class="calc-button">Calculate</button>
      <div id="result" class="result">
        <div class="result-fraction">
          <span id="rn"></span>
          <span class="fraction-line"></span>
          <span rd"></span>
        </div>
        <div class="result-mixed" id="mixed"></div>
        <div class="result-decimal" id="decimal"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .calc-container { max-width: 400px; margin: 0 auto; }
    .calc-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .fraction-inputs { display: flex; align-items: center; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-6); }
    .fraction-group { text-align: center; }
    .fraction-group input { width: 60px; padding: var(--space-2); text-align: center; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .fraction-line { display: block; width: 60px; height: 2px; background: var(--color-text); margin: var(--space-1) 0; }
    .operators { display: flex; flex-direction: column; gap: var(--space-2); }
    .op-btn { width: 40px; height: 40px; border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; background: var(--color-bg); }
    .op-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .calc-button { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .result { margin-top: var(--space-6); padding: var(--space-6); background: var(--color-surface); border-radius: var(--radius-xl); text-align: center; }
    .result-fraction { font-size: var(--text-3xl); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: var(--space-2); margin-bottom: var(--space-4); }
    .result-mixed { color: var(--color-text-secondary); margin-bottom: var(--space-2); }
    .result-decimal { font-size: var(--text-lg); color: var(--color-primary); font-weight: 600; }
  `;
  container.appendChild(style);

  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  
  function simplify(n, d) {
    const g = gcd(Math.abs(n), Math.abs(d));
    return [n / g, d / g];
  }

  container.querySelector('#calc-btn').addEventListener('click', () => {
    const n1 = parseInt(container.querySelector('#n1').value) || 0;
    const d1 = parseInt(container.querySelector('#d1').value) || 1;
    const n2 = parseInt(container.querySelector('#n2').value) || 0;
    const d2 = parseInt(container.querySelector('#d2').value) || 1;
    const op = container.querySelector('.op-btn.active').dataset.op;
    
    let rn, rd;
    switch (op) {
      case '+': rn = n1 * d2 + n2 * d1; rd = d1 * d2; break;
      case '-': rn = n1 * d2 - n2 * d1; rd = d1 * d2; break;
      case '*': rn = n1 * n2; rd = d1 * d2; break;
      case '/': rn = n1 * d2; rd = d2 === 0 ? 1 : d1 * n2; break;
    }
    
    if (rd === 0) rd = 1;
    const [simpN, simpD] = simplify(rn, rd);
    const isNegative = (simpN < 0) !== (simpD < 0);
    const absN = Math.abs(simpN);
    
    container.querySelector('#rn').textContent = Math.abs(simpN);
    container.querySelector('#rd').textContent = Math.abs(simpD);
    
    const whole = Math.floor(absN / simpD);
    const fracN = absN % Math.abs(simpD);
    const sign = isNegative ? '- ' : '';
    container.querySelector('#mixed').textContent = fracN === 0 ? '' : sign + (isNegative ? '-' : '') + whole + ' ' + fracN + '/' + Math.abs(simpD);
    container.querySelector('#decimal').textContent = '= ' + (simpN / simpD).toFixed(4);
  });

  container.querySelectorAll('.op-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}
