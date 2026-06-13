export const toolConfig = {
  id: 'user-agent-parser',
  name: 'User Agent Parser',
  category: 'dev',
  description: 'Parse browser, OS, and device info from user agent strings.',
  icon: '🖥️',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="ua-container">
      <h2>User Agent Parser</h2>
      <textarea id="uaInput" placeholder="Paste User-Agent string..."></textarea>
      <button id="parseBtn" class="btn btn-primary">Parse</button>
      <div class="result" id="result"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .ua-container { max-width: 800px; margin: 0 auto; }
    .ua-container h2 { margin-bottom: var(--space-4); }
    textarea { width: 100%; height: 100px; margin-bottom: var(--space-4); padding: var(--space-3); border-radius: var(--radius-lg); border: 1px solid var(--color-border); font-family: monospace; }
    .result { margin-top: var(--space-4); padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg); }
  `;
  container.appendChild(style);

  const input = container.querySelector('#uaInput');
  const result = container.querySelector('#result');
  const parseBtn = container.querySelector('#parseBtn');

  const BROWSERS = [
    { pattern: 'Firefox/', regex: /Firefox\/(\d+)/, name: 'Firefox ' },
    { pattern: 'Edg/', regex: /Edg\/(\d+)/, name: 'Edge ' },
    { pattern: 'Chrome/', not: 'Edg', regex: /Chrome\/(\d+)/, name: 'Chrome ' },
    { pattern: 'Safari/', not: 'Chrome', regex: /Version\/(\d+)/, name: 'Safari ' }
  ];

  const OS_MAP = [
    { keyword: 'Windows', name: 'Windows' },
    { keyword: 'Mac OS', name: 'macOS' },
    { keyword: 'Linux', name: 'Linux' },
    { keyword: 'Android', name: 'Android' },
    { keyword: 'iPhone', name: 'iOS' },
    { keyword: 'iPad', name: 'iOS' }
  ];

  function detectBrowser(ua) {
    for (const b of BROWSERS) {
      if (!b.pattern || ua.includes(b.pattern)) continue;
      if (b.not && ua.includes(b.not)) continue;
      const match = ua.match(b.regex);
      return b.name + (match ? match[1] : '');
    }
    return 'Unknown';
  }

  function detectOS(ua) {
    for (const o of OS_MAP) {
      if (ua.includes(o.keyword)) return o.name;
    }
    return 'Unknown';
  }

  function detectDevice(ua) {
    if (ua.includes('Tablet') || ua.includes('iPad')) return 'Tablet';
    if (ua.includes('Mobile')) return 'Mobile';
    return 'Desktop';
  }

  function parseUA(ua) {
    return {
      browser: detectBrowser(ua),
      os: detectOS(ua),
      device: detectDevice(ua)
    };
  }

  parseBtn.addEventListener('click', () => {
    const info = parseUA(input.value || navigator.userAgent);
    result.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-4);">
        <div><strong>Browser</strong><p>${info.browser}</p></div>
        <div><strong>OS</strong><p>${info.os}</p></div>
        <div><strong>Device</strong><p>${info.device}</p></div>
      </div>
    `;
  });
}