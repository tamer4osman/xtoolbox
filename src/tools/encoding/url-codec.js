export const toolConfig = {
  id: 'url-codec',
  name: 'URL Encoder',
  category: 'encoding',
  description: 'Encode and decode URL.',
  icon: '🔗',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="codec-container">
      <div class="codec-tabs"><button class="tab active" data-tab="encode">Encode</button><button class="tab" data-tab="decode">Decode</button></div>
      <div class="panel active" id="encode">
        <textarea id="enc-input" placeholder="Text to encode...">Hello World! ?foo=bar</textarea>
        <div class="output"><span>Encoded:</span><pre id="enc-output"></pre></div>
      </div>
      <div class="panel" id="decode">
        <textarea id="dec-input" placeholder="URL encoded text..."></textarea>
        <div class="output"><span>Decoded:</span><pre id="dec-output"></pre></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .codec-container { max-width: 700px; margin: 0 auto; }
    .codec-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .codec-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
    .codec-tabs .tab { flex: 1; padding: var(--space-3); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; }
    .codec-tabs .tab.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .panel { display: none; }
    .panel.active { display: block; }
    .panel textarea { width: 100%; height: 100px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); margin-bottom: var(--space-4); resize: vertical; }
    .output { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); }
    .output span { font-weight: 600; font-size: var(--text-sm); display: block; margin-bottom: var(--space-2); }
    .output pre { margin: 0; font-family: monospace; font-size: var(--text-sm); word-break: break-all; }
  `;
  container.appendChild(style);

  container.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    container.querySelectorAll('.tab, .panel').forEach(el => el.classList.remove('active'));
    t.classList.add('active');
    container.querySelector('#' + t.dataset.tab).classList.add('active');
  }));

  container.querySelector('#enc-input').addEventListener('input', () => {
    container.querySelector('#enc-output').textContent = encodeURIComponent(container.querySelector('#enc-input').value);
  });

  container.querySelector('#dec-input').addEventListener('input', () => {
    try { container.querySelector('#dec-output').textContent = decodeURIComponent(container.querySelector('#dec-input').value); }
    catch { container.querySelector('#dec-output').textContent = 'Invalid URL encoded string'; }
  });

  container.querySelector('#enc-input').dispatchEvent(new Event('input'));
}
