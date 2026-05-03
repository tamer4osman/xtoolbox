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

  function parseUA(ua) {
    const info = { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
    
    // Browser detection
    if (ua.includes('Firefox/')) {
      const match = ua.match(/Firefox\/(\d+)/);
      info.browser = 'Firefox ' + (match ? match[1] : '');
    } else if (ua.includes('Edg/')) {
      const match = ua.match(/Edg\/(\d+)/);
      info.browser = 'Edge ' + (match ? match[1] : '');
    } else if (ua.includes('Chrome/') && !ua.includes('Edg')) {
      const match = ua.match(/Chrome\/(\d+)/);
      info.browser = 'Chrome ' + (match ? match[1] : '');
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      const match = ua.match(/Version\/(\d+)/);
      info.browser = 'Safari ' + (match ? match[1] : '');
    }
    
    // OS detection
    if (ua.includes('Windows')) info.os = 'Windows';
    else if (ua.includes('Mac OS')) info.os = 'macOS';
    else if (ua.includes('Linux')) info.os = 'Linux';
    else if (ua.includes('Android')) info.os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) info.os = 'iOS';
    
    // Device detection
    if (ua.includes('Mobile')) info.device = 'Mobile';
    if (ua.includes('Tablet') || ua.includes('iPad')) info.device = 'Tablet';
    
    return info;
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