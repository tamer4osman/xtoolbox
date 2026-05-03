import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadAudioFile, audioBufferToWav, applyGain, drawWaveform, getPeakLevel } from './audio-utils.js';

export const toolConfig = {
  id: 'boost-audio',
  name: 'Volume Booster',
  category: 'audio',
  description: 'Increase or decrease the volume of an audio file.',
  icon: '🔊',
  accept: 'audio/*',
  maxSizeMB: 100,
  keywords: ['boost audio', 'increase volume', 'volume booster'],
  steps: ['Upload an audio file', 'Adjust gain slider', 'Preview waveform', 'Download'],
  faqs: [{ question: 'Will boosting cause clipping?', answer: 'Values above 100% may cause clipping (distortion). The tool clips to prevent exceeding maximum.' }]
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
      updatePreview();
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <canvas id="waveform" style="width:100%;height:80px;border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-4);"></canvas>
        <div class="form-group">
          <label>Gain: <strong id="gain-display">100</strong>%</label>
          <input type="range" id="gain-slider" min="10" max="500" value="100" step="5" class="range-slider-input">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-muted);"><span>10% (quiet)</span><span>500% (loud)</span></div>
        </div>
        <div id="peak-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);"></div>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Apply & Download</button>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const waveformCanvas = container.querySelector('#waveform');
  const gainSlider = container.querySelector('#gain-slider');
  const gainDisplay = container.querySelector('#gain-display');
  const peakInfo = container.querySelector('#peak-info');
  const downloadBtn = container.querySelector('#download-btn');

  function updatePreview() {
    if (!audioBuffer) return;
    waveformCanvas.width = 600;
    waveformCanvas.height = 80;
    const gain = parseInt(gainSlider.value) / 100;
    const boosted = applyGain(audioBuffer, gain);
    const peak = getPeakLevel(boosted);
    drawWaveform(boosted, waveformCanvas, peak > 1 ? '#EF4444' : '#2563EB');
    peakInfo.textContent = peak > 1 ? `⚠️ Peak: ${(peak * 100).toFixed(0)}% — will clip` : `Peak: ${(peak * 100).toFixed(0)}%`;
  }

  gainSlider.addEventListener('input', () => {
    gainDisplay.textContent = gainSlider.value;
    updatePreview();
  });

  downloadBtn.addEventListener('click', () => {
    if (!audioBuffer) return;
    const gain = parseInt(gainSlider.value) / 100;
    const boosted = applyGain(audioBuffer, gain);
    const blob = audioBufferToWav(boosted);
    downloadBlob(blob, `boosted-${gainSlider.value}pct.wav`);
    showToast({ message: `Volume set to ${gainSlider.value}%!`, type: 'success' });
  });
}

export function destroy() {}
