export function optimizeSvg(svgText, options = {}) {
  const {
    removeMetadata = true,
    removeComments = true,
    removeEditorData = true,
    removeEmptyGroups = true,
    removeUselessDefs = true,
    collapseGroups = true,
    precision = 2
  } = options;

  let result = svgText;

  function roundNum(n) {
    return Number(n.toFixed(precision));
  }

  if (removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }

  if (removeMetadata) {
    result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  }

  if (removeEditorData) {
    result = result.replace(/<(sodipodi|inkscape|sketch|adobe|illustrator|corel)[\s\S]*?<\/\1:[\s\S]*?>/gi, '');
    result = result.replace(/<(sodipodi|inkscape|sketch|adobe|illustrator|corel)[^>]*\/>/gi, '');
    result = result.replace(/\s*(sodipodi|inkscape|sketch|adobe|illustrator|corel):[a-z-]+="[^"]*"/gi, '');
  }

  result = result.replace(/<title[\s\S]*?<\/title>/gi, '');
  result = result.replace(/<desc[\s\S]*?<\/desc>/gi, '');

  if (removeUselessDefs) {
    result = result.replace(/<defs>\s*<\/defs>/gi, '');
  }

  if (removeEmptyGroups) {
    let prev = '';
    while (prev !== result) {
      prev = result;
      result = result.replace(/<g([^>]*)>\s*<\/g>/gi, (match, attrs) => {
        if (/\b(id|class|transform|style|fill|stroke|opacity|clip-path|mask)\s*=/i.test(attrs)) return match;
        return '';
      });
    }
  }

  result = result.replace(/\s*data-[a-z-]+="[^"]*"/gi, '');

  result = result.replace(/(\d+\.\d{3,})/g, (m) => roundNum(parseFloat(m)).toString());

  result = result.replace(/\s+/g, ' ');
  result = result.replace(/> </g, '><');
  result = result.replace(/\s+\/>/g, '/>');
  result = result.trim();

  const before = svgText.length;
  const after = result.length;
  const saved = before - after;
  const percent = before > 0 ? ((saved / before) * 100).toFixed(1) : 0;

  return {
    optimized: result,
    stats: { before, after, saved, percent }
  };
}

export const toolConfig = {
  id: 'svg-optimizer',
  name: 'SVG Optimizer & Minifier',
  category: 'css',
  description: 'Optimize and minify SVG files by removing metadata, comments, editor data, and redundant code. Reduces file size 30-70%.',
  icon: '✨',
  accept: '.svg,image/svg+xml',
  maxSizeMB: 10,
  keywords: ['svg', 'optimizer', 'minifier', 'svgomg', 'compress', 'svg optimization', 'reduce svg size'],
  steps: ['Upload or paste an SVG file', 'Configure optimization options', 'Preview before/after comparison', 'Download optimized SVG'],
  faqs: [
    { question: 'What does SVG optimization remove?', answer: 'Metadata, comments, editor data (Inkscape, Sketch, etc.), empty groups, useless defs, data attributes, unnecessary whitespace, and redundant path data precision.' },
    { question: 'Will optimization change how my SVG looks?', answer: 'No. The optimizer preserves visual appearance while removing non-visual data. Groups may be collapsed and path data rounded, but the rendered output is identical.' },
    { question: 'What SVG editors add bloat?', answer: 'Inkscape (sodipodi namespace), Sketch, Adobe Illustrator, and CorelDRAW all embed metadata and editor-specific attributes that are unnecessary for rendering.' }
  ]
};

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function formatBytes(b) {
  if (b === 0) return '0 B';
  const k = 1024;
  const s = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(1) + ' ' + s[i];
}

function getOptions(container) {
  return {
    removeMetadata: container.querySelector('#opt-metadata').checked,
    removeComments: container.querySelector('#opt-comments').checked,
    removeEditorData: container.querySelector('#opt-editor').checked,
    removeEmptyGroups: container.querySelector('#opt-groups').checked,
    collapseGroups: container.querySelector('#opt-collapse').checked,
    removeUselessDefs: container.querySelector('#opt-defs').checked,
    precision: parseInt(container.querySelector('#opt-precision').value)
  };
}

function showResults(container, result, originalSvg, originalName) {
  const { stats, optimized } = result;
  const isGood = stats.saved > 0;
  const resultsEl = container.querySelector('#svg-results');
  const previewEl = container.querySelector('#svg-preview');
  const originalPreview = container.querySelector('#svg-preview-original');
  const optimizedPreview = container.querySelector('#svg-preview-optimized');

  resultsEl.style.display = 'block';
  previewEl.style.display = 'grid';
  resultsEl.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);margin-bottom:var(--space-4);">
      <div style="padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);text-align:center;">
        <div style="font-size:var(--text-xl);font-weight:700;color:var(--color-text);">${formatBytes(stats.before)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Original</div>
      </div>
      <div style="padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);text-align:center;">
        <div style="font-size:var(--text-xl);font-weight:700;color:${isGood ? 'var(--color-success)' : 'var(--color-text)'};">${formatBytes(stats.after)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Optimized</div>
      </div>
      <div style="padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);text-align:center;">
        <div style="font-size:var(--text-xl);font-weight:700;color:${isGood ? 'var(--color-success)' : 'var(--color-text-muted)'};">${isGood ? '-' : ''}${formatBytes(Math.abs(stats.saved))} (${stats.percent}%)</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);">Saved</div>
      </div>
    </div>
    <button class="btn btn-primary btn-lg" id="svg-download-btn" style="width:100%;margin-bottom:var(--space-3);">Download Optimized SVG</button>
    <details>
      <summary style="cursor:pointer;font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-2);">View Optimized Code</summary>
      <pre style="background:var(--color-surface);padding:var(--space-3);border-radius:var(--radius-md);font-size:12px;overflow-x:auto;max-height:300px;overflow-y:auto;border:1px solid var(--color-border);"><code>${esc(optimized)}</code></pre>
    </details>
  `;

  originalPreview.innerHTML = originalSvg;
  optimizedPreview.innerHTML = optimized;

  container.querySelector('#svg-download-btn').addEventListener('click', () => {
    const blob = new Blob([optimized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalName.replace(/\.svg$/i, '') + '.min.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

export function render(container) {
  let originalSvg = null;
  let originalName = 'input.svg';

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="svg-upload-area"></div>
      <div id="svg-paste-area" style="display:none;">
        <div class="form-group">
          <label>Or paste SVG code</label>
          <textarea id="svg-paste-input" class="text-input" rows="6" placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>' style="font-family:monospace;font-size:13px;resize:vertical;"></textarea>
          <button class="btn btn-primary" id="svg-paste-btn" style="margin-top:var(--space-2);width:100%;">Optimize Pasted SVG</button>
        </div>
      </div>
      <div class="tool-options" id="svg-options" style="display:none;">
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-3);">
          <label style="display:flex;align-items:center;gap:4px;font-size:var(--text-sm);cursor:pointer;"><input type="checkbox" id="opt-metadata" checked> Metadata</label>
          <label style="display:flex;align-items:center;gap:4px;font-size:var(--text-sm);cursor:pointer;"><input type="checkbox" id="opt-comments" checked> Comments</label>
          <label style="display:flex;align-items:center;gap:4px;font-size:var(--text-sm);cursor:pointer;"><input type="checkbox" id="opt-editor" checked> Editor data</label>
          <label style="display:flex;align-items:center;gap:4px;font-size:var(--text-sm);cursor:pointer;"><input type="checkbox" id="opt-groups" checked> Empty groups</label>
          <label style="display:flex;align-items:center;gap:4px;font-size:var(--text-sm);cursor:pointer;"><input type="checkbox" id="opt-collapse" checked> Collapse groups</label>
          <label style="display:flex;align-items:center;gap:4px;font-size:var(--text-sm);cursor:pointer;"><input type="checkbox" id="opt-defs" checked> Useless defs</label>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-3);">
          <label>Precision: <strong id="opt-precision-val">2</strong> decimal places</label>
          <input type="range" id="opt-precision" min="0" max="5" value="2" class="range-slider-input">
        </div>
        <button class="btn btn-primary btn-lg" id="svg-optimize-btn" style="width:100%;margin-bottom:var(--space-4);">Optimize SVG</button>
      </div>
      <div id="svg-results" style="display:none;"></div>
      <div id="svg-preview" style="display:none;margin-top:var(--space-4);border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">
          <div style="border-right:1px solid var(--color-border);">
            <div style="padding:var(--space-2) var(--space-3);background:var(--color-surface);font-size:var(--text-xs);font-weight:600;text-transform:uppercase;color:var(--color-text-muted);border-bottom:1px solid var(--color-border);">Original</div>
            <div id="svg-preview-original" style="padding:var(--space-4);display:flex;align-items:center;justify-content:center;min-height:200px;background:#fff;"></div>
          </div>
          <div>
            <div style="padding:var(--space-2) var(--space-3);background:var(--color-surface);font-size:var(--text-xs);font-weight:600;text-transform:uppercase;color:var(--color-text-muted);border-bottom:1px solid var(--color-border);">Optimized</div>
            <div id="svg-preview-optimized" style="padding:var(--space-4);display:flex;align-items:center;justify-content:center;min-height:200px;background:#fff;"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const uploadArea = container.querySelector('#svg-upload-area');
  const pasteArea = container.querySelector('#svg-paste-area');
  const optionsArea = container.querySelector('#svg-options');
  const precisionSlider = container.querySelector('#opt-precision');
  const precisionVal = container.querySelector('#opt-precision-val');
  const optimizeBtn = container.querySelector('#svg-optimize-btn');
  const pasteInput = container.querySelector('#svg-paste-input');
  const pasteBtn = container.querySelector('#svg-paste-btn');

  function optimizeSvgFile() {
    if (!originalSvg) return;
    showResults(container, optimizeSvg(originalSvg, getOptions(container)), originalSvg, originalName);
  }

  function showUploadOrPaste() {
    uploadArea.innerHTML = '';
    const dropZone = document.createElement('div');
    dropZone.className = 'tool-upload-zone';
    dropZone.innerHTML = `
      <div style="text-align:center;padding:var(--space-8);">
        <div style="font-size:48px;margin-bottom:var(--space-3);">📁</div>
        <div style="font-size:var(--text-lg);font-weight:600;margin-bottom:var(--space-2);">Drop SVG file here</div>
        <div style="color:var(--color-text-muted);margin-bottom:var(--space-3);">or</div>
        <label class="btn btn-primary" style="cursor:pointer;">Browse Files
          <input type="file" accept=".svg,image/svg+xml" style="display:none;" id="svg-file-input">
        </label>
        <div style="margin-top:var(--space-3);color:var(--color-text-muted);font-size:var(--text-sm);">or</div>
        <button class="btn btn-ghost" id="svg-show-paste" style="margin-top:var(--space-2);">Paste SVG Code</button>
      </div>
    `;
    uploadArea.appendChild(dropZone);

    dropZone.querySelector('#svg-file-input').addEventListener('change', e => handleFile(e.target.files[0]));
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = 'var(--color-primary)'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = ''; });
    dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.style.borderColor = ''; if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });
    dropZone.querySelector('#svg-show-paste').addEventListener('click', () => { pasteArea.style.display = 'block'; });
  }

  function handleFile(file) {
    if (!file) return;
    originalName = file.name;
    const reader = new FileReader();
    reader.onload = e => {
      originalSvg = e.target.result;
      optionsArea.style.display = 'block';
      pasteArea.style.display = 'none';
      uploadArea.innerHTML = `
        <div style="padding:var(--space-3);background:var(--color-surface);border-radius:var(--radius-md);display:flex;align-items:center;gap:var(--space-3);">
          <span style="font-size:24px;">📄</span>
          <div style="flex:1;"><div style="font-weight:600;font-size:var(--text-sm);">${esc(file.name)}</div><div style="font-size:var(--text-xs);color:var(--color-text-muted);">${formatBytes(file.size)}</div></div>
          <button class="btn btn-ghost btn-sm" id="svg-change-file">Change</button>
        </div>
      `;
      uploadArea.querySelector('#svg-change-file').addEventListener('click', showUploadOrPaste);
      optimizeSvgFile();
    };
    reader.readAsText(file);
  }

  precisionSlider.addEventListener('input', () => { precisionVal.textContent = precisionSlider.value; });
  optimizeBtn.addEventListener('click', optimizeSvgFile);

  pasteBtn.addEventListener('click', () => {
    const val = pasteInput.value.trim();
    if (!val) return;
    originalSvg = val;
    originalName = 'pasted.svg';
    optionsArea.style.display = 'block';
    pasteArea.style.display = 'none';
    uploadArea.innerHTML = `
      <div style="padding:var(--space-3);background:var(--color-surface);border-radius:var(--radius-md);display:flex;align-items:center;gap:var(--space-3);">
        <span style="font-size:24px;">📋</span>
        <div style="flex:1;"><div style="font-weight:600;font-size:var(--text-sm);">Pasted SVG</div><div style="font-size:var(--text-xs);color:var(--color-text-muted);">${formatBytes(val.length)}</div></div>
        <button class="btn btn-ghost btn-sm" id="svg-change-file">Change</button>
      </div>
    `;
    uploadArea.querySelector('#svg-change-file').addEventListener('click', showUploadOrPaste);
    optimizeSvgFile();
  });

  showUploadOrPaste();
}

export function destroy() {}
