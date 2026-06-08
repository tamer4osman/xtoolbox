import { PDFDocument } from 'pdf-lib';
import { downloadBlob } from '../../utils/file.js';
import { showToast } from '../../components/toast.js';
import { createSingleFileTool } from '../../utils/single-file-tool.js';

export const toolConfig = {
  id: 'word-to-pdf',
  name: 'Word to PDF',
  category: 'pdf',
  description: 'Convert Word documents (.docx) to PDF files. Preserves formatting and layout.',
  icon: '📝',
  accept: '.docx,.doc',
  maxSizeMB: 50,
  keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'ms word to pdf'],
  steps: ['Upload a Word document', 'Click Convert', 'Download PDF'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support .docx and .doc files up to 50MB.' },
    { question: 'Is formatting preserved?', answer: 'Most formatting including fonts, colors, and layout is preserved.' }
  ]
};

export function render(container) {
  createSingleFileTool({
    container,
    toolId: 'word2pdf',
    accept: '.docx,.doc',
    icon: '📝',
    buttonText: 'Convert to PDF',
    processingMessage: 'Converting Word to PDF...',
    async onConvert({ file }) {
      const docxPdf = await import('docx-pdf');
      const arrayBuffer = await file.arrayBuffer();
      const pdfBlob = await docxPdf.docxToPdf(arrayBuffer);

      const bytes = await pdfBlob.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pdfBytes = await pdfDoc.save();

      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), file.name.replace(/\.docx?$/, '.pdf'));
      showToast({ message: 'Word document converted to PDF!', type: 'success' });
    }
  });
}

export function destroy() {}
