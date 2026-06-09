import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadPdf, renderAllPages } from './pdf-utils.js';

export const toolConfig = {
  id: 'pdf-esign',
  name: 'PDF eSign',
  category: 'pdf',
  description: 'Draw your signature and stamp it onto PDF pages. Draw, type, or upload signature.',
  icon: '✍️',
  accept: '.pdf',
  maxSizeMB: 50,
  keywords: ['sign pdf', 'pdf signature', 'esign pdf', 'digital signature pdf', 'electronic signature'],
  steps: ['Upload a PDF', 'Draw or type your signature', 'Place signature on PDF', 'Download signed PDF'],
  faqs: [
    { question: 'Is this legally binding?', answer: 'This creates a visual signature overlay. Consult local laws for legal requirements.' }
  ]
};

const SIGN_CSS = `
      .signature-tabs { display:flex;gap:var(--space-2);margin-bottom:var(--space-4); }
      .tab-btn { flex:1;padding:var(--space-3);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer; }
      .tab-btn.active { background:var(--color-primary);color:white;border-color:var(--color-primary); }
      #sign-canvas { width:100%;height:150px;border:2px dashed var(--color-border);border-radius:var(--radius-md);background:white;cursor:crosshair; }
      .page-selector { display:flex;gap:var(--space-4);align-items:center; }
      .page-selector label { display:flex;flex:1;gap:var(--space-2); }
      .page-selector select { flex:1;padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-md); }`;

const SIGN_HTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="sign-panel" style="display:none;">
        <div class="signature-tabs">
          <button class="tab-btn active" data-tab="draw">Draw</button>
          <button class="tab-btn" data-tab="type">Type</button>
          <button class="tab-btn" data-tab="upload">Upload</button>
        </div>
        <div class="tab-content" id="draw-tab">
          <canvas id="sign-canvas" width="400" height="150"></canvas>
          <button class="btn btn-secondary" id="clear-sign">Clear</button>
        </div>
        <div class="tab-content" id="type-tab" style="display:none;">
          <input type="text" id="type-name" class="input" placeholder="Your name" style="width:100%;padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-3);">
          <select id="sign-font" class="select" style="width:100%;padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-3);">
            <option value="Helvetica">Helvetica</option>
            <option value="TimesRoman">Times New Roman</option>
            <option value="Courier">Courier</option>
          </select>
          <div id="type-preview" style="font-size:24px;padding:var(--space-4);background:var(--color-surface);border-radius:var(--radius-md);text-align:center;"></div>
        </div>
        <div class="tab-content" id="upload-tab" style="display:none;">
          <input type="file" id="sign-upload" accept="image/*" style="width:100%;padding:var(--space-4);">
        </div>
        <div class="page-selector" style="margin:var(--space-4) 0;">
          <label>Sign on page: <select id="page-select" class="select"></select></label>
          <label>Position: 
            <select id="position-select" class="select">
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="center">Center</option>
            </select>
          </label>
        </div>
        <button class="btn btn-primary" id="apply-sign" style="width:100%;margin-top:var(--space-4);">Apply Signature</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Applying signature...</p></div>
    </div>`;

function bindSignEvents(container, signPanel, signatureRef) {
  const canvas = container.querySelector('#sign-canvas');
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  let isDrawing = false, lastX = 0, lastY = 0;

  canvas.addEventListener('mousedown', (e) => { isDrawing = true; [lastX, lastY] = [e.offsetX, e.offsetY]; });
  canvas.addEventListener('mousemove', (e) => { if (!isDrawing) return; ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); [lastX, lastY] = [e.offsetX, e.offsetY]; });
  canvas.addEventListener('mouseup', () => isDrawing = false);
  canvas.addEventListener('mouseout', () => isDrawing = false);

  container.querySelector('#clear-sign').addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      container.querySelector('#' + btn.dataset.tab + '-tab').style.display = 'block';
    });
  });

  const updateTypePreview = () => {
    container.querySelector('#type-preview').textContent = container.querySelector('#type-name').value || 'Your Signature';
    container.querySelector('#type-preview').style.fontFamily = container.querySelector('#sign-font').value;
  };
  container.querySelector('#type-name').addEventListener('input', updateTypePreview);
  container.querySelector('#sign-font').addEventListener('change', updateTypePreview);

  container.querySelector('#sign-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onload = (ev) => signatureRef.data = ev.target.result; reader.readAsDataURL(file); }
  });

  return canvas;
}

export function render(container) {
  let pdfFile = null, pdfDoc = null;
  const signatureRef = { data: null };

  const upload = createFileUpload({ accept: '.pdf', multiple: false, maxSizeMB: 50, onFilesSelected: (files) => { if (files.length > 0) { pdfFile = files[0]; loadPdfAndPages(files[0]); } } });

  container.innerHTML = SIGN_HTML;
  const style = document.createElement('style'); style.textContent = SIGN_CSS; container.appendChild(style);
  container.querySelector('#upload-area').appendChild(upload.element);
  const signPanel = container.querySelector('#sign-panel');
  const canvas = bindSignEvents(container, signPanel, signatureRef);

  async function loadPdfAndPages(file) {
    try {
      pdfFile = file; const bytes = await file.arrayBuffer(); pdfDoc = await PDFDocument.load(bytes);
      const select = container.querySelector('#page-select'); select.innerHTML = '';
      for (let i = 0; i < pdfDoc.getPageCount(); i++) select.innerHTML += `<option value="${i}">Page ${i + 1}</option>`;
      signPanel.style.display = 'block';
    } catch (err) { showToast({ message: 'Error loading PDF: ' + err.message, type: 'error' }); }
  }

  container.querySelector('#apply-sign').addEventListener('click', async () => {
    const activeTab = container.querySelector('.tab-btn.active').dataset.tab;
    let signatureImage;
    if (activeTab === 'draw') { signatureImage = canvas.toDataURL('image/png'); }
    else if (activeTab === 'type') {
      const name = container.querySelector('#type-name').value || 'Signed';
      const tempDoc = await PDFDocument.create(); const page = tempDoc.addPage([200, 50]);
      const font = await tempDoc.embedFont(StandardFonts.Helvetica); page.drawText(name, { x: 5, y: 15, size: 24, font });
      signatureImage = URL.createObjectURL(new Blob([await tempDoc.save()], { type: 'application/pdf' }));
    } else {
      if (!signatureRef.data) { showToast({ message: 'Please upload an image first', type: 'warning' }); return; }
      signatureImage = signatureRef.data;
    }
    if (!signatureImage) { showToast({ message: 'Please create or upload a signature', type: 'warning' }); return; }
    container.querySelector('#processing').style.display = 'flex';
    try {
      const pdfDocNew = await PDFDocument.load(await pdfFile.arrayBuffer());
      const pages = pdfDocNew.getPages();
      const page = pages[parseInt(container.querySelector('#page-select').value)];
      const { width, height } = page.getSize();
      const position = container.querySelector('#position-select').value;
      let embed = signatureImage.startsWith('data:image') ? await pdfDocNew.embedPng(await fetch(signatureImage).then(r => r.arrayBuffer())) : await pdfDocNew.embedPdf(signatureImage);
      const sigWidth = 100, sigHeight = embed.height * (sigWidth / embed.width), margin = 20;
      let x, y;
      switch (position) {
        case 'bottom-left': x = margin; y = margin; break;
        case 'top-right': x = width - sigWidth - margin; y = height - sigHeight - margin; break;
        case 'top-left': x = margin; y = height - sigHeight - margin; break;
        case 'center': x = (width - sigWidth) / 2; y = (height - sigHeight) / 2; break;
        default: x = width - sigWidth - margin; y = margin;
      }
      page.drawImage(embed, { x, y, width: sigWidth, height: sigHeight });
      downloadBlob(new Blob([await pdfDocNew.save()], { type: 'application/pdf' }), pdfFile.name.replace('.pdf', '-signed.pdf'));
      showToast({ message: 'PDF signed successfully!', type: 'success' });
    } catch (err) { showToast({ message: 'Error signing PDF: ' + err.message, type: 'error' }); }
    finally { container.querySelector('#processing').style.display = 'none'; }
  });
}

export function destroy() {}
