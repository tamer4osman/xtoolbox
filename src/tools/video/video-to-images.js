import { createVideoTool } from './video-tool-factory.js';
import JSZip from 'jszip';
import { downloadBlob } from '../../utils/file.js';

const { toolConfig, render, destroy } = createVideoTool({
  toolConfig: {
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
  },
  optionsHTML: `
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
  `,
  processingText: 'Extracting frames...',
  actionBtnLabel: 'Extract Frames',
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const fps = tctx.getValue('fps-select');
    const format = tctx.getValue('format-select');

    await ffmpeg.exec(['-i', inputName, '-vf', `fps=${fps}`, `frame_%04d.${format}`]);

    const files = await ffmpeg.listDir('.');
    const frameFiles = files.filter(f => f.name.startsWith('frame_') && f.name.endsWith(`.${format}`));

    const zip = new JSZip();
    for (const file of frameFiles) {
      const data = await ffmpeg.readFile(file.name);
      zip.file(file.name, data);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `frames-${fps}fps.zip`);

    for (const file of frameFiles) await ffmpeg.deleteFile(file.name);
  }
});

export { toolConfig, render, destroy };
