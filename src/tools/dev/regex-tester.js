export const toolConfig = {
  id: 'regex-tester',
  name: 'Regex Tester',
  category: 'dev',
  description: 'Test regular expressions with live matching, capture groups, and visual railroad diagram.',
  icon: '🔍',
  status: 'done'
};

function tokenizeRegex(pattern) {
  const tokens = [];
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === '\\') {
      const next = pattern[i + 1] || '';
      const cls = /[dDwWsSbB]/.test(next);
      tokens.push({ type: cls ? 'class' : 'escape', value: '\\' + next });
      i += 2;
    } else if (ch === '[') {
      let j = i + 1;
      if (j < pattern.length && pattern[j] === '^') j++;
      if (j < pattern.length && pattern[j] === ']') j++;
      while (j < pattern.length && pattern[j] !== ']') {
        if (pattern[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'class', value: pattern.slice(i, j + 1) });
      i = j + 1;
    } else if (ch === '(') {
      let groupType = 'group';
      let value = '(';
      if (pattern[i + 1] === '?') {
        if (pattern[i + 2] === ':') { groupType = 'noncapture'; value = '(?:'; i += 3; }
        else if (pattern[i + 2] === '=') { groupType = 'lookahead'; value = '(?='; i += 3; }
        else if (pattern[i + 2] === '!') { groupType = 'neglookahead'; value = '(?!'; i += 3; }
        else { i += 2; }
      } else {
        i++;
      }
      tokens.push({ type: 'group-start', groupType, value });
    } else if (ch === ')') {
      tokens.push({ type: 'group-end', value: ')' });
      i++;
    } else if (ch === '|') {
      tokens.push({ type: 'alternation', value: '|' });
      i++;
    } else if (ch === '^' || ch === '$') {
      tokens.push({ type: 'anchor', value: ch });
      i++;
    } else if (ch === '*' || ch === '+' || ch === '?') {
      let value = ch;
      if (pattern[i + 1] === '?') { value += '?'; i++; }
      tokens.push({ type: 'quantifier', value });
      i++;
    } else if (ch === '{') {
      let j = i + 1;
      while (j < pattern.length && pattern[j] !== '}') j++;
      const quant = pattern.slice(i, j + 1);
      let value = quant;
      if (pattern[j + 1] === '?') { value += '?'; j++; }
      tokens.push({ type: 'quantifier', value });
      i = j + 1;
    } else if (ch === '.') {
      tokens.push({ type: 'class', value: '.' });
      i++;
    } else {
      tokens.push({ type: 'literal', value: ch });
      i++;
    }
  }
  return tokens;
}

function buildRailroadSVG(tokens) {
  const NODE_W = 40, NODE_H = 28, H_GAP = 12, V_GAP = 24;
  const TEXT_MAX = 60;

  function measureText(text) {
    return Math.min(text.length * 7 + 12, TEXT_MAX);
  }

  function renderNode(label, color) {
    const w = Math.max(measureText(label), NODE_W);
    return { w, h: NODE_H, label, color };
  }

  function layoutTokens(tokens) {
    const items = [];
    for (const tok of tokens) {
      if (tok.type === 'alternation') {
        items.push({ kind: 'split' });
      } else if (tok.type === 'group-start') {
        items.push({ kind: 'open', label: tok.value, color: '#6366f1' });
      } else if (tok.type === 'group-end') {
        items.push({ kind: 'close', label: ')', color: '#6366f1' });
      } else if (tok.type === 'anchor') {
        items.push({ kind: 'anchor', label: tok.value === '^' ? 'start' : 'end', color: '#f59e0b' });
      } else if (tok.type === 'quantifier') {
        items.push({ kind: 'quant', label: tok.value, color: '#8b5cf6' });
      } else if (tok.type === 'class') {
        const label = tok.value.length > 8 ? tok.value.slice(0, 7) + '…' : tok.value;
        items.push(renderNode(label, '#10b981'));
      } else if (tok.type === 'escape') {
        const label = tok.value.length > 8 ? tok.value.slice(0, 7) + '…' : tok.value;
        items.push(renderNode(label, '#f97316'));
      } else {
        const label = tok.value.length > 8 ? tok.value.slice(0, 7) + '…' : tok.value;
        items.push(renderNode(label, '#3b82f6'));
      }
    }
    return items;
  }

  const items = layoutTokens(tokens);
  if (items.length === 0) return '';

  const totalW = items.reduce((sum, item) => sum + (item.w || NODE_W) + H_GAP, H_GAP + 20);
  const totalH = NODE_H + V_GAP * 2 + 20;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">`;
  svg += `<style>text{font:11px monospace;fill:#1f2937}</style>`;

  const y = totalH / 2;
  let x = 10;

  svg += `<line x1="0" y1="${y}" x2="${x}" y2="${y}" stroke="#9ca3af" stroke-width="2"/>`;

  for (const item of items) {
    if (item.kind === 'split') {
      svg += `<circle cx="${x}" cy="${y}" r="4" fill="#ef4444"/>`;
      x += 8;
      svg += `<line x1="${x}" y1="${y}" x2="${x + H_GAP}" y2="${y}" stroke="#9ca3af" stroke-width="2"/>`;
      x += H_GAP;
    } else if (item.kind === 'anchor') {
      const w = 36;
      svg += `<rect x="${x}" y="${y - NODE_H / 2}" width="${w}" height="${NODE_H}" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>`;
      svg += `<text x="${x + w / 2}" y="${y + 4}" text-anchor="middle" font-size="10">${item.label}</text>`;
      x += w + H_GAP;
    } else if (item.kind === 'quant') {
      const w = Math.max(measureText(item.label), 32);
      svg += `<rect x="${x}" y="${y - NODE_H / 2}" width="${w}" height="${NODE_H}" rx="10" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="4,2"/>`;
      svg += `<text x="${x + w / 2}" y="${y + 4}" text-anchor="middle" font-size="10">${item.label}</text>`;
      x += w + H_GAP;
    } else if (item.kind === 'open' || item.kind === 'close') {
      const w = Math.max(measureText(item.label), 28);
      svg += `<rect x="${x}" y="${y - NODE_H / 2}" width="${w}" height="${NODE_H}" rx="4" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>`;
      svg += `<text x="${x + w / 2}" y="${y + 4}" text-anchor="middle" font-size="10">${item.label}</text>`;
      x += w + H_GAP;
    } else {
      const w = item.w || NODE_W;
      svg += `<rect x="${x}" y="${y - NODE_H / 2}" width="${w}" height="${NODE_H}" rx="6" fill="white" stroke="${item.color}" stroke-width="2"/>`;
      svg += `<text x="${x + w / 2}" y="${y + 4}" text-anchor="middle" font-size="11">${item.label}</text>`;
      x += w + H_GAP;
    }

    svg += `<line x1="${x - H_GAP + (items.indexOf(item) < items.length - 1 ? 0 : 0)}" y1="${y}" x2="${x}" y2="${y}" stroke="#9ca3af" stroke-width="2"/>`;
  }

  svg += `<line x1="${x}" y1="${y}" x2="${x + 10}" y2="${y}" stroke="#9ca3af" stroke-width="2"/>`;
  svg += `<circle cx="${x + 10}" cy="${y}" r="4" fill="#9ca3af"/>`;

  svg += '</svg>';
  return svg;
}

export function render(container) {
  container.innerHTML = `
    <div class="regex-container">
      <h2>Regex Tester</h2>
      <div class="input-group">
        <input type="text" id="pattern" placeholder="Regular expression" value="\\b\\w+\\b">
        <div class="flags">
          <label><input type="checkbox" id="g" checked> global</label>
          <label><input type="checkbox" id="i" checked> case-insensitive</label>
          <label><input type="checkbox" id="m" checked> multiline</label>
        </div>
      </div>
      <textarea id="testInput" placeholder="Test string...">The quick brown fox jumps over the lazy dog</textarea>
      <div class="regex-toggle">
        <label><input type="checkbox" id="showDiagram" checked> Show railroad diagram</label>
      </div>
      <div id="diagramWrap" class="diagram-wrap"></div>
      <div class="results">
        <div class="match-count" id="matchCount"></div>
        <div class="matches" id="matches"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .regex-container { max-width: 800px; margin: 0 auto; }
    .regex-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .input-group { margin-bottom: var(--space-3); }
    #pattern { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); font-family: monospace; font-size: var(--text-lg); margin-bottom: var(--space-2); }
    .flags { display: flex; gap: var(--space-4); margin-bottom: var(--space-3); }
    .flags label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); }
    #testInput { width: 100%; height: 120px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); font-family: monospace; resize: vertical; }
    .regex-toggle { margin: var(--space-3) 0; }
    .regex-toggle label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); color: var(--color-text-secondary); }
    .diagram-wrap { overflow-x: auto; padding: var(--space-3); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); margin-bottom: var(--space-4); min-height: 40px; }
    .diagram-wrap svg { display: block; }
    .results { margin-top: var(--space-4); }
    .match-count { font-weight: 600; margin-bottom: var(--space-2); }
    .matches { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-3); max-height: 200px; overflow: auto; }
    .match-item { padding: var(--space-2); border-bottom: 1px solid var(--color-border); font-family: monospace; font-size: var(--text-sm); }
    .match-item:last-child { border: none; }
  `;
  container.appendChild(style);

  const diagramWrap = container.querySelector('#diagramWrap');
  const showDiagram = container.querySelector('#showDiagram');

  function updateDiagram() {
    const pattern = container.querySelector('#pattern').value;
    if (!showDiagram.checked || !pattern) {
      diagramWrap.innerHTML = '';
      return;
    }
    try {
      const tokens = tokenizeRegex(pattern);
      diagramWrap.innerHTML = buildRailroadSVG(tokens);
    } catch {
      diagramWrap.innerHTML = '<span style="color:#ef4444;font-size:12px">Cannot render diagram</span>';
    }
  }

  function run() {
    const pattern = container.querySelector('#pattern').value;
    const flags = (container.querySelector('#g').checked ? 'g' : '') +
                 (container.querySelector('#i').checked ? 'i' : '') +
                 (container.querySelector('#m').checked ? 'm' : '');
    const text = container.querySelector('#testInput').value;
    try {
      const regex = new RegExp(pattern, flags);
      const matches = text.match(regex) || [];
      container.querySelector('#matchCount').textContent = matches.length + ' match' + (matches.length !== 1 ? 'es' : '');
      if (matches.length === 0) {
        container.querySelector('#matches').innerHTML = '<div class="match-item">No matches found</div>';
      } else {
        container.querySelector('#matches').innerHTML = matches.map((m, i) =>
          '<div class="match-item">' + (i + 1) + '. "' + m + '"</div>'
        ).join('');
      }
    } catch (e) {
      container.querySelector('#matchCount').textContent = 'Invalid regex';
      container.querySelector('#matches').innerHTML = '<div class="match-item" style="color:#ef4444">' + e.message + '</div>';
    }
    updateDiagram();
  }

  container.querySelectorAll('input').forEach(i => i.addEventListener('input', run));
  container.querySelectorAll('input').forEach(i => i.addEventListener('change', run));
  run();
}
