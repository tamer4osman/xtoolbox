import { loadPdf } from './pdf-utils.js';
import { createPdfOptionsTool } from './pdf-options-tool-factory.js';

export const toolConfig = {
  id: 'protect-pdf',
  name: 'Protect PDF',
  category: 'pdf',
  description: 'Add password protection to a PDF file.',
  icon: '🔒',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['protect pdf', 'password pdf', 'encrypt pdf'],
  steps: ['Upload a PDF file', 'Enter a password', 'Confirm the password', 'Download the protected PDF'],
  faqs: [
    { question: 'What encryption is used?', answer: 'pdf-lib uses standard PDF encryption supported by all PDF readers.' },
    { question: 'Can I set different passwords for opening vs editing?', answer: 'Currently only one password is supported for opening the PDF.' }
  ]
};

export function render(container) {
  const optionsHTML = `
    <div class="form-group">
      <label>Password</label>
      <input type="password" id="password-input" class="text-input" placeholder="Enter a password">
    </div>
    <div class="form-group">
      <label>Confirm Password</label>
      <input type="password" id="confirm-input" class="text-input" placeholder="Confirm the password">
    </div>
  `;

  createPdfOptionsTool({
    container,
    toolId: 'protect-pdf',
    optionsHTML,
    actionButtonText: 'Protect PDF',
    processingMessage: 'Protecting PDF...',
    outputFilename: 'protected.pdf',
    successMessage: 'PDF saved! Note: Client-side encryption has limitations.',
    validate: (root) => {
      const password = root.querySelector('#password-input').value;
      const confirm = root.querySelector('#confirm-input').value;
      if (!password) return 'Please enter a password';
      if (password !== confirm) return 'Passwords do not match';
      return null;
    },
    process: async (file) => {
      const password = document.querySelector('#password-input').value;
      const pdfDoc = await loadPdf(file);
      pdfDoc.encrypt(password || '');
      const bytes = await pdfDoc.save();
      return { blob: new Blob([bytes], { type: 'application/pdf' }), successMessage: 'PDF protected successfully!' };
    }
  });
}

export function destroy() {}
