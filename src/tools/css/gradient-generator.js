export const toolConfig = {
  id: 'gradient-generator',
  name: 'CSS Gradient Generator',
  category: 'css',
  description: 'Visual editor for linear, radial, and conic CSS gradients.',
  icon: '🎨',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="gradient-container">
      <div class="preview" id="preview"></div>
      <div class="controls">
        <div class="control-group">
          <label>Type</label>
          <select id="type"><option value="linear">Linear</option><option value="radial">Radial</option><option value="conic">Conic</option></select>
        </div>
        <div class="control-group">
          <label>Angle</label>
          <input type="range" id="angle" min="0" max="360" value="90">
          <span id="angleVal">90°</span>
        </div>
        <div class="color-stops" id="colorStops">
          <div class="color-stop"><input type="color" value="#3b82f6"><input type="text" value="#3b82f6"></div>
          <div class="color-stop"><input type="color" value="#8b5cf6"><input type="text" value="#8b5cf6"></div>
        </div>
        <button id="addStopBtn" class="add-btn">+ Add Color</button>
      </div>
      <div class="output"><code id="cssOutput"></code><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .gradient-container { max-width: 700px; margin: 0 auto; }
    .gradient-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .preview { height: 200px; border-radius: var(--radius-xl); margin-bottom: var(--space-4); background: linear-gradient(90deg, #3b82f6, #8b5cf6); }
    .controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-group { margin-bottom: var(--space-3); }
    .control-group label { display: block; font-weight: 500; margin-bottom: var(--space-2); font-size: var(--text-sm); }
    .control-group select { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .control-group input[type="range"] { width: 70%; vertical-align: middle; }
    .color-stops { margin-bottom: var(--space-3); }
    .color-stop { display: flex; gap: var(--space-2); margin-bottom: var(--space-2); }
    .color-stop input[type="color"] { width: 40px; height: 40px; padding: 0; border: none; cursor: pointer; }
    .color-stop input[type="text"] { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: monospace; }
    .add-btn { width: 100%; padding: var(--space-2); background: var(--color-bg); border: 1px dashed var(--color-border); border-radius: var(--radius-md); cursor: pointer; }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output code { flex: 1; font-family: monospace; font-size: var(--text-sm); word-break: break-all; }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  function update() {
    const type = container.querySelector('#type').value;
    const angle = container.querySelector('#angle').value;
    const colors = [...container.querySelectorAll('.color-stop input[type="color"]')].map(i => i.value);
    let gradient;
    if (type === 'linear') gradient = `linear-gradient(${angle}deg, ${colors.join(', ')})`;
    else if (type === 'radial') gradient = `radial-gradient(circle, ${colors.join(', ')})`;
    else gradient = `conic-gradient(from ${angle}deg, ${colors.join(', ')})`;
    container.querySelector('#preview').style.background = gradient;
    container.querySelector('#cssOutput').textContent = `background: ${gradient};`;
    container.querySelector('#angleVal').textContent = angle + '°';
  }

  container.querySelector('#type').addEventListener('change', update);
  container.querySelector('#angle').addEventListener('input', update);
  container.querySelector('#addStopBtn').addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'color-stop';
    div.innerHTML = '<input type="color" value="#ffffff"><input type="text" value="#ffffff">';
    container.querySelector('#colorStops').appendChild(div);
    div.querySelector('input[type="color"]').addEventListener('input', update);
    div.querySelector('input[type="text"]').addEventListener('input', update);
    update();
  });
  container.querySelectorAll('.color-stop input').forEach(i => i.addEventListener('input', update));
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#cssOutput').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  update();
}
