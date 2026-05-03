import { PDFDocument } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'unlock-pdf',
  name: 'Unlock PDF',
  category: 'pdf',
  description: 'Remove password protection from a PDF (requires password).',
  icon: '🔓',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['unlock pdf', 'remove pdf password', 'decrypt pdf'],
  steps: ['Upload a password-protected PDF', 'Enter the password', 'Click "Unlock"', 'Download the unlocked PDF'],
  faqs: [
    { question: 'Can I unlock without the password?', answer: 'No. You need the correct password to unlock a protected PDF.' },
    { question: 'Is the password sent to a server?', answer: 'No. Everything happens in your browser. The password never leaves your device.' }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: (files) => {
      currentFile = files[0] || null;
      optionsArea.style.display = currentFile ? 'block' : 'none';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="form-group">
          <label>PDF Password</label>
          <input type="password" id="password-input" class="text-input" placeholder="Enter the PDF password">
        </div>
        <button class="btn btn-primary btn-lg" id="unlock-btn" style="width:100%;">Unlock PDF</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Unlocking...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const unlockBtn = container.querySelector('#unlock-btn');
  const processing = container.querySelector('#processing');

  unlockBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const password = container.querySelector('#password-input').value;
    if (!password) { showToast({ message: 'Please enter the password', type: 'warning' }); return; }

    processing.style.display = 'block';
    unlockBtn.style.display = 'none';

    try {
      const bytes = await currentFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { password });
      const unlockedBytes = await pdfDoc.save();
      downloadBlob(new Blob([unlockedBytes], { type: 'application/pdf' }), 'unlocked.pdf');
      showToast({ message: 'PDF unlocked!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Wrong password or invalid PDF: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      unlockBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
