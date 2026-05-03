import { formatFileSize } from '../utils/file.js';
import { createElement } from '../utils/dom.js';

/**
 * Create a file upload dropzone component
 */
export function createFileUpload({
  accept = '*',
  multiple = false,
  maxSizeMB = 100,
  maxFiles = 20,
  onFilesSelected = () => {},
  label = null
}) {
  let selectedFiles = [];

  const element = createElement('div', { className: 'file-upload' });
  element.innerHTML = `
    <div class="file-upload-dropzone" id="dropzone">
      <div class="file-upload-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <p class="file-upload-text">${label || (multiple ? 'Drag & drop files here or click to browse' : 'Drag & drop a file here or click to browse')}</p>
      <p class="file-upload-hint">Max ${maxSizeMB}MB per file${multiple ? `, up to ${maxFiles} files` : ''}</p>
      <input type="file" class="file-upload-input" accept="${accept}" ${multiple ? 'multiple' : ''}>
      <button class="btn btn-primary file-upload-btn">Browse Files</button>
    </div>
    <div class="file-upload-list" id="file-list"></div>
  `;

  const dropzone = element.querySelector('#dropzone');
  const fileInput = element.querySelector('.file-upload-input');
  const browseBtn = element.querySelector('.file-upload-btn');
  const fileList = element.querySelector('#file-list');

  browseBtn.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('click', (e) => {
    if (e.target === dropzone || e.target.closest('.file-upload-icon') || e.target.closest('.file-upload-text')) {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    handleFiles(Array.from(fileInput.files));
    fileInput.value = '';
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    handleFiles(Array.from(e.dataTransfer.files));
  });

  function handleFiles(files) {
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      if (accept !== '*' && !isFileTypeAccepted(file, accept)) {
        errors.push(`${file.name}: Invalid file type`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max ${maxSizeMB}MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (multiple) {
      selectedFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
    } else {
      selectedFiles = validFiles.slice(0, 1);
    }

    renderFileList();
    onFilesSelected(selectedFiles);

    if (errors.length > 0 && typeof showToast === 'function') {
      errors.forEach(err => showToast({ message: err, type: 'error' }));
    }
  }

  function isFileTypeAccepted(file, acceptStr) {
    const types = acceptStr.split(',').map(t => t.trim());
    return types.some(type => {
      if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type.toLowerCase());
      if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'));
      return file.type === type;
    });
  }

  function renderFileList() {
    if (selectedFiles.length === 0) { fileList.innerHTML = ''; return; }

    fileList.innerHTML = selectedFiles.map((file, index) => `
      <div class="file-upload-item">
        <span class="file-upload-item-icon">📎</span>
        <div class="file-upload-item-info">
          <span class="file-upload-item-name">${file.name}</span>
          <span class="file-upload-item-size">${formatFileSize(file.size)}</span>
        </div>
        <button class="file-upload-item-remove" data-index="${index}" title="Remove file">✕</button>
      </div>
    `).join('');

    fileList.querySelectorAll('.file-upload-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedFiles.splice(parseInt(btn.dataset.index), 1);
        renderFileList();
        onFilesSelected(selectedFiles);
      });
    });
  }

  return {
    element,
    getFiles: () => selectedFiles,
    clear: () => { selectedFiles = []; renderFileList(); }
  };
}
