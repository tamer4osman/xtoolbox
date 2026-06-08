export function createNoise(ctx, type) {
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

function makeLayer(ctx, noiseType, filterType, freq, q, gainVal, output) {
  const n = createNoise(ctx, noiseType);
  const f = ctx.createBiquadFilter();
  f.type = filterType;
  f.frequency.value = freq;
  if (q !== undefined) f.Q.value = q;
  const g = ctx.createGain();
  g.gain.value = gainVal;
  n.connect(f).connect(g).connect(output);
  return { source: n, filter: f, gain: g };
}

function makeLfo(ctx, type, freq, gainVal, target) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  g.gain.value = gainVal;
  osc.connect(g).connect(target);
  return { osc, gain: g };
}

const SOUND_CREATORS = {
  rain(ctx, gain) {
    const nodes = [];
    const l1 = makeLayer(ctx, 'white', 'bandpass', 4000, 0.3, 0.3, gain);
    nodes.push(l1.source);
    const l2 = makeLayer(ctx, 'brown', 'lowpass', 800, undefined, 0.15, gain);
    nodes.push(l2.source);
    const lfo = makeLfo(ctx, 'sine', 0.3, 0.1, l1.gain.gain);
    lfo.osc.start();
    nodes.push(lfo.osc);
    return nodes;
  },

  cafe(ctx, gain) {
    const nodes = [];
    const l1 = makeLayer(ctx, 'pink', 'bandpass', 600, 0.8, 0.25, gain);
    nodes.push(l1.source);
    const l2 = makeLayer(ctx, 'white', 'bandpass', 2500, 1.5, 0.06, gain);
    nodes.push(l2.source);
    const l3 = makeLayer(ctx, 'brown', 'lowpass', 200, undefined, 0.12, gain);
    nodes.push(l3.source);
    const lfo = makeLfo(ctx, 'sine', 0.08, 0.08, l1.gain.gain);
    lfo.osc.start();
    nodes.push(lfo.osc);
    return nodes;
  },

  brown(ctx, gain) {
    const nodes = [];
    const l = makeLayer(ctx, 'brown', 'lowpass', 400, undefined, 1, gain);
    nodes.push(l.source);
    return nodes;
  },

  waves(ctx, gain) {
    const nodes = [];
    const l1 = makeLayer(ctx, 'white', 'lowpass', 600, 0.5, 0.4, gain);
    nodes.push(l1.source);
    const l2 = makeLayer(ctx, 'pink', 'highpass', 3000, undefined, 0.08, gain);
    nodes.push(l2.source);
    const lfo1 = makeLfo(ctx, 'sine', 0.08, 300, l1.filter.frequency);
    lfo1.osc.start();
    nodes.push(lfo1.osc);
    const lfo2 = makeLfo(ctx, 'sine', 0.06, 0.15, l1.gain.gain);
    lfo2.osc.start();
    nodes.push(lfo2.osc);
    return nodes;
  },

  wind(ctx, gain) {
    const nodes = [];
    const l1 = makeLayer(ctx, 'brown', 'bandpass', 400, 0.4, 0.35, gain);
    nodes.push(l1.source);
    const l2 = makeLayer(ctx, 'white', 'bandpass', 1200, 3, 0.04, gain);
    nodes.push(l2.source);
    const lfo1 = makeLfo(ctx, 'sine', 0.12, 0.2, l1.gain.gain);
    lfo1.osc.start();
    nodes.push(lfo1.osc);
    const lfo2 = makeLfo(ctx, 'sine', 0.07, 150, l1.filter.frequency);
    lfo2.osc.start();
    nodes.push(lfo2.osc);
    return nodes;
  },

  fire(ctx, gain) {
    const nodes = [];
    const l1 = makeLayer(ctx, 'brown', 'bandpass', 1500, 1.5, 0.2, gain);
    nodes.push(l1.source);
    const l2 = makeLayer(ctx, 'white', 'highpass', 4000, undefined, 0.05, gain);
    nodes.push(l2.source);
    const l3 = makeLayer(ctx, 'brown', 'lowpass', 300, undefined, 0.1, gain);
    nodes.push(l3.source);
    const lfo = makeLfo(ctx, 'square', 3, 0.08, l2.gain.gain);
    lfo.osc.start();
    nodes.push(lfo.osc);
    return nodes;
  },

  thunder(ctx, gain) {
    const nodes = [];
    const l1 = makeLayer(ctx, 'brown', 'lowpass', 100, 1, 0.4, gain);
    nodes.push(l1.source);
    const l2 = makeLayer(ctx, 'white', 'bandpass', 300, 0.8, 0.1, gain);
    nodes.push(l2.source);
    const l3 = makeLayer(ctx, 'white', 'bandpass', 3000, 0.3, 0.06, gain);
    nodes.push(l3.source);
    const lfo = makeLfo(ctx, 'sine', 0.05, 0.15, l1.gain.gain);
    lfo.osc.start();
    nodes.push(lfo.osc);
    return nodes;
  },

  birds(ctx, gain) {
    const nodes = [];
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
    return nodes;
  }
};

export function createSoundNodes(ctx, soundId) {
  const gain = ctx.createGain();
  gain.gain.value = 0.5;
  const creator = SOUND_CREATORS[soundId];
  const nodes = creator ? creator(ctx, gain) : [];
  gain.connect(ctx._masterGain || ctx.destination);
  nodes.forEach(n => { try { n.start(); } catch {} });
  return { gain, nodes };
}
