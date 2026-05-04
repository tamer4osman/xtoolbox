export const toolConfig = {
  id: 'percentage-calculator',
  name: 'Percentage Calculator',
  category: 'math',
  description: 'Calculate percentages: what is X% of Y, X is what % of Y, % change.',
  icon: '%',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="calc-container">
      <div class="calc-tabs">
        <button class="tab-btn active" data-tab="whatis">What is X% of Y</button>
        <button class="tab-btn" data-tab="xIsWhat">X is what % of Y</button>
        <button class="tab-btn" data-tab="change">% Change</button>
        <button class="tab-btn" data-tab="increase">% Increase</button>
        <button class="tab-btn" data-tab="difference">% Difference</button>
      </div>
      <div class="calc-content">
        <div class="tab-panel active" id="whatis">
          <div class="calc-row">
            <label>What is</label>
            <input type="number" id="p1" value="20" />
            <label>% of</label>
            <input type="number" id="v1" value="100" />
          </div>
          <div class="result" id="r1">= 20</div>
        </div>
        
        <div class="tab-panel" id="xIsWhat">
          <div class="calc-row">
            <input type="number" id="p2" value="25" />
            <label>is what % of</label>
            <input type="number" id="v2" value="100" />
          </div>
          <div class="result" id="r2">= 25%</div>
        </div>
        
        <div class="tab-panel" id="change">
          <div class="calc-row">
            <label>From</label>
            <input type="number" id="old" value="100" />
            <label>To</label>
            <input type="number" id="new" value="150" />
          </div>
          <div class="result" id="r3">+50%</div>
        </div>
        
        <div class="tab-panel" id="increase">
          <div class="calc-row">
            <label>Increase</label>
            <input type="number" id="increase-from" value="100" />
            <label>by</label>
            <input type="number" id="increase-pct" value="25" />
            <label>% =</label>
          </div>
          <div class="result" id="r4">125</div>
        </div>
        
        <div class="tab-panel" id="difference">
          <div class="calc-row">
            <input type="number" id="diff1" value="50" />
            <label>vs</label>
            <input type="number" id="diff2" value="100" />
          </div>
          <div class="result" id="r5">50%</div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .calc-container { max-width: 500px; margin: 0 auto; }
    .calc-tabs { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-4); }
    .tab-btn { flex: 1; min-width: 100px; padding: var(--space-3); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; font-size: var(--text-sm); }
    .tab-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .tab-panel { display: none; background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); }
    .tab-panel.active { display: block; }
    .calc-row { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; justify-content: center; }
    .calc-row label { font-weight: 500; }
    .calc-row input { width: 100px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); text-align: center; font-size: var(--text-lg); }
    .result { font-size: 2rem; font-weight: 700; text-align: center; padding: var(--space-6); background: var(--color-bg); border-radius: var(--radius-lg); margin-top: var(--space-4); }
  `;
  container.appendChild(style);

  function calc1() {
    const p = parseFloat(container.querySelector('#p1').value) || 0;
    const v = parseFloat(container.querySelector('#v1').value) || 0;
    container.querySelector('#r1').textContent = '= ' + (p * v / 100);
  }

  function calc2() {
    const x = parseFloat(container.querySelector('#p2').value) || 0;
    const t = parseFloat(container.querySelector('#v2').value) || 1;
    container.querySelector('#r2').textContent = (x / t * 100).toFixed(2) + '%';
  }

  function calc3() {
    const o = parseFloat(container.querySelector('#old').value) || 1;
    const n = parseFloat(container.querySelector('#new').value) || 0;
    const change = ((n - o) / o * 100);
    container.querySelector('#r3').textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
  }

  function calc4() {
    const from = parseFloat(container.querySelector('#increase-from').value) || 0;
    const pct = parseFloat(container.querySelector('#increase-pct').value) || 0;
    container.querySelector('#r4').textContent = from * (1 + pct / 100);
  }

  function calc5() {
    const d1 = parseFloat(container.querySelector('#diff1').value) || 0;
    const d2 = parseFloat(container.querySelector('#diff2').value) || 0;
    const diff = d2 > 0 ? ((d1 - d2) / d2 * 100) : 0;
    container.querySelector('#r5').textContent = diff.toFixed(2) + '%';
  }

  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector('#' + btn.dataset.tab).classList.add('active');
    });
  });

  container.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      calc1(); calc2(); calc3(); calc4(); calc5();
    });
  });

  calc1(); calc2(); calc3(); calc4(); calc5();
}
