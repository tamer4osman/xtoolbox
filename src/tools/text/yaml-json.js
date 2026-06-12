export const toolConfig = {
  id: 'yaml-json',
  name: 'YAML to JSON',
  category: 'text',
  description: 'Convert YAML to JSON format.',
  icon: '🔄',
  accept: '.yaml,.yml,.json',
  maxSizeMB: 1,
  keywords: ['yaml to json', 'convert yaml', 'yaml parser'],
  steps: ['Enter YAML', 'Get JSON']
};

export function parseYAMLValue(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map(s => s.trim());
  }
  if (trimmed === 'null') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (!isNaN(trimmed)) return Number(trimmed);
  return trimmed.replace(/^["']|["']$/g, '');
}

export function parseYAML(yaml) {
  const lines = yaml.split('\n');
  const result = {};
  const stack = [{ obj: result, indent: -1 }];
  
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    
    const indent = line.search(/\S/);
    const keyMatch = line.match(/^(\s*)([^:]+):(.*)$/);
    
    if (keyMatch) {
      const [, , key, value] = keyMatch;
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      
      const current = stack[stack.length - 1].obj;
      
      if (trimmedValue) {
        current[trimmedKey] = parseYAMLValue(value);
      } else {
        current[trimmedKey] = {};
        stack.push({ obj: current[trimmedKey], parent: current, indent, lastKey: trimmedKey });
      }
    } else if (line.trim().startsWith('-')) {
      const value = line.trim().slice(1).trim();
      const parent = stack[stack.length - 1].parent;
      const parentKey = stack[stack.length - 1].lastKey;
      
      if (parent && parentKey && !Array.isArray(parent[parentKey])) {
        parent[parentKey] = [];
      }
      
      if (parent && parentKey) {
        if (value) {
          parent[parentKey].push(parseYAMLValue(value));
        }
      }
    }
  }
  return result;
}

export function render(container) {
  container.innerHTML = `
    <div class="convert-container">
      <div class="convert-input">
        <h3>YAML</h3>
        <textarea id="yaml-input" placeholder="name: John
age: 30
city: NYC">name: John
age: 30
city: NYC
skills:
  - JavaScript
  - Python</textarea>
      </div>
      <div class="convert-output">
        <h3>JSON</h3>
        <textarea id="json-output" readonly></textarea>
        <button id="copy-btn" class="btn btn-secondary">Copy</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .convert-container { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .convert-input textarea, .convert-output textarea { width: 100%; min-height: 250px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: monospace; font-size: 14px; }
    .convert-output textarea { background: var(--color-surface); }
    .convert-input h3, .convert-output h3 { margin-bottom: var(--space-2); font-size: var(--text-sm); color: var(--color-muted); }
    #copy-btn { margin-top: var(--space-2); }
  `;
  container.appendChild(style);

  const yamlInput = container.querySelector('#yaml-input');
  const jsonOutput = container.querySelector('#json-output');
  const copyBtn = container.querySelector('#copy-btn');

  function convert() {
    try {
      const obj = parseYAML(yamlInput.value);
      jsonOutput.value = JSON.stringify(obj, null, 2);
    } catch (e) {
      jsonOutput.value = 'Error: ' + e.message;
    }
  }

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(jsonOutput.value);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy', 1500);
  });

  yamlInput.addEventListener('input', convert);
  convert();
}