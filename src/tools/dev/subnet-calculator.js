import { escapeHtml } from '../../utils/escape-html.js';

export function parseCIDR(input) {
  const match = input.trim().match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
  if (!match) return null;
  const ip = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];
  const prefix = parseInt(match[5]);
  if (ip.some(o => o < 0 || o > 255) || prefix < 0 || prefix > 32) return null;
  return { ip, prefix };
}

function ipToInt(octets) {
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

function intToIp(val) {
  return [(val >>> 24) & 255, (val >>> 16) & 255, (val >>> 8) & 255, val & 255];
}

export function calcSubnet(ip, prefix) {
  const mask = ~((1 << (32 - prefix)) - 1) >>> 0;
  const ipInt = ipToInt(ip);
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  const maskOctets = intToIp(mask);
  const totalHosts = prefix >= 31 ? Math.pow(2, 32 - prefix) : Math.pow(2, 32 - prefix) - 2;

  return {
    ip: ip.join('.'),
    prefix,
    mask: maskOctets.join('.'),
    network: intToIp(network).join('.'),
    broadcast: intToIp(broadcast).join('.'),
    firstHost: prefix >= 31 ? intToIp(network).join('.') : intToIp(network + 1).join('.'),
    lastHost: prefix >= 31 ? intToIp(broadcast).join('.') : intToIp(broadcast - 1).join('.'),
    totalHosts: totalHosts < 0 ? 0 : totalHosts,
    wildcard: intToIp(~mask).join('.'),
    binaryIp: ip.map(o => o.toString(2).padStart(8, '0')).join('.'),
    binaryMask: maskOctets.map(o => o.toString(2).padStart(8, '0')).join('.')
  };
}

export const toolConfig = {
  id: 'subnet-calculator',
  name: 'IP Subnet Calculator',
  category: 'dev',
  description: 'Calculate network address, broadcast, host range, and more from CIDR notation.',
  icon: '🌐',
  accept: null,
  maxSizeMB: null,
  keywords: ['subnet', 'cidr', 'ip', 'network', 'calculator', 'subnet mask', 'broadcast', 'host range'],
  steps: ['Enter an IP and CIDR prefix (e.g. 192.168.1.0/24)', 'View network details instantly', 'Copy values as needed'],
  faqs: [
    { question: 'What is CIDR notation?', answer: 'CIDR (Classless Inter-Domain Routing) uses IP/prefix format, e.g. 192.168.1.0/24 means subnet mask 255.255.255.0.' },
    { question: 'What is the usable host range?', answer: 'The range between network and broadcast addresses available for assigning to devices.' }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label>IP Address / CIDR</label>
        <input type="text" id="sc-input" class="text-input" placeholder="e.g. 192.168.1.0/24" value="192.168.1.0/24">
      </div>
      <button class="btn btn-primary btn-lg" id="sc-calc" style="width:100%;margin-bottom:var(--space-4);">Calculate</button>
      <div id="sc-results"></div>
    </div>
  `;

  const input = container.querySelector('#sc-input');
  const calcBtn = container.querySelector('#sc-calc');
  const results = container.querySelector('#sc-results');

  function renderRow(label, value) {
    return `<div style="display:flex;justify-content:space-between;padding:var(--space-2) 0;border-bottom:1px solid var(--color-border);font-family:monospace;font-size:var(--text-sm);">
      <span style="color:var(--color-text-muted);">${label}</span>
      <span style="font-weight:600;">${escapeHtml(value)}</span>
    </div>`;
  }

  function calc() {
    const parsed = parseCIDR(input.value);
    if (!parsed) {
      results.innerHTML = `<div style="color:var(--color-danger);padding:var(--space-3);">Invalid CIDR notation. Use format: 192.168.1.0/24</div>`;
      return;
    }
    const s = calcSubnet(parsed.ip, parsed.prefix);
    results.innerHTML = `
      <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);">
        ${renderRow('Address', s.ip)}
        ${renderRow('Prefix', '/' + s.prefix)}
        ${renderRow('Subnet Mask', s.mask)}
        ${renderRow('Wildcard Mask', s.wildcard)}
        ${renderRow('Network', s.network)}
        ${renderRow('Broadcast', s.broadcast)}
        ${renderRow('First Host', s.firstHost)}
        ${renderRow('Last Host', s.lastHost)}
        ${renderRow('Total Hosts', s.totalHosts.toLocaleString())}
        ${renderRow('Binary IP', s.binaryIp)}
        ${renderRow('Binary Mask', s.binaryMask)}
      </div>
    `;
  }

  calcBtn.addEventListener('click', calc);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') calc(); });
  calc();
}

export function destroy() {}
