import { createFileUpload } from '../../components/file-upload.js';

export function createPdfPreviewTool({ container, accept = '.pdf', maxSizeMB = 100, onFileLoaded }) {
  let currentFile = null;

  const upload = createFileUpload({
    accept,
    multiple: false,
    maxSizeMB,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      optionsArea.style.display = 'block';
      previewContainer.innerHTML = '<div style="text-align:center;padding:var(--space-8);"><div class="spinner"></div><p>Rendering pages...</p></div>';
      await onFileLoaded(currentFile);
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;"></div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Saving...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const previewContainer = document.createElement('div');
  previewContainer.id = 'preview-container';
  const processing = container.querySelector('#processing');

  return { getFile: () => currentFile, optionsArea, previewContainer, processing };
}
