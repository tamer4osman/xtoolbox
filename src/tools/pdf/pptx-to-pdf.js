import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { downloadBlob } from '../../utils/file.js';
import { showToast } from '../../components/toast.js';
import { createSingleFileTool } from '../../utils/single-file-tool.js';

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
  const xml = await zip.file(slidePath)?.async('text');
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const texts = [];
  for (const el of doc.getElementsByTagName('a:t')) {
    const t = el.textContent.trim();
    if (t) texts.push(t);
  }
  return texts;
}

async function extractSlideImages(zip, slidePath, mediaPaths) {
  const xml = await zip.file(slidePath)?.async('text');
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const images = [];
  for (const blip of doc.getElementsByTagName('a:blip')) {
    const embedId = blip.getAttribute('r:embed');
    if (!embedId) continue;
    const relsXml = await zip.file('ppt/slides/_rels/' + slidePath.split('/').pop() + '.rels')?.async('text');
    if (!relsXml) continue;
    const relDoc = new DOMParser().parseFromString(relsXml, 'application/xml');
    for (const rel of relDoc.getElementsByTagName('Relationship')) {
      if (rel.getAttribute('Id') === embedId) {
        const mediaPath = 'ppt/media/' + rel.getAttribute('Target').replace('../media/', '');
        if (mediaPaths[mediaPath]) images.push({ path: mediaPath, data: mediaPaths[mediaPath] });
      }
    }
  }
  return images;
}

export function render(container) {
  createSingleFileTool({
    container,
    toolId: 'pptx2pdf',
    accept: '.pptx',
    icon: '',
    buttonText: 'Convert to PDF',
    processingMessage: 'Converting presentation to PDF...',
    async onConvert({ file, progress }) {
      const zip = await JSZip.loadAsync(file);
      const presXml = await zip.file('ppt/presentation.xml')?.async('text');
      if (!presXml) throw new Error('Invalid PPTX file');
      const totalSlides = new DOMParser().parseFromString(presXml, 'application/xml').getElementsByTagName('p:sldId').length;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();

      const mediaPaths = {};
      zip.forEach((path, f) => { if (path.startsWith('ppt/media/')) mediaPaths[path] = f; });

      for (let i = 0; i < totalSlides; i++) {
        if (i > 0) doc.addPage();
        progress(Math.round(((i + 1) / totalSlides) * 100));
        const slidePath = `ppt/slides/slide${i + 1}.xml`;
        const texts = await extractSlideText(zip, slidePath);
        const images = await extractSlideImages(zip, slidePath, mediaPaths);

        for (const img of images) {
          try {
            const data = await img.data.async('base64');
            const ext = img.path.split('.').pop().toLowerCase();
            doc.addImage(`data:image/${ext};base64,${data}`, ext === 'png' ? 'PNG' : 'JPEG', 10, 10, pw - 20, ph - 20);
          } catch (e) { console.warn('Failed to add image:', e); }
        }

        let y = 20;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        for (const text of texts) {
          if (y > ph - 20) { doc.addPage(); y = 20; }
          const split = doc.splitTextToSize(text, pw - 40);
          doc.text(split, 20, y);
          y += split.length * 8;
        }
      }

      downloadBlob(doc.output('blob'), file.name.replace(/\.pptx$/i, '') + '.pdf');
      showToast({ message: `Converted ${totalSlides} slides to PDF!`, type: 'success' });
    }
  });
}

export function destroy() {}
