import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { readFFmpegFile, formatTime } from './video-utils.js';
import { createVideoTool } from './video-tool-factory.js';

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

let gifBlob = null;

export const render = createVideoTool({
  maxSizeMB: 200,
  processingText: 'Converting...',
  actionBtnLabel: 'Convert to GIF',
  optionsHTML: `
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
    <div class="tool-results" id="results" style="display:none;text-align:center;">
      <div id="gif-preview" style="margin:var(--space-4) 0;"></div>
      <button class="btn btn-primary btn-lg" id="download-btn">Download GIF</button>
    </div>
  `,
  onFileLoaded(info, tctx) {
    tctx.query('#duration-info').textContent = `Duration: ${formatTime(info.duration)}`;
  },
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const fps = tctx.getValue('fps-select');
    const width = tctx.getValue('width-select');
    const outputName = 'output.gif';

    const scaleFilter = width === '-1' ? `fps=${fps}` : `fps=${fps},scale=${width}:-1:flags=lanczos`;
    await ffmpeg.exec(['-i', inputName, '-vf', scaleFilter, '-f', 'gif', outputName]);

    gifBlob = await readFFmpegFile(ffmpeg, outputName, 'image/gif');
    const preview = tctx.query('#gif-preview');
    preview.innerHTML = `<img src="${URL.createObjectURL(gifBlob)}" style="max-width:100%;border-radius:var(--radius-md);border:1px solid var(--color-border);">`;
    preview.innerHTML += `<div style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-2);">Size: ${formatFileSize(gifBlob.size)}</div>`;
    tctx.query('#results').style.display = 'block';
    showToast({ message: 'GIF created!', type: 'success' });

    const downloadBtn = tctx.query('#download-btn');
    downloadBtn.onclick = () => { if (gifBlob) downloadBlob(gifBlob, 'converted.gif'); };

    await ffmpeg.deleteFile(outputName);
  },
});

export function destroy() { gifBlob = null; }
