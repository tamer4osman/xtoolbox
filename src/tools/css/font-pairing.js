export const toolConfig = {
  id: 'font-pairing',
  name: 'Font Pairing Preview',
  category: 'css',
  description: 'Preview Google Fonts pairings for headings and body text.',
  icon: '🔤',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="font-container">
      <div class="preset-list" id="presets"></div>
      <div class="preview" id="preview">
        <div class="heading">The Quick Brown Fox</div>
        <div class="body">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
      </div>
      <div class="output">
        <div class="output-row"><span>Heading Font:</span><code id="headingFont"></code></div>
        <div class="output-row"><span>Body Font:</span><code id="bodyFont"></code></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .font-container { max-width: 800px; margin: 0 auto; }
    .font-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .preset-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-2); margin-bottom: var(--space-4); }
    .preset-btn { padding: var(--space-2); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-xs); text-align: center; }
    .preset-btn:hover, .preset-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .preview { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-4); text-align: center; }
    .heading { font-size: 32px; font-weight: 700; margin-bottom: var(--space-3); }
    .body { font-size: 16px; line-height: 1.6; }
    .output { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
    .output-row { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); }
    .output-row:last-child { border: none; }
    .output-row span { font-weight: 500; font-size: var(--text-sm); }
    .output-row code { font-family: monospace; font-size: var(--text-sm); }
  `;
  container.appendChild(style);

  const presets = [
    { name: 'Modern', heading: 'Inter', body: 'Inter', h: '700', b: '400' },
    { name: 'Classic', heading: 'Playfair Display', body: 'Source Serif Pro', h: '700', b: '400' },
    { name: 'Clean', heading: 'Montserrat', body: 'Open Sans', h: '700', b: '400' },
    { name: 'Tech', heading: 'Roboto Mono', body: 'Roboto', h: '700', b: '400' },
    { name: 'Elegant', heading: 'Cormorant Garamond', body: 'Proza Libre', h: '600', b: '400' },
    { name: 'Bold', heading: 'Oswald', body: 'Lato', h: '700', b: '400' }
  ];

  container.querySelector('#presets').innerHTML = presets.map((p, i) =>
    `<button class="preset-btn${i === 0 ? ' active' : ''}" data-heading="${p.heading}" data-body="${p.body}">${p.name}</button>`
  ).join('');

  function loadFont(heading, body) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${heading.replace(/ /g, '+')}:wght@400;700&family=${body.replace(/ /g, '+')}:wght@400;600&display=swap`;
    document.head.appendChild(link);
    const preview = container.querySelector('.preview');
    preview.querySelector('.heading').style.fontFamily = `'${heading}', sans-serif`;
    preview.querySelector('.body').style.fontFamily = `'${body}', sans-serif`;
    container.querySelector('#headingFont').textContent = `font-family: '${heading}', sans-serif;`;
    container.querySelector('#bodyFont').textContent = `font-family: '${body}', sans-serif;`;
  }

  container.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadFont(btn.dataset.heading, btn.dataset.body);
    });
  });

  loadFont('Inter', 'Inter');
}
