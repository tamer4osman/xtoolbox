import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'upscale-image',
  name: 'Image Upscaler',
  category: 'image',
  description: 'Upscale images 2x or 4x using AI super-resolution.',
  icon: '🔍',
  accept: 'image/jpeg,image/png',
  maxSizeMB: 20,
  keywords: ['upscale image', 'increase resolution', 'image upscaler', 'ai upscaler'],
  steps: ['Upload an image', 'Choose scale (2x or 4x)', 'Wait for AI processing', 'Download upscaled image'],
  faqs: [
    { question: 'How does it work?', answer: 'Uses Real-ESRGAN deep learning model running in your browser via ONNX Runtime Web.' },
    { question: 'What is the max input size?', answer: 'Recommended max 512×512 for 4x, 1024×1024 for 2x to avoid memory issues.' }
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
          <div style="font-size:3rem;margin-bottom:var(--space-4);">🔍</div>
          <h3 style="font-size:var(--text-xl);font-weight:600;margin-bottom:var(--space-2);">Image Upscaler</h3>
          <p style="color:var(--color-text-secondary);margin-bottom:var(--space-4);max-width:500px;margin-left:auto;margin-right:auto;">
            This tool requires the Real-ESRGAN ONNX model (~8MB) to be hosted at <code>/models/realesrgan-x4.onnx</code>.
            The model runs entirely in your browser — no data is sent to any server.
          </p>
          <div style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);text-align:left;font-size:var(--text-sm);color:var(--color-text-secondary);">
            <strong>To enable:</strong> Download the Real-ESRGAN ONNX model and place it in <code>public/models/realesrgan-x4.onnx</code>.
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
