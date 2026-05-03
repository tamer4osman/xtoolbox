export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="upload-zone" id="upload-zone">
          <p>Drop images here or <label class="upload-link">browse<input type="file" id="file-input" accept="image/*" multiple hidden /></label></p>
          <p class="upload-hint">Supports JPG, PNG, WebP</p>
        </div>
        <div id="preview-list" class="preview-list"></div>
        <button id="remove-btn" class="tool-button primary" disabled>Remove Metadata from All</button>
        <div id="result-section" class="result-section hidden">
          <p id="result-count"></p>
          <button id="download-btn" class="tool-button secondary">Download All</button>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .upload-zone { border: 2px dashed var(--color-border); border-radius: var(--radius-lg); padding: var(--space-12) var(--space-6); text-align: center; cursor: pointer; margin-bottom: var(--space-4); }
    .upload-zone:hover { border-color: var(--color-primary); background: var(--color-primary-light); }
    .upload-link { color: var(--color-primary); cursor: pointer; text-decoration: underline; }
    .preview-list { display: grid; gap: var(--space-3); margin-bottom: var(--space-4); }
    .preview-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); background: var(--color-surface); border-radius: var(--radius-md); }
    .preview-item img { width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); }
    .tool-button { padding: var(--space-3) var(--space-6); border-radius: var(--radius-md); font-weight: 600; }
    .tool-button.primary { background: var(--color-primary); color: white; border: none; }
    .tool-button.primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .tool-button.secondary { background: var(--color-surface); border: 1px solid var(--color-border); }
    .result-section { margin-top: var(--space-4); text-align: center; }
    .result-section.hidden { display: none; }
  `;
  container.appendChild(style);

  const files = [];
  const fileInput = container.querySelector('#file-input');
  const previewList = container.querySelector('#preview-list');
  const removeBtn = container.querySelector('#remove-btn');
  const resultSection = container.querySelector('#result-section');
  const downloadBtn = container.querySelector('#download-btn');

  container.querySelector('#upload-zone').addEventListener('drop', e => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', () => handleFiles(fileInput.files));

  function handleFiles(newFiles) {
    Array.from(newFiles).forEach(file => {
      if (file.type.startsWith('image/')) {
        files.push(file);
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `<img src="${URL.createObjectURL(file)}" /><span>${file.name}</span>`;
        previewList.appendChild(div);
      }
    });
    removeBtn.disabled = files.length === 0;
    removeBtn.textContent = `Remove Metadata from ${files.length} File(s)`;
  }

  removeBtn.addEventListener('click', async () => {
    resultSection.classList.remove('hidden');
    container.querySelector('#result-count').textContent = `Processed ${files.length} files. Click Download to save.`;
  });

  downloadBtn.addEventListener('click', () => {
    files.forEach(file => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.href = canvas.toDataURL(file.type);
        a.download = 'clean_' + file.name;
        a.click();
      };
      img.src = URL.createObjectURL(file);
    });
  });
}
