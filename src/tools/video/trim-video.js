import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadFFmpeg, getVideoInfo, writeUploadedFile, readFFmpegFile, formatTime, createVideoPreview } from './video-utils.js';

export const toolConfig = {
  id: 'trim-video',
  name: 'Video Trimmer',
  category: 'video',
  description: 'Cut and trim videos by setting start and end time.',
  icon: '✂️',
  accept: 'video/*',
  maxSizeMB: 500,
  keywords: ['trim video', 'cut video', 'video trimmer'],
  steps: ['Upload a video', 'Set start and end time', 'Click "Trim"', 'Download trimmed video'],
  faqs: [
    { question: 'Does trimming re-encode the video?', answer: 'We use stream copy (-c copy) for fast, lossless trimming when possible.' }
  ]
};

export function render(container) {
  let currentFile = null;
  let videoInfo = null;

  const upload = createFileUpload({
    accept: 'video/*',
    multiple: false,
    maxSizeMB: 500,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      videoInfo = await getVideoInfo(currentFile);
      previewArea.innerHTML = '';
      const preview = createVideoPreview(currentFile);
      previewArea.appendChild(preview.element);
      durationInfo.textContent = `Duration: ${formatTime(videoInfo.duration)}`;
      endTime.placeholder = formatTime(videoInfo.duration);
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="preview-area"></div>
        <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);" id="duration-info">-</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
          <div class="form-group"><label>Start Time (MM:SS or HH:MM:SS)</label><input type="text" id="start-time" class="text-input" value="0:00" placeholder="0:00"></div>
          <div class="form-group"><label>End Time (MM:SS or HH:MM:SS)</label><input type="text" id="end-time" class="text-input" placeholder="Leave empty for end"></div>
        </div>
        <button class="btn btn-primary btn-lg" id="trim-btn" style="width:100%;">Trim Video</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Trimming...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const previewArea = container.querySelector('#preview-area');
  const durationInfo = container.querySelector('#duration-info');
  const startTime = container.querySelector('#start-time');
  const endTime = container.querySelector('#end-time');
  const trimBtn = container.querySelector('#trim-btn');
  const processing = container.querySelector('#processing');

  function parseTime(str) {
    if (!str || str.trim() === '') return null;
    const parts = str.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parseFloat(str) || 0;
  }

  trimBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const start = parseTime(startTime.value) || 0;
    const end = parseTime(endTime.value);

    processing.style.display = 'block';
    trimBtn.style.display = 'none';

    try {
      const ffmpeg = await loadFFmpeg();
      const ext = currentFile.name.split('.').pop() || 'mp4';
      const inputName = `input.${ext}`;
      const outputName = `trimmed.${ext}`;

      await writeUploadedFile(ffmpeg, currentFile, inputName);

      const args = ['-i', inputName, '-ss', String(start)];
      if (end !== null) args.push('-to', String(end));
      args.push('-c', 'copy', outputName);

      await ffmpeg.exec(args);

      const mimeType = ext === 'webm' ? 'video/webm' : 'video/mp4';
      const blob = await readFFmpegFile(ffmpeg, outputName, mimeType);
      downloadBlob(blob, `trimmed.${ext}`);
      showToast({ message: 'Video trimmed!', type: 'success' });

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      trimBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
