import { PDFDocument } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile } from '../image/image-utils.js';

const PAGE_SIZES = {
  'a4': [595, 842],
  'letter': [612, 792],
  'legal': [612, 1008]
};

function computePageDimensions(pageSize, orientation, image, margin) {
  let pageWidth, pageHeight;
  if (pageSize === 'fit') {
    pageWidth = image.width + margin * 2;
    pageHeight = image.height + margin * 2;
  } else {
    [pageWidth, pageHeight] = PAGE_SIZES[pageSize];
    if (orientation === 'landscape' || (orientation === 'auto' && image.naturalWidth > image.naturalHeight)) {
      if (pageWidth < pageHeight) [pageWidth, pageHeight] = [pageHeight, pageWidth];
    } else if (orientation === 'portrait' || orientation === 'auto') {
      if (pageWidth > pageHeight) [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }
  }
  return [pageWidth, pageHeight];
}

function fitImageToPage(image, pageWidth, pageHeight, margin) {
  const availWidth = pageWidth - margin * 2;
  const availHeight = pageHeight - margin * 2;
  const imgRatio = image.width / image.height;
  const pageRatio = availWidth / availHeight;
  if (imgRatio > pageRatio) {
    return { drawWidth: availWidth, drawHeight: availWidth / imgRatio };
  }
  return { drawWidth: availHeight * imgRatio, drawHeight: availHeight };
}

/**
 * Factory for image-to-PDF conversion tools (JPG, PNG, etc.).
 * The only differences between source formats are the pdf-lib embed
 * function and the file extension. Everything else (UI, layout,
 * orientation, margin handling) is shared.
 *
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.name
 * @param {string} opts.description
 * @param {string} opts.icon
 * @param {string} opts.accept
 * @param {string[]} opts.keywords
 * @param {Array} opts.faqs
 * @param {(pdfDoc: PDFDocument, bytes: Uint8Array) => Promise<PDFImage>} opts.embedImage
 * @param {string} opts.fileTypeName - Display name in UI (e.g. "JPG", "PNG")
 * @param {RegExp} opts.fileExtRegex - Regex to strip source extension
 */
export function createImageToPdfTool({
  id, name, description, icon = '', accept, keywords, faqs,
  embedImage, fileTypeName, fileExtRegex
}) {
  function render(container) {
    let images = [];
    let files = [];

    const upload = createFileUpload({
      accept,
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
        totalFiles.textContent = files.length + ' ' + fileTypeName + ' file(s)';
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
          const imageBytes = await fetch(img.src).then(r => r.arrayBuffer());
          const embeddedImage = await embedImage(pdfDoc, new Uint8Array(imageBytes));

          const [pageWidth, pageHeight] = computePageDimensions(pageSize, orientation, img, margin);
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          const { drawWidth, drawHeight } = fitImageToPage(embeddedImage, pageWidth, pageHeight, margin);
          const x = margin + (pageWidth - margin * 2 - drawWidth) / 2;
          const y = margin + (pageHeight - margin * 2 - drawHeight) / 2;
          page.drawImage(embeddedImage, { x, y, width: drawWidth, height: drawHeight });
        }

        progressPct.textContent = '95';
        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const outputName = files.length === 1 ? files[0].name.replace(fileExtRegex, '') : 'combined';
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

  return {
    toolConfig: {
      id, name, category: 'pdf', description, icon, accept, maxSizeMB: 50, keywords, faqs
    },
    render
  };
}
