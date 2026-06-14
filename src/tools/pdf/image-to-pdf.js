import { PDFDocument } from 'pdf-lib';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile } from '../image/image-utils.js';
import { createUploadTool } from '../image/upload-tool-factory.js';
import { computePageDimensions, fitImageToPage } from './image-to-pdf-tool.js';

export const toolConfig = {
  id: 'image-to-pdf',
  name: 'Image to PDF',
  category: 'pdf',
  description: 'Convert images into a PDF document.',
  icon: '📄',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'photo to pdf'],
  steps: ['Upload one or more images', 'Choose page size', 'Click "Convert to PDF"', 'Download the PDF'],
  faqs: [
    { question: 'What image formats are supported?', answer: 'JPG, PNG, WebP, GIF, BMP, and SVG.' },
    { question: 'Can I combine multiple images?', answer: 'Yes, each image becomes a separate page in the PDF.' },
    { question: 'Will images be scaled?', answer: 'Images are scaled to fit the chosen page size while maintaining aspect ratio.' }
  ]
};

export function render(container) {
  createUploadTool({
    container,
    toolId: 'image-to-pdf',
    fileTypeName: 'Image',
    accept: 'image/*',
    buttonText: 'Convert to PDF',
    optionsHTML: `
      <div class="form-group">
        <label>Page Size</label>
        <select id="image-to-pdf-page-size" class="select-input">
          <option value="fit">Fit to Image</option>
          <option value="a4">A4</option>
          <option value="letter" selected>Letter</option>
          <option value="legal">Legal</option>
        </select>
      </div>
      <div class="form-group">
        <label>Orientation</label>
        <select id="image-to-pdf-orientation" class="select-input">
          <option value="auto">Auto (match image)</option>
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>
      <div class="form-group">
        <label>Margin (points)</label>
        <input type="number" id="image-to-pdf-margin" value="0" min="0" max="100" class="text-input" style="width:100px;">
      </div>
    `,
    async onConvert({ files, progress }) {
      const images = [];
      for (const file of files) {
        images.push(await loadImageFromFile(file));
      }

      const pageSize = container.querySelector('#image-to-pdf-page-size').value;
      const orientation = container.querySelector('#image-to-pdf-orientation').value;
      const margin = parseInt(container.querySelector('#image-to-pdf-margin').value) || 0;

      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < images.length; i++) {
        progress(Math.round(((i + 1) / images.length) * 80));
        const img = images[i];
        const imageBytes = await fetch(img.src).then(r => r.arrayBuffer());
        const bytes = new Uint8Array(imageBytes);

        let embeddedImage;
        try {
          embeddedImage = await pdfDoc.embedJpg(bytes);
        } catch {
          embeddedImage = await pdfDoc.embedPng(bytes);
        }

        const [pageWidth, pageHeight] = computePageDimensions(pageSize, orientation, img, margin);
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const { drawWidth, drawHeight } = fitImageToPage(embeddedImage, pageWidth, pageHeight, margin);
        const x = margin + (pageWidth - margin * 2 - drawWidth) / 2;
        const y = margin + (pageHeight - margin * 2 - drawHeight) / 2;
        page.drawImage(embeddedImage, { x, y, width: drawWidth, height: drawHeight });
      }

      progress(95);
      const pdfBytes = await pdfDoc.save();
      const outputName = files.length === 1 ? files[0].name.replace(/\.[^.]+$/, '') : 'combined';
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${outputName}.pdf`);
      progress(100);
      showToast({ message: `Converted ${images.length} image(s) to PDF!`, type: 'success' });
    }
  });
}
