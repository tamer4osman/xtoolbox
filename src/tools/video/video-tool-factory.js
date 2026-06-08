import { createFileUpload } from '../../components/file-upload.js';
import { loadFFmpeg, writeUploadedFile, readFFmpegFile, getVideoInfo, formatTime } from './video-utils.js';

export function createVideoTool({ container, onFileLoaded }) {
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
      onFileLoaded?.();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="video-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Processing...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const videoInfo = container.querySelector('#video-info');
  const processing = container.querySelector('#processing');

  return {
    getFile: () => currentFile,
    optionsArea,
    processing,
    async runFFmpeg(outputName, args, outputMime, outputFilename) {
      processing.style.display = 'block';
      try {
        const ffmpeg = await loadFFmpeg();
        await writeUploadedFile(ffmpeg, currentFile, 'input.mp4');
        await ffmpeg.exec(['-i', 'input.mp4', ...args]);
        const blob = await readFFmpegFile(ffmpeg, outputName, outputMime);
        const { downloadBlob } = await import('../../utils/file.js');
        downloadBlob(blob, outputFilename);
        await ffmpeg.deleteFile('input.mp4');
        await ffmpeg.deleteFile(outputName);
        return blob;
      } finally {
        processing.style.display = 'none';
      }
    }
  };
}
