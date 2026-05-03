import { createFileUpload } from '../../components/file-upload.js';

export const toolConfig = {
  id: 'xml-to-csv',
  name: 'XML to CSV Converter',
  category: 'text',
  description: 'Convert XML files to CSV format. Extract data tables from XML documents.',
  icon: '📊',
  accept: '.xml',
  maxSizeMB: 10,
  keywords: ['xml to csv', 'convert xml csv', 'xml converter'],
  steps: ['Upload XML file', 'Preview data', 'Download CSV']
};

export function render(container) {
  container.innerHTML = `
    <div class="xml-csv-container">
      <div class="file-area">
        <div id="dropzone" class="dropzone">
          <p>Drag & drop XML file here or click to browse</p>
          <input type="file" id="file-input" accept=".xml" hidden>
          <button class="btn btn-primary" id="browse-btn">Browse Files</button>
        </div>
      </div>
      <div id="preview" class="preview-area" style="display:none">
        <h3>Preview</h3>
        <div id="table-container"></div>
        <button id="download-btn" class="btn btn-primary">Download CSV</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .xml-csv-container { max-width: 900px; margin: 0 auto; }
    .dropzone { 
      border: 2px dashed var(--color-border); border-radius: var(--radius-lg);
      padding: var(--space-8); text-align: center; cursor: pointer;
    }
    .dropzone:hover { border-color: var(--color-primary); background: var(--color-surface); }
    .preview-area { margin-top: var(--space-4); }
    #table-container { 
      max-height: 400px; overflow: auto; 
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      margin: var(--space-4) 0;
    }
    table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
    th, td { 
      padding: var(--space-2) var(--space-3); text-align: left;
      border-bottom: 1px solid var(--color-border);
    }
    th { background: var(--color-surface); font-weight: 600; }
  `;
  container.appendChild(style);

  const dropzone = container.querySelector('#dropzone');
  const fileInput = container.querySelector('#file-input');
  const browseBtn = container.querySelector('#browse-btn');
  const preview = container.querySelector('#preview');
  const tableContainer = container.querySelector('#table-container');
  const downloadBtn = container.querySelector('#download-btn');

  let csvData = [];
  let headers = [];

  function parseXML(xmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    
    const rows = [];
    
    function extractRows(element, path = '') {
      const children = Array.from(element.children);
      
      if (children.length === 0) {
        return null;
      }
      
      const row = {};
      let hasTextContent = element.textContent.trim() && children.length === 0;
      
      if (hasTextContent && path) {
        row[path] = element.textContent.trim();
      }
      
      for (const child of children) {
        const childPath = path ? `${path}.${child.tagName}` : child.tagName;
        const childData = extractRows(child, childPath);
        if (childData) {
          Object.assign(row, childData);
        }
      }
      
      if (Object.keys(row).length > 0) {
        rows.push(row);
      }
      
      return null;
    }
    
    extractRows(doc.documentElement);
    
    // Try to find repeating elements
    const allElements = doc.getElementsByTagName('*');
    const tagCounts = {};
    for (const el of allElements) {
      tagCounts[el.tagName] = (tagCounts[el.tagName] || 0) + 1;
    }
    
    const repeatingTags = Object.entries(tagCounts)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
    
    if (repeatingTags.length > 0) {
      const targetTag = repeatingTags[0];
      const elements = doc.getElementsByTagName(targetTag);
      for (const el of elements) {
        const row = {};
        function extract(el, prefix = '') {
          for (const child of el.children) {
            const key = prefix ? `${prefix}.${child.tagName}` : child.tagName;
            if (child.children.length === 0 || child.textContent.trim()) {
              row[key] = child.textContent.trim();
            }
            extract(child, key);
          }
        }
        extract(el);
        if (Object.keys(row).length > 0) {
          rows.push(row);
        }
      }
    }
    
    return rows;
  }

  function toCSV(rows) {
    if (rows.length === 0) return '';
    
    const allKeys = new Set();
    rows.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));
    const keys = Array.from(allKeys);
    
    const header = keys.join(',');
    const lines = rows.map(row => 
      keys.map(k => {
        const val = row[k] || '';
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      }).join(',')
    );
    
    return [header, ...lines].join('\n');
  }

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xml = e.target.result;
        const rows = parseXML(xml);
        
        if (rows.length === 0) {
          alert('No data found in XML file');
          return;
        }
        
        csvData = rows;
        const csv = toCSV(rows);
        
        // Display preview
        const keys = Object.keys(rows[0] || {});
        let html = '<table><thead><tr>';
        html += keys.map(k => `<th>${k}</th>`).join('');
        html += '</tr></thead><tbody>';
        
        const previewRows = rows.slice(0, 10);
        previewRows.forEach(row => {
          html += '<tr>';
          html += keys.map(k => `<td>${row[k] || ''}</td>`).join('');
          html += '</tr>';
        });
        
        if (rows.length > 10) {
          html += `<tr><td colspan="${keys.length}">... and ${rows.length - 10} more rows</td></tr>`;
        }
        
        html += '</tbody></table>';
        
        tableContainer.innerHTML = html;
        preview.style.display = 'block';
        
        // Store CSV for download
        container.csvData = csv;
      } catch (err) {
        alert('Error parsing XML: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  dropzone.addEventListener('click', () => fileInput.click());
  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--color-primary)';
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '';
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '';
    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  downloadBtn.addEventListener('click', () => {
    const csv = container.csvData;
    if (!csv) return;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
}
