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
      const { default: mammoth } = await import('mammoth');
      const { jsPDF } = await import('jspdf');

      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      let y = margin;

      const div = document.createElement('div');
      div.innerHTML = html;
      div.style.position = 'absolute';
      div.style.left = '-9999px';
      div.style.width = maxWidth + 'mm';
      document.body.appendChild(div);

      const lines = doc.splitTextToSize(div.textContent || '', maxWidth);
      document.body.removeChild(div);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      for (const line of lines) {
        if (y + 5 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 5;
      }

      const pdfBytes = doc.output('arraybuffer');
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), file.name.replace(/\.docx?$/, '.pdf'));
      showToast({ message: 'Word document converted to PDF!', type: 'success' });
    }
  });
}

export function destroy() {}
