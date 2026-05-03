import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { loadFFmpeg, writeUploadedFile, readFFmpegFile, getVideoInfo, formatTime } from './video-utils.js';

export const toolConfig = {
  id: 'mute-video',
  name: 'Mute Video',
  category: 'video',
  description: 'Remove audio track from a video file.',
  icon: '🔇',
  accept: 'video/*',
  maxSizeMB: 500,
  keywords: ['mute video', 'remove audio', 'silent video'],
  steps: ['Upload a video', 'Click "Remove Audio"', 'Download muted video'],
  faqs: [
    { question: 'Does this affect video quality?', answer: 'No. Only the audio track is removed. Video quality is preserved.' }
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
        <button class="btn btn-primary btn-lg" id="mute-btn" style="width:100%;">🔇 Remove Audio & Download</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Removing audio...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const videoInfo = container.querySelector('#video-info');
  const muteBtn = container.querySelector('#mute-btn');
  const processing = container.querySelector('#processing');

  muteBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    processing.style.display = 'block';
    muteBtn.style.display = 'none';

    try {
      const ffmpeg = await loadFFmpeg();
      await writeUploadedFile(ffmpeg, currentFile, 'input.mp4');
      await ffmpeg.exec(['-i', 'input.mp4', '-an', '-c:v', 'copy', 'output.mp4']);

      const blob = await readFFmpegFile(ffmpeg, 'output.mp4', 'video/mp4');
      downloadBlob(blob, 'muted.mp4');
      showToast({ message: 'Audio removed!', type: 'success' });

      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      muteBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
