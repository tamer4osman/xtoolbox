export function render(container) {
  container.innerHTML = `
    <div class="sd-container">
      <h2>Structured Data Generator</h2>
      <select id="type"><option value="organization">Organization</option><option value="localbusiness">Local Business</option><option value="person">Person</option><option value="article">Article</option><option value="product">Product</option><option value="faq">FAQ</option></select>
      <div id="fields"></div>
      <button id="generateBtn" class="generate-btn">Generate JSON-LD</button>
      <div class="output"><pre id="result"></pre><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .sd-container { max-width: 700px; margin: 0 auto; }
    .sd-container h2 { text-align: center; margin-bottom: var(--space-4); }
    #type { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); margin-bottom: var(--space-3); }
    #fields { background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); margin-bottom: var(--space-3); display: flex; flex-direction: column; gap: var(--space-2); }
    #fields input { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .generate-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin-bottom: var(--space-4); }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output pre { flex: 1; margin: 0; font-family: monospace; font-size: var(--text-xs); white-space: pre-wrap; max-height: 300px; overflow: auto; }
    #copyBtn { padding: var(--space-2); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  const schemas = {
    organization: ['name', 'url', 'logo', 'description', 'sameAs'],
    localbusiness: ['name', 'address', 'telephone', 'priceRange', 'openingHours'],
    person: ['name', 'jobTitle', 'email', 'url', 'sameAs'],
    article: ['headline', 'author', 'datePublished', 'image', 'description'],
    product: ['name', 'image', 'description', 'offers', 'brand'],
    faq: ['question', 'answer']
  };

  function renderFields() {
    const type = container.querySelector('#type').value;
    const fields = schemas[type] || [];
    container.querySelector('#fields').innerHTML = fields.map(f => 
      '<input placeholder="' + f + '" data-field="' + f + '">'
    ).join('');
  }

  function generate() {
    const type = container.querySelector('#type').value;
    const inputs = container.querySelectorAll('#fields input');
    const data = {};
    inputs.forEach(i => { if (i.value) data[i.dataset.field] = i.value; });
    const ld = {
      '@context': 'https://schema.org',
      '@type': type.charAt(0).toUpperCase() + type.slice(1),
      ...data
    };
    container.querySelector('#result').textContent = JSON.stringify(ld, null, 2);
  }

  container.querySelector('#type').addEventListener('change', renderFields);
  container.querySelector('#generateBtn').addEventListener('click', generate);
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#result').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  renderFields();
}
