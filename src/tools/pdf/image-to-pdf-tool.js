import { PDFDocument } from 'pdf-lib';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile } from '../image/image-utils.js';
import { createUploadTool } from '../image/upload-tool-factory.js';

const PAGE_SIZES = {
  'a4': [595, 842],
  'letter': [612, 792],
  'legal': [612, 1008]
};

function computePageDimensions(pageSize, orientation, image, margin) {
  let pageWidth, pageHeight;
  if (pageSize === 'fit') {
    pageWidth = image.naturalWidth + margin * 2;
    pageHeight = image.naturalHeight + margin * 2;
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

export { computePageDimensions };

function fitImageToPage(image, pageWidth, pageHeight, margin) {
  const availWidth = pageWidth - margin * 2;
  const availHeight = pageHeight - margin * 2;
  const imgRatio = image.naturalWidth / image.naturalHeight;
  const pageRatio = availWidth / availHeight;
  if (imgRatio > pageRatio) {
    return { drawWidth: availWidth, drawHeight: availWidth / imgRatio };
  }
  return { drawWidth: availHeight * imgRatio, drawHeight: availHeight };
}

export { fitImageToPage };

export function createImageToPdfTool({
  id, name, description, icon = '', accept, keywords, faqs,
  embedImage, fileTypeName, fileExtRegex
}) {
  function render(container) {
    createUploadTool({
      container,
      toolId: id,
      fileTypeName,
      accept,
      buttonText: 'Convert to PDF',
      optionsHTML: `
        <div class="form-group">
          <label>Page Size</label>
          <select id="${id}-page-size" class="select-input">
            <option value="fit">Fit to Image</option>
            <option value="a4">A4</option>
            <option value="letter" selected>Letter</option>
            <option value="legal">Legal</option>
          </select>
        </div>
        <div class="form-group">
          <label>Orientation</label>
          <select id="${id}-orientation" class="select-input">
            <option value="auto">Auto (match image)</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <div class="form-group">
          <label>Margin (points)</label>
          <input type="number" id="${id}-margin" value="0" min="0" max="100" class="text-input" style="width:100px;">
        </div>
      `,
      async onConvert({ files, uploadedData, progress }) {
        const images = [];
        for (const file of files) {
          images.push(await loadImageFromFile(file));
        }

        const pageSize = container.querySelector(`#${id}-page-size`).value;
        const orientation = container.querySelector(`#${id}-orientation`).value;
        const margin = parseInt(container.querySelector(`#${id}-margin`).value) || 0;

        const pdfDoc = await PDFDocument.create();
        for (let i = 0; i < images.length; i++) {
          progress(Math.round(((i + 1) / images.length) * 80));
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

        progress(95);
        const pdfBytes = await pdfDoc.save();
        const outputName = files.length === 1 ? files[0].name.replace(fileExtRegex, '') : 'combined';
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${outputName}.pdf`);
        progress(100);
        showToast({ message: `Converted ${images.length} image(s) to PDF!`, type: 'success' });
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
