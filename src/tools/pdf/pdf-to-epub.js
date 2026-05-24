import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: 'pdf-to-epub',
  name: 'PDF to EPUB',
  category: 'pdf',
  description: 'Convert PDF to e-book format for e-readers.',
  icon: '📚',
  accept: '.pdf',
  maxSizeMB: 50,
  keywords: ['pdf to epub', 'convert pdf to ebook', 'pdf to e-reader', 'pdf to kindle'],
  steps: ['Upload a PDF file', 'Click "Convert to EPUB"', 'Download the .epub file'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support PDF files up to 50MB.' },
    { question: 'Are images preserved?', answer: 'Text is extracted. Images are not included in the EPUB.' },
    { question: 'Are scanned PDFs supported?', answer: 'Only PDFs with selectable text. Scanned images need OCR first.' }
  ]
};

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const chapters = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    // Group text items by Y position to detect paragraphs
    const paragraphs = [];
    let currentParagraph = [];
    let lastY = null;
    const yThreshold = 3;

    for (const item of items) {
      const y = Math.round(item.transform[5]);
      const text = item.str;

      if (!text.trim()) continue;

      if (lastY === null || Math.abs(y - lastY) > yThreshold) {
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
        }
        currentParagraph = [text];
      } else {
        currentParagraph.push(text);
      }
      lastY = y;
    }

    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }

    if (paragraphs.length > 0) {
      chapters.push({
        number: i,
        paragraphs: paragraphs.filter(p => p.trim().length > 0)
      });
    }
  }

  return chapters;
}

function generateEpub(chapters, title, author) {
  const zip = new JSZip();
  const uid = `urn:uuid:${crypto.randomUUID()}`;
  const date = new Date().toISOString().replace(/\.\d+Z/, 'Z');

  // mimetype (must be first, uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF/container.xml
  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  // Build manifest items
  let manifestItems = `    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="style" href="style.css" media-type="text/css"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
`;
  let spineItems = `    <itemref idref="cover"/>
`;
  let navPoints = '';

  chapters.forEach((chapter, idx) => {
    const id = `chapter${idx + 1}`;
    manifestItems += `    <item id="${id}" href="text/${id}.xhtml" media-type="application/xhtml+xml"/>\n`;
    spineItems += `    <itemref idref="${id}"/>\n`;
    navPoints += `    <navPoint id="${id}" playOrder="${idx + 2}">
      <navLabel><text>Chapter ${chapter.number}</text></navLabel>
      <content src="text/${id}.xhtml"/>
    </navPoint>\n`;
  });

  // OEBPS/content.opf
  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="uid">${uid}</dc:identifier>
    <dc:title>${escapeHtml(title)}</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>${escapeHtml(author)}</dc:creator>
    <meta property="dcterms:modified">${date}</meta>
  </metadata>
  <manifest>
${manifestItems}  </manifest>
  <spine toc="ncx">
${spineItems}  </spine>
</package>`);

  // OEBPS/toc.ncx
  zip.file('OEBPS/toc.ncx', `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeHtml(title)}</text></docTitle>
  <navMap>
    <navPoint id="cover" playOrder="1">
      <navLabel><text>Cover</text></navLabel>
      <content src="cover.xhtml"/>
    </navPoint>
${navPoints}  </navMap>
</ncx>`);

  // OEBPS/style.css
  zip.file('OEBPS/style.css', `body { font-family: serif; line-height: 1.6; margin: 1em; }
h1 { text-align: center; margin-bottom: 2em; }
p { text-indent: 1.5em; margin: 0.5em 0; }`);

  // OEBPS/cover.xhtml
  zip.file('OEBPS/cover.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Cover</title><link href="style.css" rel="stylesheet" type="text/css"/></head>
<body><h1>${escapeHtml(title)}</h1><p style="text-align:center;color:#666;">${escapeHtml(author)}</p></body>
</html>`);

  // OEBPS/text/chapterN.xhtml
  chapters.forEach((chapter, idx) => {
    const id = `chapter${idx + 1}`;
    const paragraphs = chapter.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n      ');
    zip.file(`OEBPS/text/${id}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Chapter ${chapter.number}</title><link href="../style.css" rel="stylesheet" type="text/css"/></head>
<body>
  <h1>Chapter ${chapter.number}</h1>
  ${paragraphs}
</body>
</html>`);
  });

  return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
}

export function render(container) {
  let pdfFile = null;

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        pdfFile = files[0];
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
          <span class="file-icon">📄</span>
          <div class="file-details-text">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-info"></div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Convert to EPUB</button>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Converting PDF to EPUB... <span id="progress-pct">0</span>%</p>
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
    if (!pdfFile) return;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    filePanel.style.display = 'none';

    try {
      const title = pdfFile.name.replace(/\.pdf$/i, '');
      const chapters = await extractPdfText(pdfFile);
      progressPct.textContent = '75';

      if (chapters.length === 0) {
        showToast({ message: 'No extractable text found in PDF.', type: 'warning' });
      } else {
        const epubBlob = await generateEpub(chapters, title, 'Converted by ToolBox');
        progressPct.textContent = '100';
        downloadBlob(epubBlob, `${title}.epub`);
        showToast({ message: `Converted! ${chapters.length} chapters extracted.`, type: 'success' });
      }
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
