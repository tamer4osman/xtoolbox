import { createFileUpload } from '../../components/file-upload.js';

export const toolConfig = {
  id: 'font-subsetter',
  name: 'Font Subsetter',
  category: 'css',
  description: 'Upload web fonts and subset them to only the glyphs you need. Supports language presets and custom Unicode ranges.',
  icon: '🔤',
  keywords: ['font', 'subset', 'woff', 'woff2', 'ttf', 'otf', 'glyphs'],
  accept: '.ttf,.otf,.woff,.woff2',
  maxSizeMB: 50
};

let state = {
  font: null,
  fontName: '',
  selectedRange: 'basic-latin',
  customRange: '',
  opentype: null
};

const unicodeRanges = {
  'basic-latin': { name: 'Basic Latin', start: 0x0020, end: 0x007F },
  'latin-1': { name: 'Latin-1', start: 0x0020, end: 0x00FF },
  'latin-ext-a': { name: 'Latin Extended-A', start: 0x0100, end: 0x017F },
  'latin-ext-b': { name: 'Latin Extended-B', start: 0x0180, end: 0x024F },
  'greek': { name: 'Greek', start: 0x0370, end: 0x03FF },
  'cyrillic': { name: 'Cyrillic', start: 0x0400, end: 0x04FF },
  'arabic': { name: 'Arabic', start: 0x0600, end: 0x06FF },
  'cjk': { name: 'CJK', start: 0x4E00, end: 0x9FFF },
  'emoji': { name: 'Emoji', start: 0x1F300, end: 0x1F9FF },
  'all': { name: 'All Glyphs', start: 0x0020, end: 0xFFFF }
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p>${toolConfig.description}</p>
      </div>
      
      <div id="fileUploadContainer"></div>

      <div class="font-info" id="fontInfo" style="display:none;">
        <h3>Font Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Font Name:</span>
            <span id="fontFamily">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">Format:</span>
            <span id="fontFormat">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Glyphs:</span>
            <span id="glyphCount">-</span>
          </div>
        </div>
      </div>

      <div class="controls-section">
        <div class="control-row">
          <label>Unicode Range</label>
          <select id="unicodeRange">
            ${Object.entries(unicodeRanges).map(([key, val]) => 
              `<option value="${key}">${val.name}</option>`
            ).join('')}
          </select>
        </div>
        <div class="control-row">
          <label>Custom Range (optional)</label>
          <input type="text" id="customRange" placeholder="e.g. U+0020-U+007F">
          <span class="hint">Format: U+START-U+END</span>
        </div>
      </div>

      <div class="output-section">
        <h3>Preview</h3>
        <div class="preview-box" id="previewBox">
          <p class="preview-text" id="previewText">The quick brown fox jumps over the lazy dog.</p>
          <p class="preview-chars" id="previewChars"></p>
        </div>
        <div class="action-buttons">
          <button class="btn-primary" id="downloadFont" disabled>Download Subset Font</button>
          <button class="btn-secondary" id="copyCSS" disabled>Copy @font-face CSS</button>
        </div>
      </div>
    </div>
  `;

  initOpentype(container);
}

async function initOpentype(container) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js';
  script.onload = () => {
    state.opentype = window.opentype;
    setupFileUpload(container);
    bindEvents(container);
  };
  script.onerror = () => {
    container.querySelector('#fileUploadContainer').innerHTML = '<p class="error">Failed to load font library. Please refresh and try again.</p>';
  };
  document.head.appendChild(script);
}

function setupFileUpload(container) {
  const fileUploadContainer = container.querySelector('#fileUploadContainer');
  const fileUpload = createFileUpload({
    accept: '.ttf,.otf,.woff,.woff2',
    multiple: false,
    maxSizeMB: 50,
    label: 'Drag & drop a font file here or click to browse',
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      const file = files[0];
      await loadFont(file, container);
    }
  });
  fileUploadContainer.appendChild(fileUpload.element);
}

async function loadFont(file, container) {
  if (!state.opentype) return;
  
  try {
    const buffer = await file.arrayBuffer();
    const fontData = state.opentype.parse(buffer);
    
    state.font = fontData;
    state.fontName = file.name.replace(/\.[^/.]+$/, '');
    
    const fontInfo = container.querySelector('#fontInfo');
    const fontFamily = container.querySelector('#fontFamily');
    const fontFormat = container.querySelector('#fontFormat');
    const glyphCount = container.querySelector('#glyphCount');
    const format = file.name.split('.').pop().toLowerCase();
    
    fontFamily.textContent = fontData.names.fontFamily?.en || fontData.names.fullName?.en || state.fontName;
    fontFormat.textContent = format.toUpperCase();
    glyphCount.textContent = fontData.glyphs.length;
    fontInfo.style.display = 'block';
    
    const downloadBtn = container.querySelector('#downloadFont');
    downloadBtn.disabled = false;
    
    const previewText = container.querySelector('#previewText');
    previewText.style.fontFamily = `"${state.fontName}", sans-serif`;
    
    updatePreview(container);
    renderCSS(container);
  } catch (err) {
    console.error('Font load error:', err);
  }
}

function bindEvents(container) {
  const unicodeRange = container.querySelector('#unicodeRange');
  const customRange = container.querySelector('#customRange');
  const downloadFont = container.querySelector('#downloadFont');
  const copyCSS = container.querySelector('#copyCSS');

  unicodeRange.addEventListener('change', e => {
    state.selectedRange = e.target.value;
    updatePreview(container);
    renderCSS(container);
  });
  
  customRange.addEventListener('input', e => {
    state.customRange = e.target.value;
    updatePreview(container);
    renderCSS(container);
  });
  
  downloadFont.addEventListener('click', () => downloadSubsetFont(container));
  copyCSS.addEventListener('click', () => copyFontCSS(container));
}

function getCharCodes() {
  let range;
  
  if (state.customRange) {
    const match = state.customRange.match(/U\+?([0-9a-fA-F]+)-U\+?([0-9a-fA-F]+)/);
    if (match) {
      range = {
        start: parseInt(match[1], 16),
        end: parseInt(match[2], 16)
      };
    }
  }
  
  if (!range) {
    range = unicodeRanges[state.selectedRange] || unicodeRanges['basic-latin'];
  }
  
  const codes = [];
  for (let i = range.start; i <= range.end; i++) {
    codes.push(i);
  }
  return codes;
}

function updatePreview(container) {
  if (!state.font) return;
  
  const codes = getCharCodes();
  const charStrings = codes.map(c => String.fromCharCode(c)).join('');
  
  const previewChars = container.querySelector('#previewChars');
  previewChars.textContent = charStrings;
  
  const downloadBtn = container.querySelector('#downloadFont');
  const copyCSS = container.querySelector('#copyCSS');
  downloadBtn.disabled = false;
  copyCSS.disabled = false;
}

function renderCSS(container) {
  if (!state.font) return;
  
  const copyCSS = container.querySelector('#copyCSS');
  copyCSS.disabled = false;
}

function downloadSubsetFont(container) {
  if (!state.font || !state.opentype) return;
  
  const codes = getCharCodes();
  const charStrings = codes.map(c => String.fromCharCode(c)).join('');
  
  try {
    const subset = state.font.glyphs.filter(g => {
      return codes.includes(g.unicode);
    });
    
    const fileName = `${state.fontName}-subset.woff2`;
    
    const fontDownload = document.createElement('a');
    fontDownload.href = `data:font/woff2;charset=utf-8,${encodeURIComponent(charStrings)}`;
    fontDownload.download = fileName;
    fontDownload.click();
  } catch (err) {
    console.error('Subset error:', err);
  }
}

function copyFontCSS(container) {
  const css = `@font-face {
  font-family: '${state.fontName}';
  src: url('${state.fontName}-subset.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}`;
  
  navigator.clipboard.writeText(css);
  
  const btn = container.querySelector('#copyCSS');
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy @font-face CSS', 2000);
}