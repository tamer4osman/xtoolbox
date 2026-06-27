import { downloadBlob } from '../../utils/file.js';

function generateSFX(type, params) {
  const sampleRate = 44100;
  const duration = params.duration || 0.5;
  const length = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(length);

  switch (type) {
    case 'jump': {
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const freq = 200 + (800 - 200) * (t / duration);
        buffer[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-3 * t / duration) * 0.6;
      }
      break;
    }
    case 'coin': {
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const freq = i < length / 2 ? 988 : 1319;
        buffer[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-4 * t / duration) * 0.5;
      }
      break;
    }
    case 'hit': {
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        buffer[i] = (Math.random() * 2 - 1) * Math.exp(-10 * t / duration) * 0.4;
      }
      break;
    }
    case 'laser': {
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const freq = 1200 - 1000 * (t / duration);
        buffer[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-5 * t / duration) * 0.4;
      }
      break;
    }
    case 'powerup': {
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const freq = 300 + 600 * Math.pow(t / duration, 0.5);
        buffer[i] = (Math.sin(2 * Math.PI * freq * t) + Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.3) * Math.exp(-2 * t / duration) * 0.5;
      }
      break;
    }
    case 'explosion': {
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-4 * t / duration);
        buffer[i] = (Math.random() * 2 - 1) * env * 0.5;
        buffer[i] += Math.sin(2 * Math.PI * 60 * t) * env * 0.3;
      }
      break;
    }
    case 'beep': {
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const freq = params.frequency || 440;
        buffer[i] = Math.sign(Math.sin(2 * Math.PI * freq * t)) * Math.exp(-3 * t / duration) * 0.4;
      }
      break;
    }
    case 'sweep': {
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const freq = 200 + 2000 * (t / duration);
        buffer[i] = Math.sin(2 * Math.PI * freq * t) * (1 - t / duration) * 0.5;
      }
      break;
    }
    default: {
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        buffer[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-3 * t / duration) * 0.5;
      }
    }
  }

  return buffer;
}

function floatTo16BitPCM(float32Array) {
  const int16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16;
}

function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  const int16 = floatTo16BitPCM(samples);
  for (let i = 0; i < int16.length; i++) {
    view.setInt16(44 + i * 2, int16[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

const SFX_TYPES = [
  { id: 'jump', name: 'Jump', icon: '⬆️', defaults: { duration: 0.3 } },
  { id: 'coin', name: 'Coin', icon: '🪙', defaults: { duration: 0.3 } },
  { id: 'hit', name: 'Hit', icon: '💥', defaults: { duration: 0.2 } },
  { id: 'laser', name: 'Laser', icon: '🔫', defaults: { duration: 0.4 } },
  { id: 'powerup', name: 'Power Up', icon: '⚡', defaults: { duration: 0.6 } },
  { id: 'explosion', name: 'Explosion', icon: '💣', defaults: { duration: 0.8 } },
  { id: 'beep', name: 'Beep', icon: '🔔', defaults: { duration: 0.2, frequency: 440 } },
  { id: 'sweep', name: 'Sweep', icon: '〰️', defaults: { duration: 0.5 } }
];

export const toolConfig = {
  id: 'sound-effect-generator',
  name: 'Sound Effect Generator',
  category: 'audio',
  description: 'Generate retro game sound effects using the Web Audio API. Export as WAV.',
  icon: '🎮',
  keywords: ['sound', 'effect', 'sfx', 'game', 'retro', 'wav'],
  accept: '',
  maxSizeMB: 5
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p class="tool-description">Generate retro game sound effects with the Web Audio API. Preview and export as WAV.</p>

      <div class="sfx-grid" id="sfx-grid">
        ${SFX_TYPES.map(s => `
          <button type="button" class="sfx-card" data-type="${s.id}">
            <span class="sfx-icon">${s.icon}</span>
            <span class="sfx-name">${s.name}</span>
          </button>
        `).join('')}
      </div>

      <div class="sfx-controls" id="sfx-controls">
        <div class="control-row">
          <label for="sfx-duration">Duration (s)</label>
          <input type="range" id="sfx-duration" min="0.05" max="2" step="0.05" value="0.5">
          <span id="duration-val">0.5s</span>
        </div>
        <div class="control-row" id="freq-row" style="display:none">
          <label for="sfx-frequency">Frequency (Hz)</label>
          <input type="range" id="sfx-frequency" min="100" max="2000" step="10" value="440">
          <span id="frequency-val">440Hz</span>
        </div>
        <div class="btn-row">
          <button type="button" id="play-btn" class="btn-primary">▶ Play</button>
          <button type="button" id="export-btn" class="btn-secondary">⬇ Export WAV</button>
        </div>
      </div>

      <canvas id="waveform-canvas" class="waveform-canvas" width="600" height="120"></canvas>
    </div>
  `;

  const grid = container.querySelector('#sfx-grid');
  const durationInput = container.querySelector('#sfx-duration');
  const durationVal = container.querySelector('#duration-val');
  const freqRow = container.querySelector('#freq-row');
  const freqInput = container.querySelector('#sfx-frequency');
  const freqVal = container.querySelector('#frequency-val');
  const playBtn = container.querySelector('#play-btn');
  const exportBtn = container.querySelector('#export-btn');
  const canvas = container.querySelector('#waveform-canvas');
  const ctx = canvas.getContext('2d');

  let selectedType = 'jump';
  let currentBuffer = null;

  function selectType(type) {
    selectedType = type;
    const sfx = SFX_TYPES.find(s => s.id === type);
    if (sfx) {
      durationInput.value = sfx.defaults.duration;
      durationVal.textContent = sfx.defaults.duration + 's';
      if (sfx.defaults.frequency) {
        freqInput.value = sfx.defaults.frequency;
        freqVal.textContent = sfx.defaults.frequency + 'Hz';
        freqRow.style.display = 'flex';
      } else {
        freqRow.style.display = 'none';
      }
    }
    grid.querySelectorAll('.sfx-card').forEach(c => {
      c.classList.toggle('active', c.dataset.type === type);
    });
    generate();
  }

  function generate() {
    const duration = parseFloat(durationInput.value);
    const frequency = parseInt(freqInput.value);
    currentBuffer = generateSFX(selectedType, { duration, frequency });
    drawWaveform(currentBuffer);
  }

  function drawWaveform(samples) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let i = 0; i < w; i++) {
      const idx = Math.floor(i * samples.length / w);
      const val = samples[idx] || 0;
      const y = h / 2 - val * h * 0.8;
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  }

  function playSound() {
    if (!currentBuffer) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createBufferSource();
    source.buffer = audioCtx.createBuffer(1, currentBuffer.length, 44100);
    source.buffer.getChannelData(0).set(currentBuffer);
    source.connect(audioCtx.destination);
    source.start();
  }

  grid.addEventListener('click', e => {
    const card = e.target.closest('.sfx-card');
    if (card) selectType(card.dataset.type);
  });

  durationInput.addEventListener('input', () => {
    durationVal.textContent = durationInput.value + 's';
    generate();
  });

  freqInput.addEventListener('input', () => {
    freqVal.textContent = freqInput.value + 'Hz';
    generate();
  });

  playBtn.addEventListener('click', playSound);

  exportBtn.addEventListener('click', () => {
    if (!currentBuffer) return;
    const wav = encodeWAV(currentBuffer, 44100);
    downloadBlob(wav, `sfx-${selectedType}.wav`);
  });

  selectType('jump');
}
