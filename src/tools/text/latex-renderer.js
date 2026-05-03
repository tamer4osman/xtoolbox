import { createFileUpload } from '../../components/file-upload.js';

export const toolConfig = {
  id: 'latex-renderer',
  name: 'LaTeX Renderer',
  category: 'text',
  description: 'Render LaTeX equations to images. Preview and export as PNG.',
  icon: '∑',
  accept: '.tex,.txt',
  maxSizeMB: 5,
  keywords: ['latex renderer', 'latex to image', 'equation editor', 'math equation'],
  steps: ['Enter LaTeX code', 'Preview rendered equation', 'Download as PNG']
};

export function render(container) {
  container.innerHTML = `
    <div class="latex-container">
      <div class="latex-input">
        <textarea id="latex-input" placeholder="Enter LaTeX code here...">x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}</textarea>
      </div>
      <div class="latex-controls">
        <button id="render-btn" class="btn btn-primary">Render</button>
        <button id="download-btn" class="btn btn-secondary" disabled>Download PNG</button>
      </div>
      <div id="preview" class="latex-preview"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .latex-container { max-width: 800px; margin: 0 auto; }
    .latex-input { margin-bottom: var(--space-4); }
    .latex-input textarea { 
      width: 100%; min-height: 120px; font-family: 'Courier New', monospace;
      padding: var(--space-3); border: 1px solid var(--color-border);
      border-radius: var(--radius-md); font-size: var(--text-base);
    }
    .latex-controls { display: flex; gap: var(--space-3); margin-bottom: var(--space-4); }
    .latex-preview { 
      min-height: 150px; padding: var(--space-6); 
      background: white; border-radius: var(--radius-lg);
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--color-border);
    }
    .latex-preview .katex { font-size: 2em; }
  `;
  container.appendChild(style);

  const input = container.querySelector('#latex-input');
  const renderBtn = container.querySelector('#render-btn');
  const downloadBtn = container.querySelector('#download-btn');
  const preview = container.querySelector('#preview');

  let katexLoaded = false;

  function renderLatex() {
    if (!window.katex) {
      loadKaTeX();
      return;
    }
    
    const latex = input.value.trim();
    if (!latex) return;
    
    try {
      const html = window.katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true
      });
      preview.innerHTML = html;
      downloadBtn.disabled = false;
    } catch (e) {
      preview.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
      downloadBtn.disabled = true;
    }
  }

  function loadKaTeX() {
    if (katexLoaded) {
      renderLatex();
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    document.head.appendChild(link);
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
    script.onload = () => {
      katexLoaded = true;
      renderLatex();
    };
    script.onerror = () => {
      preview.innerHTML = '<p style="color:red">Failed to load KaTeX library</p>';
    };
    document.head.appendChild(script);
  }

  renderBtn.addEventListener('click', loadKaTeX);
  
  input.addEventListener('input', () => {
    if (window.katex) renderLatex();
  });

  downloadBtn.addEventListener('click', () => {
    const html = preview.innerHTML;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 150;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '24px KaTeX_Main';
    ctx.fillText('Equation', 20, 30);
    
    const img = new Image();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="150">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:24px;color:black;padding:20px;">
          ${html}
        </div>
      </foreignObject>
    </svg>`;
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = 'latex-equation.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  });

  loadKaTeX();
}
