import { createVideoTool } from './video-tool-factory.js';
import { readFFmpegFile } from './video-utils.js';
import { downloadBlob } from '../../utils/file.js';
import { createVideoPreview } from './video-utils.js';

const { toolConfig, render, destroy } = createVideoTool({
  toolConfig: {
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
  },
  optionsHTML: `
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
  `,
  processingText: 'Processing...',
  actionBtnLabel: 'Apply Speed & Download',
  onFileLoaded(videoInfo, tctx) {
    const previewArea = tctx.query('#preview-area');
    previewArea.innerHTML = '';
    const preview = createVideoPreview(tctx.container._currentFile);
    previewArea.appendChild(preview.element);
  },
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const speed = parseFloat(tctx.getValue('data-speed') || '1');
    if (speed === 1) {
      const { showToast } = await import('../../components/toast.js');
      showToast({ message: 'Select a different speed first', type: 'warning' });
      return;
    }

    let audioFilter;
    if (speed <= 0.5) audioFilter = `atempo=0.5,atempo=${speed / 0.5}`;
    else if (speed >= 2) audioFilter = `atempo=2.0,atempo=${speed / 2}`;
    else audioFilter = `atempo=${speed}`;

    await ffmpeg.exec([
      '-i', inputName,
      '-filter:v', `setpts=${1 / speed}*PTS`,
      '-filter:a', audioFilter,
      'output.mp4'
    ]);

    const blob = await readFFmpegFile(ffmpeg, 'output.mp4', 'video/mp4');
    downloadBlob(blob, `speed-${speed}x.mp4`);
    await ffmpeg.deleteFile('output.mp4');
  }
});

export { toolConfig, render, destroy };
