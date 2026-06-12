import { escapeHtml } from '../../utils/dom.js';

export const toolConfig = {
  id: 'sql-to-json',
  name: 'SQL to JSON & Schema Converter',
  category: 'dev',
  description: 'Parse SQL CREATE TABLE and INSERT INTO queries to generate structured JSON schemas and arrays.',
  icon: '🗃️',
  accept: '.sql',
  maxSizeMB: 5,
  keywords: ['sql', 'json', 'schema', 'converter', 'database', 'parser'],
  status: 'done',
  steps: [
    'Paste your SQL CREATE TABLE or INSERT statements',
    'Click "Parse SQL" to convert',
    'View JSON output and schema definitions',
    'Copy or download the results'
  ],
  faqs: [
    {
      question: 'What SQL statements does this tool support?',
      answer: 'It supports CREATE TABLE statements and INSERT INTO statements with VALUES clauses. It can extract table structures and data rows.'
    },
    {
      question: 'Is my SQL data sent to any server?',
      answer: 'No, all parsing happens entirely in your browser. Your SQL queries never leave your device.'
    }
  ]
};

const SQL_CSS = `
  .sql-converter-container { max-width: 1000px; margin: 0 auto; }
  .sql-textarea, .output-textarea {
    width: 100%; height: 250px; padding: var(--space-4);
    border: 2px solid var(--color-border); border-radius: var(--radius-xl);
    background: var(--color-surface); font-family: 'Fira Code', monospace;
    font-size: var(--text-sm); resize: vertical;
  }
  .sql-textarea:focus { outline: none; border-color: var(--color-primary); }
  .output-textarea { background: var(--color-bg); cursor: default; }
  .file-input { display: block; padding: var(--space-3); border: 2px dashed var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); cursor: pointer; }
  .file-input:hover { border-color: var(--color-primary); }
  .action-buttons { display: flex; gap: var(--space-3); margin: var(--space-6) 0; flex-wrap: wrap; }
  .action-buttons .btn { flex: 1; min-width: 120px; }
  .tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); border-bottom: 2px solid var(--color-border); }
  .tab { padding: var(--space-3) var(--space-4); background: transparent; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; cursor: pointer; font-weight: 500; color: var(--color-text-secondary); }
  .tab:hover { color: var(--color-text); }
  .tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
  .tab-panel { display: none; }
  .tab-panel.active { display: block; }
  .data-preview { padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg); overflow-x: auto; }
  .data-preview table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
  .data-preview th, .data-preview td { padding: var(--space-2) var(--space-3); text-align: left; border-bottom: 1px solid var(--color-border); }
  .data-preview th { background: var(--color-bg); font-weight: 600; }
`;

const SQL_HTML = `
  <div class="sql-converter-container">
    <div class="form-group">
      <label for="sql-input">SQL Input</label>
      <textarea id="sql-input" class="sql-textarea" placeholder="Paste your SQL CREATE TABLE or INSERT statements here..."></textarea>
    </div>
    <div class="form-group">
      <label for="file-upload">Or upload a .sql file:</label>
      <input type="file" id="file-upload" accept=".sql" class="file-input">
    </div>
    <div class="action-buttons">
      <button id="parse-btn" class="btn btn-primary">Parse SQL</button>
      <button id="copy-json-btn" class="btn btn-secondary" disabled>Copy JSON</button>
      <button id="copy-schema-btn" class="btn btn-secondary" disabled>Copy Schema</button>
      <button id="download-json-btn" class="btn btn-secondary" disabled>Download JSON</button>
      <button id="download-schema-btn" class="btn btn-secondary" disabled>Download Schema</button>
      <button id="clear-btn" class="btn btn-ghost">Clear</button>
    </div>
    <div class="tabs">
      <button class="tab active" data-tab="json">JSON Output</button>
      <button class="tab" data-tab="schema">JSON Schema</button>
      <button class="tab" data-tab="preview">Data Preview</button>
    </div>
    <div class="tab-content">
      <div id="json-tab" class="tab-panel active">
        <div class="form-group">
          <label for="json-output">JSON Output</label>
          <textarea id="json-output" class="output-textarea" readonly placeholder="Converted JSON will appear here..."></textarea>
        </div>
      </div>
      <div id="schema-tab" class="tab-panel">
        <div class="form-group">
          <label for="schema-output">JSON Schema</label>
          <textarea id="schema-output" class="output-textarea" readonly placeholder="JSON Schema will appear here..."></textarea>
        </div>
      </div>
      <div id="preview-tab" class="tab-panel">
        <div id="data-preview" class="data-preview"></div>
      </div>
    </div>
  </div>
`;

function buildPreviewHtml(jsonData) {
  let html = '';
  for (const [tableName, data] of Object.entries(jsonData)) {
    if (data.rows.length > 0) {
      html += `<h4>${escapeHtml(tableName)}</h4><table><thead><tr>`;
      Object.keys(data.rows[0]).forEach(col => { html += `<th>${escapeHtml(col)}</th>`; });
      html += '</tr></thead><tbody>';
      data.rows.slice(0, 10).forEach(row => {
        html += '<tr>';
        Object.values(row).forEach(val => { html += `<td>${val === null ? 'NULL' : escapeHtml(val)}</td>`; });
        html += '</tr>';
      });
      html += '</tbody></table>';
    }
  }
  return html || '<p>No data rows found to preview.</p>';
}

function parseCreateTable(sql) {
  const tables = {};
  const createRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(([\s\S]*?)\)\s*;/gi;
  let match;

  while ((match = createRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const columnsDef = match[2];
    const columns = {};

    const columnLines = columnsDef.split(',');
    for (const line of columnLines) {
      const trimmed = line.trim();
      if (trimmed.toUpperCase().startsWith('PRIMARY') || 
          trimmed.toUpperCase().startsWith('UNIQUE') ||
          trimmed.toUpperCase().startsWith('INDEX') ||
          trimmed.toUpperCase().startsWith('KEY')) {
        continue;
      }

      const colMatch = trimmed.match(/[`"']?(\w+)[`"']?\s+([\w()]+)/i);
      if (colMatch) {
        const colName = colMatch[1];
        const colType = colMatch[2].toUpperCase();
        columns[colName] = {
          type: mapSqlType(colType),
          nullable: !trimmed.toUpperCase().includes('NOT NULL')
        };
      }
    }

    tables[tableName] = columns;
  }

  return tables;
}

function mapSqlType(sqlType) {
  const type = sqlType.toUpperCase().split('(')[0];
  const mapping = {
    'INT': 'integer',
    'INTEGER': 'integer',
    'BIGINT': 'integer',
    'SMALLINT': 'integer',
    'TINYINT': 'integer',
    'DECIMAL': 'number',
    'NUMERIC': 'number',
    'FLOAT': 'number',
    'DOUBLE': 'number',
    'REAL': 'number',
    'VARCHAR': 'string',
    'CHAR': 'string',
    'TEXT': 'string',
    'LONGTEXT': 'string',
    'MEDIUMTEXT': 'string',
    'DATE': 'string (date)',
    'DATETIME': 'string (datetime)',
    'TIMESTAMP': 'string (datetime)',
    'TIME': 'string (time)',
    'BOOLEAN': 'boolean',
    'BOOL': 'boolean',
    'BLOB': 'string (binary)',
    'JSON': 'object'
  };
  return mapping[type] || 'string';
}

function parseInsertStatements(sql) {
  const inserts = {};
  const insertRegex = /INSERT\s+INTO\s+[`"']?(\w+)[`"']?\s*(?:\(([^)]+)\))?\s*VALUES\s*\(([\s\S]*?)\)\s*;/gi;
  let match;

  while ((match = insertRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const columnsStr = match[2];
    const valuesStr = match[3];

    const columns = columnsStr 
      ? columnsStr.split(',').map(c => c.trim().replace(/[`"']/g, ''))
      : [];

    const values = parseValues(valuesStr);

    if (!inserts[tableName]) {
      inserts[tableName] = [];
    }

    const row = {};
    if (columns.length > 0) {
      columns.forEach((col, i) => {
        row[col] = values[i] !== undefined ? values[i] : null;
      });
    } else {
      values.forEach((val, i) => {
        row[`column_${i + 1}`] = val;
      });
    }

    inserts[tableName].push(row);
  }

  return inserts;
}

function parseValues(valuesStr) {
  const values = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];

    if (inString) {
      if (char === stringChar && valuesStr[i - 1] !== '\\') {
        inString = false;
        values.push(current);
        current = '';
        i++; // skip comma
      } else {
        current += char;
      }
    } else {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
      } else if (char === ',' || i === valuesStr.length - 1) {
        const trimmed = current.trim();
        if (trimmed.toUpperCase() === 'NULL') {
          values.push(null);
        } else if (trimmed === 'TRUE') {
          values.push(true);
        } else if (trimmed === 'FALSE') {
          values.push(false);
        } else if (!isNaN(trimmed) && trimmed !== '') {
          values.push(Number(trimmed));
        } else {
          values.push(trimmed || null);
        }
        current = '';
      } else {
        current += char;
      }
    }
  }

  return values;
}

export function generateSchema(tables) {
  const schema = {};
  for (const [tableName, columns] of Object.entries(tables)) {
    schema[tableName] = {
      type: 'object',
      properties: {}
    };
    for (const [colName, colDef] of Object.entries(columns)) {
      schema[tableName].properties[colName] = {
        type: colDef.type
      };
    }
  }
  return schema;
}

export function render(container) {
  container.innerHTML = SQL_HTML;

  const style = document.createElement('style');
  style.textContent = SQL_CSS;
  container.appendChild(style);

  const q = id => container.querySelector(`#${id}`);
  const els = {
    sqlInput: q('sql-input'),
    fileUpload: q('file-upload'),
    jsonOutput: q('json-output'),
    schemaOutput: q('schema-output'),
    dataPreview: q('data-preview'),
    parseBtn: q('parse-btn'),
    copyJsonBtn: q('copy-json-btn'),
    copySchemaBtn: q('copy-schema-btn'),
    downloadJsonBtn: q('download-json-btn'),
    downloadSchemaBtn: q('download-schema-btn'),
    clearBtn: q('clear-btn'),
    tabs: container.querySelectorAll('.tab'),
    tabPanels: container.querySelectorAll('.tab-panel'),
  };

  let parsedData = null;
  let parsedSchema = null;

  els.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      els.tabs.forEach(t => t.classList.remove('active'));
      els.tabPanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector(`#${tab.dataset.tab}-tab`).classList.add('active');
    });
  });

  els.fileUpload.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => { els.sqlInput.value = ev.target.result; };
      reader.readAsText(file);
    }
  });

  els.parseBtn.addEventListener('click', () => {
    const sql = els.sqlInput.value.trim();
    if (!sql) { alert('Please paste SQL or upload a .sql file first.'); return; }
    try {
      const tables = parseCreateTable(sql);
      const inserts = parseInsertStatements(sql);
      const jsonData = {};
      for (const [tableName, columns] of Object.entries(tables)) {
        jsonData[tableName] = { structure: columns, rows: inserts[tableName] || [] };
      }
      parsedData = jsonData;
      parsedSchema = generateSchema(tables);
      els.jsonOutput.value = JSON.stringify(jsonData, null, 2);
      els.schemaOutput.value = JSON.stringify(parsedSchema, null, 2);
      els.dataPreview.innerHTML = buildPreviewHtml(jsonData);
      els.copyJsonBtn.disabled = false;
      els.copySchemaBtn.disabled = false;
      els.downloadJsonBtn.disabled = false;
      els.downloadSchemaBtn.disabled = false;
    } catch (err) {
      alert('Error parsing SQL: ' + err.message);
    }
  });

  const copyToClipboard = async (text, btn) => {
    try {
      await navigator.clipboard.writeText(text);
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  els.copyJsonBtn.addEventListener('click', () => copyToClipboard(els.jsonOutput.value, els.copyJsonBtn));
  els.copySchemaBtn.addEventListener('click', () => copyToClipboard(els.schemaOutput.value, els.copySchemaBtn));
  els.downloadJsonBtn.addEventListener('click', () => downloadFile(els.jsonOutput.value, 'converted-data.json'));
  els.downloadSchemaBtn.addEventListener('click', () => downloadFile(els.schemaOutput.value, 'schema.json'));

  els.clearBtn.addEventListener('click', () => {
    els.sqlInput.value = '';
    els.jsonOutput.value = '';
    els.schemaOutput.value = '';
    els.dataPreview.innerHTML = '';
    parsedData = null;
    parsedSchema = null;
    els.copyJsonBtn.disabled = true;
    els.copySchemaBtn.disabled = true;
    els.downloadJsonBtn.disabled = true;
    els.downloadSchemaBtn.disabled = true;
    els.fileUpload.value = '';
  });
}

export function destroy() {
  // No cleanup needed
}