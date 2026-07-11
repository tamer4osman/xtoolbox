import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import JSZip from "jszip";
import { escapeHtml } from "../../utils/escape-html.js";
import { downloadBlob } from "../../utils/file.js";
import { showToast } from "../../components/toast.js";
import { createSingleFileTool } from "../../utils/single-file-tool.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: "pdf-to-epub",
  name: "PDF to EPUB",
  category: "pdf",
  description: "Convert PDF to e-book format for e-readers.",
  icon: "📚",
  accept: ".pdf",
  maxSizeMB: 50,
  keywords: ["pdf to epub", "convert pdf to ebook", "pdf to e-reader", "pdf to kindle"],
  steps: ["Upload a PDF file", 'Click "Convert to EPUB"', "Download the .epub file"],
  faqs: [
    { question: "What formats supported?", answer: "We support PDF files up to 50MB." },
    {
      question: "Are images preserved?",
      answer: "Text is extracted. Images are not included in the EPUB."
    },
    {
      question: "Are scanned PDFs supported?",
      answer: "Only PDFs with selectable text. Scanned images need OCR first."
    }
  ]
};

async function extractPdfText(file) {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const chapters = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const items = (await pdf.getPage(i)).getTextContent().items;
    const paragraphs = [];
    let cur = [];
    let lastY = null;
    for (const item of items) {
      const y = Math.round(item.transform[5]);
      if (!item.str.trim()) continue;
      if (lastY === null || Math.abs(y - lastY) > 3) {
        if (cur.length > 0) paragraphs.push(cur.join(" "));
        cur = [item.str];
      } else {
        cur.push(item.str);
      }
      lastY = y;
    }
    if (cur.length > 0) paragraphs.push(cur.join(" "));
    if (paragraphs.length > 0)
      chapters.push({ number: i, paragraphs: paragraphs.filter(p => p.trim().length > 0) });
  }
  return chapters;
}

function generateEpub(chapters, title, author) {
  const zip = new JSZip();
  const uid = `urn:uuid:${crypto.randomUUID()}`;
  const date = new Date().toISOString().replace(/\.\d+Z/, "Z");
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`
  );

  let manifestItems = `    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n    <item id="style" href="style.css" media-type="text/css"/>\n    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>\n`;
  let spineItems = `    <itemref idref="cover"/>\n`;
  let navPoints = "";
  chapters.forEach((ch, idx) => {
    const id = `chapter${idx + 1}`;
    manifestItems += `    <item id="${id}" href="text/${id}.xhtml" media-type="application/xhtml+xml"/>\n`;
    spineItems += `    <itemref idref="${id}"/>\n`;
    navPoints += `    <navPoint id="${id}" playOrder="${idx + 2}"><navLabel><text>Chapter ${ch.number}</text></navLabel><content src="text/${id}.xhtml"/></navPoint>\n`;
  });

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf"><dc:identifier id="uid">${uid}</dc:identifier><dc:title>${escapeHtml(title)}</dc:title><dc:language>en</dc:language><dc:creator>${escapeHtml(author)}</dc:creator><meta property="dcterms:modified">${date}</meta></metadata><manifest>${manifestItems}  </manifest><spine toc="ncx">${spineItems}  </spine></package>`
  );
  zip.file(
    "OEBPS/toc.ncx",
    `<?xml version="1.0" encoding="UTF-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="${uid}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>${escapeHtml(title)}</text></docTitle><navMap><navPoint id="cover" playOrder="1"><navLabel><text>Cover</text></navLabel><content src="cover.xhtml"/></navPoint>${navPoints}</navMap></ncx>`
  );
  zip.file(
    "OEBPS/style.css",
    "body { font-family: serif; line-height: 1.6; margin: 1em; }\nh1 { text-align: center; margin-bottom: 2em; }\np { text-indent: 1.5em; margin: 0.5em 0; }"
  );
  zip.file(
    "OEBPS/cover.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Cover</title><link href="style.css" rel="stylesheet" type="text/css"/></head><body><h1>${escapeHtml(title)}</h1><p style="text-align:center;color:#666;">${escapeHtml(author)}</p></body></html>`
  );
  chapters.forEach((ch, idx) => {
    const id = `chapter${idx + 1}`;
    zip.file(
      `OEBPS/text/${id}.xhtml`,
      `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Chapter ${ch.number}</title><link href="../style.css" rel="stylesheet" type="text/css"/></head><body><h1>Chapter ${ch.number}</h1>${ch.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join("\n      ")}</body></html>`
    );
  });
  return zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
}

export function render(container) {
  createSingleFileTool({
    container,
    toolId: "pdf2epub",
    accept: ".pdf",
    icon: "📚",
    buttonText: "Convert to EPUB",
    processingMessage: "Converting PDF to EPUB...",
    async onConvert({ file, progress }) {
      const title = file.name.replace(/\.pdf$/i, "");
      const chapters = await extractPdfText(file);
      progress(75);
      if (chapters.length === 0) {
        showToast({ message: "No extractable text found in PDF.", type: "warning" });
      } else {
        downloadBlob(await generateEpub(chapters, title, "Converted by ToolBox"), `${title}.epub`);
        progress(100);
        showToast({
          message: `Converted! ${chapters.length} chapters extracted.`,
          type: "success"
        });
      }
    }
  });
}

export function destroy() {}
