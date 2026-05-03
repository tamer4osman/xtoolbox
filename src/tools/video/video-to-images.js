import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadFFmpeg, writeUploadedFile, readFFmpegFile, getVideoInfo, formatTime } from './video-utils.js';
import JSZip from 'jszip';

export const toolConfig = {
  id: 'video-to-images',
  name: 'Video to Images',
  category: 'video',
  description: 'Extract frames from a video as PNG or JPG images.',
  icon: '🖼️',
  accept: 'video/*',
  maxSizeMB: 500,
  keywords: ['video to images', 'extract frames', 'video to jpg'],
  steps: ['Upload a video', 'Choose frame rate', 'Click "Extract"', 'Download ZIP of images'],
  faqs: [
    { question: 'How many frames will be extracted?', answer: 'Depends on video duration and chosen FPS. A 10s video at 1 FPS = 10 frames.' }
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
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="video-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div class="form-group">
          <label>Extract Rate</label>
          <select id="fps-select" class="select-input">
            <option value="1">1 frame per second</option>
            <option value="5" selected>5 frames per second</option>
            <option value="10">10 frames per second</option>
            <option value="25">Every frame (25 FPS)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Format</label>
          <select id="format-select" class="select-input">
            <option value="png" selected>PNG (lossless)</option>
            <option value="jpg">JPG (smaller)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="extract-btn" style="width:100%;">Extract Frames</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Extracting frames... <span id="progress-pct">0</span>%</p>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const videoInfo = container.querySelector('#video-info');
  const extractBtn = container.querySelector('#extract-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');

  extractBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const fps = container.querySelector('#fps-select').value;
    const format = container.querySelector('#format-select').value;

    processing.style.display = 'block';
    extractBtn.style.display = 'none';

    try {
      const ffmpeg = await loadFFmpeg((pct) => { progressPct.textContent = pct; });
      await writeUploadedFile(ffmpeg, currentFile, 'input.mp4');

      await ffmpeg.exec(['-i', 'input.mp4', '-vf', `fps=${fps}`, `frame_%04d.${format}`]);

      const files = await ffmpeg.listDir('.');
      const frameFiles = files.filter(f => f.name.startsWith('frame_') && f.name.endsWith(`.${format}`));

      const zip = new JSZip();
      for (const file of frameFiles) {
        const data = await ffmpeg.readFile(file.name);
        zip.file(file.name, data);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `frames-${fps}fps.zip`);
      showToast({ message: `${frameFiles.length} frames extracted!`, type: 'success' });

      await ffmpeg.deleteFile('input.mp4');
      for (const file of frameFiles) await ffmpeg.deleteFile(file.name);
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      extractBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
