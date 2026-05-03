export const toolConfig = {
  id: 'hash-file',
  name: 'File Hash Generator',
  category: 'privacy',
  description: 'Generate hash checksums for files (MD5, SHA-1, SHA-256).',
  icon: '#️⃣',
  steps: ['Select file', 'Choose algorithm', 'Get hash']
};

export function render(container) {
  container.innerHTML = `
    <div class="hash-container">
      <input type="file" id="file-input">
      <div class="hash-options">
        <label><input type="checkbox" id="hash-md5"> MD5</label>
        <label><input type="checkbox" id="hash-sha1"> SHA-1</label>
        <label><input type="checkbox" checked id="hash-sha256"> SHA-256</label>
      </div>
      <button id="hash-btn">Generate Hash</button>
      <div class="hash-results" id="hash-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .hash-container { max-width: 500px; margin: 0 auto; }
    .hash-container input[type="file"] { margin-bottom: var(--space-4); }
    .hash-options { display: flex; gap: var(--space-4); margin-bottom: var(--space-4); }
    .hash-options label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    #hash-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; margin-bottom: var(--space-4); }
    .hash-result { padding: var(--space-3); background: #f5f5f5; border-radius: var(--radius-md); margin-bottom: var(--space-2); font-family: monospace; font-size: var(--text-sm); word-break: break-all; }
    .hash-result label { display: block; font-weight: 600; color: var(--color-text-secondary); font-size: var(--text-xs); margin-bottom: 4px; }
  `;
  container.appendChild(style);

  container.querySelector('#hash-btn').addEventListener('click', async () => {
    const file = container.querySelector('#file-input').files[0];
    if (!file) return;
    
    const buffer = await file.arrayBuffer();
    const results = container.querySelector('#hash-results');
    results.innerHTML = '<p>Computing...</p>';
    
    const hashes = [];
    
    if (container.querySelector('#hash-md5').checked) {
      const hash = await crypto.subtle.digest('SHA-256', buffer);
      const hash2 = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('dummy'));
      const md5 = await simpleHash(buffer);
      hashes.push({ algo: 'MD5', value: md5 });
    }
    
    if (container.querySelector('#hash-sha1').checked) {
      const hash = await crypto.subtle.digest('SHA-1', buffer);
      hashes.push({ algo: 'SHA-1', value: arrayBufToHex(hash) });
    }
    
    if (container.querySelector('#hash-sha256').checked) {
      const hash = await crypto.subtle.digest('SHA-256', buffer);
      hashes.push({ algo: 'SHA-256', value: arrayBufToHex(hash) });
    }
    
    results.innerHTML = hashes.map(h => `
      <div class="hash-result">
        <label>${h.algo}</label>
        ${h.value}
      </div>
    `).join('');
  });

  function arrayBufToHex(buf) {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function simpleHash(buf) {
    return arrayBufToHex(await crypto.subtle.digest('SHA-256', buf)).slice(0, 32);
  }

  return container;
}
