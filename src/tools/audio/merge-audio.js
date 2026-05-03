import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { loadAudioFile, audioBufferToWav, concatAudioBuffers, formatAudioTime } from './audio-utils.js';

export const toolConfig = {
  id: 'merge-audio',
  name: 'Audio Merger',
  category: 'audio',
  description: 'Combine multiple audio files into one.',
  icon: '🔗',
  accept: 'audio/*',
  maxSizeMB: 100,
  keywords: ['merge audio', 'combine audio', 'join audio'],
  steps: ['Upload multiple audio files', 'Reorder if needed', 'Click "Merge"', 'Download merged audio'],
  faqs: [{ question: 'Can I merge different formats?', answer: 'Yes. All files are decoded and merged as WAV.' }]
};

export function render(container) {
  let files = [];

  const upload = createFileUpload({
    accept: 'audio/*',
    multiple: true,
    maxSizeMB: 100,
    maxFiles: 20,
    onFilesSelected: (f) => {
      files = f;
      renderFileList();
      mergeBtn.style.display = f.length > 1 ? 'inline-flex' : 'none';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="file-list" style="margin:var(--space-4) 0;"></div>
      <button class="btn btn-primary btn-lg" id="merge-btn" style="display:none;width:100%;">Merge Audio Files</button>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Merging...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const fileList = container.querySelector('#file-list');
  const mergeBtn = container.querySelector('#merge-btn');
  const processing = container.querySelector('#processing');

  function renderFileList() {
    fileList.innerHTML = files.map((f, i) => `
      <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-2);">
        <span style="font-weight:600;color:var(--color-text-muted);">${i + 1}.</span>
        <span style="flex:1;font-size:var(--text-sm);">${f.name}</span>
        <span style="font-size:var(--text-xs);color:var(--color-text-muted);">${formatFileSize(f.size)}</span>
      </div>
    `).join('');
  }

  mergeBtn.addEventListener('click', async () => {
    if (files.length < 2) return;
    processing.style.display = 'block';
    mergeBtn.style.display = 'none';

    try {
      const buffers = [];
      for (const file of files) {
        buffers.push(await loadAudioFile(file));
      }
      const merged = concatAudioBuffers(buffers);
      const blob = audioBufferToWav(merged);
      downloadBlob(blob, 'merged.wav');
      showToast({ message: `${files.length} files merged! (${formatAudioTime(merged.duration)})`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      mergeBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
