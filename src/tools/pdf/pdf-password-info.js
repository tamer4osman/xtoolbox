import { PDFDocument } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';

export const toolConfig = {
  id: 'pdf-password-info',
  name: 'PDF Password Info',
  category: 'pdf',
  description: 'Check if a PDF is encrypted, view protection level and permissions.',
  icon: '🔐',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['pdf password', 'pdf encryption', 'is pdf protected', 'pdf security', 'check pdf password'],
  steps: ['Upload a PDF file', 'View encryption status', 'See permissions'],
  faqs: [
    { question: 'Is my file uploaded?', answer: 'No. All processing happens in your browser.' }
  ]
};

export function render(container) {
  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: (files) => {
      if (files.length > 0) checkPasswordInfo(files[0]);
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="result-panel" style="display:none;">
        <div class="security-info">
          <div class="security-status" id="security-status"></div>
          <div class="permissions-panel" id="permissions-panel"></div>
        </div>
      </div>
    </div>
    <style>
      .security-info { margin-top:var(--space-6); }
      .security-status { padding:var(--space-6);border-radius:var(--radius-lg);text-align:center; }
      .security-status.protected { background:#FEF2F2;border:2px solid #DCFCE7; }
      .security-status.unlocked { background:#F0FDF4;border:2px solid #22C55E; }
      .security-icon { font-size:48px;margin-bottom:var(--space-4); }
      .security-title { font-size:var(--text-2xl);font-weight:700;margin-bottom:var(--space-2); }
      .security-desc { color:var(--color-text-secondary); }
      .permissions-panel { margin-top:var(--space-6);background:var(--color-surface);padding:var(--space-6);border-radius:var(--radius-lg); }
      .permissions-panel h4 { margin-bottom:var(--space-4); }
      .permission-item { display:flex;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--color-border); }
      .permission-item:last-child { border:none; }
      .permission-label { color:var(--color-text-secondary); }
      .permission-value { font-weight:600; }
      .permission-value.allow { color:var(--color-success); }
      .permission-value.deny { color:var(--color-error); }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const resultPanel = container.querySelector('#result-panel');
  const securityStatus = container.querySelector('#security-status');
  const permissionsPanel = container.querySelector('#permissions-panel');

  async function checkPasswordInfo(file) {
    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = PDFDocument.load(bytes, { ignoreEncryption: true });
      
      const isEncrypted = pdfDoc.isEncrypted();
      const permissions = pdfDoc.getPermissions ? pdfDoc.getPermissions() : null;
      
      if (isEncrypted) {
        securityStatus.className = 'security-status protected';
        securityStatus.innerHTML = `
          <div class="security-icon">🔒</div>
          <div class="security-title">Password Protected</div>
          <div class="security-desc">This PDF is encrypted and requires a password to open.</div>
        `;
      } else {
        securityStatus.className = 'security-status unlocked';
        securityStatus.innerHTML = `
          <div class="security-icon">🔓</div>
          <div class="security-title">Not Protected</div>
          <div class="security-desc">This PDF is not password protected.</div>
        `;
      }

      let permsHtml = '<h4>Permissions</h4>';
      
      if (permissions) {
        permsHtml += `
          <div class="permission-item">
            <span class="permission-label">Print</span>
            <span class="permission-value ${permissions.print ? 'allow' : 'deny'}>${permissions.print ? 'Allowed' : 'Not Allowed'}</span>
          </div>
          <div class="permission-item">
            <span class="permission-label">Modify</span>
            <span class="permission-value ${permissions.modify !== false ? 'allow' : 'deny'}>${permissions.modify !== false ? 'Allowed' : 'Not Allowed'}</span>
          </div>
          <div class="permission-item">
            <span class="permission-label">Extract Content</span>
            <span class="permission-value ${permissions.extract !== false ? 'allow' : 'deny'}>${permissions.extract !== false ? 'Allowed' : 'Not Allowed'}</span>
          </div>
          <div class="permission-item">
            <span class="permission-label">Annotate</span>
            <span class="permission-value ${permissions.annotate ? 'allow' : 'deny'}>${permissions.annotate ? 'Allowed' : 'Not Allowed'}</span>
          </div>
        `;
      } else {
        permsHtml += '<p>No permission information available.</p>';
      }
      
      permissionsPanel.innerHTML = permsHtml;
      resultPanel.style.display = 'block';
      
    } catch (err) {
      if (err.message.includes('encrypted') || err.message.includes('password')) {
        securityStatus.className = 'security-status protected';
        securityStatus.innerHTML = `
          <div class="security-icon">🔒</div>
          <div class="security-title">Password Protected</div>
          <div class="security-desc">This PDF is encrypted. Enter password to view full info.</div>
        `;
        resultPanel.style.display = 'block';
      } else {
        showToast({ message: 'Error checking PDF: ' + err.message, type: 'error' });
      }
    }
  }
}

export function destroy() {}
