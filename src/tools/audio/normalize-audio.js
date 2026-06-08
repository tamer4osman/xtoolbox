import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { audioBufferToWav, getPeakLevel, applyGain, drawWaveform } from './audio-utils.js';
import { createAudioTool } from './audio-tool-factory.js';

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
  const { getAudioBuffer, optionsArea } = createAudioTool({
    container,
    onFileLoaded(buf) {
      const peak = getPeakLevel(buf);
      const peakDb = peak > 0 ? (20 * Math.log10(peak)).toFixed(1) : '-∞';
      peakDisplay.textContent = `${peakDb} dB`;
      peakPercent.textContent = `${(peak * 100).toFixed(1)}%`;
      waveformCanvas.width = 600;
      waveformCanvas.height = 80;
      drawWaveform(buf, waveformCanvas, peak > 0.95 ? '#EF4444' : '#10B981');
    }
  });

  optionsArea.innerHTML = `
    <canvas id="waveform" style="width:100%;height:80px;border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-4);"></canvas>
    <div class="stats-row">
      <div class="stat"><span class="stat-label">Peak Level</span><span class="stat-value" id="peak-display">-</span></div>
      <div class="stat"><span class="stat-label">Peak %</span><span class="stat-value" id="peak-percent">-</span></div>
    </div>
    <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">Normalization will boost the volume so the peak reaches 0 dB (100%).</p>
    <button class="btn btn-primary btn-lg" id="normalize-btn" style="width:100%;">Normalize & Download</button>
  `;

  const waveformCanvas = optionsArea.querySelector('#waveform');
  const peakDisplay = optionsArea.querySelector('#peak-display');
  const peakPercent = optionsArea.querySelector('#peak-percent');
  const normalizeBtn = optionsArea.querySelector('#normalize-btn');

  normalizeBtn.addEventListener('click', () => {
    const buf = getAudioBuffer();
    if (!buf) return;
    const peak = getPeakLevel(buf);
    if (peak === 0) { showToast({ message: 'Audio is silent', type: 'warning' }); return; }
    const gain = 1 / peak;
    downloadBlob(audioBufferToWav(applyGain(buf, gain)), 'normalized.wav');
    showToast({ message: `Normalized! Gain: ${gain.toFixed(2)}x`, type: 'success' });
  });
}

export function destroy() {}
