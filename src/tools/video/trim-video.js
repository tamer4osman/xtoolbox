import { createVideoTool } from './video-tool-factory.js';
import { readFFmpegFile, createVideoPreview } from './video-utils.js';
import { downloadBlob } from '../../utils/file.js';

function parseTime(str) {
  if (!str || str.trim() === '') return null;
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseFloat(str) || 0;
}

const { toolConfig, render, destroy } = createVideoTool({
  toolConfig: {
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
  },
  optionsHTML: `
    <div id="preview-area"></div>
    <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);" id="duration-info">-</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
      <div class="form-group"><label>Start Time (MM:SS or HH:MM:SS)</label><input type="text" id="start-time" class="text-input" value="0:00" placeholder="0:00"></div>
      <div class="form-group"><label>End Time (MM:SS or HH:MM:SS)</label><input type="text" id="end-time" class="text-input" placeholder="Leave empty for end"></div>
    </div>
  `,
  processingText: 'Trimming...',
  actionBtnLabel: 'Trim Video',
  onFileLoaded(videoInfo, tctx) {
    const previewArea = tctx.query('#preview-area');
    previewArea.innerHTML = '';
    const preview = createVideoPreview(tctx.container._currentFile);
    previewArea.appendChild(preview.element);
    tctx.query('#duration-info').textContent = `Duration: ${videoInfo.formattedDuration}`;
    tctx.query('#end-time').placeholder = videoInfo.formattedDuration;
  },
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const start = parseTime(tctx.getValue('start-time')) || 0;
    const end = parseTime(tctx.getValue('end-time'));

    const ext = inputName.split('.').pop();
    const outputName = `trimmed.${ext}`;

    const args = ['-i', inputName, '-ss', String(start)];
    if (end !== null) args.push('-to', String(end));
    args.push('-c', 'copy', outputName);

    await ffmpeg.exec(args);

    const mimeType = ext === 'webm' ? 'video/webm' : 'video/mp4';
    const blob = await readFFmpegFile(ffmpeg, outputName, mimeType);
    downloadBlob(blob, `trimmed.${ext}`);
    await ffmpeg.deleteFile(outputName);
  }
});

export { toolConfig, render, destroy };
