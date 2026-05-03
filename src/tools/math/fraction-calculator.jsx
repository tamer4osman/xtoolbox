export const toolConfig = {
  id: 'fraction-calculator',
  name: 'Fraction Calculator',
  category: 'math',
  description: 'Perform arithmetic operations with fractions, simplify, and convert to decimals.',
  icon: '½',
  steps: ['Enter fractions', 'Select operation', 'Calculate']
};

export function render(container) {
  container.innerHTML = `
    <div class="frac-container">
      <div class="frac-inputs">
        <div class="frac-box">
          <input type="number" id="num1" placeholder="1">
          <span class="frac-line"></span>
          <input type="number" id="den1" placeholder="2">
        </div>
        <div class="frac-ops">
          <button class="frac-op active" data-op="+">+</button>
          <button class="frac-op" data-op="-">−</button>
          <button class="frac-op" data-op="*">×</button>
          <button class="frac-op" data-op="/">÷</button>
        </div>
        <div class="frac-box">
          <input type="number" id="num2" placeholder="1">
          <span class="frac-line"></span>
          <input type="number" id="den2" placeholder="4">
        </div>
      </div>
      <button class="frac-calc">Calculate</button>
      <div class="frac-result" id="frac-result"></div>
      <div class="frac-decimal" id="frac-decimal"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .frac-container { max-width: 400px; margin: 0 auto; text-align: center; }
    .frac-inputs { display: flex; align-items: center; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-4); }
    .frac-box { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .frac-box input { width: 70px; padding: var(--space-3); text-align: center; font-size: var(--text-xl); border: 2px solid #ddd; border-radius: var(--radius-md); }
    .frac-line { width: 70px; height: 2px; background: #333; }
    .frac-ops { display: flex; flex-direction: column; gap: 8px; }
    .frac-op { width: 40px; height: 40px; border: none; background: #f5f5f5; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-lg); font-weight: bold; }
    .frac-op.active { background: var(--color-primary); color: white; }
    .frac-calc { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); font-size: var(--text-base); cursor: pointer; margin-bottom: var(--space-4); }
    .frac-result { padding: var(--space-4); background: #f5f5f5; border-radius: var(--radius-lg); font-size: var(--text-2xl); font-weight: bold; margin-bottom: var(--space-3); }
    .frac-decimal { color: var(--color-text-secondary); font-size: var(--text-base); }
  `;
  container.appendChild(style);

  let currentOp = '+';
  container.querySelectorAll('.frac-op').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.frac-op').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOp = btn.dataset.op;
    });
  });

  container.querySelector('.frac-calc').addEventListener('click', () => {
    const n1 = parseInt(container.querySelector('#num1').value) || 0;
    const d1 = parseInt(container.querySelector('#den1').value) || 1;
    const n2 = parseInt(container.querySelector('#num2').value) || 0;
    const d2 = parseInt(container.querySelector('#den2').value) || 1;

    let num, den;
    switch (currentOp) {
      case '+': num = n1 * d2 + n2 * d1; den = d1 * d2; break;
      case '-': num = n1 * d2 - n2 * d1; den = d1 * d2; break;
      case '*': num = n1 * n2; den = d1 * d2; break;
      case '/': num = n1 * d2; den = d1 * n2; break;
    }

    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(Math.abs(num), Math.abs(den));
    num /= divisor;
    den /= divisor;

    const result = num === 0 ? '0' : den === 1 ? `${num}` : `${num}/${den}`;
    const decimal = den !== 0 ? (num / den).toFixed(4).replace(/\.?0+$/, '') : 'undefined';

    container.querySelector('#frac-result').textContent = `= ${result}`;
    container.querySelector('#frac-decimal').textContent = `= ${decimal}`;
  });

  return container;
}
