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

export function render(container) {
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
  style.textContent = `
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
  container.appendChild(style);

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
    }
    return audioCtx;
  }

  function createNoise(ctx, type) {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === 'brown') {
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  function createSoundNodes(ctx, soundId) {
    const gain = ctx.createGain();
    gain.gain.value = 0.5;

    let nodes = [];

    if (soundId === 'rain') {
      // Layer 1: steady rain hiss
      const n1 = createNoise(ctx, 'white');
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.value = 4000;
      f1.Q.value = 0.3;
      const g1 = ctx.createGain();
      g1.gain.value = 0.3;
      n1.connect(f1).connect(g1).connect(gain);
      nodes.push(n1);

      // Layer 2: deeper rain rumble
      const n2 = createNoise(ctx, 'brown');
      const f2 = ctx.createBiquadFilter();
      f2.type = 'lowpass';
      f2.frequency.value = 800;
      const g2 = ctx.createGain();
      g2.gain.value = 0.15;
      n2.connect(f2).connect(g2).connect(gain);
      nodes.push(n2);

      // Layer 3: occasional drip modulation
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 0.3;
      lfoG.gain.value = 0.1;
      lfo.connect(lfoG).connect(g1.gain);
      lfo.start();
      nodes.push(lfo);

    } else if (soundId === 'cafe') {
      // Layer 1: warm chatter band
      const n1 = createNoise(ctx, 'pink');
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.value = 600;
      f1.Q.value = 0.8;
      const g1 = ctx.createGain();
      g1.gain.value = 0.25;
      n1.connect(f1).connect(g1).connect(gain);
      nodes.push(n1);

      // Layer 2: clink/rustle high band
      const n2 = createNoise(ctx, 'white');
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.value = 2500;
      f2.Q.value = 1.5;
      const g2 = ctx.createGain();
      g2.gain.value = 0.06;
      n2.connect(f2).connect(g2).connect(gain);
      nodes.push(n2);

      // Layer 3: low ambient rumble
      const n3 = createNoise(ctx, 'brown');
      const f3 = ctx.createBiquadFilter();
      f3.type = 'lowpass';
      f3.frequency.value = 200;
      const g3 = ctx.createGain();
      g3.gain.value = 0.12;
      n3.connect(f3).connect(g3).connect(gain);
      nodes.push(n3);

      // Slow modulation for liveliness
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 0.08;
      lfoG.gain.value = 0.08;
      lfo.connect(lfoG).connect(g1.gain);
      lfo.start();
      nodes.push(lfo);

    } else if (soundId === 'brown') {
      const n = createNoise(ctx, 'brown');
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 400;
      n.connect(f).connect(gain);
      nodes.push(n);

    } else if (soundId === 'waves') {
      // Layer 1: base wash
      const n1 = createNoise(ctx, 'white');
      const f1 = ctx.createBiquadFilter();
      f1.type = 'lowpass';
      f1.frequency.value = 600;
      f1.Q.value = 0.5;
      const g1 = ctx.createGain();
      g1.gain.value = 0.4;
      n1.connect(f1).connect(g1).connect(gain);
      nodes.push(n1);

      // Layer 2: foam/spray
      const n2 = createNoise(ctx, 'pink');
      const f2 = ctx.createBiquadFilter();
      f2.type = 'highpass';
      f2.frequency.value = 3000;
      const g2 = ctx.createGain();
      g2.gain.value = 0.08;
      n2.connect(f2).connect(g2).connect(gain);
      nodes.push(n2);

      // Slow wave LFO
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.08;
      lfoG.gain.value = 300;
      lfo.connect(lfoG).connect(f1.frequency);
      lfo.start();
      nodes.push(lfo);

      // Second LFO for volume swell
      const lfo2 = ctx.createOscillator();
      const lfoG2 = ctx.createGain();
      lfo2.type = 'sine';
      lfo2.frequency.value = 0.06;
      lfoG2.gain.value = 0.15;
      lfo2.connect(lfoG2).connect(g1.gain);
      lfo2.start();
      nodes.push(lfo2);

    } else if (soundId === 'wind') {
      // Layer 1: main wind body
      const n1 = createNoise(ctx, 'brown');
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.value = 400;
      f1.Q.value = 0.4;
      const g1 = ctx.createGain();
      g1.gain.value = 0.35;
      n1.connect(f1).connect(g1).connect(gain);
      nodes.push(n1);

      // Layer 2: whistling edge
      const n2 = createNoise(ctx, 'white');
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.value = 1200;
      f2.Q.value = 3;
      const g2 = ctx.createGain();
      g2.gain.value = 0.04;
      n2.connect(f2).connect(g2).connect(gain);
      nodes.push(n2);

      // Gusts LFO
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12;
      lfoG.gain.value = 0.2;
      lfo.connect(lfoG).connect(g1.gain);
      lfo.start();
      nodes.push(lfo);

      // Pitch variation
      const lfo2 = ctx.createOscillator();
      const lfoG2 = ctx.createGain();
      lfo2.frequency.value = 0.07;
      lfoG2.gain.value = 150;
      lfo2.connect(lfoG2).connect(f1.frequency);
      lfo2.start();
      nodes.push(lfo2);

    } else if (soundId === 'fire') {
      // Layer 1: base crackle
      const n1 = createNoise(ctx, 'brown');
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.value = 1500;
      f1.Q.value = 1.5;
      const g1 = ctx.createGain();
      g1.gain.value = 0.2;
      n1.connect(f1).connect(g1).connect(gain);
      nodes.push(n1);

      // Layer 2: high crackle pops
      const n2 = createNoise(ctx, 'white');
      const f2 = ctx.createBiquadFilter();
      f2.type = 'highpass';
      f2.frequency.value = 4000;
      const g2 = ctx.createGain();
      g2.gain.value = 0.05;
      n2.connect(f2).connect(g2).connect(gain);
      nodes.push(n2);

      // Layer 3: low ember rumble
      const n3 = createNoise(ctx, 'brown');
      const f3 = ctx.createBiquadFilter();
      f3.type = 'lowpass';
      f3.frequency.value = 300;
      const g3 = ctx.createGain();
      g3.gain.value = 0.1;
      n3.connect(f3).connect(g3).connect(gain);
      nodes.push(n3);

      // Random flicker modulation
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.type = 'square';
      lfo.frequency.value = 3;
      lfoG.gain.value = 0.08;
      lfo.connect(lfoG).connect(g2.gain);
      lfo.start();
      nodes.push(lfo);

    } else if (soundId === 'thunder') {
      // Layer 1: deep rumble
      const n1 = createNoise(ctx, 'brown');
      const f1 = ctx.createBiquadFilter();
      f1.type = 'lowpass';
      f1.frequency.value = 100;
      f1.Q.value = 1;
      const g1 = ctx.createGain();
      g1.gain.value = 0.4;
      n1.connect(f1).connect(g1).connect(gain);
      nodes.push(n1);

      // Layer 2: mid crack
      const n2 = createNoise(ctx, 'white');
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.value = 300;
      f2.Q.value = 0.8;
      const g2 = ctx.createGain();
      g2.gain.value = 0.1;
      n2.connect(f2).connect(g2).connect(gain);
      nodes.push(n2);

      // Layer 3: rain underlay
      const n3 = createNoise(ctx, 'white');
      const f3 = ctx.createBiquadFilter();
      f3.type = 'bandpass';
      f3.frequency.value = 3000;
      f3.Q.value = 0.3;
      const g3 = ctx.createGain();
      g3.gain.value = 0.06;
      n3.connect(f3).connect(g3).connect(gain);
      nodes.push(n3);

      // Slow rumble modulation
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 0.05;
      lfoG.gain.value = 0.15;
      lfo.connect(lfoG).connect(g1.gain);
      lfo.start();
      nodes.push(lfo);

    } else if (soundId === 'birds') {
      // Multiple bird-like oscillators with different chirp rates
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 1800 + i * 600;

        const chirpLfo = ctx.createOscillator();
        const chirpG = ctx.createGain();
        chirpLfo.frequency.value = 2 + i * 1.5;
        chirpG.gain.value = 0.06;
        chirpLfo.connect(chirpG).connect(osc.frequency);
        chirpLfo.start();

        const ampLfo = ctx.createOscillator();
        const ampG = ctx.createGain();
        ampLfo.frequency.value = 0.3 + i * 0.2;
        ampG.gain.value = 0.015;
        ampLfo.connect(ampG).connect(gain.gain);
        ampLfo.start();

        osc.start();
        const mixG = ctx.createGain();
        mixG.gain.value = 0.03;
        osc.connect(mixG).connect(gain);
        nodes.push(osc, chirpLfo, ampLfo);
      }
    }

    gain.connect(masterGain);
    nodes.forEach(n => { try { n.start(); } catch {} });
    return { gain, nodes };
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
      const soundNodes = createSoundNodes(ctx, soundId);
      activeSounds[soundId] = soundNodes;
      card.classList.add('active');
      card.querySelector('.amb-card-status').textContent = 'Playing';
    }
  }

  function updateVolume(soundId, value) {
    if (activeSounds[soundId]) {
      activeSounds[soundId].gain.gain.value = value / 100;
    }
  }

  // Render cards
  const grid = container.querySelector('#amb-grid');
  SOUNDS.forEach(sound => {
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
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 0;
    const display = container.querySelector('#amb-timer-display');
    const minutes = parseInt(e.target.value);
    if (minutes === 0) {
      display.textContent = '';
      return;
    }
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
  });

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ':' + String(sec).padStart(2, '0');
  }
}
