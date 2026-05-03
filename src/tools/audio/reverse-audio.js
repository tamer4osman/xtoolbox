import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadAudioFile, audioBufferToWav, reverseAudioBuffer, drawWaveform, formatAudioTime } from './audio-utils.js';

export const toolConfig = {
  id: 'reverse-audio',
  name: 'Audio Reverser',
  category: 'audio',
  description: 'Play an audio file backwards.',
  icon: '⏪',
  accept: 'audio/*',
  maxSizeMB: 100,
  keywords: ['reverse audio', 'play backwards', 'audio reverser'],
  steps: ['Upload an audio file', 'Click "Reverse"', 'Preview or download'],
  faqs: [{ question: 'Why would I reverse audio?', answer: 'For creative effects, hidden messages, or music production.' }]
};

export function render(container) {
  let audioBuffer = null;

  const upload = createFileUpload({
    accept: 'audio/*',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      audioBuffer = await loadAudioFile(files[0]);
      durationInfo.textContent = `Duration: ${formatAudioTime(audioBuffer.duration)}`;
      waveformCanvas.width = 600;
      waveformCanvas.height = 80;
      drawWaveform(audioBuffer, waveformCanvas);
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="duration-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div style="text-align:center;margin:var(--space-4) 0;">
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-2);">Original Waveform</div>
          <canvas id="waveform" style="width:100%;height:80px;border:1px solid var(--color-border);border-radius:var(--radius-md);"></canvas>
        </div>
        <button class="btn btn-primary btn-lg" id="reverse-btn" style="width:100%;">⏪ Reverse & Download</button>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const durationInfo = container.querySelector('#duration-info');
  const waveformCanvas = container.querySelector('#waveform');
  const reverseBtn = container.querySelector('#reverse-btn');

  reverseBtn.addEventListener('click', () => {
    if (!audioBuffer) return;
    const reversed = reverseAudioBuffer(audioBuffer);
    const blob = audioBufferToWav(reversed);
    downloadBlob(blob, 'reversed.wav');
    showToast({ message: 'Audio reversed!', type: 'success' });
  });
}

export function destroy() {}
