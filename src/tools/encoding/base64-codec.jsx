export function render(container) {
  container.innerHTML = `
    <div class="codec-container">
      <div class="codec-tabs"><button class="tab active" data-tab="encode">Encode</button><button class="tab" data-tab="decode">Decode</button></div>
      <div class="codec-panels">
        <div class="panel active" id="encode">
          <textarea id="enc-input" placeholder="Text to encode...">Hello World</textarea>
          <div class="output"><span>Base64:</span><pre id="enc-output"></pre></div>
        </div>
        <div class="panel" id="decode">
          <textarea id="dec-input" placeholder="Base64 to decode..."></textarea>
          <div class="output"><span>Text:</span><pre id="dec-output"></pre></div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .codec-container { max-width: 700px; margin: 0 auto; }
    .codec-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .codec-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
    .codec-tabs .tab { flex: 1; padding: var(--space-3); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; font-weight: 500; }
    .codec-tabs .tab.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .panel { display: none; }
    .panel.active { display: block; }
    .panel textarea { width: 100%; height: 120px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); margin-bottom: var(--space-4); resize: vertical; }
    .output { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); }
    .output span { font-weight: 600; font-size: var(--text-sm); display: block; margin-bottom: var(--space-2); }
    .output pre { margin: 0; font-family: monospace; font-size: var(--text-sm); word-break: break-all; }
  `;
  container.appendChild(style);

  container.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector('#' + tab.dataset.tab).classList.add('active');
    });
  });

  container.querySelector('#enc-input').addEventListener('input', () => {
    try { container.querySelector('#enc-output').textContent = btoa(container.querySelector('#enc-input').value); }
    catch { container.querySelector('#enc-output').textContent = 'Invalid input'; }
  });

  container.querySelector('#dec-input').addEventListener('input', () => {
    try { container.querySelector('#dec-output').textContent = atob(container.querySelector('#dec-input').value); }
    catch { container.querySelector('#dec-output').textContent = 'Invalid Base64'; }
  });

  container.querySelector('#enc-input').dispatchEvent(new Event('input'));
}
