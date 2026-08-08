import { fft } from "../../tools/audio/dsp.js";

export const SAMPLE_RATE = 8000;

export function tone(frequency, seconds) {
  const n = Math.floor(SAMPLE_RATE * seconds);
  const signal = new Float32Array(n);
  for (let i = 0; i < n; i++)
    signal[i] = 0.6 * Math.sin((2 * Math.PI * frequency * i) / SAMPLE_RATE);
  return signal;
}

export function dominantPeak(samples) {
  const fftSize = 2048;
  const n = Math.min(fftSize, samples.length);
  const re = new Float64Array(fftSize);
  const im = new Float64Array(fftSize);
  for (let i = 0; i < n; i++) re[i] = samples[i];
  fft(re, im);
  const half = fftSize >> 1;
  let peak = 0;
  let peakIdx = 0;
  for (let b = 1; b < half; b++) {
    const m = re[b] * re[b] + im[b] * im[b];
    if (m > peak) {
      peak = m;
      peakIdx = b;
    }
  }
  return (peakIdx * SAMPLE_RATE) / fftSize;
}
