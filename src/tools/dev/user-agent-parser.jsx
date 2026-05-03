export const toolConfig = {
  id: 'user-agent-parser',
  name: 'User Agent Parser',
  category: 'dev',
  description: 'Parse browser and device information from user agent strings.',
  icon: '🕵️',
  steps: ['Enter user agent string', 'View parsed info']
};

export function render(container) {
  container.innerHTML = `
    <div class="ua-container">
      <textarea id="ua-input" placeholder="Paste user agent string here..."></textarea>
      <button id="ua-parse">Parse</button>
      <div class="ua-results" id="ua-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .ua-container { max-width: 600px; margin: 0 auto; }
    .ua-container textarea { width: 100%; height: 100px; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-lg); font-family: monospace; font-size: var(--text-sm); resize: vertical; margin-bottom: var(--space-3); }
    .ua-container button { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; margin-bottom: var(--space-4); }
    .ua-results { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
    .ua-item { padding: var(--space-3); background: #f5f5f5; border-radius: var(--radius-md); }
    .ua-item label { display: block; font-size: var(--text-xs); color: var(--color-text-secondary); text-transform: uppercase; margin-bottom: 4px; }
    .ua-item span { font-weight: 500; }
  `;
  container.appendChild(style);

  function parseUA(ua) {
    const result = { browser: 'Unknown', os: 'Unknown', device: 'Desktop', engine: 'Unknown' };
    
    if (!ua) return result;
    
    if (/Firefox\/\d+/.test(ua)) {
      result.browser = ua.match(/Firefox\/(\d+)/)?.[1] ? `Firefox ${ua.match(/Firefox\/(\d+)/)[1]}` : 'Firefox';
    } else if (/Edg\/\d+/.test(ua)) {
      result.browser = 'Edge';
    } else if (/Chrome\/\d+/.test(ua)) {
      result.browser = ua.match(/Chrome\/\d+/) ? `Chrome ${ua.match(/Chrome\/(\d+)/)?.[1]}` : 'Chrome';
    } else if (/Safari/ && !/Chrome/.test(ua)) {
      result.browser = 'Safari';
    }
    
    if (/Windows NT 10/.test(ua)) result.os = 'Windows 10/11';
    else if (/Mac OS X/.test(ua)) result.os = 'macOS';
    else if (/Linux/.test(ua)) result.os = 'Linux';
    else if (/Android/.test(ua)) { result.os = 'Android'; result.device = 'Mobile'; }
    else if (/iPhone|iPad|iPod/.test(ua)) { result.os = 'iOS'; result.device = 'Mobile'; }
    
    if (/Mobile/.test(ua)) result.device = 'Mobile';
    
    if (/WebKit/.test(ua)) result.engine = 'WebKit';
    else if (/Gecko/.test(ua)) result.engine = 'Gecko';
    else if (/Trident/.test(ua)) result.engine = 'Trident';
    
    return result;
  }

  container.querySelector('#ua-parse').addEventListener('click', () => {
    const ua = container.querySelector('#ua-input').value;
    const info = parseUA(ua);
    
    container.querySelector('#ua-results').innerHTML = `
      <div class="ua-item"><label>Browser</label><span>${info.browser}</span></div>
      <div class="ua-item"><label>Operating System</label><span>${info.os}</span></div>
      <div class="ua-item"><label>Device</label><span>${info.device}</span></div>
      <div class="ua-item"><label>Engine</label><span>${info.engine}</span></div>
    `;
  });

  return container;
}
