export const toolConfig = {
  id: 'password-generator',
  name: 'Password Generator',
  category: 'privacy',
  description: 'Generate secure random passwords with customizable options.',
  icon: '🔐',
  steps: ['Configure options', 'Generate password', 'Copy']
};

export function render(container) {
  container.innerHTML = `
    <div class="pwd-gen-container">
      <div class="pwd-display">
        <input type="text" id="pwd-output" readonly>
        <button id="pwd-copy">Copy</button>
      </div>
      <div class="pwd-options">
        <div class="pwd-length">
          <label>Length: <span id="length-val">16</span></label>
          <input type="range" id="pwd-length" min="8" max="64" value="16">
        </div>
        <div class="pwd-checks">
          <label><input type="checkbox" id="pwd-upper" checked> Uppercase (A-Z)</label>
          <label><input type="checkbox" id="pwd-lower" checked> Lowercase (a-z)</label>
          <label><input type="checkbox" id="pwd-numbers" checked> Numbers (0-9)</label>
          <label><input type="checkbox" id="pwd-symbols" checked> Symbols (!@#$%)</label>
        </div>
      </div>
      <button id="pwd-generate">Generate Password</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .pwd-gen-container { max-width: 450px; margin: 0 auto; }
    .pwd-display { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
    .pwd-display input { flex: 1; padding: var(--space-3); font-family: monospace; font-size: var(--text-lg); border: 2px solid #ddd; border-radius: var(--radius-md); }
    .pwd-display button { padding: var(--space-3) var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    .pwd-length { margin-bottom: var(--space-4); }
    .pwd-length label { display: flex; justify-content: space-between; margin-bottom: var(--space-2); }
    .pwd-length input[type="range"] { width: 100%; }
    .pwd-checks { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-4); }
    .pwd-checks label { display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); cursor: pointer; }
    #pwd-generate { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-size: var(--text-base); cursor: pointer; }
  `;
  container.appendChild(style);

  const lengthSlider = container.querySelector('#pwd-length');
  const lengthVal = container.querySelector('#length-val');
  
  lengthSlider.addEventListener('input', () => {
    lengthVal.textContent = lengthSlider.value;
  });

  container.querySelector('#pwd-generate').addEventListener('click', generate);
  
  container.querySelector('#pwd-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#pwd-output').value);
  });

  function generate() {
    const len = parseInt(lengthSlider.value);
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let chars = '';
    if (container.querySelector('#pwd-upper').checked) chars += upper;
    if (container.querySelector('#pwd-lower').checked) chars += lower;
    if (container.querySelector('#pwd-numbers').checked) chars += nums;
    if (container.querySelector('#pwd-symbols').checked) chars += syms;
    
    if (!chars) chars = lower;
    
    let pwd = '';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) {
      pwd += chars[arr[i] % chars.length];
    }
    
    container.querySelector('#pwd-output').value = pwd;
  }

  generate();
  return container;
}
