import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { loadFFmpeg, writeUploadedFile, readFFmpegFile, getVideoInfo, formatTime } from './video-utils.js';

export const toolConfig = {
  id: 'video-to-audio',
  name: 'Video to Audio',
  category: 'video',
  description: 'Extract audio track from video files. Save as MP3 or WAV.',
  icon: '🎵',
  accept: 'video/*',
  maxSizeMB: 500,
  keywords: ['video to audio', 'extract audio', 'mp4 to mp3'],
  steps: ['Upload a video', 'Choose audio format', 'Click "Extract"', 'Download audio'],
  faqs: [
    { question: 'What formats can I extract?', answer: 'MP3, WAV, and AAC.' }
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
          <label>Audio Format</label>
          <select id="format-select" class="select-input">
            <option value="mp3" selected>MP3 (compressed, small file)</option>
            <option value="wav">WAV (uncompressed, best quality)</option>
            <option value="aac">AAC (good quality, small file)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="extract-btn" style="width:100%;">Extract Audio</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Extracting audio...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const videoInfo = container.querySelector('#video-info');
  const extractBtn = container.querySelector('#extract-btn');
  const processing = container.querySelector('#processing');

  extractBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const format = container.querySelector('#format-select').value;

    processing.style.display = 'block';
    extractBtn.style.display = 'none';

    try {
      const ffmpeg = await loadFFmpeg();
      await writeUploadedFile(ffmpeg, currentFile, 'input.mp4');

      const codecMap = { mp3: 'libmp3lame', wav: 'pcm_s16le', aac: 'aac' };
      const outputName = `audio.${format}`;

      await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-acodec', codecMap[format], '-ab', '192k', outputName]);

      const mimeMap = { mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac' };
      const blob = await readFFmpegFile(ffmpeg, outputName, mimeMap[format]);
      downloadBlob(blob, `extracted.${format}`);
      showToast({ message: `Audio extracted as ${format.toUpperCase()}! (${formatFileSize(blob.size)})`, type: 'success' });

      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      extractBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
