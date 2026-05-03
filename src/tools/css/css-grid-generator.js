export function render(container) {
  container.innerHTML = `
    <div class="grid-container">
      <div class="controls">
        <div class="control-row">
          <label>Columns</label>
          <input type="text" id="columns" value="1fr 1fr 1fr" placeholder="e.g. 1fr 1fr 1fr">
        </div>
        <div class="control-row">
          <label>Rows</label>
          <input type="text" id="rows" value="auto auto" placeholder="e.g. auto 100px">
        </div>
        <div class="control-row">
          <label>Gap</label>
          <input type="range" id="gap" min="0" max="50" value="16">
          <span id="gapVal">16px</span>
        </div>
        <div class="control-row">
          <label>Justify Items</label>
          <select id="justify"><option value="stretch">stretch</option><option value="start">start</option><option value="end">end</option><option value="center">center</option></select>
        </div>
        <div class="control-row">
          <label>Align Items</label>
          <select id="align"><option value="stretch">stretch</option><option value="start">start</option><option value="end">end</option><option value="center">center</option></select>
        </div>
      </div>
      <div class="preview">
        <div class="grid-box">1</div>
        <div class="grid-box">2</div>
        <div class="grid-box">3</div>
        <div class="grid-box">4</div>
        <div class="grid-box">5</div>
        <div class="grid-box">6</div>
      </div>
      <div class="output"><code id="cssOutput"></code><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .grid-container { max-width: 800px; margin: 0 auto; }
    .grid-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
    .control-row label { width: 100px; font-size: var(--text-sm); }
    .control-row input[type="text"] { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .control-row select { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .control-row input[type="range"] { flex: 1; }
    .control-row span { width: 50px; text-align: right; font-size: var(--text-sm); font-family: monospace; }
    .preview { display: grid; background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); min-height: 200px; margin-bottom: var(--space-4); }
    .grid-box { background: var(--color-primary); color: white; padding: var(--space-4); display: flex; align-items: center; justify-content: center; font-weight: 600; border-radius: var(--radius-md); }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output code { flex: 1; font-family: monospace; font-size: var(--text-sm); }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  function update() {
    const cols = container.querySelector('#columns').value;
    const rows = container.querySelector('#rows').value;
    const gap = container.querySelector('#gap').value;
    const justify = container.querySelector('#justify').value;
    const align = container.querySelector('#align').value;
    const grid = container.querySelector('.preview');
    grid.style.gridTemplateColumns = cols;
    grid.style.gridTemplateRows = rows;
    grid.style.gap = gap + 'px';
    grid.style.justifyItems = justify;
    grid.style.alignItems = align;
    container.querySelector('#cssOutput').textContent = `.container {
  display: grid;
  grid-template-columns: ${cols};
  grid-template-rows: ${rows};
  gap: ${gap}px;
  justify-items: ${justify};
  align-items: ${align};
}`;
    container.querySelector('#gapVal').textContent = gap + 'px';
  }

  container.querySelectorAll('input, select').forEach(i => i.addEventListener('input', update));
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#cssOutput').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  update();
}
