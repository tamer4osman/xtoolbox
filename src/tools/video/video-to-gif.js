import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { loadFFmpeg, writeUploadedFile, readFFmpegFile, getVideoInfo, formatTime } from './video-utils.js';

export const toolConfig = {
  id: 'video-to-gif',
  name: 'Video to GIF',
  category: 'video',
  description: 'Convert video clips to animated GIF images.',
  icon: '🎞️',
  accept: 'video/*',
  maxSizeMB: 200,
  keywords: ['video to gif', 'mp4 to gif', 'gif maker'],
  steps: ['Upload a video', 'Set start/end time and FPS', 'Click "Convert"', 'Download GIF'],
  faqs: [
    { question: 'What FPS should I use?', answer: '10-15 FPS is usually good for GIFs. Lower FPS = smaller file.' }
  ]
};

export function render(container) {
  let currentFile = null;
  let videoInfo = null;

  const upload = createFileUpload({
    accept: 'video/*',
    multiple: false,
    maxSizeMB: 200,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      videoInfo = await getVideoInfo(currentFile);
      durationInfo.textContent = `Duration: ${formatTime(videoInfo.duration)}`;
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="duration-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
          <div class="form-group"><label>Start Time</label><input type="text" id="start-time" class="text-input" value="0:00"></div>
          <div class="form-group"><label>End Time</label><input type="text" id="end-time" class="text-input" placeholder="End"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
          <div class="form-group">
            <label>FPS</label>
            <select id="fps-select" class="select-input">
              <option value="5">5 FPS (small)</option>
              <option value="10" selected>10 FPS (good)</option>
              <option value="15">15 FPS (smooth)</option>
              <option value="24">24 FPS (very smooth)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Width</label>
            <select id="width-select" class="select-input">
              <option value="320">320px</option>
              <option value="480" selected>480px</option>
              <option value="640">640px</option>
              <option value="-1">Original</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert to GIF</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Converting... <span id="progress-pct">0</span>%</p>
      </div>
      <div class="tool-results" id="results" style="display:none;text-align:center;">
        <div id="gif-preview" style="margin:var(--space-4) 0;"></div>
        <button class="btn btn-primary btn-lg" id="download-btn">Download GIF</button>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const durationInfo = container.querySelector('#duration-info');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');
  const results = container.querySelector('#results');
  const gifPreview = container.querySelector('#gif-preview');
  const downloadBtn = container.querySelector('#download-btn');
  let gifBlob = null;

  convertBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const fps = container.querySelector('#fps-select').value;
    const width = container.querySelector('#width-select').value;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    results.style.display = 'none';

    try {
      const ffmpeg = await loadFFmpeg((pct) => { progressPct.textContent = pct; });
      await writeUploadedFile(ffmpeg, currentFile, 'input.mp4');

      const scaleFilter = width === '-1' ? `fps=${fps}` : `fps=${fps},scale=${width}:-1:flags=lanczos`;
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', scaleFilter,
        '-f', 'gif', 'output.gif'
      ]);

      gifBlob = await readFFmpegFile(ffmpeg, 'output.gif', 'image/gif');
      gifPreview.innerHTML = `<img src="${URL.createObjectURL(gifBlob)}" style="max-width:100%;border-radius:var(--radius-md);border:1px solid var(--color-border);">`;
      gifPreview.innerHTML += `<div style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-2);">Size: ${formatFileSize(gifBlob.size)}</div>`;
      results.style.display = 'block';
      showToast({ message: 'GIF created!', type: 'success' });

      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.gif');
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (gifBlob) downloadBlob(gifBlob, 'converted.gif');
  });
}

export function destroy() {}
