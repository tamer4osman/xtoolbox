export const toolConfig = {
  id: 'flexbox-playground',
  name: 'Flexbox Playground',
  category: 'css',
  description: 'Interactive CSS Flexbox tester with live preview and code output.',
  icon: '📦',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="flex-container">
      <div class="controls">
        <div class="control-row"><label>Justify Content</label><select id="jc"><option value="flex-start">flex-start</option><option value="flex-end">flex-end</option><option value="center" selected>center</option><option value="space-between">space-between</option><option value="space-around">space-around</option><option value="space-evenly">space-evenly</option></select></div>
        <div class="control-row"><label>Align Items</label><select id="ai"><option value="stretch">stretch</option><option value="flex-start">flex-start</option><option value="flex-end">flex-end</option><option value="center" selected>center</option><option value="baseline">baseline</option></select></div>
        <div class="control-row"><label>Flex Direction</label><select id="fd"><option value="row" selected>row</option><option value="row-reverse">row-reverse</option><option value="column">column</option><option value="column-reverse">column-reverse</option></select></div>
        <div class="control-row"><label>Flex Wrap</label><select id="fw"><option value="nowrap" selected>nowrap</option><option value="wrap">wrap</option><option value="wrap-reverse">wrap-reverse</option></select></div>
        <div class="control-row"><label>Gap</label><input type="range" id="gap" min="0" max="40" value="12"><span id="gapVal">12px</span></div>
      </div>
      <div class="preview" id="preview"><div class="item">1</div><div class="item">2</div><div class="item">3</div><div class="item">4</div></div>
      <div class="output"><code id="cssOutput"></code><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .flex-container { max-width: 800px; margin: 0 auto; }
    .flex-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
    .control-row label { width: 120px; font-size: var(--text-sm); }
    .control-row select { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .control-row input { flex: 1; }
    .control-row span { width: 50px; text-align: right; font-size: var(--text-sm); font-family: monospace; }
    .preview { display: flex; background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); min-height: 180px; margin-bottom: var(--space-4); }
    .item { width: 60px; height: 60px; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; border-radius: var(--radius-md); }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output code { flex: 1; font-family: monospace; font-size: var(--text-sm); }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  function update() {
    const flex = container.querySelector('.preview');
    flex.style.justifyContent = container.querySelector('#jc').value;
    flex.style.alignItems = container.querySelector('#ai').value;
    flex.style.flexDirection = container.querySelector('#fd').value;
    flex.style.flexWrap = container.querySelector('#fw').value;
    flex.style.gap = container.querySelector('#gap').value + 'px';
    container.querySelector('#gapVal').textContent = container.querySelector('#gap').value + 'px';
    container.querySelector('#cssOutput').textContent = `.container {
  display: flex;
  justify-content: ${flex.style.justifyContent};
  align-items: ${flex.style.alignItems};
  flex-direction: ${flex.style.flexDirection};
  flex-wrap: ${flex.style.flexWrap};
  gap: ${flex.style.gap};
}`;
  }

  container.querySelectorAll('input, select').forEach(i => i.addEventListener('input', update));
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#cssOutput').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  update();
}
