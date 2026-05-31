import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';

const TEMPLATES = [
  { name: 'Custom', entries: [] },
  { name: 'Localhost', entries: [{ ip: '127.0.0.1', hostname: 'localhost', comment: '' }] },
  { name: 'Local Network', entries: [
    { ip: '192.168.1.1', hostname: 'router.local', comment: 'Router' },
    { ip: '192.168.1.10', hostname: 'server.local', comment: 'Server' },
    { ip: '192.168.1.20', hostname: 'printer.local', comment: 'Printer' }
  ]},
  { name: 'Block Ads', entries: [
    { ip: '0.0.0.0', hostname: 'ad.doubleclick.net', comment: 'Block doubleclick' },
    { ip: '0.0.0.0', hostname: 'pagead2.googlesyndication.com', comment: 'Block Google ads' },
    { ip: '0.0.0.0', hostname: 'ads.facebook.com', comment: 'Block Facebook ads' }
  ]},
  { name: 'Development', entries: [
    { ip: '127.0.0.1', hostname: 'localhost', comment: '' },
    { ip: '127.0.0.1', hostname: 'app.local', comment: 'Local dev' },
    { ip: '127.0.0.1', hostname: 'api.local', comment: 'Local API' },
    { ip: '127.0.0.1', hostname: 'db.local', comment: 'Local DB' }
  ]}
];

export const toolConfig = {
  id: 'hosts-file-generator',
  name: 'Hosts File Configurator',
  category: 'dev',
  description: 'Generate formatted local network alias hosts configurations from a simple visual key table.',
  icon: '🌐',
  accept: null,
  maxSizeMB: null,
  keywords: ['hosts', 'hosts file', 'local network', 'dns', 'aliases', 'network configuration', 'etc hosts'],
  steps: ['Add IP and hostname pairs', 'Choose a template or create custom entries', 'Copy or download the generated hosts file content'],
  faqs: [
    { question: 'What is a hosts file?', answer: 'The hosts file is a local system file that maps hostnames to IP addresses. It overrides DNS resolution for the specified hostnames.' },
    { question: 'Where is the hosts file located?', answer: 'Linux/macOS: /etc/hosts. Windows: C:\\Windows\\System32\\drivers\\etc\\hosts.' },
    { question: 'How do I apply changes?', answer: 'After modifying the hosts file, flush your DNS cache. On Windows: ipconfig /flushdns. On macOS: sudo dscacheutil -flushcache. On Linux: sudo systemd-resolve --flush-caches.' }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label>Template</label>
        <select id="hfg-template" class="text-input">
          ${TEMPLATES.map((t, i) => `<option value="${i}">${t.name}</option>`).join('')}
        </select>
      </div>
      
      <div style="margin-top:var(--space-3);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <label style="margin-bottom:0;font-weight:600;">Hosts Entries</label>
          <button class="btn btn-sm btn-secondary" id="hfg-add">+ Add Entry</button>
        </div>
        <div id="hfg-entries"></div>
      </div>
      
      <div style="margin-top:var(--space-4);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <label style="margin-bottom:0;font-weight:600;">Generated Hosts File</label>
          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn-sm btn-secondary" id="hfg-download">Download</button>
            <button class="btn btn-sm btn-primary" id="hfg-copy">Copy</button>
          </div>
        </div>
        <pre id="hfg-output" style="background:var(--color-code-bg, #1e1e2e);color:#cdd6f4;padding:var(--space-3);border-radius:var(--radius-md);overflow-x:auto;font-size:var(--text-sm);line-height:1.6;white-space:pre-wrap;word-break:break-all;min-height:120px;font-family:monospace;"></pre>
      </div>
    </div>
  `;

  const templateSelect = container.querySelector('#hfg-template');
  const entriesDiv = container.querySelector('#hfg-entries');
  const addBtn = container.querySelector('#hfg-add');
  const output = container.querySelector('#hfg-output');
  const copyBtn = container.querySelector('#hfg-copy');
  const downloadBtn = container.querySelector('#hfg-download');

  let entries = [];

  function createEntryRow(ip = '', hostname = '', comment = '') {
    const row = document.createElement('div');
    row.className = 'hfg-row';
    row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:var(--space-2);margin-bottom:var(--space-2);align-items:center;';
    row.innerHTML = `
      <input type="text" class="text-input hfg-ip" placeholder="IP address" value="${ip}" style="font-family:monospace;">
      <input type="text" class="text-input hfg-hostname" placeholder="hostname" value="${hostname}" style="font-family:monospace;">
      <input type="text" class="text-input hfg-comment" placeholder="comment (optional)" value="${comment}">
      <button class="btn btn-sm btn-danger hfg-remove" title="Remove">×</button>
    `;
    
    const removeBtn = row.querySelector('.hfg-remove');
    removeBtn.addEventListener('click', () => {
      row.remove();
      updateOutput();
    });
    
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', updateOutput);
    });
    
    return row;
  }

  function renderEntries() {
    entriesDiv.innerHTML = '';
    entries.forEach(entry => {
      const row = createEntryRow(entry.ip, entry.hostname, entry.comment);
      entriesDiv.appendChild(row);
    });
    updateOutput();
  }

  function updateOutput() {
    const rows = entriesDiv.querySelectorAll('.hfg-row');
    let content = '# Hosts File Configuration\n';
    content += '# Generated by XToolBox Hosts File Configurator\n';
    content += '# ' + new Date().toISOString().split('T')[0] + '\n\n';
    
    rows.forEach(row => {
      const ip = row.querySelector('.hfg-ip').value.trim();
      const hostname = row.querySelector('.hfg-hostname').value.trim();
      const comment = row.querySelector('.hfg-comment').value.trim();
      
      if (ip && hostname) {
        let line = `${ip}\t${hostname}`;
        if (comment) line += `\t# ${comment}`;
        content += line + '\n';
      }
    });
    
    output.textContent = content;
  }

  function addEntry() {
    const row = createEntryRow();
    entriesDiv.appendChild(row);
    updateOutput();
    row.querySelector('.hfg-ip').focus();
  }

  templateSelect.addEventListener('change', () => {
    const idx = parseInt(templateSelect.value);
    entries = [...TEMPLATES[idx].entries];
    renderEntries();
  });

  addBtn.addEventListener('click', addEntry);

  copyBtn.addEventListener('click', async () => {
    const success = await copyToClipboard(output.textContent);
    if (success) {
      showToast({ message: 'Hosts file content copied to clipboard', type: 'success' });
    } else {
      showToast({ message: 'Failed to copy', type: 'error' });
    }
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([output.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hosts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({ message: 'Hosts file downloaded', type: 'success' });
  });

  renderEntries();
}

export function destroy() {}