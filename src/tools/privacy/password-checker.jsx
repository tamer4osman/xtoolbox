export const toolConfig = {
  id: 'password-checker',
  name: 'Password Strength Checker',
  category: 'privacy',
  description: 'Check password strength and get improvement suggestions.',
  icon: '🔒',
  steps: ['Enter password', 'View strength analysis']
};

export function render(container) {
  container.innerHTML = `
    <div class="pwd-check-container">
      <input type="text" id="pwd-input" placeholder="Enter password to check...">
      <div class="pwd-strength">
        <div class="strength-bar"><div class="strength-fill" id="strength-fill"></div></div>
        <span class="strength-text" id="strength-text">Enter a password</span>
      </div>
      <div class="pwd-checks-list" id="checks-list"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .pwd-check-container { max-width: 450px; margin: 0 auto; }
    .pwd-check-container input { width: 100%; padding: var(--space-4); font-size: var(--text-lg); border: 2px solid #ddd; border-radius: var(--radius-lg); margin-bottom: var(--space-4); }
    .strength-bar { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; margin-bottom: var(--space-2); }
    .strength-fill { height: 100%; width: 0%; transition: all 0.3s; border-radius: 4px; }
    .strength-text { font-weight: 600; text-align: center; display: block; margin-bottom: var(--space-4); }
    .pwd-checks-list { display: grid; gap: var(--space-2); }
    .pwd-check-item { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); padding: var(--space-2); background: #f5f5f5; border-radius: var(--radius-md); }
    .pwd-check-item.pass { background: #d4edda; }
    .pwd-check-item.fail { background: #f8d7da; }
  `;
  container.appendChild(style);

  container.querySelector('#pwd-input').addEventListener('input', checkPwd);

  function checkPwd() {
    const pwd = container.querySelector('#pwd-input').value;
    const fill = container.querySelector('#strength-fill');
    const text = container.querySelector('#strength-text');
    const list = container.querySelector('#checks-list');
    
    if (!pwd) {
      fill.style.width = '0%';
      fill.style.background = '#eee';
      text.textContent = 'Enter a password';
      list.innerHTML = '';
      return;
    }
    
    let score = 0;
    const checks = [
      { test: pwd.length >= 8, label: 'At least 8 characters' },
      { test: pwd.length >= 12, label: 'At least 12 characters' },
      { test: /[a-z]/.test(pwd), label: 'Contains lowercase letter' },
      { test: /[A-Z]/.test(pwd), label: 'Contains uppercase letter' },
      { test: /[0-9]/.test(pwd), label: 'Contains number' },
      { test: /[^a-zA-Z0-9]/.test(pwd), label: 'Contains special character' },
      { test: !/(.)\1{2,}/.test(pwd), label: 'No repeated characters' }
    ];
    
    checks.forEach(c => { if (c.test) score++; });
    
    list.innerHTML = checks.map(c => `
      <div class="pwd-check-item ${c.test ? 'pass' : 'fail'}">
        <span>${c.test ? '✓' : '✗'}</span> ${c.label}
      </div>
    `).join('');
    
    const pct = Math.min(100, (score / checks.length) * 100);
    fill.style.width = pct + '%';
    
    if (score <= 2) {
      fill.style.background = '#dc3545';
      text.textContent = 'Weak';
    } else if (score <= 4) {
      fill.style.background = '#ffc107';
      text.textContent = 'Medium';
    } else {
      fill.style.background = '#28a745';
      text.textContent = 'Strong';
    }
  }

  return container;
}
