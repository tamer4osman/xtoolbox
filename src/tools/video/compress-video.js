import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { loadFFmpeg, getVideoInfo, writeUploadedFile, readFFmpegFile, formatTime, createVideoPreview } from './video-utils.js';

export const toolConfig = {
  id: 'compress-video',
  name: 'Video Compressor',
  category: 'video',
  description: 'Reduce video file size by adjusting quality, resolution, and bitrate.',
  icon: '📦',
  accept: 'video/*',
  maxSizeMB: 500,
  keywords: ['compress video', 'reduce video size', 'video compressor'],
  steps: ['Upload a video', 'Choose quality and resolution', 'Click "Compress"', 'Download compressed video'],
  faqs: [
    { question: 'How much can I compress?', answer: 'Typically 30-70% reduction depending on settings.' },
    { question: 'Does compression reduce quality?', answer: 'Lower quality settings will reduce visual quality.' }
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
      originalSize.textContent = videoInfo.sizeFormatted;
      originalDims.textContent = `${videoInfo.width}×${videoInfo.height}`;
      originalDuration.textContent = formatTime(videoInfo.duration);
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="stats-row" style="margin-bottom:var(--space-4);">
          <div class="stat"><span class="stat-label">Size</span><span class="stat-value" id="original-size">-</span></div>
          <div class="stat"><span class="stat-label">Resolution</span><span class="stat-value" id="original-dims">-</span></div>
          <div class="stat"><span class="stat-label">Duration</span><span class="stat-value" id="original-duration">-</span></div>
        </div>
        <div class="form-group">
          <label>Quality</label>
          <select id="quality-select" class="select-input">
            <option value="high">High (larger file)</option>
            <option value="medium" selected>Medium (balanced)</option>
            <option value="low">Low (smallest file)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Resolution</label>
          <select id="resolution-select" class="select-input">
            <option value="original">Original</option>
            <option value="1920:1080">1080p</option>
            <option value="1280:720" selected>720p</option>
            <option value="854:480">480p</option>
            <option value="640:360">360p</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="compress-btn" style="width:100%;">Compress Video</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p id="progress-text">Compressing... <span id="progress-pct">0</span>%</p>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const originalSize = container.querySelector('#original-size');
  const originalDims = container.querySelector('#original-dims');
  const originalDuration = container.querySelector('#original-duration');
  const compressBtn = container.querySelector('#compress-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');

  compressBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const quality = container.querySelector('#quality-select').value;
    const resolution = container.querySelector('#resolution-select').value;

    processing.style.display = 'block';
    compressBtn.style.display = 'none';

    try {
      const ffmpeg = await loadFFmpeg((pct) => { progressPct.textContent = pct; });
      const ext = currentFile.name.split('.').pop() || 'mp4';
      const inputName = `input.${ext}`;
      const outputName = `compressed.mp4`;

      await writeUploadedFile(ffmpeg, currentFile, inputName);

      const bitrateMap = { high: '2M', medium: '1M', low: '500k' };
      const args = ['-i', inputName, '-b:v', bitrateMap[quality]];
      if (resolution !== 'original') args.push('-s', resolution);
      args.push('-c:a', 'aac', '-b:a', '128k', outputName);

      await ffmpeg.exec(args);

      const blob = await readFFmpegFile(ffmpeg, outputName, 'video/mp4');
      downloadBlob(blob, `compressed-${quality}.mp4`);
      showToast({ message: `Compressed from ${formatFileSize(currentFile.size)} to ${formatFileSize(blob.size)}!`, type: 'success' });

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      compressBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
