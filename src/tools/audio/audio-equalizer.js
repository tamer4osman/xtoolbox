import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadAudioFile } from './audio-utils.js';

export const toolConfig = {
  id: 'audio-equalizer',
  name: 'Audio Equalizer',
  category: 'audio',
  description: 'Adjust frequency bands and visualize the spectrum of any audio file.',
  icon: '🎛️',
  accept: 'audio/*',
  maxSizeMB: 100,
  keywords: ['equalizer', 'eq', 'audio', 'spectrum', 'frequency', 'bass', 'treble'],
  steps: ['Upload an audio file', 'Adjust the 10 frequency band sliders', 'Listen to the equalized audio', 'View the real-time spectrum'],
  faqs: [
    { question: 'What do the frequency bands control?', answer: 'Each band controls a specific frequency range: bass (low), midrange (middle), and treble (high).' },
    { question: 'Can I reset the equalizer?', answer: 'Yes, click the Reset button to set all bands back to 0dB (flat response).' }
  ]
};

const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const EQ_LABELS = ['31', '62', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

export function createEQBands(audioContext, count = 10) {
  const filters = [];
  for (let i = 0; i < count; i++) {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = EQ_FREQUENCIES[i];
    filter.Q.value = 1.4;
    filter.gain.value = 0;
    filters.push(filter);
  }
  for (let i = 0; i < count - 1; i++) filters[i].connect(filters[i + 1]);
  return filters;
}

export function connectFilters(filters, source, destination) {
  if (filters.length === 0) { source.connect(destination); return; }
  source.connect(filters[0]);
  filters[filters.length - 1].connect(destination);
}

export function setBandGain(filters, index, gain) {
  if (filters[index]) filters[index].gain.value = gain;
}

export function resetAllBands(filters) {
  for (const f of filters) f.gain.value = 0;
}

export function drawSpectrum(analyser, canvas) {
  const ctx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const barCount = 64;
    const binsPerBar = Math.floor(bufferLength / barCount);
    const barWidth = w / barCount;

    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      const start = i * binsPerBar;
      for (let j = start; j < start + binsPerBar && j < bufferLength; j++) sum += dataArray[j];
      const avg = sum / binsPerBar;
      const barHeight = (avg / 255) * h;

      const hue = 220 - (i / barCount) * 60;
      ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
      ctx.fillRect(i * barWidth, h - barHeight, barWidth - 1, barHeight);
    }
  }
  draw();
}

export function drawEQCurve(filters, canvas, sampleRate) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  const minFreq = 20;
  const maxFreq = sampleRate / 2;
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);
  const points = [];

  for (let px = 0; px < w; px++) {
    const logFreq = logMin + (px / w) * (logMax - logMin);
    const freq = Math.pow(10, logFreq);
    let totalResponse = 0;
    for (const filter of filters) {
      const freqs = new Float32Array([freq]);
      const magResponse = new Float32Array(1);
      const phaseResponse = new Float32Array(1);
      filter.getFrequencyResponse(freqs, magResponse, phaseResponse);
      totalResponse += 20 * Math.log10(Math.max(magResponse[0], 0.0001));
    }
    const normalized = (totalResponse + 24) / 48;
    points.push({ x: px, y: h - normalized * h });
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function render(container) {
  let audioContext = null;
  let audioBuffer = null;
  let sourceNode = null;
  let filters = [];
  let analyser = null;
  let isPlaying = false;

  const upload = createFileUpload({
    accept: 'audio/*',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      if (isPlaying) stopAudio();
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioBuffer = await loadAudioFile(files[0]);
      filters = createEQBands(audioContext, 10);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      playBtn.disabled = false;
      resetBtn.disabled = false;
      spectrumCanvas.style.display = 'block';
      eqCurveCanvas.style.display = 'block';
      drawEQCurve(filters, eqCurveCanvas, audioContext.sampleRate);
      showToast({ message: 'Audio loaded. Click Play to hear the EQ effect.', type: 'success' });
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);">
          <button class="btn btn-primary" id="play-btn" disabled>Play</button>
          <button class="btn btn-secondary" id="reset-btn" disabled>Reset</button>
        </div>
        <div id="eq-sliders" style="display:grid;grid-template-columns:repeat(10,1fr);gap:var(--space-2);margin-bottom:var(--space-4);">
          ${EQ_LABELS.map((label, i) => `
            <div style="text-align:center;">
              <input type="range" class="eq-slider" data-band="${i}" min="-12" max="12" value="0" step="0.5"
                style="writing-mode:vertical-lr;direction:rtl;height:120px;width:24px;">
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-1);">${label}</div>
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);" id="gain-${i}">0dB</div>
            </div>
          `).join('')}
        </div>
        <div style="font-weight:600;margin-bottom:var(--space-2);">EQ Curve</div>
        <canvas id="eq-curve" width="600" height="100" style="width:100%;height:100px;border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-4);display:none;"></canvas>
        <div style="font-weight:600;margin-bottom:var(--space-2);">Spectrum</div>
        <canvas id="spectrum" width="600" height="150" style="width:100%;height:150px;border:1px solid var(--color-border);border-radius:var(--radius-md);display:none;"></canvas>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const playBtn = container.querySelector('#play-btn');
  const resetBtn = container.querySelector('#reset-btn');
  const spectrumCanvas = container.querySelector('#spectrum');
  const eqCurveCanvas = container.querySelector('#eq-curve');
  const sliders = container.querySelectorAll('.eq-slider');

  function stopAudio() {
    if (sourceNode) { try { sourceNode.stop(); } catch {} sourceNode = null; }
    isPlaying = false;
    playBtn.textContent = 'Play';
  }

  playBtn.addEventListener('click', () => {
    if (!audioBuffer || !audioContext) return;
    if (isPlaying) { stopAudio(); return; }
    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;
    connectFilters(filters, sourceNode, analyser);
    analyser.connect(audioContext.destination);
    sourceNode.start(0);
    isPlaying = true;
    playBtn.textContent = 'Stop';
    drawSpectrum(analyser, spectrumCanvas);
  });

  resetBtn.addEventListener('click', () => {
    resetAllBands(filters);
    sliders.forEach(s => { s.value = 0; });
    EQ_LABELS.forEach((_, i) => { container.querySelector(`#gain-${i}`).textContent = '0dB'; });
    drawEQCurve(filters, eqCurveCanvas, audioContext.sampleRate);
  });

  sliders.forEach(slider => {
    slider.addEventListener('input', () => {
      const band = parseInt(slider.dataset.band);
      const gain = parseFloat(slider.value);
      setBandGain(filters, band, gain);
      container.querySelector(`#gain-${band}`).textContent = `${gain > 0 ? '+' : ''}${gain}dB`;
      drawEQCurve(filters, eqCurveCanvas, audioContext.sampleRate);
    });
  });

  optionsArea.style.display = 'block';
}

export function destroy() {}
