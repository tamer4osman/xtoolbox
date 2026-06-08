import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { audioBufferToWav, changeSpeed, formatAudioTime } from './audio-utils.js';
import { createAudioTool } from './audio-tool-factory.js';

export const toolConfig = {
  id: 'audio-speed',
  name: 'Audio Speed Changer',
  category: 'audio',
  description: 'Speed up or slow down audio without changing pitch.',
  icon: '⏩',
  accept: 'audio/*',
  maxSizeMB: 100,
  keywords: ['audio speed', 'speed up audio', 'slow audio'],
  steps: ['Upload an audio file', 'Choose speed (0.5x–3x)', 'Click "Apply"', 'Download'],
  faqs: [{ question: 'Does changing speed affect pitch?', answer: 'No. This uses time-stretching to change speed while preserving pitch.' }]
};

export function render(container) {
  const { getAudioBuffer, optionsArea } = createAudioTool({
    container,
    onFileLoaded(buf) {
      durationInfo.textContent = `Duration: ${formatAudioTime(buf.duration)}`;
      updateInfo();
    }
  });

  optionsArea.innerHTML = `
    <div id="duration-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
    <div class="form-group">
      <label>Speed: <strong id="speed-display">1.0</strong>x</label>
      <input type="range" id="speed-slider" min="25" max="300" value="100" step="5" class="range-slider-input">
      <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-muted);"><span>0.25x (slow)</span><span>3x (fast)</span></div>
    </div>
    <div id="new-duration" style="font-size:var(--text-sm);color:var(--color-primary);font-weight:600;margin-bottom:var(--space-4);"></div>
    <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-4);">
      <button class="btn btn-sm btn-secondary" data-speed="50">0.5x</button>
      <button class="btn btn-sm btn-secondary" data-speed="75">0.75x</button>
      <button class="btn btn-sm btn-secondary active" data-speed="100">1x</button>
      <button class="btn btn-sm btn-secondary" data-speed="125">1.25x</button>
      <button class="btn btn-sm btn-secondary" data-speed="150">1.5x</button>
      <button class="btn btn-sm btn-secondary" data-speed="200">2x</button>
    </div>
    <button class="btn btn-primary btn-lg" id="apply-btn" style="width:100%;">Apply & Download</button>
  `;

  const durationInfo = optionsArea.querySelector('#duration-info');
  const speedSlider = optionsArea.querySelector('#speed-slider');
  const speedDisplay = optionsArea.querySelector('#speed-display');
  const newDuration = optionsArea.querySelector('#new-duration');
  const applyBtn = optionsArea.querySelector('#apply-btn');

  function updateInfo() {
    const buf = getAudioBuffer();
    if (!buf) return;
    const speed = parseInt(speedSlider.value) / 100;
    speedDisplay.textContent = speed.toFixed(2);
    newDuration.textContent = `New duration: ${formatAudioTime(buf.duration / speed)}`;
    container.querySelectorAll('[data-speed]').forEach(b => {
      b.classList.toggle('active', b.dataset.speed === speedSlider.value);
    });
  }

  speedSlider.addEventListener('input', updateInfo);
  container.querySelectorAll('[data-speed]').forEach(btn => {
    btn.addEventListener('click', () => { speedSlider.value = btn.dataset.speed; updateInfo(); });
  });

  applyBtn.addEventListener('click', () => {
    const buf = getAudioBuffer();
    if (!buf) return;
    const speed = parseInt(speedSlider.value) / 100;
    const result = changeSpeed(buf, speed);
    downloadBlob(audioBufferToWav(result), `speed-${speed}x.wav`);
    showToast({ message: `Speed set to ${speed}x!`, type: 'success' });
  });
}

export function destroy() {}
