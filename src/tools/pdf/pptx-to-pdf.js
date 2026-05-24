import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'pptx-to-pdf',
  name: 'PowerPoint to PDF',
  category: 'pdf',
  description: 'Convert .pptx presentations to PDF files.',
  icon: '',
  accept: '.pptx',
  maxSizeMB: 50,
  keywords: ['pptx to pdf', 'powerpoint to pdf', 'convert ppt to pdf', 'presentation to pdf'],
  steps: ['Upload a .pptx file', 'Click "Convert to PDF"', 'Download the PDF file'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support .pptx files up to 50MB.' },
    { question: 'Are images preserved?', answer: 'Yes, images embedded in slides are included.' },
    { question: 'Is formatting preserved?', answer: 'Text and basic layout are preserved. Complex animations are not supported.' }
  ]
};

async function extractSlideText(zip, slidePath) {
  const slideXml = await zip.file(slidePath)?.async('text');
  if (!slideXml) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(slideXml, 'application/xml');
  const textElements = doc.getElementsByTagName('a:t');
  
  const texts = [];
  for (let i = 0; i < textElements.length; i++) {
    const text = textElements[i].textContent;
    if (text.trim()) {
      texts.push(text.trim());
    }
  }
  return texts;
}

async function extractSlideImages(zip, slidePath, mediaPaths) {
  const slideXml = await zip.file(slidePath)?.async('text');
  if (!slideXml) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(slideXml, 'application/xml');
  const blipElements = doc.getElementsByTagName('a:blip');
  
  const images = [];
  for (let i = 0; i < blipElements.length; i++) {
    const embedId = blipElements[i].getAttribute('r:embed');
    if (embedId) {
      const relsXml = await zip.file('ppt/slides/_rels/' + slidePath.split('/').pop() + '.rels')?.async('text');
      if (relsXml) {
        const relDoc = parser.parseFromString(relsXml, 'application/xml');
        const rels = relDoc.getElementsByTagName('Relationship');
        for (let j = 0; j < rels.length; j++) {
          if (rels[j].getAttribute('Id') === embedId) {
            const target = rels[j].getAttribute('Target');
            const mediaPath = 'ppt/media/' + target.replace('../media/', '');
            if (mediaPaths[mediaPath]) {
              images.push({ path: mediaPath, data: mediaPaths[mediaPath] });
            }
          }
        }
      }
    }
  }
  return images;
}

export function render(container) {
  let pptxFile = null;

  const upload = createFileUpload({
    accept: '.pptx',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        pptxFile = files[0];
        convertBtn.style.display = 'inline-flex';
        fileName.textContent = files[0].name;
        fileInfo.textContent = (files[0].size / 1024 / 1024).toFixed(2) + ' MB';
        filePanel.style.display = 'block';
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="file-info-panel" id="file-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon"></span>
          <div class="file-details-text">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-info"></div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Convert to PDF</button>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Converting presentation to PDF... <span id="progress-pct">0</span>%</p>
      </div>
    </div>
    <style>
      .file-info-panel { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg); }
      .file-details { display:flex;align-items:center;gap:var(--space-4); }
      .file-icon { font-size:32px; }
      .file-name { font-weight:600; }
      .file-size { font-size:var(--text-sm);color:var(--color-text-secondary); }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');
  const filePanel = container.querySelector('#file-panel');
  const fileName = container.querySelector('#file-name');
  const fileInfo = container.querySelector('#file-info');

  convertBtn.addEventListener('click', async () => {
    if (!pptxFile) return;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    filePanel.style.display = 'none';

    try {
      const zip = await JSZip.loadAsync(pptxFile);
      const presentationXml = await zip.file('ppt/presentation.xml')?.async('text');
      if (!presentationXml) throw new Error('Invalid PPTX file');

      const parser = new DOMParser();
      const presDoc = parser.parseFromString(presentationXml, 'application/xml');
      const slideIds = presDoc.getElementsByTagName('p:sldId');
      const totalSlides = slideIds.length;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Cache media files
      const mediaPaths = {};
      zip.forEach((relativePath, file) => {
        if (relativePath.startsWith('ppt/media/')) {
          mediaPaths[relativePath] = file;
        }
      });

      for (let i = 0; i < totalSlides; i++) {
        if (i > 0) doc.addPage();
        progressPct.textContent = Math.round(((i + 1) / totalSlides) * 100);

        const slidePath = `ppt/slides/slide${i + 1}.xml`;
        const texts = await extractSlideText(zip, slidePath);
        const images = await extractSlideImages(zip, slidePath, mediaPaths);

        let y = 20;
        const lineHeight = 8;

        // Add images first (background)
        for (const img of images) {
          try {
            const imgData = await img.data.async('base64');
            const ext = img.path.split('.').pop().toLowerCase();
            const format = ext === 'png' ? 'PNG' : 'JPEG';
            doc.addImage(`data:image/${ext};base64,${imgData}`, format, 10, 10, pageWidth - 20, pageHeight - 20);
          } catch (e) {
            console.warn('Failed to add image:', e);
          }
        }

        // Add text
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        for (const text of texts) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          const splitText = doc.splitTextToSize(text, pageWidth - 40);
          doc.text(splitText, 20, y);
          y += splitText.length * lineHeight;
        }
      }

      const pdfBlob = doc.output('blob');
      const fileNameWithoutExt = pptxFile.name.replace(/\.pptx$/i, '');
      downloadBlob(pdfBlob, `${fileNameWithoutExt}.pdf`);
      showToast({ message: `Converted ${totalSlides} slides to PDF!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
      filePanel.style.display = 'block';
    }
  });
}

export function destroy() {}
