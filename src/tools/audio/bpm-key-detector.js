import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { loadAudioFile } from "./audio-utils.js";

export const toolConfig = {
  id: "bpm-key-detector",
  name: "BPM & Key Detector",
  category: "audio",
  description: "Detect tempo (BPM) and musical key of any audio file.",
  icon: "🥁",
  accept: "audio/*",
  maxSizeMB: 100,
  keywords: ["bpm", "tempo", "key", "music", "detect", "beat"],
  steps: ["Upload an audio file", "View detected BPM and key", "Check confidence scores"],
  faqs: [
    {
      question: "What is BPM?",
      answer: "BPM stands for Beats Per Minute, which indicates the tempo of a song.",
    },
    {
      question: "How accurate is key detection?",
      answer:
        "Key detection works best on music with clear harmonic content. Results may vary with complex arrangements.",
    },
  ],
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const KK_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KK_MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export function getSamplesFromBuffer(buffer) {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const ch0 = buffer.getChannelData(0);
  const ch1 = buffer.getChannelData(1);
  const mixed = new Float32Array(ch0.length);
  for (let i = 0; i < ch0.length; i++) mixed[i] = (ch0[i] + ch1[i]) / 2;
  return mixed;
}

export function computeAutocorrelation(samples, maxLag) {
  const ac = new Float32Array(maxLag);
  for (let lag = 0; lag < maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < samples.length - lag; i++) sum += samples[i] * samples[i + lag];
    ac[lag] = sum;
  }
  return ac;
}

export function detectOnsets(samples, sampleRate, hopSize = 1024) {
  const windowSize = 2048;
  const numFrames = Math.max(0, Math.floor((samples.length - windowSize) / hopSize));
  const energy = new Float32Array(numFrames);
  for (let i = 0; i < numFrames; i++) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) sum += samples[i * hopSize + j] ** 2;
    energy[i] = sum / windowSize;
  }
  const onsetTimes = [];
  const threshold = 0.02;
  for (let i = 1; i < numFrames - 1; i++) {
    if (energy[i] > threshold && energy[i] > energy[i - 1] && energy[i] >= energy[i + 1]) {
      onsetTimes.push((i * hopSize) / sampleRate);
    }
  }
  return onsetTimes;
}

export function detectBPM(onsetTimes) {
  if (onsetTimes.length < 2) return { bpm: 0, confidence: 0 };
  const intervals = [];
  for (let i = 1; i < onsetTimes.length; i++) intervals.push(onsetTimes[i] - onsetTimes[i - 1]);
  if (intervals.length === 0) return { bpm: 0, confidence: 0 };
  const histogram = new Map();
  for (const interval of intervals) {
    const bpm = Math.round(60 / interval);
    if (bpm >= 60 && bpm <= 200) histogram.set(bpm, (histogram.get(bpm) || 0) + 1);
  }
  let bestBpm = 0;
  let bestCount = 0;
  for (const [bpm, count] of histogram) {
    if (count > bestCount) {
      bestCount = count;
      bestBpm = bpm;
    }
  }
  const confidence = Math.min(1, bestCount / Math.max(1, intervals.length));
  return { bpm: bestBpm, confidence };
}

export function computeChroma(samples, sampleRate, frameSize = 4096) {
  const chromaAccum = new Float64Array(12);
  let frameCount = 0;
  for (let offset = 0; offset + frameSize <= samples.length; offset += frameSize) {
    const frame = samples.slice(offset, offset + frameSize);
    const spectrum = fftMagnitude(frame);
    for (let bin = 1; bin < spectrum.length / 2; bin++) {
      const freq = (bin * sampleRate) / frameSize;
      if (freq < 65 || freq > 2093) continue;
      const midi = 12 * Math.log2(freq / 440) + 69;
      const pitchClass = Math.round(midi) % 12;
      chromaAccum[pitchClass < 0 ? pitchClass + 12 : pitchClass] += spectrum[bin];
    }
    frameCount++;
  }
  if (frameCount > 0) {
    let maxVal = 0;
    for (let i = 0; i < 12; i++) chromaAccum[i] /= frameCount;
    for (let i = 0; i < 12; i++) if (chromaAccum[i] > maxVal) maxVal = chromaAccum[i];
    if (maxVal > 0) for (let i = 0; i < 12; i++) chromaAccum[i] /= maxVal;
  }
  return chromaAccum;
}

function fftMagnitude(frame) {
  const n = frame.length;
  const real = new Float64Array(n);
  const imag = new Float64Array(n);
  for (let i = 0; i < n; i++) real[i] = frame[i];
  fftInPlace(real, imag);
  const mag = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) mag[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
  return mag;
}

function fftInPlace(real, imag) {
  const n = real.length;
  if (n === 0) return;
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wReal = Math.cos(angle);
    const wImag = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let curReal = 1;
      let curImag = 0;
      for (let k = 0; k < halfLen; k++) {
        const tReal = curReal * real[i + k + halfLen] - curImag * imag[i + k + halfLen];
        const tImag = curReal * imag[i + k + halfLen] + curImag * real[i + k + halfLen];
        real[i + k + halfLen] = real[i + k] - tReal;
        imag[i + k + halfLen] = imag[i + k] - tImag;
        real[i + k] += tReal;
        imag[i + k] += tImag;
        const newReal = curReal * wReal - curImag * wImag;
        curImag = curReal * wImag + curImag * wReal;
        curReal = newReal;
      }
    }
  }
}

export function detectKey(chroma) {
  let bestKey = 0;
  let bestMode = "major";
  let bestCorr = -2;
  const scores = [];
  for (let shift = 0; shift < 12; shift++) {
    const rotated = new Float64Array(12);
    for (let i = 0; i < 12; i++) rotated[i] = chroma[(i + shift) % 12];
    const corrMajor = pearsonCorrelation(rotated, KK_MAJOR);
    const corrMinor = pearsonCorrelation(rotated, KK_MINOR);
    scores.push({
      tonic: shift,
      mode: "major",
      label: NOTE_NAMES[shift],
      confidence: Math.max(0, corrMajor),
    });
    scores.push({
      tonic: shift,
      mode: "minor",
      label: NOTE_NAMES[shift] + "m",
      confidence: Math.max(0, corrMinor),
    });
    if (corrMajor > bestCorr) {
      bestCorr = corrMajor;
      bestKey = shift;
      bestMode = "major";
    }
    if (corrMinor > bestCorr) {
      bestCorr = corrMinor;
      bestKey = shift;
      bestMode = "minor";
    }
  }
  scores.sort((a, b) => b.confidence - a.confidence);
  return {
    tonic: bestKey,
    mode: bestMode,
    label: NOTE_NAMES[bestKey] + (bestMode === "minor" ? "m" : ""),
    confidence: Math.max(0, bestCorr),
    scores,
  };
}

export function pearsonCorrelation(x, y) {
  const n = Math.min(x.length, y.length);
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return den === 0 ? 0 : num / den;
}

export function formatBPM(bpm) {
  return bpm > 0 ? bpm.toFixed(1) : "--";
}

export function formatKey(key) {
  return key.label || "--";
}

export function render(container) {
  let audioBuffer = null;

  const upload = createFileUpload({
    accept: "audio/*",
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      try {
        audioBuffer = await loadAudioFile(files[0]);
        optionsArea.style.display = "block";
        resultsArea.style.display = "none";
        analyzeBtn.disabled = false;
        showToast({ message: "Audio loaded. Click Analyze.", type: "success" });
      } catch {
        showToast({ message: "Failed to load audio file.", type: "error" });
      }
    },
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <button class="btn btn-primary btn-lg" id="analyze-btn" style="width:100%;">Analyze BPM & Key</button>
      </div>
      <div id="results-area" style="display:none;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4);">
          <div style="background:var(--color-bg-secondary);border-radius:var(--radius-lg);padding:var(--space-6);text-align:center;">
            <div style="font-size:var(--text-4xl);font-weight:700;color:var(--color-primary);" id="bpm-value">--</div>
            <div style="color:var(--color-text-muted);margin-top:var(--space-2);">BPM</div>
            <div style="font-size:var(--text-sm);color:var(--color-text-muted);" id="bpm-confidence"></div>
          </div>
          <div style="background:var(--color-bg-secondary);border-radius:var(--radius-lg);padding:var(--space-6);text-align:center;">
            <div style="font-size:var(--text-4xl);font-weight:700;color:var(--color-primary);" id="key-value">--</div>
            <div style="color:var(--color-text-muted);margin-top:var(--space-2);">Key</div>
            <div style="font-size:var(--text-sm);color:var(--color-text-muted);" id="key-confidence"></div>
          </div>
        </div>
        <div id="key-details" style="background:var(--color-bg-secondary);border-radius:var(--radius-lg);padding:var(--space-4);"></div>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const resultsArea = container.querySelector("#results-area");
  const analyzeBtn = container.querySelector("#analyze-btn");

  analyzeBtn.addEventListener("click", () => {
    if (!audioBuffer) return;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    setTimeout(() => {
      try {
        const samples = getSamplesFromBuffer(audioBuffer);
        const sampleRate = audioBuffer.sampleRate;
        const onsetTimes = detectOnsets(samples, sampleRate);
        const bpmResult = detectBPM(onsetTimes);
        const chroma = computeChroma(samples, sampleRate);
        const keyResult = detectKey(chroma);
        container.querySelector("#bpm-value").textContent = formatBPM(bpmResult.bpm);
        container.querySelector("#bpm-confidence").textContent =
          `Confidence: ${(bpmResult.confidence * 100).toFixed(0)}%`;
        container.querySelector("#key-value").textContent = formatKey(keyResult);
        container.querySelector("#key-confidence").textContent =
          `Confidence: ${(keyResult.confidence * 100).toFixed(0)}%`;
        const keyDetails = container.querySelector("#key-details");
        const top5 = keyResult.scores.slice(0, 5);
        keyDetails.innerHTML = `
          <div style="font-weight:600;margin-bottom:var(--space-2);">Top 5 Key Candidates</div>
          ${top5
            .map(
              (s, i) => `
            <div style="display:flex;justify-content:space-between;padding:var(--space-1) 0;${i === 0 ? "font-weight:600;" : ""}">
              <span>${s.label}</span>
              <span>${(s.confidence * 100).toFixed(1)}%</span>
            </div>
          `,
            )
            .join("")}
        `;
        resultsArea.style.display = "block";
        analyzeBtn.textContent = "Analyze Again";
        analyzeBtn.disabled = false;
      } catch {
        showToast({ message: "Analysis failed. Try a different audio file.", type: "error" });
        analyzeBtn.textContent = "Analyze BPM & Key";
        analyzeBtn.disabled = false;
      }
    }, 50);
  });
}

export function destroy() {}
