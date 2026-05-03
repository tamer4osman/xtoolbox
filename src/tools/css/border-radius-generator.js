export function render(container) {
  container.innerHTML = `
    <div class="br-container">
      <div class="preview-box" id="preview"></div>
      <div class="controls">
        <div class="control-row">
          <label>All Corners</label>
          <input type="range" id="all" min="0" max="100" value="20">
          <span id="allVal">20px</span>
        </div>
        <div class="control-grid">
          <div class="corner"><label>TL</label><input type="range" id="tl" min="0" max="100" value="20"></div>
          <div class="corner"><label>TR</label><input type="range" id="tr" min="0" max="100" value="20"></div>
          <div class="corner"><label>BL</label><input type="range" id="bl" min="0" max="100" value="20"></div>
          <div class="corner"><label>BR</label><input type="range" id="br" min="0" max="100" value="20"></div>
        </div>
        <div class="control-row">
          <label><input type="checkbox" id="linkAll" checked> Link all corners</label>
        </div>
      </div>
      <div class="output"><code id="cssOutput"></code><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .br-container { max-width: 600px; margin: 0 auto; }
    .br-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .preview-box { width: 150px; height: 150px; margin: 0 auto var(--space-4); background: var(--color-primary); }
    .controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
    .control-row label { width: 100px; font-size: var(--text-sm); }
    .control-row input[type="range"] { flex: 1; }
    .control-row span { width: 50px; text-align: right; font-size: var(--text-sm); font-family: monospace; }
    .control-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); margin-bottom: var(--space-3); }
    .corner { text-align: center; }
    .corner label { display: block; font-size: var(--text-xs); margin-bottom: var(--space-1); }
    .corner input { width: 100%; }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output code { flex: 1; font-family: monospace; font-size: var(--text-sm); }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  function update() {
    const linked = container.querySelector('#linkAll').checked;
    const all = container.querySelector('#all').value;
    const v = linked ? all : container.querySelector('#tl').value;
    const h = linked ? all : container.querySelector('#tr').value;
    const br = linked ? all : container.querySelector('#bl').value;
    const bl = linked ? all : container.querySelector('#br').value;
    const radius = `${v}px ${h}px ${br}px ${bl}px`;
    container.querySelector('#preview').style.borderRadius = radius;
    container.querySelector('#cssOutput').textContent = `border-radius: ${radius};`;
    container.querySelector('#allVal').textContent = all + 'px';
  }

  container.querySelector('#all').addEventListener('input', () => {
    if (container.querySelector('#linkAll').checked) {
      ['tl', 'tr', 'bl', 'br'].forEach(id => container.querySelector('#' + id).value = container.querySelector('#all').value);
    }
    update();
  });
  container.querySelector('#linkAll').addEventListener('change', update);
  container.querySelectorAll('#tl, #tr, #bl, #br').forEach(i => i.addEventListener('input', update));
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#cssOutput').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  update();
}
