import { findLocalFileHeaders, extractEntryData, isDirectory, hasDataDescriptor } from '../../utils/archive-utils.js';
import { formatFileSize, downloadBlob as downloadFile } from '../../utils/file.js';
import JSZip from 'jszip';

export const toolConfig = {
  id: 'archive-repair',
  name: 'Archive Repair & Recovery',
  category: 'productivity',
  description: 'Repair corrupted ZIP archives and recover readable files from damaged or incomplete ZIP archives.',
  icon: '🔧',
  keywords: ['zip', 'repair', 'recover', 'corrupted', 'archive', 'fix', 'broken'],
  accept: '.zip',
  maxSizeMB: 100,
  status: 'done'
};

function getCompressionName(method) {
  const names = { 0: 'Stored', 8: 'Deflated' };
  return names[method] || `Method ${method}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function tryNormalLoad(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer, { checkCRC32: false, optimizedBinaryString: true });
  const files = [];
  zip.forEach((path, entry) => {
    if (!entry.dir) {
      files.push({
        path,
        compressedSize: entry._data ? entry._data.compressedSize || 0 : 0,
        uncompressedSize: entry._data ? entry._data.uncompressedSize || 0 : 0,
        method: entry._data ? entry._data.compressionMethod : 8,
        date: entry.date
      });
    }
  });
  return { zip, files };
}

function extractStoredEntry(view, header) {
  const data = extractEntryData(view, header);
  if (!data) return { skipped: { path: header.fileName, reason: 'Data extends beyond file boundary' } };
  return { recovered: { header, data: new Uint8Array(data) } };
}

async function extractDeflatedEntry(view, header) {
  const data = extractEntryData(view, header);
  if (!data) return { skipped: { path: header.fileName, reason: 'Data extends beyond file boundary' } };
  try {
    const decompressed = await inflateRaw(data);
    return { recovered: { header, data: decompressed } };
  } catch {
    return { skipped: { path: header.fileName, reason: 'Deflate decompression failed - data may be corrupted' } };
  }
}

async function processEntry(view, header) {
  if (isDirectory(header)) return null;
  if (hasDataDescriptor(header)) return { skipped: { path: header.fileName, reason: 'Data descriptor (streaming) - cannot recover without full ZIP structure' } };
  if (header.compressionMethod === 0) return extractStoredEntry(view, header);
  if (header.compressionMethod === 8) return extractDeflatedEntry(view, header);
  return { skipped: { path: header.fileName, reason: `Unsupported compression method: ${header.compressionMethod}` } };
}

async function recoverFromRawBytes(arrayBuffer) {
  const view = new Uint8Array(arrayBuffer);
  const headers = findLocalFileHeaders(arrayBuffer);
  const recoveredFiles = [];
  const skippedFiles = [];

  for (const header of headers) {
    const result = await processEntry(view, header);
    if (!result) continue;
    if (result.recovered) recoveredFiles.push(result.recovered);
    if (result.skipped) skippedFiles.push(result.skipped);
  }

  return { recoveredFiles, skippedFiles, totalHeaders: headers.length };
}

function inflateRaw(data) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([data]);
    const reader = blob.stream().getReader();
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    const reader2 = ds.readable.getReader();
    const chunks = [];

    reader.read().then(function process({ done, value }) {
      if (done) {
        writer.close();
      } else {
        writer.write(value).then(() => reader.read().then(process));
      }
    });

    reader2.read().then(function process({ done, value }) {
      if (done) {
        const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        resolve(result);
      } else {
        chunks.push(value);
        reader2.read().then(process);
      }
    }).catch(reject);
  });
}

async function buildRepairedZip(recoveredFiles) {
  const zip = new JSZip();
  for (const file of recoveredFiles) {
    zip.file(file.header.fileName, file.data, { binary: true });
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

function renderFileList(files, emptyMsg) {
  if (files.length === 0) return `<div style="padding:12px;color:var(--text-muted,#888);font-size:13px;">${emptyMsg}</div>`;
  return files.map(f => `
    <div class="ar-file-item">
      <div>
        <div class="name">${escapeHtml(f.header?.fileName || f.path)}</div>
        <div class="reason">${f.reason ? escapeHtml(f.reason) : `${getCompressionName(f.header.compressionMethod)} → ${formatFileSize(f.data.length)}`}</div>
      </div>
      <div class="meta">${f.data ? formatFileSize(f.data.length) : ''}</div>
    </div>
  `).join('');
}

function renderSummary(recoveredFiles, skippedFiles) {
  const totalSize = recoveredFiles.reduce((acc, f) => acc + f.data.length, 0);
  return `
    <div class="ar-summary-card"><div class="count">${recoveredFiles.length}</div><div class="label">Recovered</div></div>
    <div class="ar-summary-card"><div class="count">${skippedFiles.length}</div><div class="label">Skipped</div></div>
    <div class="ar-summary-card"><div class="count">${formatFileSize(totalSize)}</div><div class="label">Total Size</div></div>
  `;
}

function renderArchiveInfo(originalName, arrayBuffer, repairedBlob, recoveredFiles, skippedFiles) {
  return `<dl>
    <dt>Original File</dt><dd>${escapeHtml(originalName)}</dd>
    <dt>Original Size</dt><dd>${formatFileSize(arrayBuffer.byteLength)}</dd>
    <dt>Repaired Size</dt><dd>${formatFileSize(repairedBlob.size)}</dd>
    <dt>Entries Found</dt><dd>${recoveredFiles.length + skippedFiles.length}</dd>
    <dt>Entries Recovered</dt><dd>${recoveredFiles.length}</dd>
    <dt>Entries Skipped</dt><dd>${skippedFiles.length}</dd>
  </dl>`;
}

function getStyles() {
  return `
    .ar-container { max-width: 800px; margin: 0 auto; }
    .ar-upload-area { border: 2px dashed var(--border, #ccc); border-radius: 12px; padding: 48px 24px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
    .ar-upload-area:hover, .ar-upload-area.drag-over { border-color: var(--primary, #4285f4); background: var(--primary-bg, #f0f7ff); }
    .ar-upload-icon { font-size: 48px; margin-bottom: 12px; }
    .ar-upload-text { font-size: 16px; font-weight: 600; color: var(--text); }
    .ar-upload-hint { font-size: 13px; color: var(--text-muted, #888); margin-top: 6px; }
    .ar-status { margin-top: 16px; padding: 12px 16px; border-radius: 8px; font-size: 14px; background: var(--bg-secondary, #f8f9fa); color: var(--text); }
    .ar-status.error { background: #fef2f2; color: #dc2626; }
    .ar-status.success { background: #f0fdf4; color: #16a34a; }
    .ar-results { margin-top: 20px; }
    .ar-results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .ar-results-header h3 { margin: 0; font-size: 18px; color: var(--text); }
    .ar-summary { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .ar-summary-card { flex: 1; min-width: 120px; padding: 12px 16px; background: var(--bg-secondary, #f8f9fa); border-radius: 8px; text-align: center; }
    .ar-summary-card .count { font-size: 24px; font-weight: 700; color: var(--primary, #4285f4); }
    .ar-summary-card .label { font-size: 12px; color: var(--text-muted, #888); margin-top: 4px; }
    .ar-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border, #ccc); margin-bottom: 16px; }
    .ar-tab { padding: 8px 16px; border: none; background: none; font-size: 14px; cursor: pointer; color: var(--text-muted, #888); border-bottom: 2px solid transparent; transition: all 0.2s; }
    .ar-tab:hover { color: var(--text); }
    .ar-tab.active { color: var(--primary, #4285f4); border-bottom-color: var(--primary, #4285f4); font-weight: 600; }
    .ar-tab-content { min-height: 100px; }
    .ar-file-list { display: flex; flex-direction: column; gap: 6px; }
    .ar-file-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-secondary, #f8f9fa); border-radius: 8px; font-size: 13px; }
    .ar-file-item .name { font-weight: 500; color: var(--text); word-break: break-all; }
    .ar-file-item .meta { color: var(--text-muted, #888); white-space: nowrap; margin-left: 12px; }
    .ar-file-item .reason { color: var(--warning, #d97706); font-size: 12px; margin-top: 2px; }
    .ar-archive-info { padding: 16px; background: var(--bg-secondary, #f8f9fa); border-radius: 8px; }
    .ar-archive-info dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin: 0; }
    .ar-archive-info dt { font-weight: 600; color: var(--text-muted, #888); font-size: 13px; }
    .ar-archive-info dd { color: var(--text); font-size: 13px; margin: 0; }
    .ar-btn { padding: 8px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .ar-btn-primary { background: var(--primary, #4285f4); color: white; }
    .ar-btn-primary:hover { filter: brightness(0.9); }
  `;
}

function getMarkup() {
  return `
    <div class="ar-container">
      <div class="ar-upload-area" id="ar-drop-zone">
        <div class="ar-upload-icon">📦</div>
        <div class="ar-upload-text">Drop a corrupted ZIP file here</div>
        <div class="ar-upload-hint">or click to browse</div>
        <input type="file" id="ar-file-input" accept=".zip" hidden>
      </div>
      <div id="ar-status" class="ar-status" style="display:none"></div>
      <div id="ar-results" class="ar-results" style="display:none">
        <div class="ar-results-header">
          <h3>Recovery Results</h3>
          <button id="ar-download" class="ar-btn ar-btn-primary">Download Repaired ZIP</button>
        </div>
        <div id="ar-summary" class="ar-summary"></div>
        <div class="ar-tabs">
          <button class="ar-tab active" data-tab="recovered">Recovered Files</button>
          <button class="ar-tab" data-tab="skipped">Skipped Files</button>
          <button class="ar-tab" data-tab="info">Archive Info</button>
        </div>
        <div id="ar-tab-recovered" class="ar-tab-content"><div id="ar-file-list" class="ar-file-list"></div></div>
        <div id="ar-tab-skipped" class="ar-tab-content" style="display:none"><div id="ar-skipped-list" class="ar-file-list"></div></div>
        <div id="ar-tab-info" class="ar-tab-content" style="display:none"><div id="ar-archive-info" class="ar-archive-info"></div></div>
      </div>
    </div>
    <style>${getStyles()}</style>
  `;
}

async function extractFromNormalLoad(arrayBuffer) {
  const normalResult = await tryNormalLoad(arrayBuffer);
  const recoveredFiles = [];
  for (const f of normalResult.files) {
    const entry = normalResult.zip.file(f.path);
    if (entry) {
      const data = await entry.async('uint8array');
      recoveredFiles.push({
        header: { fileName: f.path, compressionMethod: f.method || 8, compressedSize: f.compressedSize, uncompressedSize: f.uncompressedSize, lastModTime: 0, lastModDate: 0 },
        data
      });
    }
  }
  return recoveredFiles;
}

function setStatus(el, className, text) {
  el.style.display = '';
  el.className = className;
  el.textContent = text;
}



export function render(container) {
  container.innerHTML = getMarkup();

  const dropZone = container.querySelector('#ar-drop-zone');
  const fileInput = container.querySelector('#ar-file-input');
  const status = container.querySelector('#ar-status');
  const results = container.querySelector('#ar-results');
  const downloadBtn = container.querySelector('#ar-download');

  let repairedBlob = null;
  let fileName = '';

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

  container.querySelectorAll('.ar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.ar-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      container.querySelectorAll('.ar-tab-content').forEach(c => c.style.display = 'none');
      container.querySelector(`#ar-tab-${tab.dataset.tab}`).style.display = '';
    });
  });

  downloadBtn.addEventListener('click', () => {
    if (repairedBlob) downloadFile(repairedBlob, fileName.replace(/\.zip$/i, '') + '-repaired.zip');
  });

  async function handleFile(file) {
    fileName = file.name;
    setStatus(status, 'ar-status', `Analyzing ${file.name} (${formatFileSize(file.size)})...`);
    results.style.display = 'none';

    try {
      const arrayBuffer = await file.arrayBuffer();
      let recoveredFiles = [];
      let skippedFiles = [];
      let loadMethod = '';

      try {
        recoveredFiles = await extractFromNormalLoad(arrayBuffer);
        loadMethod = 'normal';
      } catch {
        setStatus(status, 'ar-status', 'Normal load failed. Scanning raw bytes...');
        const raw = await recoverFromRawBytes(arrayBuffer);
        recoveredFiles = raw.recoveredFiles;
        skippedFiles = raw.skippedFiles;
        loadMethod = 'raw-scan';
      }

      if (recoveredFiles.length === 0) {
        setStatus(status, 'ar-status error', 'No recoverable files found. The file may not be a ZIP or may be too corrupted.');
        return;
      }

      setStatus(status, 'ar-status', `Building repaired ZIP from ${recoveredFiles.length} recovered file(s)...`);
      repairedBlob = await buildRepairedZip(recoveredFiles);
      setStatus(status, 'ar-status success', `Recovery complete! ${recoveredFiles.length} file(s) recovered (${loadMethod === 'normal' ? 'loaded normally' : 'scanned from raw bytes'}).`);
      showResults(recoveredFiles, skippedFiles, arrayBuffer, file.name);
    } catch (err) {
      setStatus(status, 'ar-status error', `Recovery failed: ${err.message}`);
    }
  }

  function showResults(recoveredFiles, skippedFiles, arrayBuffer, originalName) {
    results.style.display = '';
    container.querySelector('#ar-summary').innerHTML = renderSummary(recoveredFiles, skippedFiles);
    container.querySelector('#ar-file-list').innerHTML = renderFileList(recoveredFiles, 'No files recovered.');
    container.querySelector('#ar-skipped-list').innerHTML = renderFileList(skippedFiles, 'No files were skipped.');
    container.querySelector('#ar-archive-info').innerHTML = renderArchiveInfo(originalName, arrayBuffer, repairedBlob, recoveredFiles, skippedFiles);
  }
}
