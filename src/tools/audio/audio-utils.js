import { downloadBlob } from '../../utils/file.js';

const audioContext = () => new (window.AudioContext || window.webkitAudioContext)();

/**
 * Load audio file into AudioBuffer
 */
export async function loadAudioFile(file) {
  const ctx = audioContext();
  const arrayBuffer = await file.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
}

/**
 * Get audio duration from file
 */
export async function getAudioDuration(file) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    };
    audio.onerror = () => resolve(0);
    audio.src = URL.createObjectURL(file);
  });
}

/**
 * Convert AudioBuffer to WAV Blob
 */
export function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = buffer.length * blockAlign;
  const headerSize = 44;
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channels
  const channels = [];
  for (let i = 0; i < numChannels; i++) channels.push(buffer.getChannelData(i));

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
}

/**
 * Create AudioBuffer from Float32Array samples
 */
export function createAudioBuffer(samples, sampleRate, numChannels = 1) {
  const ctx = audioContext();
  const buffer = ctx.createBuffer(numChannels, samples.length, sampleRate);
  buffer.getChannelData(0).set(samples);
  return buffer;
}

/**
 * Slice AudioBuffer between start and end seconds
 */
export function sliceAudioBuffer(buffer, startTime, endTime) {
  const ctx = audioContext();
  const sampleRate = buffer.sampleRate;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor(endTime * sampleRate);
  const length = endSample - startSample;

  const newBuffer = ctx.createBuffer(buffer.numberOfChannels, length, sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const source = buffer.getChannelData(ch);
    const dest = newBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      dest[i] = source[startSample + i] || 0;
    }
  }
  return newBuffer;
}

/**
 * Concatenate multiple AudioBuffers
 */
export function concatAudioBuffers(buffers) {
  const ctx = audioContext();
  const sampleRate = buffers[0].sampleRate;
  const numChannels = Math.max(...buffers.map(b => b.numberOfChannels));
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);

  const result = ctx.createBuffer(numChannels, totalLength, sampleRate);
  let offset = 0;
  for (const buffer of buffers) {
    for (let ch = 0; ch < numChannels; ch++) {
      const source = ch < buffer.numberOfChannels ? buffer.getChannelData(ch) : buffer.getChannelData(0);
      result.getChannelData(ch).set(source, offset);
    }
    offset += buffer.length;
  }
  return result;
}

/**
 * Apply gain to AudioBuffer
 */
export function applyGain(buffer, gain) {
  return mapBuffer(buffer, (sample) => Math.max(-1, Math.min(1, sample * gain)));
}

/**
 * Get peak level of AudioBuffer (0-1)
 */
export function getPeakLevel(buffer) {
  let peak = 0;
  forEachSample(buffer, (sample) => {
    const abs = Math.abs(sample);
    if (abs > peak) peak = abs;
  });
  return peak;
}

/**
 * Reverse AudioBuffer
 */
export function reverseAudioBuffer(buffer) {
  return mapBuffer(buffer, (_sample, i, source) => source[source.length - 1 - i]);
}

function mapBuffer(buffer, fn) {
  const ctx = audioContext();
  const out = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const source = buffer.getChannelData(ch);
    const dest = out.getChannelData(ch);
    for (let i = 0; i < source.length; i++) {
      dest[i] = fn(source[i], i, source);
    }
  }
  return out;
}

function forEachSample(buffer, fn) {
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      fn(data[i], i, ch);
    }
  }
}

/**
 * Change speed of AudioBuffer (resample)
 */
export function changeSpeed(buffer, speed) {
  const ctx = audioContext();
  const newLength = Math.floor(buffer.length / speed);
  const newBuffer = ctx.createBuffer(buffer.numberOfChannels, newLength, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const source = buffer.getChannelData(ch);
    const dest = newBuffer.getChannelData(ch);
    for (let i = 0; i < newLength; i++) {
      const srcIdx = i * speed;
      const idx = Math.floor(srcIdx);
      const frac = srcIdx - idx;
      dest[i] = idx + 1 < source.length
        ? source[idx] * (1 - frac) + source[idx + 1] * frac
        : (source[idx] || 0);
    }
  }
  return newBuffer;
}

/**
 * Format seconds to MM:SS
 */
export function formatAudioTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Draw simple waveform on canvas
 */
export function drawWaveform(buffer, canvas, color = '#2563EB') {
  const ctx = canvas.getContext('2d');
  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / canvas.width);
  const amp = canvas.height / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < canvas.width; i++) {
    let min = 1, max = -1;
    for (let j = 0; j < step; j++) {
      const datum = data[i * step + j] || 0;
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
  }
}
