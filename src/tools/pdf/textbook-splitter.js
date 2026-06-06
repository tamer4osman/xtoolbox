import { showToast } from '../../components/toast.js';
import { renderAllPages, renderPdfPage } from './pdf-utils.js';
import { downloadBlob } from '../../utils/file.js';
import JSZip from 'jszip';
import { createPdfPageBrowser } from './pdf-page-browser.js';

export const toolConfig = {
  id: 'textbook-splitter',
  name: 'Page Textbook Splitter',
  category: 'pdf',
  description: 'Split landscape-scanned book pages down the middle into consecutive portrait pages.',
  icon: '📖',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['textbook splitter', 'split pdf pages', 'book scanner', 'landscape to portrait', 'pdf page split'],
  steps: [
    'Upload a PDF with landscape-scanned book pages',
    'Review the preview to see how pages will be split',
    'Click "Split Pages" to split each landscape page down the center',
    'Download a ZIP file containing all individual half-page images'
  ],
  faqs: [
    {
      question: 'What kind of PDFs does this work with?',
      answer: 'This tool works best with landscape-oriented PDFs where each page contains two book pages side by side, as produced by book scanners or flatbed scanners.'
    },
    {
      question: 'What format is the output?',
      answer: 'The output is a ZIP file containing PNG images of each half-page, named sequentially (page_001_left.png, page_001_right.png, etc.).'
    },
    {
      question: 'Is this truly client-side?',
      answer: 'Yes. All processing happens in your browser using PDF.js. Your files never leave your device.'
    }
  ]
};

const STYLE_CSS = `
  .splitter-info { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); }
  .splitter-info h3 { margin-bottom: var(--space-2); }
  .splitter-info p { color: var(--color-text-secondary); font-size: var(--text-sm); }
  .splitter-previews { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4); }
  .splitter-page-card { background: white; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
  .splitter-page-card .page-label { padding: var(--space-2); font-size: var(--text-xs); text-align: center; color: var(--color-text-muted); background: var(--color-surface); border-bottom: 1px solid var(--color-border); }
  .splitter-page-card canvas { width: 100%; display: block; }
  .splitter-page-card .split-indicator { display: flex; padding: var(--space-1) var(--space-2); gap: var(--space-1); font-size: var(--text-xs); }
  .split-indicator .half { flex: 1; text-align: center; padding: var(--space-1); border-radius: var(--radius-sm); }
  .split-indicator .left { background: rgba(37, 99, 235, 0.1); color: var(--color-primary); }
  .split-indicator .right { background: rgba(124, 58, 237, 0.1); color: var(--color-secondary); }
  .split-indicator .pass-through { background: var(--color-surface); color: var(--color-text-muted); flex: 1; text-align: center; padding: var(--space-1); border-radius: var(--radius-sm); }
  .splitter-actions { text-align: center; margin-top: var(--space-4); }
`;

const OPTIONS_HTML = `
  <div class="splitter-info" id="splitter-info"></div>
  <div class="splitter-previews" id="splitter-previews"></div>
  <div class="splitter-actions">
    <button class="btn btn-primary btn-lg" id="split-btn">Split & Download ZIP</button>
  </div>
`;

let _browser = null;
let _totalSplitPages = 0;

export function render(container) {
  _totalSplitPages = 0;

  _browser = createPdfPageBrowser({
    container,
    optionsHTML: OPTIONS_HTML,
    styleCSS: STYLE_CSS,
    actionButtonSelector: '#split-btn',
    renderScale: 0.4,
    initialProcessingMessage: 'Splitting pages...',

    onPagesLoaded: (canvases) => {
      const splitterInfo = container.querySelector('#splitter-info');
      const splitterPreviews = container.querySelector('#splitter-previews');

      let landscapeCount = 0;
      canvases.forEach(c => { if (c.width > c.height) landscapeCount++; });
      _totalSplitPages = canvases.length + landscapeCount;

      splitterInfo.innerHTML = `
        <h3>Preview</h3>
        <p>${canvases.length} page(s) detected · ${landscapeCount} landscape page(s) will be split · Result: <strong>${_totalSplitPages} images</strong></p>
      `;

      splitterPreviews.innerHTML = '';
      canvases.forEach((canvas, i) => {
        const card = document.createElement('div');
        card.className = 'splitter-page-card';

        const label = document.createElement('div');
        label.className = 'page-label';
        label.textContent = `Page ${i + 1} (${canvas.width} × ${canvas.height})`;
        card.appendChild(label);

        const thumb = document.createElement('canvas');
        thumb.width = canvas.width;
        thumb.height = canvas.height;
        const thumbCtx = thumb.getContext('2d');
        thumbCtx.drawImage(canvas, 0, 0);
        thumb.style.maxWidth = '100%';
        card.appendChild(thumb);

        const indicator = document.createElement('div');
        indicator.className = 'split-indicator';
        if (canvas.width > canvas.height) {
          const left = document.createElement('div');
          left.className = 'half left'; left.textContent = '← Left';
          const right = document.createElement('div');
          right.className = 'half right'; right.textContent = 'Right →';
          indicator.appendChild(left);
          indicator.appendChild(right);
        } else {
          const pt = document.createElement('div');
          pt.className = 'pass-through'; pt.textContent = 'Pass through';
          indicator.appendChild(pt);
        }
        card.appendChild(indicator);
        splitterPreviews.appendChild(card);
      });
    },

    onReset: () => {
      _totalSplitPages = 0;
      container.querySelector('#splitter-info').innerHTML = '';
      container.querySelector('#splitter-previews').innerHTML = '';
    },

    onAction: async (api) => {
      const zip = new JSZip();
      const canvases = api.canvases;
      const file = api.file;
      const pageCount = canvases.length;

      for (let i = 0; i < pageCount; i++) {
        api.setProcessingText(`Rendering page ${i + 1} of ${pageCount}...`);
        const preview = canvases[i];
        const isLandscape = preview.width > preview.height;
        const fullCanvas = await renderPdfPage(file, i, 2.0);
        const pageNum = String(i + 1).padStart(3, '0');

        if (isLandscape) {
          const halfW = Math.round(fullCanvas.width / 2);

          for (const half of ['left', 'right']) {
            const halfCanvas = document.createElement('canvas');
            halfCanvas.width = halfW;
            halfCanvas.height = fullCanvas.height;
            const ctx = halfCanvas.getContext('2d');
            const sx = half === 'left' ? 0 : halfW;
            ctx.drawImage(fullCanvas, sx, 0, halfW, fullCanvas.height, 0, 0, halfW, fullCanvas.height);

            const pngBlob = await new Promise(resolve => halfCanvas.toBlob(resolve, 'image/png'));
            const pngBytes = await pngBlob.arrayBuffer();
            zip.file(`page_${pageNum}_${half}.png`, pngBytes);
          }
        } else {
          const pngBlob = await new Promise(resolve => fullCanvas.toBlob(resolve, 'image/png'));
          const pngBytes = await pngBlob.arrayBuffer();
          zip.file(`page_${pageNum}.png`, pngBytes);
        }
      }

      api.setProcessingText('Creating ZIP archive...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'split_pages.zip');
      showToast({ message: `Downloaded ${_totalSplitPages} images as ZIP!`, type: 'success' });
    }
  });
}

export function destroy() {
  _totalSplitPages = 0;
  if (_browser) {
    _browser.destroy();
    _browser = null;
  }
}
