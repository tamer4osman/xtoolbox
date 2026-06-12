import { BASIC_TOOL_CSS } from '../shared/basic-tool-css.js';

export const toolConfig = {
  id: 'hash-generator',
  name: 'Hash Generator',
  category: 'encoding',
  description: 'Generate hash from text using MD5, SHA-1, SHA-256.',
  icon: '#️⃣',
  accept: null,
  maxSizeMB: null,
  keywords: ['hash generator', 'md5', 'sha256', 'sha1', 'crypto hash'],
  steps: ['Enter text', 'Choose algorithm', 'Get hash']
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <textarea id="input" placeholder="Enter text to hash..."></textarea>
      <div class="tool-buttons hash-buttons">
        <button class="btn hash-btn active" data-algo="sha256">SHA-256</button>
        <button class="btn hash-btn" data-algo="sha1">SHA-1</button>
        <button class="btn hash-btn" data-algo="md5">MD5</button>
        <button class="btn hash-btn" data-algo="sha384">SHA-384</button>
        <button class="btn hash-btn" data-algo="sha512">SHA-512</button>
      </div>
      <div class="hash-output">
        <textarea id="output" readonly></textarea>
        <button id="copy-btn" class="btn btn-secondary">Copy Hash</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    ${BASIC_TOOL_CSS}
    .hash-buttons { flex-wrap: wrap; }
    .hash-buttons .btn { flex: 1; min-width: 80px; }
    .hash-output textarea { background: var(--color-surface); min-height: 80px; }
    .hash-output { position: relative; }
    #copy-btn { position: absolute; right: var(--space-2); bottom: var(--space-2); }
  `;
  container.appendChild(style);

  const input = container.querySelector('#input');
  const output = container.querySelector('#output');
  const copyBtn = container.querySelector('#copy-btn');
  const algoBtns = container.querySelectorAll('.hash-btn');
  let currentAlgo = 'sha256';

  const hashAsync = async (text, algo) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  async function generate() {
    const text = input.value;
    if (!text) {
      output.value = '';
      return;
    }
    output.value = 'Computing...';
    try {
      output.value = await hashAsync(text, currentAlgo);
    } catch (e) {
      output.value = 'Error: ' + e.message;
    }
  }

  algoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      algoBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAlgo = btn.dataset.algo;
      generate();
    });
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy Hash', 1500);
  });

  input.addEventListener('input', generate);
}
