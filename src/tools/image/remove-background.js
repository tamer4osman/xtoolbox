import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile, canvasToBlob } from './image-utils.js';

export const toolConfig = {
  id: 'remove-background',
  name: 'Background Remover',
  category: 'image',
  description: 'Remove background from images using AI. Works 100% in your browser.',
  icon: '🎭',
  accept: 'image/jpeg,image/png',
  maxSizeMB: 20,
  keywords: ['remove background', 'background remover', 'transparent background'],
  steps: ['Upload an image (JPG or PNG)', 'Wait for AI processing', 'Preview result with transparency', 'Download PNG with transparent background'],
  faqs: [
    { question: 'How does it work?', answer: 'Uses a U2-Net deep learning model running entirely in your browser via ONNX Runtime Web.' },
    { question: 'Is it accurate?', answer: 'It works best with clear foreground objects like people, products, and animals.' }
  ]
};

export function render(container) {
  const upload = createFileUpload({
    accept: 'image/jpeg,image/png',
    multiple: false,
    maxSizeMB: 20,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      resultArea.style.display = 'block';
      resultArea.innerHTML = `
        <div style="text-align:center;padding:var(--space-8);">
          <div style="font-size:3rem;margin-bottom:var(--space-4);">🎭</div>
          <h3 style="font-size:var(--text-xl);font-weight:600;margin-bottom:var(--space-2);">Background Remover</h3>
          <p style="color:var(--color-text-secondary);margin-bottom:var(--space-4);max-width:500px;margin-left:auto;margin-right:auto;">
            This tool requires the U2-Net ONNX model (~4MB) to be hosted at <code>/models/u2net.onnx</code>. 
            The model runs entirely in your browser — no data is sent to any server.
          </p>
          <div style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);text-align:left;font-size:var(--text-sm);color:var(--color-text-secondary);">
            <strong>To enable:</strong> Download the U2-Net ONNX model and place it in <code>public/models/u2net.onnx</code>. 
            Then rebuild the project.
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="result-area" style="display:none;margin-top:var(--space-6);"></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const resultArea = container.querySelector('#result-area');
}

export function destroy() {}
