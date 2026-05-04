export const toolConfig = {
  id: 'image-color-picker',
  name: 'Image Color Picker',
  category: 'image',
  description: 'Pick colors directly from any image.',
  icon: '🎨',
  status: 'done'
};

export function render(container) {
  let imageCanvas = null;
  let uploadedImage = null;

  container.innerHTML = `
    <div class="color-picker-container">
      <h2>Image Color Picker</h2>
      <p class="subtitle">Click anywhere on an image to get the color</p>
      
      <div class="upload-area" id="upload-area">
        <div class="upload-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p>Drop an image here or click to upload</p>
          <span class="upload-hint">PNG, JPG, GIF, WebP supported</span>
        </div>
        <input type="file" id="file-input" accept="image/*" hidden>
      </div>

      <div class="image-container" id="image-container" hidden>
        <canvas id="image-canvas"></canvas>
        <div class="cursor-preview" id="cursor-preview" hidden>
          <div class="color-swatch"></div>
          <span class="color-hex"></span>
        </div>
      </div>

      <div class="color-result" id="color-result" hidden>
        <h3>Selected Color</h3>
        <div class="color-display">
          <div class="color-preview" id="color-preview"></div>
          <div class="color-values">
            <div class="color-value-item">
              <label>HEX</label>
              <div class="value-row">
                <span id="hex-value">#000000</span>
                <button class="copy-btn" data-copy="hex-value">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="color-value-item">
              <label>RGB</label>
              <div class="value-row">
                <span id="rgb-value">rgb(0, 0, 0)</span>
                <button class="copy-btn" data-copy="rgb-value">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="color-value-item">
              <label>HSL</label>
              <div class="value-row">
                <span id="hsl-value">hsl(0, 0%, 0%)</span>
                <button class="copy-btn" data-copy="hsl-value">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .color-picker-container { max-width: 800px; margin: 0 auto; }
    .color-picker-container h2 { text-align: center; margin-bottom: var(--space-2); }
    .subtitle { text-align: center; color: var(--color-text-secondary); margin-bottom: var(--space-6); }
    
    .upload-area { 
      border: 2px dashed var(--color-border); 
      border-radius: var(--radius-xl); 
      padding: var(--space-8);
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--color-surface);
    }
    .upload-area:hover { border-color: var(--color-primary); background: var(--color-background); }
    .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
    .upload-placeholder svg { color: var(--color-text-secondary); }
    .upload-placeholder p { font-weight: 500; }
    .upload-hint { font-size: var(--text-sm); color: var(--color-text-secondary); }
    
    .image-container { 
      position: relative; 
      margin-top: var(--space-6);
      overflow: hidden;
      border-radius: var(--radius-xl);
      cursor: crosshair;
      display: inline-block;
    }
    #image-canvas { max-width: 100%; display: block; border-radius: var(--radius-xl); }
    
    .cursor-preview {
      position: absolute;
      pointer-events: none;
      background: var(--color-surface);
      padding: 8px 12px;
      border-radius: var(--radius-lg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 8px;
      transform: translate(-50%, -100%);
      margin-top: -10px;
      z-index: 10;
    }
    .cursor-preview.hidden { display: none; }
    .cursor-preview .color-swatch { width: 24px; height: 24px; border-radius: var(--radius-md); border: 2px solid white; }
    .cursor-preview .color-hex { font-weight: 600; font-size: var(--text-sm); }
    
    .color-result { 
      margin-top: var(--space-6); 
      background: var(--color-surface);
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }
    .color-result h3 { margin-bottom: var(--space-4); }
    .color-display { display: flex; gap: var(--space-6); align-items: flex-start; }
    .color-preview { 
      width: 120px; 
      height: 120px; 
      border-radius: var(--radius-xl); 
      border: 3px solid var(--color-border);
      flex-shrink: 0;
    }
    .color-values { flex: 1; display: flex; flex-direction: column; gap: var(--space-3); }
    .color-value-item label { display: block; font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: 4px; }
    .value-row { display: flex; align-items: center; gap: var(--space-2); }
    .value-row span { 
      font-family: monospace; 
      font-size: var(--text-base);
      background: var(--color-background);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      flex: 1;
    }
    .copy-btn {
      padding: var(--space-2);
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: all 0.2s;
    }
    .copy-btn:hover { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    
    @media (max-width: 600px) {
      .color-display { flex-direction: column; }
      .color-preview { width: 100%; height: 80px; }
    }
  `;
  container.appendChild(style);

  const uploadArea = container.querySelector('#upload-area');
  const fileInput = container.querySelector('#file-input');
  const imageContainer = container.querySelector('#image-container');
  const imageCanvasEl = container.querySelector('#image-canvas');
  const colorResult = container.querySelector('#color-result');
  const cursorPreview = container.querySelector('#cursor-preview');
  const colorPreview = container.querySelector('#color-preview');

  uploadArea.addEventListener('click', () => fileInput.click());
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--color-primary)';
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--color-border)';
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--color-border)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file);
  });

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        uploadedImage = img;
        imageCanvas = imageCanvasEl.getContext('2d');
        
        const maxWidth = Math.min(800, window.innerWidth - 48);
        const scale = maxWidth / img.width;
        const width = img.width * scale;
        const height = img.height * scale;
        
        imageCanvasEl.width = width;
        imageCanvasEl.height = height;
        imageCanvas.drawImage(img, 0, 0, width, height);
        
        uploadArea.hidden = true;
        imageContainer.hidden = false;
        colorResult.hidden = false;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  imageCanvasEl.addEventListener('click', (e) => {
    if (!imageCanvas) return;
    
    const rect = imageCanvasEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pixel = imageCanvas.getImageData(x, y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    
    container.querySelector('#hex-value').textContent = hex;
    container.querySelector('#rgb-value').textContent = `rgb(${r}, ${g}, ${b})`;
    container.querySelector('#hsl-value').textContent = hsl;
    colorPreview.style.backgroundColor = hex;
    
    cursorPreview.querySelector('.color-swatch').style.backgroundColor = hex;
    cursorPreview.querySelector('.color-hex').textContent = hex;
    cursorPreview.style.left = e.clientX - imageContainer.getBoundingClientRect().left + 'px';
    cursorPreview.style.top = e.clientY - imageContainer.getBoundingClientRect().top + 'px';
    cursorPreview.hidden = false;
  });

  imageCanvasEl.addEventListener('mousemove', (e) => {
    if (!imageCanvas) return;
    
    const rect = imageCanvasEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x >= 0 && x < imageCanvasEl.width && y >= 0 && y < imageCanvasEl.height) {
      const pixel = imageCanvas.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      
      cursorPreview.querySelector('.color-swatch').style.backgroundColor = hex;
      cursorPreview.querySelector('.color-hex').textContent = hex;
      cursorPreview.style.left = e.clientX - imageContainer.getBoundingClientRect().left + 'px';
      cursorPreview.style.top = e.clientY - imageContainer.getBoundingClientRect().top + 'px';
      cursorPreview.hidden = false;
    }
  });

  imageCanvasEl.addEventListener('mouseleave', () => {
    cursorPreview.hidden = true;
  });

  container.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copy;
      const text = container.querySelector(`#${targetId}`).textContent;
      navigator.clipboard.writeText(text);
      btn.innerHTML = '✓';
      setTimeout(() => {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      }, 1500);
    });
  });

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  return container;
}