export const toolConfig = {
  id: 'css-triangle-generator',
  name: 'CSS Pure Triangle Code Generator',
  category: 'css',
  description: 'Visually construct minimal pure border-based CSS triangles in any direction.',
  icon: '🔺',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="tri-container">
      <div class="preview-area">
        <div class="preview-box" id="preview"></div>
      </div>
      <div class="controls">
        <div class="control-row">
          <label>Direction</label>
          <div class="dir-btns">
            <button class="dir-btn active" data-dir="up">▲</button>
            <button class="dir-btn" data-dir="down">▼</button>
            <button class="dir-btn" data-dir="left">◀</button>
            <button class="dir-btn" data-dir="right">▶</button>
          </div>
        </div>
        <div class="control-row">
          <label>Size</label>
          <input type="range" id="size" min="10" max="150" value="60">
          <span id="sizeVal">60px</span>
        </div>
        <div class="control-row">
          <label>Color</label>
          <input type="color" id="color" value="#3b82f6">
          <span id="colorVal">#3b82f6</span>
        </div>
        <div class="control-row">
          <label>Rotate</label>
          <input type="range" id="rotate" min="0" max="360" value="0">
          <span id="rotateVal">0°</span>
        </div>
      </div>
      <div class="output">
        <code id="cssOutput"></code>
        <button id="copyBtn">Copy</button>
      </div>
      <div class="html-output">
        <label>HTML</label>
        <code id="htmlOutput">&lt;div class="triangle"&gt;&lt;/div&gt;</code>
        <button id="copyHtmlBtn">Copy</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tri-container { max-width: 600px; margin: 0 auto; }
    .preview-area { display: flex; justify-content: center; align-items: center; min-height: 200px; background: repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 50% / 20px 20px; border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
    .control-row label { width: 70px; font-size: var(--text-sm); font-weight: 500; }
    .control-row input[type="range"] { flex: 1; }
    .control-row input[type="color"] { width: 40px; height: 32px; border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; padding: 2px; }
    .control-row span { width: 60px; text-align: right; font-size: var(--text-sm); font-family: monospace; }
    .dir-btns { display: flex; gap: var(--space-2); }
    .dir-btn { width: 40px; height: 40px; border: 2px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .dir-btn:hover { border-color: var(--color-primary); }
    .dir-btn.active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
    .output, .html-output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); margin-bottom: var(--space-3); align-items: center; }
    .output code, .html-output code { flex: 1; font-family: monospace; font-size: var(--text-sm); word-break: break-all; }
    .html-output label { font-size: var(--text-xs); font-weight: 600; color: var(--color-text-secondary); width: 40px; }
    #copyBtn, #copyHtmlBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); white-space: nowrap; }
    #copyBtn:hover, #copyHtmlBtn:hover { background: var(--color-primary-hover); }
  `;
  container.appendChild(style);

  let dir = 'up';
  const sizeEl = container.querySelector('#size');
  const colorEl = container.querySelector('#color');
  const rotateEl = container.querySelector('#rotate');
  const sizeVal = container.querySelector('#sizeVal');
  const colorVal = container.querySelector('#colorVal');
  const rotateVal = container.querySelector('#rotateVal');
  const preview = container.querySelector('#preview');
  const cssOutput = container.querySelector('#cssOutput');
  const htmlOutput = container.querySelector('#htmlOutput');

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function update() {
    const size = parseInt(sizeEl.value);
    const color = colorEl.value;
    const rotate = parseInt(rotateEl.value);
    const half = Math.round(size / 2);

    sizeVal.textContent = size + 'px';
    colorVal.textContent = color;
    rotateVal.textContent = rotate + '°';

    let borderCSS = '';
    if (dir === 'up') {
      borderCSS = `width: 0;\n  height: 0;\n  border-left: ${half}px solid transparent;\n  border-right: ${half}px solid transparent;\n  border-bottom: ${size}px solid ${color};`;
    } else if (dir === 'down') {
      borderCSS = `width: 0;\n  height: 0;\n  border-left: ${half}px solid transparent;\n  border-right: ${half}px solid transparent;\n  border-top: ${size}px solid ${color};`;
    } else if (dir === 'left') {
      borderCSS = `width: 0;\n  height: 0;\n  border-top: ${half}px solid transparent;\n  border-bottom: ${half}px solid transparent;\n  border-right: ${size}px solid ${color};`;
    } else if (dir === 'right') {
      borderCSS = `width: 0;\n  height: 0;\n  border-top: ${half}px solid transparent;\n  border-bottom: ${half}px solid transparent;\n  border-left: ${size}px solid ${color};`;
    }

    const transform = rotate ? `\n  transform: rotate(${rotate}deg);` : '';
    const fullCSS = `.triangle {\n  ${borderCSS}${transform}\n}`;

    cssOutput.textContent = fullCSS;
    htmlOutput.textContent = '<div class="triangle"></div>';

    // live preview
    preview.style.width = '0';
    preview.style.height = '0';
    preview.style.border = 'none';
    preview.style.transform = '';

    if (dir === 'up') {
      preview.style.borderLeft = half + 'px solid transparent';
      preview.style.borderRight = half + 'px solid transparent';
      preview.style.borderBottom = size + 'px solid ' + color;
    } else if (dir === 'down') {
      preview.style.borderLeft = half + 'px solid transparent';
      preview.style.borderRight = half + 'px solid transparent';
      preview.style.borderTop = size + 'px solid ' + color;
    } else if (dir === 'left') {
      preview.style.borderTop = half + 'px solid transparent';
      preview.style.borderBottom = half + 'px solid transparent';
      preview.style.borderRight = size + 'px solid ' + color;
    } else if (dir === 'right') {
      preview.style.borderTop = half + 'px solid transparent';
      preview.style.borderBottom = half + 'px solid transparent';
      preview.style.borderLeft = size + 'px solid ' + color;
    }
    if (rotate) preview.style.transform = 'rotate(' + rotate + 'deg)';
  }

  container.querySelectorAll('.dir-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dir = btn.dataset.dir;
      update();
    });
  });

  sizeEl.addEventListener('input', update);
  colorEl.addEventListener('input', update);
  rotateEl.addEventListener('input', update);

  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(cssOutput.textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });

  container.querySelector('#copyHtmlBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(htmlOutput.textContent);
    container.querySelector('#copyHtmlBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyHtmlBtn').textContent = 'Copy', 1500);
  });

  update();
}
