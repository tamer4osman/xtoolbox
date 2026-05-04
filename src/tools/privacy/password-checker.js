export const toolConfig = {
  id: 'password-checker',
  name: 'Password Strength Checker',
  category: 'privacy',
  description: 'Check how strong your password is with detailed feedback.',
  icon: '🛡️',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="input-section">
          <label>Password</label>
          <input type="password" id="password" class="tool-input" placeholder="Enter password to check" />
          <button id="toggle-btn" class="toggle-btn">👁️</button>
        </div>
        <div id="strength-meter" class="strength-meter">
          <div id="strength-bar"></div>
        </div>
        <div id="strength-text" class="strength-text"></div>
        <div id="checks" class="checks"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 500px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .tool-icon { font-size: 4rem; margin-bottom: var(--space-4); }
    .tool-description { color: var(--color-text-secondary); }
    .input-section { position: relative; margin-bottom: var(--space-6); }
    .tool-input { width: 100%; padding: var(--space-4); padding-right: 50px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); font-size: var(--text-lg); }
    .tool-input:focus { border-color: var(--color-primary); outline: none; }
    .toggle-btn { position: absolute; right: 12px; top: 38px; background: none; border: none; cursor: pointer; font-size: 1.25rem; }
    .strength-meter { height: 8px; background: var(--color-border); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--space-3); }
    #strength-bar { height: 100%; width: 0; transition: all 0.3s; }
    .strength-text { text-align: center; font-weight: 600; margin-bottom: var(--space-4); }
    .checks { display: flex; flex-direction: column; gap: var(--space-2); }
    .check-item { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); }
    .check-item.weak { color: var(--color-error); }
    .check-item.strong { color: var(--color-success); }
  `;
  container.appendChild(style);

  const password = container.querySelector('#password');
  const toggleBtn = container.querySelector('#toggle-btn');
  const strengthBar = container.querySelector('#strength-bar');
  const strengthText = container.querySelector('#strength-text');
  const checks = container.querySelector('#checks');

  const checksList = [
    { test: p => p.length >= 8, label: 'At least 8 characters' },
    { test: p => /[a-z]/.test(p), label: 'Contains lowercase letter' },
    { test: p => /[A-Z]/.test(p), label: 'Contains uppercase letter' },
    { test: p => /[0-9]/.test(p), label: 'Contains number' },
    { test: p => /[^a-zA-Z0-9]/.test(p), label: 'Contains special character' },
    { test: p => p.length >= 12, label: 'At least 12 characters (recommended)' }
  ];

  toggleBtn.addEventListener('click', () => {
    password.type = password.type === 'password' ? 'text' : 'password';
  });

  password.addEventListener('input', () => {
    const p = password.value;
    const results = checksList.map(c => ({ ...c, pass: c.test(p) }));
    const passed = results.filter(r => r.pass).length;
    const score = passed / results.length;

    strengthBar.style.width = (score * 100) + '%';
    strengthBar.style.background = passed < 2 ? '#ef4444' : passed < 4 ? '#f59e0b' : '#10b981';
    strengthText.textContent = passed < 2 ? 'Weak' : passed < 4 ? 'Medium' : 'Strong';
    strengthText.style.color = strengthBar.style.background;

    checks.innerHTML = results.map(r => 
      `<div class="check-item ${r.pass ? 'strong' : 'weak'}">${r.pass ? '✓' : '✗'} ${r.label}</div>`
    ).join('');
  });
}
