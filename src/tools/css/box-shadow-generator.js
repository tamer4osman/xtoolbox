export const toolConfig = {
  id: 'box-shadow-generator',
  name: 'Box Shadow Generator',
  category: 'css',
  description: 'Visual editor for CSS box-shadow with live preview.',
  icon: '🔲',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="shadow-container">
      <div class="preview-box" id="preview"></div>
      <div class="controls">
        <div class="control-row">
          <label>Horizontal</label>
          <input type="range" id="h" min="-50" max="50" value="10">
          <span id="hVal">10px</span>
        </div>
        <div class="control-row">
          <label>Vertical</label>
          <input type="range" id="v" min="-50" max="50" value="10">
          <span id="vVal">10px</span>
        </div>
        <div class="control-row">
          <label>Blur</label>
          <input type="range" id="blur" min="0" max="100" value="20">
          <span id="blurVal">20px</span>
        </div>
        <div class="control-row">
          <label>Spread</label>
          <input type="range" id="spread" min="-50" max="50" value="0">
          <span id="spreadVal">0px</span>
        </div>
        <div class="control-row">
          <label>Color</label>
          <input type="color" id="color" value="#000000">
          <input type="range" id="opacity" min="0" max="100" value="25">
          <span id="opacityVal">25%</span>
        </div>
        <div class="control-row">
          <label><input type="checkbox" id="inset"> Inset</label>
        </div>
      </div>
      <div class="output"><code id="cssOutput"></code><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .shadow-container { max-width: 600px; margin: 0 auto; }
    .shadow-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .preview-box { width: 150px; height: 150px; margin: 0 auto var(--space-4); background: white; border-radius: var(--radius-lg); }
    .controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
    .control-row label { width: 80px; font-size: var(--text-sm); }
    .control-row input[type="range"] { flex: 1; }
    .control-row input[type="color"] { width: 40px; height: 30px; }
    .control-row span { width: 50px; text-align: right; font-size: var(--text-sm); font-family: monospace; }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output code { flex: 1; font-family: monospace; font-size: var(--text-sm); }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  function update() {
    const h = container.querySelector('#h').value;
    const v = container.querySelector('#v').value;
    const blur = container.querySelector('#blur').value;
    const spread = container.querySelector('#spread').value;
    const color = container.querySelector('#color').value;
    const opacity = container.querySelector('#opacity').value;
    const inset = container.querySelector('#inset').checked;
    const rgba = '#' + color.slice(1) + Math.round(opacity * 2.55).toString(16).padStart(2, '0');
    const shadow = `${inset ? 'inset ' : ''}${h}px ${v}px ${blur}px ${spread}px ${rgba}`;
    container.querySelector('#preview').style.boxShadow = shadow;
    container.querySelector('#cssOutput').textContent = `box-shadow: ${shadow};`;
    container.querySelector('#hVal').textContent = h + 'px';
    container.querySelector('#vVal').textContent = v + 'px';
    container.querySelector('#blurVal').textContent = blur + 'px';
    container.querySelector('#spreadVal').textContent = spread + 'px';
    container.querySelector('#opacityVal').textContent = opacity + '%';
  }

  container.querySelectorAll('input').forEach(i => i.addEventListener('input', update));
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#cssOutput').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  update();
}
