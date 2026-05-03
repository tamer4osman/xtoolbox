import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadAudioFile, audioBufferToWav, getPeakLevel, applyGain, drawWaveform } from './audio-utils.js';

export const toolConfig = {
  id: 'normalize-audio',
  name: 'Volume Normalizer',
  category: 'audio',
  description: 'Equalize volume levels across an audio file.',
  icon: '📊',
  accept: 'audio/*',
  maxSizeMB: 100,
  keywords: ['normalize audio', 'volume normalizer', 'equalize volume'],
  steps: ['Upload an audio file', 'View current peak level', 'Click "Normalize"', 'Download normalized audio'],
  faqs: [{ question: 'What does normalization do?', answer: 'It adjusts the volume so the loudest peak reaches 0 dB (maximum without clipping).' }]
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
      const peak = getPeakLevel(audioBuffer);
      const peakDb = peak > 0 ? (20 * Math.log10(peak)).toFixed(1) : '-∞';
      peakDisplay.textContent = `${peakDb} dB`;
      peakPercent.textContent = `${(peak * 100).toFixed(1)}%`;

      waveformCanvas.width = 600;
      waveformCanvas.height = 80;
      drawWaveform(audioBuffer, waveformCanvas, peak > 0.95 ? '#EF4444' : '#10B981');

      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <canvas id="waveform" style="width:100%;height:80px;border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-4);"></canvas>
        <div class="stats-row">
          <div class="stat"><span class="stat-label">Peak Level</span><span class="stat-value" id="peak-display">-</span></div>
          <div class="stat"><span class="stat-label">Peak %</span><span class="stat-value" id="peak-percent">-</span></div>
        </div>
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">Normalization will boost the volume so the peak reaches 0 dB (100%).</p>
        <button class="btn btn-primary btn-lg" id="normalize-btn" style="width:100%;">Normalize & Download</button>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const waveformCanvas = container.querySelector('#waveform');
  const peakDisplay = container.querySelector('#peak-display');
  const peakPercent = container.querySelector('#peak-percent');
  const normalizeBtn = container.querySelector('#normalize-btn');

  normalizeBtn.addEventListener('click', () => {
    if (!audioBuffer) return;
    const peak = getPeakLevel(audioBuffer);
    if (peak === 0) { showToast({ message: 'Audio is silent', type: 'warning' }); return; }

    const gain = 1 / peak;
    const normalized = applyGain(audioBuffer, gain);
    const blob = audioBufferToWav(normalized);
    downloadBlob(blob, 'normalized.wav');
    showToast({ message: `Normalized! Gain: ${gain.toFixed(2)}x`, type: 'success' });
  });
}

export function destroy() {}
