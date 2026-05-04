export const toolConfig = {
  id: 'og-generator',
  name: 'Open Graph Generator',
  category: 'seo',
  description: 'Generate Open Graph tags for social media sharing.',
  icon: '🔗',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="og-container">
      <h2>Open Graph Generator</h2>
      <input type="text" id="url" placeholder="Page URL">
      <input type="text" id="title" placeholder="Title">
      <textarea id="desc" placeholder="Description"></textarea>
      <input type="text" id="image" placeholder="Image URL">
      <select id="type"><option value="website">website</option><option value="article">article</option><option value="product">product</option></select>
      <button id="generateBtn" class="generate-btn">Generate Tags</button>
      <div class="output"><pre id="result"></pre><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .og-container { max-width: 600px; margin: 0 auto; }
    .og-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .og-container input, .og-container textarea, .og-container select { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: var(--space-2); }
    .og-container textarea { min-height: 80px; resize: vertical; }
    .generate-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin: var(--space-3) 0; }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output pre { flex: 1; margin: 0; font-family: monospace; font-size: var(--text-xs); white-space: pre-wrap; }
    #copyBtn { padding: var(--space-2); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  container.querySelector('#generateBtn').addEventListener('click', () => {
    const url = container.querySelector('#url').value;
    const title = container.querySelector('#title').value;
    const desc = container.querySelector('#desc').value;
    const img = container.querySelector('#image').value;
    const type = container.querySelector('#type').value;
    let tags = '<!-- Open Graph -->\n';
    if (url) tags += '<meta property="og:url" content="' + url + '">\n';
    if (title) tags += '<meta property="og:title" content="' + title + '">\n';
    if (desc) tags += '<meta property="og:description" content="' + desc + '">\n';
    if (img) tags += '<meta property="og:image" content="' + img + '">\n';
    tags += '<meta property="og:type" content="' + type + '">\n';
    tags += '\n<!-- Twitter -->\n';
    tags += '<meta name="twitter:card" content="summary_large_image">\n';
    if (title) tags += '<meta name="twitter:title" content="' + title + '">\n';
    if (desc) tags += '<meta name="twitter:description" content="' + desc + '">\n';
    if (img) tags += '<meta name="twitter:image" content="' + img + '">\n';
    container.querySelector('#result').textContent = tags;
  });
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#result').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
}
