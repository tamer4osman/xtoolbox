import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { loadFFmpeg, writeUploadedFile, readFFmpegFile } from './video-utils.js';

export const toolConfig = {
  id: 'images-to-video',
  name: 'Images to Video',
  category: 'video',
  description: 'Create a video from a sequence of images with custom FPS.',
  icon: '🎬',
  accept: 'image/*',
  maxSizeMB: 100,
  keywords: ['images to video', 'photo to video', 'slideshow maker'],
  steps: ['Upload images', 'Set duration per image or FPS', 'Click "Create Video"', 'Download video'],
  faqs: [
    { question: 'What format is the output?', answer: 'MP4 with H.264 encoding for maximum compatibility.' }
  ]
};

export function render(container) {
  let files = [];

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: true,
    maxSizeMB: 100,
    maxFiles: 100,
    onFilesSelected: (f) => {
      files = f;
      countInfo.textContent = `${f.length} images selected`;
      optionsArea.style.display = f.length > 0 ? 'block' : 'none';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="count-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
          <div class="form-group">
            <label>Duration per image (seconds)</label>
            <input type="number" id="duration-input" class="text-input" value="2" min="0.5" max="30" step="0.5">
          </div>
          <div class="form-group">
            <label>Output FPS</label>
            <select id="fps-select" class="select-input">
              <option value="24" selected>24 FPS</option>
              <option value="30">30 FPS</option>
              <option value="15">15 FPS</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Resolution</label>
          <select id="resolution-select" class="select-input">
            <option value="1920:1080">1920×1080 (Full HD)</option>
            <option value="1280:720" selected>1280×720 (HD)</option>
            <option value="854:480">854×480 (SD)</option>
            <option value="original">Match first image</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="create-btn" style="width:100%;">Create Video</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Creating video... <span id="progress-pct">0</span>%</p>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const countInfo = container.querySelector('#count-info');
  const createBtn = container.querySelector('#create-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');

  createBtn.addEventListener('click', async () => {
    if (files.length === 0) return;
    const duration = parseFloat(container.querySelector('#duration-input').value) || 2;
    const fps = container.querySelector('#fps-select').value;
    const resolution = container.querySelector('#resolution-select').value;

    processing.style.display = 'block';
    createBtn.style.display = 'none';

    try {
      const ffmpeg = await loadFFmpeg((pct) => { progressPct.textContent = pct; });

      // Write all images
      for (let i = 0; i < files.length; i++) {
        const padded = String(i + 1).padStart(4, '0');
        const ext = files[i].name.split('.').pop() || 'png';
        await writeUploadedFile(ffmpeg, files[i], `img_${padded}.${ext}`);
      }

      // Create concat file for ffmpeg
      let concatContent = '';
      for (let i = 0; i < files.length; i++) {
        const padded = String(i + 1).padStart(4, '0');
        const ext = files[i].name.split('.').pop() || 'png';
        concatContent += `file 'img_${padded}.${ext}'\nduration ${duration}\n`;
      }
      // Repeat last frame
      const lastPadded = String(files.length).padStart(4, '0');
      const lastExt = files[files.length - 1].name.split('.').pop() || 'png';
      concatContent += `file 'img_${lastPadded}.${lastExt}'\n`;

      const encoder = new TextEncoder();
      await ffmpeg.writeFile('concat.txt', encoder.encode(concatContent));

      const args = ['-f', 'concat', '-safe', '0', '-i', 'concat.txt'];
      if (resolution !== 'original') args.push('-s', resolution);
      args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', fps, 'output.mp4');

      await ffmpeg.exec(args);

      const blob = await readFFmpegFile(ffmpeg, 'output.mp4', 'video/mp4');
      downloadBlob(blob, 'slideshow.mp4');
      showToast({ message: `Video created from ${files.length} images! (${formatFileSize(blob.size)})`, type: 'success' });

      // Cleanup
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile('output.mp4');
      for (let i = 0; i < files.length; i++) {
        const padded = String(i + 1).padStart(4, '0');
        const ext = files[i].name.split('.').pop() || 'png';
        await ffmpeg.deleteFile(`img_${padded}.${ext}`);
      }
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      createBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
