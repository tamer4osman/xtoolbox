import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadAudioFile, audioBufferToWav, changeSpeed, formatAudioTime } from './audio-utils.js';

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
  let audioBuffer = null;

  const upload = createFileUpload({
    accept: 'audio/*',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      audioBuffer = await loadAudioFile(files[0]);
      durationInfo.textContent = `Duration: ${formatAudioTime(audioBuffer.duration)}`;
      optionsArea.style.display = 'block';
      updateInfo();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
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
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const durationInfo = container.querySelector('#duration-info');
  const speedSlider = container.querySelector('#speed-slider');
  const speedDisplay = container.querySelector('#speed-display');
  const newDuration = container.querySelector('#new-duration');
  const applyBtn = container.querySelector('#apply-btn');

  function updateInfo() {
    if (!audioBuffer) return;
    const speed = parseInt(speedSlider.value) / 100;
    speedDisplay.textContent = speed.toFixed(2);
    newDuration.textContent = `New duration: ${formatAudioTime(audioBuffer.duration / speed)}`;
    container.querySelectorAll('[data-speed]').forEach(b => {
      b.classList.toggle('active', b.dataset.speed === speedSlider.value);
    });
  }

  speedSlider.addEventListener('input', updateInfo);
  container.querySelectorAll('[data-speed]').forEach(btn => {
    btn.addEventListener('click', () => {
      speedSlider.value = btn.dataset.speed;
      updateInfo();
    });
  });

  applyBtn.addEventListener('click', () => {
    if (!audioBuffer) return;
    const speed = parseInt(speedSlider.value) / 100;
    const result = changeSpeed(audioBuffer, speed);
    const blob = audioBufferToWav(result);
    downloadBlob(blob, `speed-${speed}x.wav`);
    showToast({ message: `Speed set to ${speed}x!`, type: 'success' });
  });
}

export function destroy() {}
