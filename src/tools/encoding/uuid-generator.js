export const toolConfig = {
  id: 'uuid-generator',
  name: 'UUID Generator',
  category: 'encoding',
  description: 'Generate UUIDs v4 randomly.',
  icon: '🎲',
  accept: null,
  maxSizeMB: null,
  keywords: ['uuid generator', 'guid generator', 'unique id'],
  steps: ['Click Generate', 'Copy UUID']
};

export function render(container) {
  container.innerHTML = `
    <div class="uuid-container">
      <div id="uuid-display" class="uuid-display"></div>
      <div class="uuid-buttons">
        <button id="generate-btn" class="btn btn-primary">Generate UUID</button>
        <button id="copy-btn" class="btn btn-secondary">Copy</button>
      </div>
      <div class="uuid-options">
        <label>Quantity: <input type="number" id="count" value="1" min="1" max="100"></label>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .uuid-container { max-width: 500px; margin: 0 auto; text-align: center; }
    .uuid-display { 
      background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); 
      font-family: monospace; font-size: var(--text-lg); margin-bottom: var(--space-4); min-height: 60px;
    }
    .uuid-display .uuid { padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); }
    .uuid-display .uuid:last-child { border-bottom: none; }
    .uuid-buttons { display: flex; gap: var(--space-3); justify-content: center; }
    .uuid-buttons .btn { flex: 1; max-width: 150px; }
    .uuid-options { margin-top: var(--space-4); }
    .uuid-options input { width: 60px; }
  `;
  container.appendChild(style);

  const display = container.querySelector('#uuid-display');
  const generateBtn = container.querySelector('#generate-btn');
  const copyBtn = container.querySelector('#copy-btn');
  const countInput = container.querySelector('#count');

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function generate() {
    const count = Math.min(100, Math.max(1, parseInt(countInput.value) || 1));
    display.innerHTML = Array(count).fill().map(() => 
      `<div class="uuid">${generateUUID()}</div>`
    ).join('');
  }

  copyBtn.addEventListener('click', () => {
    const uuids = Array.from(display.querySelectorAll('.uuid')).map(el => el.textContent).join('\n');
    navigator.clipboard.writeText(uuids);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy', 1500);
  });

  generateBtn.addEventListener('click', generate);
  generate();
}
