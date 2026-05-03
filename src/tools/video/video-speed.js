import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadFFmpeg, writeUploadedFile, readFFmpegFile, getVideoInfo, formatTime, createVideoPreview } from './video-utils.js';

export const toolConfig = {
  id: 'video-speed',
  name: 'Video Speed Changer',
  category: 'video',
  description: 'Speed up or slow down videos. 0.25x to 4x speed.',
  icon: '⏩',
  accept: 'video/*',
  maxSizeMB: 500,
  keywords: ['video speed', 'speed up video', 'slow motion'],
  steps: ['Upload a video', 'Choose speed multiplier', 'Preview', 'Download'],
  faqs: [
    { question: 'What speed should I use?', answer: '2x for timelapse, 0.5x for slow motion, 0.25x for dramatic slow-mo.' }
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
      videoInfo.textContent = `${info.name} — ${formatTime(info.duration)}`;
      previewArea.innerHTML = '';
      const preview = createVideoPreview(currentFile);
      previewArea.appendChild(preview.element);
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="video-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div id="preview-area"></div>
        <div class="form-group">
          <label>Playback Speed</label>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-3);">
            <button class="btn btn-sm btn-secondary" data-speed="0.25">0.25x</button>
            <button class="btn btn-sm btn-secondary" data-speed="0.5">0.5x</button>
            <button class="btn btn-sm btn-secondary" data-speed="0.75">0.75x</button>
            <button class="btn btn-sm btn-secondary active" data-speed="1">1x (normal)</button>
            <button class="btn btn-sm btn-secondary" data-speed="1.5">1.5x</button>
            <button class="btn btn-sm btn-secondary" data-speed="2">2x</button>
            <button class="btn btn-sm btn-secondary" data-speed="4">4x</button>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" id="apply-btn" style="width:100%;">Apply Speed & Download</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Processing...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const videoInfo = container.querySelector('#video-info');
  const previewArea = container.querySelector('#preview-area');
  const applyBtn = container.querySelector('#apply-btn');
  const processing = container.querySelector('#processing');
  let selectedSpeed = '1';

  container.querySelectorAll('[data-speed]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedSpeed = btn.dataset.speed;
      container.querySelectorAll('[data-speed]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Update preview playback rate
      const video = previewArea.querySelector('video');
      if (video) video.playbackRate = parseFloat(selectedSpeed);
    });
  });

  applyBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const speed = parseFloat(selectedSpeed);
    if (speed === 1) { showToast({ message: 'Select a different speed first', type: 'warning' }); return; }

    processing.style.display = 'block';
    applyBtn.style.display = 'none';

    try {
      const ffmpeg = await loadFFmpeg();
      await writeUploadedFile(ffmpeg, currentFile, 'input.mp4');

      // setpts changes video speed, atempo changes audio speed
      // atempo only supports 0.5-2.0, so we chain for extreme values
      let audioFilter;
      if (speed <= 0.5) audioFilter = `atempo=0.5,atempo=${speed / 0.5}`;
      else if (speed >= 2) audioFilter = `atempo=2.0,atempo=${speed / 2}`;
      else audioFilter = `atempo=${speed}`;

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-filter:v', `setpts=${1 / speed}*PTS`,
        '-filter:a', audioFilter,
        'output.mp4'
      ]);

      const blob = await readFFmpegFile(ffmpeg, 'output.mp4', 'video/mp4');
      downloadBlob(blob, `speed-${speed}x.mp4`);
      showToast({ message: `Video speed set to ${speed}x!`, type: 'success' });

      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      applyBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
