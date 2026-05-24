import { PDFDocument } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile } from '../image/image-utils.js';

export const toolConfig = {
  id: 'png-to-pdf',
  name: 'PNG to PDF Converter',
  category: 'pdf',
  description: 'Convert PNG images to PDF documents.',
  icon: '',
  accept: '.png',
  maxSizeMB: 50,
  keywords: ['png to pdf', 'image to pdf', 'photo to pdf', 'png converter'],
  steps: ['Upload PNG image(s)', 'Choose page size and margins', 'Click "Convert to PDF"', 'Download the PDF'],
  faqs: [
    { question: 'Can I combine multiple images?', answer: 'Yes, each image becomes a separate page in the PDF.' },
    { question: 'What page sizes are available?', answer: 'Fit to image, A4, Letter, and Legal.' },
    { question: 'Is transparency preserved?', answer: 'Yes, PNG transparency is preserved in the PDF.' }
  ]
};

export function render(container) {
  let images = [];
  let files = [];

  const upload = createFileUpload({
    accept: '.png',
    multiple: true,
    maxSizeMB: 50,
    onFilesSelected: async (selectedFiles) => {
      if (selectedFiles.length === 0) return;
      
      files = Array.from(selectedFiles);
      images = [];
      
      for (const file of files) {
        const img = await loadImageFromFile(file);
        images.push(img);
      }
      
      totalFiles.textContent = files.length + ' PNG file(s)';
      totalSize.textContent = (files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1) + ' KB total';
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="display:flex;gap:var(--space-6);margin-bottom:var(--space-4);">
          <div><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Files</span><div id="total-files" style="font-weight:600;">-</div></div>
          <div><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Total Size</span><div id="total-size" style="font-weight:600;">-</div></div>
        </div>
        <div class="form-group">
          <label>Page Size</label>
          <select id="page-size" class="select-input">
            <option value="fit">Fit to Image</option>
            <option value="a4">A4</option>
            <option value="letter" selected>Letter</option>
            <option value="legal">Legal</option>
          </select>
        </div>
        <div class="form-group">
          <label>Orientation</label>
          <select id="orientation" class="select-input">
            <option value="auto">Auto (match image)</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <div class="form-group">
          <label>Margin (points)</label>
          <input type="number" id="margin" value="0" min="0" max="100" class="text-input" style="width:100px;">
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert to PDF</button>
        <div class="tool-processing" id="processing" style="display:none;">
          <div class="spinner"></div>
          <p>Converting... <span id="progress-pct">0</span>%</p>
        </div>
      </div>
    </div>
    <style>
      .text-input { padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text); }
      .select-input { padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text);width:100%; }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const totalFiles = container.querySelector('#total-files');
  const totalSize = container.querySelector('#total-size');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');

  convertBtn.addEventListener('click', async () => {
    if (images.length === 0) return;
    
    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    
    const pageSize = container.querySelector('#page-size').value;
    const orientation = container.querySelector('#orientation').value;
    const margin = parseInt(container.querySelector('#margin').value) || 0;
    
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (let i = 0; i < images.length; i++) {
        progressPct.textContent = Math.round(((i + 1) / images.length) * 80);
        
        const img = images[i];
        const pngBytes = await fetch(img.src).then(r => r.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(new Uint8Array(pngBytes));
        
        let pageWidth, pageHeight;
        
        if (pageSize === 'fit') {
          pageWidth = pngImage.width + margin * 2;
          pageHeight = pngImage.height + margin * 2;
        } else {
          const sizes = {
            'a4': [595, 842],
            'letter': [612, 792],
            'legal': [612, 1008]
          };
          [pageWidth, pageHeight] = sizes[pageSize];
          
          // Handle orientation
          if (orientation === 'landscape' || (orientation === 'auto' && img.naturalWidth > img.naturalHeight)) {
            if (pageWidth < pageHeight) {
              [pageWidth, pageHeight] = [pageHeight, pageWidth];
            }
          } else if (orientation === 'portrait' || orientation === 'auto') {
            if (pageWidth > pageHeight) {
              [pageWidth, pageHeight] = [pageHeight, pageWidth];
            }
          }
        }
        
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Calculate image dimensions to fit page with margins
        const availWidth = pageWidth - margin * 2;
        const availHeight = pageHeight - margin * 2;
        
        const imgRatio = pngImage.width / pngImage.height;
        const pageRatio = availWidth / availHeight;
        
        let drawWidth, drawHeight;
        
        if (imgRatio > pageRatio) {
          drawWidth = availWidth;
          drawHeight = availWidth / imgRatio;
        } else {
          drawHeight = availHeight;
          drawWidth = availHeight * imgRatio;
        }
        
        const x = margin + (availWidth - drawWidth) / 2;
        const y = margin + (availHeight - drawHeight) / 2;
        
        page.drawImage(pngImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight
        });
      }
      
      progressPct.textContent = '95';
      
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const outputName = files.length === 1 ? 
        files[0].name.replace(/\.png$/i, '') : 
        'combined';
      
      downloadBlob(pdfBlob, `${outputName}.pdf`);
      
      progressPct.textContent = '100';
      showToast({ message: `Converted ${images.length} image(s) to PDF!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
