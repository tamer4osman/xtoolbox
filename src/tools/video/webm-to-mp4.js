import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { loadFFmpeg, writeUploadedFile, readFFmpegFile } from './video-utils.js';

export const toolConfig = {
  id: 'webm-to-mp4',
  name: 'WEBM to MP4',
  category: 'video',
  description: 'Convert WEBM videos to MP4 format. Make your videos playable on all devices.',
  icon: '🔄',
  accept: '.webm,video/webm',
  maxSizeMB: 500,
  keywords: ['webm to mp4', 'webm converter', 'webm to video'],
  steps: ['Upload a WEBM file', 'Choose quality preset', 'Click "Convert"', 'Download MP4'],
  faqs: [
    { question: 'Why convert WEBM to MP4?', answer: 'MP4 is the most widely supported video format — it plays on all devices, browsers, and platforms.' },
    { question: 'Will I lose quality?', answer: 'At High/Maximum settings, visual quality is virtually identical while ensuring broad compatibility.' }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: '.webm,video/webm',
    multiple: false,
    maxSizeMB: 500,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      fileInfo.textContent = `${currentFile.name} — ${formatFileSize(currentFile.size)}`;
      filePreview.innerHTML = `<video controls style="max-width:100%;max-height:300px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
        <source src="${URL.createObjectURL(currentFile)}" type="video/webm">
      </video>`;
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="file-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div id="file-preview" style="margin-bottom:var(--space-4);"></div>
        <div class="form-group">
          <label>Quality</label>
          <select id="quality-select" class="select-input">
            <option value="medium" selected>Medium (good quality, smaller file)</option>
            <option value="high">High (great quality, larger file)</option>
            <option value="max">Maximum (best quality, largest file)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert to MP4</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Converting... <span id="progress-pct">0</span>%</p>
      </div>
      <div class="tool-results" id="results" style="display:none;text-align:center;">
        <div id="preview-area" style="margin:var(--space-4) 0;"></div>
        <button class="btn btn-primary btn-lg" id="download-btn">Download MP4</button>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const fileInfo = container.querySelector('#file-info');
  const filePreview = container.querySelector('#file-preview');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');
  const results = container.querySelector('#results');
  const previewArea = container.querySelector('#preview-area');
  const downloadBtn = container.querySelector('#download-btn');
  let mp4Blob = null;

  convertBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const quality = container.querySelector('#quality-select').value;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    results.style.display = 'none';

    try {
      const ffmpeg = await loadFFmpeg((pct) => { progressPct.textContent = pct; });
      await writeUploadedFile(ffmpeg, currentFile, 'input.webm');

      const crf = quality === 'max' ? '15' : quality === 'high' ? '20' : '25';
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-pix_fmt', 'yuv420p',
        '-crf', crf,
        '-movflags', '+faststart',
        'output.mp4'
      ]);

      mp4Blob = await readFFmpegFile(ffmpeg, 'output.mp4', 'video/mp4');
      previewArea.innerHTML = `
        <video controls style="max-width:100%;max-height:400px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
          <source src="${URL.createObjectURL(mp4Blob)}" type="video/mp4">
        </video>
        <div style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-2);">
          Size: ${formatFileSize(mp4Blob.size)} (was ${formatFileSize(currentFile.size)})
        </div>`;
      results.style.display = 'block';
      showToast({ message: 'Converted to MP4!', type: 'success' });

      await ffmpeg.deleteFile('input.webm');
      await ffmpeg.deleteFile('output.mp4');
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (mp4Blob) downloadBlob(mp4Blob, currentFile.name.replace(/\.webm$/i, '.mp4'));
  });
}

export function destroy() {}
