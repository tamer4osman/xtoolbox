import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { parseCSV } from '../../utils/csv.js';

export const toolConfig = {
  id: 'markdown-table-generator',
  name: 'Markdown Table Generator',
  category: 'text',
  description: 'Visually create and edit Markdown tables with a spreadsheet-like interface. Import from CSV/TSV/pipe-delimited or Markdown; export to GitHub-flavored Markdown.',
  icon: '📊',
  accept: '.csv,.tsv,.txt,.md',
  maxSizeMB: 5,
  keywords: ['markdown', 'table', 'generator', 'editor', 'spreadsheet', 'csv', 'tsv', 'pipe'],
  steps: [
    'Edit headers, alignments, and cells directly in the grid',
    'Or paste CSV / TSV / pipe-delimited / Markdown text above and click Import',
    'Watch the Markdown output update live below',
    'Copy the result or download a .md file'
  ],
  faqs: [
    { question: 'How do I change column alignment?', answer: 'Each column header has an alignment dropdown (left, center, right). The separator row in the Markdown output updates to match — `:---`, `:---:`, or `---:`.' },
    { question: 'What happens if my cell contains a pipe character?', answer: 'Pipes inside cells are escaped as `\\|` so the table stays well-formed. Newlines inside cells become `<br>` tags (GFM convention).' },
    { question: 'Can I import an existing Markdown table?', answer: 'Yes. Paste any standard Markdown table into the Import box and click Import. The tool detects the header row, separator, alignment hints, and body rows.' },
    { question: 'Which delimiters does the importer auto-detect?', answer: 'Markdown (header + separator), then tabs, pipes, or commas — whichever appears most in the first non-empty line. You can also pick the delimiter manually.' }
  ]
};

export function escapeCell(s) {
  if (s == null) return '';
  return String(s).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r\n|\r|\n/g, '<br>');
}

export function parseDelimited(text, delimiter) {
  if (text == null) return [];
  if (delimiter === ',') return parseCSV(text);

  const raw = String(text).replace(/\r\n?/g, '\n');
  const lines = raw.split('\n').filter((_, i, arr) => i < arr.length - 1 || arr[i].length > 0);
  if (lines.length === 0) return [];

  const rows = [];
  for (const line of lines) {
    if (line === '' && rows.length === 0) continue;
    if (delimiter === 'tsv') {
      rows.push(line.split('\t').map(c => c.trim()));
    } else {
      rows.push(line.split(delimiter).map(c => c.trim()));
    }
  }
  return rows;
}

export function detectDelimiter(text) {
  if (!text) return ',';
  const firstLine = String(text).split(/\r?\n/)[0] || '';
  if (/^\s*\|.*\|\s*$/.test(firstLine)) return '|';
  const tabs = (firstLine.match(/\t/g) || []).length;
  const pipes = (firstLine.match(/\|/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  if (tabs >= 1 && tabs >= pipes && tabs >= commas) return 'tsv';
  if (pipes >= 2 && pipes >= commas) return '|';
  return ',';
}

export function isMarkdownTable(text) {
  if (!text) return false;
  const lines = String(text).split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return false;
  return /^\s*\|?[\s:|-]+\|?[\s:|-]*$/.test(lines[1]) && /-+/.test(lines[1]);
}

export function parseMarkdownTable(text) {
  const out = { headers: [], rows: [], alignments: [] };
  if (!text) return out;
  const lines = String(text).split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return out;

  const splitRow = (line) => {
    let s = line.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    const cells = [];
    let cell = '';
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '\\' && s[i + 1] === '|') {
        cell += '|';
        i += 2;
      } else if (c === '|') {
        cells.push(cell);
        cell = '';
        i++;
      } else {
        cell += c;
        i++;
      }
    }
    cells.push(cell);
    return cells.map(c => c.trim().replace(/<br\s*\/?>/gi, '\n'));
  };

  const parseAlignment = (cell) => {
    const t = cell.trim();
    const left = t.startsWith(':');
    const right = t.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  };

  out.headers = splitRow(lines[0]);
  out.alignments = splitRow(lines[1]).map(parseAlignment);
  if (out.alignments.length < out.headers.length) {
    while (out.alignments.length < out.headers.length) out.alignments.push('left');
  }
  for (let i = 2; i < lines.length; i++) {
    const cells = splitRow(lines[i]);
    while (cells.length < out.headers.length) cells.push('');
    out.rows.push(cells.slice(0, out.headers.length));
  }
  return out;
}

export function generateMarkdown(headers, rows, alignments) {
  const cols = (headers || []).length;
  if (cols === 0) return '';
  const align = (alignments || []).slice(0, cols);
  while (align.length < cols) align.push('left');

  const sepCell = (a) => a === 'center' ? ':---:' : a === 'right' ? '---:' : ':---';

  const widths = [];
  for (let c = 0; c < cols; c++) {
    let w = escapeCell(headers[c] || '').length;
    for (const r of rows || []) {
      const len = escapeCell(r[c] || '').length;
      if (len > w) w = len;
    }
    widths.push(Math.max(3, w));
  }

  const pad = (s, w) => {
    const visible = s.length;
    if (visible >= w) return s;
    return s + ' '.repeat(w - visible);
  };

  const headerLine = '| ' + headers.map((h, i) => pad(escapeCell(h), widths[i])).join(' | ') + ' |';
  const sepLine = '| ' + align.map((a, i) => pad(sepCell(a), widths[i])).join(' | ') + ' |';
  const bodyLines = (rows || []).map(r =>
    '| ' + r.map((c, i) => pad(escapeCell(c == null ? '' : c), widths[i])).join(' | ') + ' |'
  );

  return [headerLine, sepLine, ...bodyLines].join('\n');
}

const DEFAULT_HEADERS = ['Name', 'Value', 'Notes'];
const DEFAULT_ALIGN = ['left', 'left', 'left'];

function ensureShape(state) {
  if (state.headers.length === 0) { state.headers = ['']; state.alignments = ['left']; }
  state.rows = state.rows.map(r => {
    const out = r.slice(0, state.headers.length);
    while (out.length < state.headers.length) out.push('');
    return out;
  });
}

function buildGridHTML(headers, rows, alignments) {
  let html = '<thead><tr>';
  headers.forEach((h, c) => {
    html += `<th style="border:1px solid var(--color-border);padding:var(--space-2);background:var(--color-bg);text-align:left;vertical-align:top;min-width:120px;">
      <input type="text" class="mtg-h text-input" data-col="${c}" value="${(h || '').replace(/"/g, '&quot;')}" placeholder="Column ${c + 1}" style="width:100%;margin-bottom:var(--space-1);font-weight:600;">
      <div style="display:flex;gap:var(--space-1);align-items:center;">
        <select class="mtg-a text-input" data-col="${c}" style="flex:1;font-size:var(--text-xs);padding:2px var(--space-1);">
          <option value="left" ${alignments[c] === 'left' ? 'selected' : ''}>Left</option>
          <option value="center" ${alignments[c] === 'center' ? 'selected' : ''}>Center</option>
          <option value="right" ${alignments[c] === 'right' ? 'selected' : ''}>Right</option>
        </select>
        <button class="mtg-rm-col btn btn-sm" data-col="${c}" type="button" title="Remove column" style="background:transparent;border:1px solid var(--color-border);color:var(--color-text-muted);cursor:pointer;padding:2px 6px;border-radius:var(--radius-sm);">×</button>
      </div>
    </th>`;
  });
  html += '</tr></thead><tbody>';
  rows.forEach((row, r) => {
    html += '<tr>';
    headers.forEach((_, c) => {
      const v = (row[c] != null ? row[c] : '').replace(/"/g, '&quot;');
      html += `<td style="border:1px solid var(--color-border);padding:var(--space-1);"><input type="text" class="mtg-c text-input" data-row="${r}" data-col="${c}" value="${v}" style="width:100%;border:none;background:transparent;padding:var(--space-1);"></td>`;
    });
    html += `<td style="border:1px solid var(--color-border);padding:var(--space-1);width:32px;text-align:center;"><button class="mtg-rm-row btn btn-sm" data-row="${r}" type="button" title="Remove row" style="background:transparent;border:1px solid var(--color-border);color:var(--color-text-muted);cursor:pointer;padding:2px 6px;border-radius:var(--radius-sm);">×</button></td></tr>`;
  });
  return html + '</tbody>';
}

function bindMarkdownTableEvents(ctx) {
  const { container, state, gridEl, outputEl, statsEl, importTextEl, delimEl, renderAll } = ctx;

  gridEl.addEventListener('input', e => {
    if (e.target.classList.contains('mtg-h')) { state.headers[parseInt(e.target.dataset.col, 10)] = e.target.value; renderAll(); }
    else if (e.target.classList.contains('mtg-c')) { state.rows[parseInt(e.target.dataset.row, 10)][parseInt(e.target.dataset.col, 10)] = e.target.value; renderAll(); }
  });

  gridEl.addEventListener('change', e => {
    if (e.target.classList.contains('mtg-a')) { state.alignments[parseInt(e.target.dataset.col, 10)] = e.target.value; renderAll(); }
  });

  gridEl.addEventListener('click', e => {
    const rmCol = e.target.closest('.mtg-rm-col');
    if (rmCol) {
      const c = parseInt(rmCol.dataset.col, 10);
      if (state.headers.length <= 1) { showToast({ message: 'At least one column is required', type: 'error' }); return; }
      state.headers.splice(c, 1); state.alignments.splice(c, 1); state.rows.forEach(r => r.splice(c, 1)); renderAll();
      return;
    }
    const rmRow = e.target.closest('.mtg-rm-row');
    if (rmRow) { state.rows.splice(parseInt(rmRow.dataset.row, 10), 1); renderAll(); }
  });

  container.querySelector('#mtg-add-row').addEventListener('click', () => { state.rows.push(new Array(state.headers.length).fill('')); renderAll(); });
  container.querySelector('#mtg-add-col').addEventListener('click', () => { state.headers.push(''); state.alignments.push('left'); state.rows.forEach(r => r.push('')); renderAll(); });
  container.querySelector('#mtg-reset').addEventListener('click', () => { state.headers = [...DEFAULT_HEADERS]; state.rows = [['', '', ''], ['', '', '']]; state.alignments = [...DEFAULT_ALIGN]; renderAll(); });

  container.querySelector('#mtg-import').addEventListener('click', () => {
    const text = importTextEl.value;
    if (!text.trim()) { showToast({ message: 'Paste some data first', type: 'error' }); return; }
    let headers, rows, alignments;
    if (isMarkdownTable(text)) {
      const parsed = parseMarkdownTable(text); headers = parsed.headers; rows = parsed.rows; alignments = parsed.alignments;
    } else {
      const choice = delimEl.value;
      const delim = choice === 'auto' ? detectDelimiter(text) : (choice === 'tsv' ? '\t' : choice);
      const data = parseDelimited(text, choice === 'tsv' ? 'tsv' : delim);
      if (data.length === 0) { showToast({ message: 'No data parsed', type: 'error' }); return; }
      headers = data[0]; rows = data.slice(1); alignments = headers.map(() => 'left');
      if (rows.length === 0) rows = [headers.map(() => '')];
    }
    state.headers = headers.map(h => h == null ? '' : String(h));
    state.alignments = alignments.slice(0, state.headers.length);
    while (state.alignments.length < state.headers.length) state.alignments.push('left');
    state.rows = rows.map(r => r.slice(0, state.headers.length).map(c => c == null ? '' : String(c)));
    while (state.rows.length === 0) state.rows.push(new Array(state.headers.length).fill(''));
    renderAll();
    showToast({ message: `Imported ${state.headers.length} column${state.headers.length === 1 ? '' : 's'} × ${state.rows.length} row${state.rows.length === 1 ? '' : 's'}`, type: 'success' });
  });

  container.querySelector('#mtg-clear-import').addEventListener('click', () => { importTextEl.value = ''; });

  container.querySelector('#mtg-copy').addEventListener('click', async () => {
    const text = outputEl.textContent;
    if (!text || text.startsWith('Add at least')) { showToast({ message: 'Nothing to copy', type: 'error' }); return; }
    const ok = await copyToClipboard(text);
    showToast({ message: ok ? 'Copied Markdown to clipboard' : 'Copy failed', type: ok ? 'success' : 'error' });
  });

  container.querySelector('#mtg-download').addEventListener('click', () => {
    const text = outputEl.textContent;
    if (!text || text.startsWith('Add at least')) { showToast({ message: 'Nothing to download', type: 'error' }); return; }
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'table.md'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast({ message: 'Downloaded table.md', type: 'success' });
  });
}

export function render(container) {
  const state = { headers: [...DEFAULT_HEADERS], rows: [['', '', ''], ['', '', '']], alignments: [...DEFAULT_ALIGN] };

  container.innerHTML = `
    <div class="tool-layout">
      <details style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);margin-bottom:var(--space-4);">
        <summary style="cursor:pointer;font-weight:600;color:var(--color-text-muted);font-size:var(--text-sm);">Import data (CSV / TSV / pipe / Markdown)</summary>
        <div style="margin-top:var(--space-3);">
          <div style="display:flex;gap:var(--space-2);align-items:center;margin-bottom:var(--space-2);flex-wrap:wrap;">
            <label style="font-size:var(--text-sm);">Delimiter:</label>
            <select id="mtg-delim" class="text-input" style="width:auto;"><option value="auto">Auto-detect</option><option value=",">Comma (,)</option><option value="tsv">Tab</option><option value="|">Pipe (|)</option></select>
            <button class="btn btn-primary btn-sm" id="mtg-import" type="button">Import</button>
            <button class="btn btn-secondary btn-sm" id="mtg-clear-import" type="button">Clear</button>
          </div>
          <textarea id="mtg-import-text" class="text-input" rows="4" placeholder="Paste CSV, TSV, pipe-delimited, or Markdown table text here..." style="font-family:monospace;font-size:var(--text-sm);resize:vertical;"></textarea>
        </div>
      </details>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
        <span style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);">Grid editor</span>
        <div style="display:flex;gap:var(--space-2);"><button class="btn btn-secondary btn-sm" id="mtg-add-row" type="button">+ Row</button><button class="btn btn-secondary btn-sm" id="mtg-add-col" type="button">+ Column</button><button class="btn btn-secondary btn-sm" id="mtg-reset" type="button">Reset</button></div>
      </div>
      <div style="overflow-x:auto;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-4);"><table id="mtg-grid" style="border-collapse:collapse;width:100%;font-size:var(--text-sm);"></table></div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <span style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);">Markdown output <span id="mtg-stats" style="color:var(--color-text-muted);font-weight:400;"></span></span>
          <div style="display:flex;gap:var(--space-2);"><button class="btn btn-secondary btn-sm" id="mtg-copy" type="button">Copy</button><button class="btn btn-primary btn-sm" id="mtg-download" type="button">Download .md</button></div>
        </div>
        <pre id="mtg-output" style="background:#1e1e2e;color:#cdd6f4;padding:var(--space-3);border-radius:var(--radius-md);overflow-x:auto;font-size:var(--text-sm);line-height:1.6;white-space:pre-wrap;word-break:break-word;min-height:120px;font-family:monospace;max-height:480px;overflow-y:auto;"></pre>
      </div>
    </div>
  `;

  const q = id => container.querySelector(`#${id}`);
  const els = { gridEl: q('mtg-grid'), outputEl: q('mtg-output'), statsEl: q('mtg-stats'), importTextEl: q('mtg-import-text'), delimEl: q('mtg-delim') };

  function renderGrid() { ensureShape(state); els.gridEl.innerHTML = buildGridHTML(state.headers, state.rows, state.alignments); }
  function renderOutput() {
    const text = generateMarkdown(state.headers, state.rows, state.alignments);
    els.outputEl.textContent = text || 'Add at least one column to build a table.';
    const lines = text ? text.split('\n').length : 0;
    els.statsEl.textContent = text ? `(${lines} line${lines === 1 ? '' : 's'}, ${text.length} chars)` : '';
  }
  function renderAll() { renderGrid(); renderOutput(); }

  bindMarkdownTableEvents({ container, state, ...els, renderAll });
  renderAll();
}

export function destroy() {}
