import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

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

function parseOpf(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xhtml+xml');
  
  // Get metadata
  const titleEl = doc.querySelector('dc\\:title, title');
  const title = titleEl ? titleEl.textContent : 'Untitled';
  
  const creatorEl = doc.querySelector('dc\\:creator, creator');
  const author = creatorEl ? creatorEl.textContent : 'Unknown';
  
  // Get manifest items
  const manifest = {};
  doc.querySelectorAll('item').forEach(item => {
    manifest[item.getAttribute('id')] = {
      href: item.getAttribute('href'),
      mediaType: item.getAttribute('media-type')
    };
  });
  
  // Get spine (reading order)
  const spine = [];
  doc.querySelectorAll('itemref').forEach(itemref => {
    const idref = itemref.getAttribute('idref');
    if (manifest[idref]) {
      spine.push(manifest[idref]);
    }
  });
  
  return { title, author, manifest, spine };
}

function extractTextFromXhtml(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  
  const blocks = [];
  const body = doc.body;
  if (!body) return blocks;
  
  function walk(node) {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) {
          blocks.push({ type: 'text', content: text });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();
        if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
          const level = parseInt(tag.charAt(1));
          blocks.push({ type: 'heading', level, content: child.textContent.trim() });
        } else if (tag === 'p' || tag === 'div' || tag === 'li') {
          const text = child.textContent.trim();
          if (text) {
            blocks.push({ type: 'paragraph', content: text });
          }
        } else if (tag === 'br') {
          blocks.push({ type: 'break' });
        } else {
          walk(child);
        }
      }
    }
  }
  
  walk(body);
  return blocks;
}

async function createPdfFromBlocks(allChapters) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageSize = { width: 612, height: 792 }; // US Letter
  const margin = 72; // 1 inch
  const maxWidth = pageSize.width - margin * 2;
  const lineHeight = 14;
  const headingSizes = { 1: 24, 2: 20, 3: 16, 4: 14, 5: 12, 6: 11 };
  const paragraphSize = 11;
  
  function addTextToPage(page, text, size, isBold, indent = 0) {
    const f = isBold ? boldFont : font;
    const lines = wrapText(text, f, size, maxWidth - indent);
    const y = page.getHeight() - margin - (page._textLines || 0) * lineHeight;
    
    for (const line of lines) {
      if (y - page._textLines * lineHeight < margin) {
        page = pdfDoc.addPage(pageSize);
        page._textLines = 0;
      }
      page.drawText(line, {
        x: margin + indent,
        y: pageSize.height - margin - page._textLines * lineHeight,
        size,
        font: f,
        color: rgb(0, 0, 0)
      });
      page._textLines++;
    }
    
    return page;
  }
  
  function wrapText(text, font, size, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, size);
      
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [''];
  }
  
  // Process each chapter
  for (let chapterIdx = 0; chapterIdx < allChapters.length; chapterIdx++) {
    const chapter = allChapters[chapterIdx];
    let page = pdfDoc.addPage(pageSize);
    page._textLines = 0;
    
    // Chapter title
    if (chapter.title) {
      page = addTextToPage(page, chapter.title, 18, true);
      page._textLines += 2; // Extra space after title
    }
    
    // Chapter content
    for (const block of chapter.blocks) {
      if (block.type === 'heading') {
        const size = headingSizes[block.level] || 14;
        page = addTextToPage(page, block.content, size, true);
        page._textLines += 1;
      } else if (block.type === 'paragraph' || block.type === 'text') {
        page = addTextToPage(page, block.content, paragraphSize, false);
        page._textLines += 1; // Space between paragraphs
      } else if (block.type === 'break') {
        page._textLines += 1;
      }
    }
  }
  
  return pdfDoc;
}

export function render(container) {
  let epubFile = null;

  const upload = createFileUpload({
    accept: '.epub',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        epubFile = files[0];
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
        <p>Converting EPUB to PDF... <span id="progress-pct">0</span>%</p>
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
    if (!epubFile) return;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    filePanel.style.display = 'none';

    try {
      const arrayBuffer = await epubFile.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      progressPct.textContent = '25';
      
      // Find the OPF file
      let opfPath = null;
      let opfContent = null;
      
      // Check for META-INF/container.xml
      const containerXml = zip.file('META-INF/container.xml');
      if (containerXml) {
        const containerText = await containerXml.async('text');
        const parser = new DOMParser();
        const containerDoc = parser.parseFromString(containerText, 'application/xml');
        const rootfile = containerDoc.querySelector('rootfile');
        if (rootfile) {
          opfPath = rootfile.getAttribute('full-path');
        }
      }
      
      // Fallback: search for .opf files
      if (!opfPath) {
        for (const path of Object.keys(zip.files)) {
          if (path.endsWith('.opf') && !path.includes('META-INF')) {
            opfPath = path;
            break;
          }
        }
      }
      
      if (!opfPath) {
        throw new Error('Could not find OPF file in EPUB');
      }
      
      opfContent = await zip.file(opfPath).async('text');
      progressPct.textContent = '50';
      
      // Parse OPF
      const { title, author, manifest, spine } = parseOpf(opfContent);
      
      // Extract chapters
      const chapters = [];
      const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
      
      for (const item of spine) {
        const href = item.href;
        const fullPath = href.startsWith('..') ? 
          opfDir + href : 
          (href.includes('/') ? href : opfDir + href);
        
        const file = zip.file(fullPath);
        if (file) {
          const htmlText = await file.async('text');
          const blocks = extractTextFromXhtml(htmlText);
          const chapterTitle = href.split('/').pop().replace(/\.[^.]+$/, '');
          
          chapters.push({
            title: chapterTitle,
            blocks
          });
        }
      }
      
      progressPct.textContent = '75';
      
      if (chapters.length === 0) {
        throw new Error('No chapters found in EPUB');
      }
      
      // Create PDF
      const pdfDoc = await createPdfFromBlocks(chapters);
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      progressPct.textContent = '100';
      
      const outputName = epubFile.name.replace(/\.epub$/i, '');
      downloadBlob(pdfBlob, `${outputName}.pdf`);
      
      showToast({ message: `Converted! ${chapters.length} chapters processed.`, type: 'success' });
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
