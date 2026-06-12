function createCopyHandler(btn, getText) {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getText());
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    } catch {
      const original = btn.textContent;
      btn.textContent = 'Failed';
      setTimeout(() => { btn.textContent = original; }, 1500);
    }
  });
}

export function createGeneratorTool({ container, title, renderForm, generate, styles }) {
  container.innerHTML = `
    <div class="gen-container">
      <h2>${title}</h2>
      <div class="gen-form">${renderForm()}</div>
      <div class="gen-output"><pre id="gen-result"></pre><button id="gen-copy">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .gen-container { max-width: 700px; margin: 0 auto; }
    .gen-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .gen-form { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
    .gen-form input, .gen-form textarea, .gen-form select { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); width: 100%; box-sizing: border-box; }
    .gen-form textarea { min-height: 80px; resize: vertical; }
    .gen-form label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); }
    .gen-form input[type="checkbox"] { width: auto; }
    .gen-output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .gen-output pre { flex: 1; margin: 0; font-family: monospace; font-size: var(--text-xs); white-space: pre-wrap; }
    #gen-copy { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; height: fit-content; }
    ${styles || ''}
  `;
  container.appendChild(style);

  const resultEl = container.querySelector('#gen-result');
  const copyBtn = container.querySelector('#gen-copy');

  function update() { resultEl.textContent = generate(container); }

  container.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  createCopyHandler(copyBtn, () => resultEl.textContent);
  update();
}
