import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { downloadBlob } from '../../utils/file.js';
import { showToast } from '../../components/toast.js';
import { createSingleFileTool } from '../../utils/single-file-tool.js';

export const toolConfig = {
  id: 'epub-to-pdf',
  name: 'EPUB to PDF',
  category: 'pdf',
  description: 'Convert EPUB e-books to PDF format.',
  icon: '',
  accept: '.epub',
  maxSizeMB: 50,
  keywords: ['epub to pdf', 'convert epub to pdf', 'ebook to pdf', 'epub converter'],
  steps: ['Upload an EPUB file', 'Click "Convert to PDF"', 'Download the .pdf file'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support EPUB files (.epub) up to 50MB.' },
    { question: 'Are images preserved?', answer: 'Text content is preserved. Images are not included in the PDF.' },
    { question: 'Is formatting preserved?', answer: 'Basic structure (headings, paragraphs) is preserved. Complex formatting may be simplified.' }
  ]
};

export function parseOpf(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xhtml+xml');
  const title = doc.querySelector('dc\\:title, title')?.textContent || 'Untitled';
  const author = doc.querySelector('dc\\:creator, creator')?.textContent || 'Unknown';
  const manifest = {};
  doc.querySelectorAll('item').forEach(item => {
    manifest[item.getAttribute('id')] = { href: item.getAttribute('href'), mediaType: item.getAttribute('media-type') };
  });
  const spine = [];
  doc.querySelectorAll('itemref').forEach(itemref => {
    const idref = itemref.getAttribute('idref');
    if (manifest[idref]) spine.push(manifest[idref]);
  });
  return { title, author, manifest, spine };
}

export function extractTextFromXhtml(htmlText) {
  const doc = new DOMParser().parseFromString(htmlText, 'text/html');
  const blocks = [];
  function walk(node) {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) blocks.push({ type: 'text', content: text });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) {
          blocks.push({ type: 'heading', level: parseInt(tag.charAt(1)), content: child.textContent.trim() });
        } else if (['p', 'div', 'li'].includes(tag)) {
          const text = child.textContent.trim();
          if (text) blocks.push({ type: 'paragraph', content: text });
        } else if (tag === 'br') {
          blocks.push({ type: 'break' });
        } else {
          walk(child);
        }
      }
    }
  }
  walk(doc.body);
  return blocks;
}

async function createPdfFromBlocks(allChapters) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pageSize = { width: 612, height: 792 };
  const margin = 72;
  const maxWidth = pageSize.width - margin * 2;
  const lineHeight = 14;
  const headingSizes = { 1: 24, 2: 20, 3: 16, 4: 14, 5: 12, 6: 11 };

  function wrapText(text, f, size, maxW) {
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word;
      if (f.widthOfTextAtSize(test, size) > maxW && cur) { lines.push(cur); cur = word; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines.length > 0 ? lines : [''];
  }

  function addText(page, text, size, isBold, indent = 0) {
    const f = isBold ? boldFont : font;
    const lines = wrapText(text, f, size, maxWidth - indent);
    for (const line of lines) {
      if (page._textLines * lineHeight > pageSize.height - margin * 2) {
        page = pdfDoc.addPage(pageSize);
        page._textLines = 0;
      }
      page.drawText(line, { x: margin + indent, y: pageSize.height - margin - page._textLines * lineHeight, size, font: f, color: rgb(0, 0, 0) });
      page._textLines++;
    }
    return page;
  }

  for (const chapter of allChapters) {
    let page = pdfDoc.addPage(pageSize);
    page._textLines = 0;
    if (chapter.title) { page = addText(page, chapter.title, 18, true); page._textLines += 2; }
    for (const block of chapter.blocks) {
      if (block.type === 'heading') { page = addText(page, block.content, headingSizes[block.level] || 14, true); page._textLines++; }
      else if (block.type === 'paragraph' || block.type === 'text') { page = addText(page, block.content, 11, false); page._textLines++; }
      else if (block.type === 'break') { page._textLines++; }
    }
  }
  return pdfDoc;
}

export function render(container) {
  createSingleFileTool({
    container,
    toolId: 'epub2pdf',
    accept: '.epub',
    icon: '',
    buttonText: 'Convert to PDF',
    processingMessage: 'Converting EPUB to PDF...',
    async onConvert({ file, progress }) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      progress(25);

      let opfPath = null;
      const containerXml = zip.file('META-INF/container.xml');
      if (containerXml) {
        const doc = new DOMParser().parseFromString(await containerXml.async('text'), 'application/xml');
        opfPath = doc.querySelector('rootfile')?.getAttribute('full-path');
      }
      if (!opfPath) {
        for (const path of Object.keys(zip.files)) {
          if (path.endsWith('.opf') && !path.includes('META-INF')) { opfPath = path; break; }
        }
      }
      if (!opfPath) throw new Error('Could not find OPF file in EPUB');

      const { spine } = parseOpf(await zip.file(opfPath).async('text'));
      progress(50);

      const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
      const chapters = [];
      for (const item of spine) {
        const href = item.href;
        const fullPath = href.startsWith('..') ? opfDir + href : (href.includes('/') ? href : opfDir + href);
        const f = zip.file(fullPath);
        if (f) {
          chapters.push({ title: href.split('/').pop().replace(/\.[^.]+$/, ''), blocks: extractTextFromXhtml(await f.async('text')) });
        }
      }
      progress(75);
      if (chapters.length === 0) throw new Error('No chapters found in EPUB');

      const pdfDoc = await createPdfFromBlocks(chapters);
      downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), file.name.replace(/\.epub$/i, '') + '.pdf');
      progress(100);
      showToast({ message: `Converted! ${chapters.length} chapters processed.`, type: 'success' });
    }
  });
}

export function destroy() {}
