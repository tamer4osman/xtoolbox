export const toolConfig = {
  id: 'remove-metadata',
  name: 'Image Metadata Remover',
  category: 'privacy',
  description: 'Remove EXIF and metadata from images for privacy.',
  icon: '🖼️',
  steps: ['Upload image', 'Download cleaned image']
};

export function render(container) {
  container.innerHTML = `
    <div class="meta-container">
      <input type="file" id="meta-input" accept="image/*">
      <div class="meta-preview" id="meta-preview">
        <p>No image selected</p>
      </div>
      <button id="meta-remove" disabled>Remove Metadata</button>
      <a id="meta-download" class="download-link" style="display:none">Download Clean Image</a>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .meta-container { max-width: 500px; margin: 0 auto; }
    .meta-container input[type="file"] { margin-bottom: var(--space-4); }
    .meta-preview { min-height: 200px; border: 2px dashed #ddd; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4); overflow: hidden; }
    .meta-preview img { max-width: 100%; max-height: 300px; }
    .meta-preview p { color: #999; }
    #meta-remove { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; margin-bottom: var(--space-3); }
    #meta-remove:disabled { background: #ccc; cursor: not-allowed; }
    .download-link { display: block; text-align: center; padding: var(--space-3); background: #28a745; color: white; border-radius: var(--radius-md); text-decoration: none; }
  `;
  container.appendChild(style);

  let currentFile = null;

  container.querySelector('#meta-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    currentFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      container.querySelector('#meta-preview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      container.querySelector('#meta-remove').disabled = false;
    };
    reader.readAsDataURL(file);
  });

  container.querySelector('#meta-remove').addEventListener('click', () => {
    if (!currentFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = container.querySelector('#meta-download');
          link.href = url;
          link.download = 'clean_' + currentFile.name;
          link.style.display = 'block';
          link.textContent = 'Download Clean Image';
        }, currentFile.type);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(currentFile);
  });

  return container;
}
