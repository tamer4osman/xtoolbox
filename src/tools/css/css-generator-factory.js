export function createCssGenerator({
  container,
  cssClass,
  controlsHTML = '',
  previewHTML = '<div id="preview" class="preview"></div>',
  extraCSS = '',
  onUpdate,
  maxWidth = '600px'
}) {
  if (!onUpdate) throw new Error('createCssGenerator: onUpdate is required');

  container.innerHTML = `
    <div class="${cssClass}">
      ${previewHTML}
      <div class="controls">${controlsHTML}</div>
      <div class="output"><code id="cssOutput"></code><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .${cssClass} { max-width: ${maxWidth}; margin: 0 auto; }
    .${cssClass} h2 { text-align: center; margin-bottom: var(--space-4); }
    .controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
    .control-row label { width: 100px; font-size: var(--text-sm); }
    .control-row input[type="range"] { flex: 1; }
    .control-row input { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .control-row select { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .control-row input[type="color"] { width: 40px; height: 30px; padding: 0; }
    .control-row span { width: 50px; text-align: right; font-size: var(--text-sm); font-family: monospace; }
    .control-group { margin-bottom: var(--space-3); }
    .control-group label { display: block; font-weight: 500; margin-bottom: var(--space-2); font-size: var(--text-sm); }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output code { flex: 1; font-family: monospace; font-size: var(--text-sm); word-break: break-all; }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    ${extraCSS}
  `;
  container.appendChild(style);

  const preview = container.querySelector('#preview') || container.querySelector('[class*="preview"], .preview, [id*="preview"]');
  const cssOutput = container.querySelector('#cssOutput');
  const copyBtn = container.querySelector('#copyBtn');
  const controls = container.querySelector('.controls');

  function readValues() {
    const vals = {};
    controls.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.id) vals[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return vals;
  }

  function fire() {
    onUpdate({ values: readValues(), preview, cssOutput, container, controls });
  }

  controls.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', fire);
    el.addEventListener('change', fire);
  });

  let copyResetTimeout;
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(cssOutput.textContent || '');
    copyBtn.textContent = 'Copied!';
    clearTimeout(copyResetTimeout);
    copyResetTimeout = setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  });

  fire();

  return { preview, cssOutput, copyBtn, controls, fire };
}
