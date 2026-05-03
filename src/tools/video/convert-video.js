import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadFFmpeg, writeUploadedFile, readFFmpegFile, getVideoInfo, formatTime } from './video-utils.js';

export const toolConfig = {
  id: 'convert-video',
  name: 'Video Format Converter',
  category: 'video',
  description: 'Convert videos between MP4, WebM, AVI, and MOV formats.',
  icon: '🔄',
  accept: 'video/*',
  maxSizeMB: 500,
  keywords: ['convert video', 'mp4 to webm', 'video converter'],
  steps: ['Upload a video', 'Choose output format', 'Click "Convert"', 'Download converted video'],
  faqs: [
    { question: 'Which format should I choose?', answer: 'MP4 for compatibility, WebM for web, MOV for Apple devices.' }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: 'video/*',
    multiple: false,
    maxSizeMB: 500,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      const info = await getVideoInfo(currentFile);
      videoInfo.textContent = `${info.name} — ${formatTime(info.duration)} — ${info.sizeFormatted}`;
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="video-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div class="form-group">
          <label>Output Format</label>
          <select id="format-select" class="select-input">
            <option value="mp4" selected>MP4 (H.264 — best compatibility)</option>
            <option value="webm">WebM (VP9 — best for web)</option>
            <option value="avi">AVI (legacy format)</option>
            <option value="mov">MOV (Apple QuickTime)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert Video</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Converting... <span id="progress-pct">0</span>%</p>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const videoInfo = container.querySelector('#video-info');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');

  convertBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const format = container.querySelector('#format-select').value;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';

    try {
      const ffmpeg = await loadFFmpeg((pct) => { progressPct.textContent = pct; });
      await writeUploadedFile(ffmpeg, currentFile, 'input.mp4');

      const outputName = `output.${format}`;
      const args = ['-i', 'input.mp4'];

      if (format === 'mp4') args.push('-c:v', 'libx264', '-c:a', 'aac');
      else if (format === 'webm') args.push('-c:v', 'libvpx-vp9', '-c:a', 'libopus');
      else if (format === 'avi') args.push('-c:v', 'mpeg4', '-c:a', 'mp3');
      else if (format === 'mov') args.push('-c:v', 'libx264', '-c:a', 'aac');

      args.push(outputName);
      await ffmpeg.exec(args);

      const mimeMap = { mp4: 'video/mp4', webm: 'video/webm', avi: 'video/x-msvideo', mov: 'video/quicktime' };
      const blob = await readFFmpegFile(ffmpeg, outputName, mimeMap[format]);
      downloadBlob(blob, `converted.${format}`);
      showToast({ message: `Converted to ${format.toUpperCase()}!`, type: 'success' });

      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
