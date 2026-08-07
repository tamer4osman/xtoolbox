const DEFAULT_FRAME_SIZE = 2048;
const DEFAULT_HOP_SIZE = 512;
const PI2 = 2 * Math.PI;
const CHUNK = 50;

export function hannWindow(n) {
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos((PI2 * i) / (n - 1)));
  return w;
}

export function fft(re, im) {
  const n = re.length;
  if (n === 1) return;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const ang = -PI2 / len;
    const wRe = Math.cos(ang),
      wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1,
        curIm = 0;
      for (let j = 0; j < half; j++) {
        const tRe = curRe * re[i + j + half] - curIm * im[i + j + half];
        const tIm = curRe * im[i + j + half] + curIm * re[i + j + half];
        re[i + j + half] = re[i + j] - tRe;
        im[i + j + half] = im[i + j] - tIm;
        re[i + j] += tRe;
        im[i + j] += tIm;
        const newRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = newRe;
      }
    }
  }
}

export function ifft(re, im) {
  for (let i = 0; i < im.length; i++) im[i] = -im[i];
  fft(re, im);
  const n = re.length;
  for (let i = 0; i < n; i++) {
    re[i] /= n;
    im[i] = -im[i] / n;
  }
}

export function magSpectrum(re, im) {
  const m = new Float32Array(re.length >> 1);
  for (let i = 0; i < m.length; i++) m[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
  return m;
}

export function stft(
  signal,
  { frameSize = DEFAULT_FRAME_SIZE, hopSize = DEFAULT_HOP_SIZE, yieldFn } = {}
) {
  const window = hannWindow(frameSize);
  const nFrames =
    signal.length <= frameSize ? 1 : Math.ceil((signal.length - frameSize) / hopSize) + 1;
  const mags = [],
    phases = [];
  const re = new Float32Array(frameSize);
  const im = new Float32Array(frameSize);
  for (let f = 0; f < nFrames; f++) {
    const start = f * hopSize;
    re.fill(0);
    im.fill(0);
    for (let i = 0; i < frameSize && start + i < signal.length; i++) {
      re[i] = signal[start + i] * window[i];
    }
    fft(re, im);
    mags.push(magSpectrum(re, im));
    const ph = new Float32Array(frameSize >> 1);
    for (let i = 0; i < ph.length; i++) ph[i] = Math.atan2(im[i], re[i]);
    phases.push(ph);
    if (yieldFn && f % CHUNK === CHUNK - 1) yieldFn();
  }
  return { mags, phases, nFrames };
}

export function istft(
  mags,
  phases,
  outputLength,
  { frameSize = DEFAULT_FRAME_SIZE, hopSize = DEFAULT_HOP_SIZE, yieldFn } = {}
) {
  const window = hannWindow(frameSize);
  const output = new Float32Array(outputLength);
  const windowSum = new Float32Array(outputLength);
  const re = new Float32Array(frameSize);
  const im = new Float32Array(frameSize);
  for (let f = 0; f < mags.length; f++) {
    re.fill(0);
    im.fill(0);
    const halfLen = mags[f].length;
    for (let i = 0; i < halfLen; i++) {
      re[i] = mags[f][i] * Math.cos(phases[f][i]);
      im[i] = mags[f][i] * Math.sin(phases[f][i]);
    }
    for (let i = halfLen; i < frameSize; i++) {
      re[i] = re[frameSize - i];
      im[i] = -im[frameSize - i];
    }
    ifft(re, im);
    const start = f * hopSize;
    for (let i = 0; i < frameSize && start + i < outputLength; i++) {
      output[start + i] += re[i] * window[i];
      windowSum[start + i] += window[i] * window[i];
    }
    if (yieldFn && f % CHUNK === CHUNK - 1) yieldFn();
  }
  for (let i = 0; i < outputLength; i++) {
    if (windowSum[i] > 1e-8) output[i] /= windowSum[i];
  }
  return output;
}

function wrapPhase(angle) {
  while (angle > Math.PI) angle -= PI2;
  while (angle < -Math.PI) angle += PI2;
  return angle;
}

export function phaseVocoder(
  mags,
  phases,
  ratio,
  { frameSize = DEFAULT_FRAME_SIZE, hopSize = DEFAULT_HOP_SIZE, inputLength, yieldFn } = {}
) {
  const bins = mags[0].length;
  const omega = new Float64Array(bins);
  for (let k = 0; k < bins; k++) omega[k] = (PI2 * k) / frameSize;
  const synthHop = Math.max(1, hopSize * ratio);
  const outputLength =
    inputLength != null
      ? Math.max(frameSize, Math.round(inputLength * ratio))
      : Math.max(frameSize, Math.round((mags.length - 1) * synthHop + frameSize));
  const lastFrame = mags[mags.length - 1];
  const synthFrames = Math.ceil((outputLength - frameSize) / synthHop) + 1;
  const output = new Float32Array(outputLength);
  const windowSum = new Float32Array(outputLength);
  const window = hannWindow(frameSize);
  const re = new Float32Array(frameSize);
  const im = new Float32Array(frameSize);
  const prevPhase = new Float64Array(bins);
  const phaseAccum = new Float32Array(bins);
  const newMags = new Float32Array(bins);
  const newPhases = new Float32Array(bins);

  for (let s = 0; s < synthFrames; s++) {
    const src = s < mags.length ? mags[s] : lastFrame;
    const prevPh = prevPhase;
    for (let k = 0; k < bins; k++) {
      const thisPhase = phases[Math.min(s, mags.length - 1)][k];
      const measured = thisPhase - prevPh[k];
      const deviation = wrapPhase(measured - omega[k] * hopSize);
      const trueFreq = omega[k] + deviation / hopSize;
      phaseAccum[k] += trueFreq * synthHop;
      newPhases[k] = phaseAccum[k];
      prevPh[k] = thisPhase;
      newMags[k] = src[k];
    }
    re.fill(0);
    im.fill(0);
    for (let k = 0; k < bins; k++) {
      re[k] = newMags[k] * Math.cos(newPhases[k]);
      im[k] = newMags[k] * Math.sin(newPhases[k]);
    }
    for (let k = bins; k < frameSize; k++) {
      re[k] = re[frameSize - k];
      im[k] = -im[frameSize - k];
    }
    ifft(re, im);
    const start = Math.round(s * synthHop);
    for (let i = 0; i < frameSize && start + i < outputLength; i++) {
      output[start + i] += re[i] * window[i];
      windowSum[start + i] += window[i] * window[i];
    }
    if (yieldFn && s % CHUNK === CHUNK - 1) yieldFn();
  }

  const result = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    if (windowSum[i] > 1e-8) result[i] = output[i] / windowSum[i];
  }
  return result;
}

export function resampleLinear(samples, outputLength) {
  const out = new Float32Array(outputLength);
  const ratio = outputLength / Math.max(1, samples.length);
  for (let i = 0; i < outputLength; i++) {
    const pos = i / ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = samples[idx] || 0;
    const b = idx + 1 < samples.length ? samples[idx + 1] : a;
    out[i] = a + (b - a) * frac;
  }
  return out;
}

export function pitchShift(
  samples,
  semitones,
  { frameSize = DEFAULT_FRAME_SIZE, hopSize = DEFAULT_HOP_SIZE, yieldFn } = {}
) {
  if (semitones === 0) return Float32Array.from(samples);
  const ratio = Math.pow(2, semitones / 12);
  const { mags, phases } = stft(samples, { frameSize, hopSize, yieldFn });
  const stretched = phaseVocoder(mags, phases, ratio, {
    frameSize,
    hopSize,
    inputLength: samples.length,
    yieldFn
  });
  return resampleLinear(stretched, samples.length);
}
