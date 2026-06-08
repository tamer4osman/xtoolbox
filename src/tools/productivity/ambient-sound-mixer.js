import { createSoundNodes } from './sound-nodes.js';

export const toolConfig = {
  id: 'ambient-sound-mixer',
  name: 'Ambient Focus Soundboard',
  category: 'productivity',
  description: 'Create customizable ambient focus soundtracks using 8 high-quality offline loopable sound nodes.',
  icon: '🎧',
  status: 'done'
};

const SOUNDS = [
  { id: 'rain', name: 'Rain', icon: '🌧️', color: '#3b82f6' },
  { id: 'cafe', name: 'Cafe', icon: '☕', color: '#92400e' },
  { id: 'brown', name: 'Brown Noise', icon: '🟤', color: '#78350f' },
  { id: 'waves', name: 'Waves', icon: '🌊', color: '#0ea5e9' },
  { id: 'wind', name: 'Wind', icon: '💨', color: '#6b7280' },
  { id: 'fire', name: 'Fire', icon: '🔥', color: '#ef4444' },
  { id: 'thunder', name: 'Thunder', icon: '⛈️', color: '#4b5563' },
  { id: 'birds', name: 'Birds', icon: '🐦', color: '#22c55e' },
];

const TIMER_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
];

const STYLES = `
  .amb-container { max-width: 800px; margin: 0 auto; }
  .amb-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4); flex-wrap: wrap; background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
  .amb-timer, .amb-master { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); }
  .amb-timer label, .amb-master label { font-weight: 600; white-space: nowrap; }
  .amb-timer select { padding: var(--space-1) var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }
  .amb-timer span { font-family: monospace; color: var(--color-primary); min-width: 50px; }
  .amb-master input[type="range"] { width: 120px; }
  .amb-master span { font-family: monospace; min-width: 40px; }
  .amb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-3); }
  .amb-card { background: var(--color-surface); border: 2px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-4); text-align: center; cursor: pointer; transition: all 0.2s; }
  .amb-card:hover { border-color: var(--color-primary); }
  .amb-card.active { border-color: var(--color-primary); background: var(--color-primary-light); }
  .amb-card-icon { font-size: 36px; margin-bottom: var(--space-2); }
  .amb-card-name { font-weight: 600; font-size: var(--text-sm); margin-bottom: var(--space-2); }
  .amb-card-status { font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: var(--space-2); }
  .amb-card.active .amb-card-status { color: var(--color-primary); }
  .amb-card-volume { display: flex; align-items: center; gap: var(--space-1); }
  .amb-card-volume input { flex: 1; }
  .amb-card-volume span { font-size: var(--text-xs); font-family: monospace; width: 30px; }
`;

function formatTime(s) {
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function createCard(sound) {
  const card = document.createElement('div');
  card.className = 'amb-card';
  card.dataset.sound = sound.id;
  card.innerHTML = `
    <div class="amb-card-icon">${sound.icon}</div>
    <div class="amb-card-name">${sound.name}</div>
    <div class="amb-card-status">Stopped</div>
    <div class="amb-card-volume">
      <input type="range" min="0" max="100" value="50" data-volume="${sound.id}">
      <span>50%</span>
    </div>
  `;
  return card;
}

export function render(container) {
  let audioCtx = null;
  let masterGain = null;
  const activeSounds = {};
  let timerInterval = null;
  let timerSeconds = 0;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(audioCtx.destination);
      audioCtx._masterGain = masterGain;
    }
    return audioCtx;
  }

  function stopSound(soundId) {
    if (activeSounds[soundId]) {
      activeSounds[soundId].nodes.forEach(n => { try { n.stop(); } catch {} });
      activeSounds[soundId].gain.disconnect();
      delete activeSounds[soundId];
    }
  }

  function toggleSound(soundId) {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const card = container.querySelector(`[data-sound="${soundId}"]`);
    if (activeSounds[soundId]) {
      stopSound(soundId);
      card.classList.remove('active');
      card.querySelector('.amb-card-status').textContent = 'Stopped';
    } else {
      activeSounds[soundId] = createSoundNodes(ctx, soundId);
      card.classList.add('active');
      card.querySelector('.amb-card-status').textContent = 'Playing';
    }
  }

  function updateVolume(soundId, value) {
    if (activeSounds[soundId]) activeSounds[soundId].gain.gain.value = value / 100;
  }

  function startTimer(minutes) {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 0;
    const display = container.querySelector('#amb-timer-display');
    if (minutes === 0) { display.textContent = ''; return; }
    timerSeconds = minutes * 60;
    display.textContent = formatTime(timerSeconds);
    timerInterval = setInterval(() => {
      timerSeconds--;
      display.textContent = formatTime(timerSeconds);
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        Object.keys(activeSounds).forEach(id => {
          stopSound(id);
          const card = container.querySelector(`[data-sound="${id}"]`);
          card.classList.remove('active');
          card.querySelector('.amb-card-status').textContent = 'Stopped';
        });
        display.textContent = 'Done!';
      }
    }, 1000);
  }

  // Setup UI
  container.innerHTML = `
    <div class="amb-container">
      <div class="amb-header">
        <div class="amb-timer">
          <label>Sleep Timer</label>
          <select id="amb-timer">
            ${TIMER_OPTIONS.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
          </select>
          <span id="amb-timer-display"></span>
        </div>
        <div class="amb-master">
          <label>Master Volume</label>
          <input type="range" id="amb-master" min="0" max="100" value="70">
          <span id="amb-master-val">70%</span>
        </div>
      </div>
      <div class="amb-grid" id="amb-grid"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = STYLES;
  container.appendChild(style);

  // Render sound cards
  const grid = container.querySelector('#amb-grid');
  SOUNDS.forEach(sound => {
    const card = createCard(sound);
    card.addEventListener('click', (e) => {
      if (e.target.type === 'range') return;
      toggleSound(sound.id);
    });
    card.querySelector(`[data-volume="${sound.id}"]`).addEventListener('input', (e) => {
      e.stopPropagation();
      const val = parseInt(e.target.value);
      card.querySelector('.amb-card-volume span').textContent = val + '%';
      updateVolume(sound.id, val);
    });
    grid.appendChild(card);
  });

  // Master volume
  container.querySelector('#amb-master').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    container.querySelector('#amb-master-val').textContent = val + '%';
    if (masterGain) masterGain.gain.value = val / 100;
  });

  // Timer
  container.querySelector('#amb-timer').addEventListener('change', (e) => {
    startTimer(parseInt(e.target.value));
  });
}
