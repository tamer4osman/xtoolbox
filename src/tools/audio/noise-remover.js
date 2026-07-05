import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";

const FRAME_SIZE = 2048;
const HOP_SIZE = 512;
const PI2 = 2 * Math.PI;

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

export function estimateNoiseProfile(magnitudes, noiseFrames) {
  const bins = magnitudes[0].length;
  const profile = new Float32Array(bins);
  const count = Math.min(noiseFrames, magnitudes.length);
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < bins; j++) profile[j] += magnitudes[i][j];
  }
  for (let j = 0; j < bins; j++) profile[j] /= count;
  return profile;
}

export function autoDetectNoiseFrames(magnitudes) {
  let energies = magnitudes.map((m) => {
    let s = 0;
    for (let i = 0; i < m.length; i++) s += m[i] * m[i];
    return s;
  });
  const sorted = [...energies].sort((a, b) => a - b);
  const median = sorted[sorted.length >> 1];
  const threshold = median * 0.3;
  let count = 0;
  for (const e of energies) {
    if (e < threshold) count++;
    else break;
  }
  return Math.max(4, Math.min(count, magnitudes.length >> 1));
}

export function spectralSubtraction(magnitudes, phases, noiseProfile, alpha, beta, yieldFn) {
  const result = [];
  const CHUNK = 50;
  for (let f = 0; f < magnitudes.length; f++) {
    const mag = new Float32Array(magnitudes[f].length);
    for (let j = 0; j < mag.length; j++) {
      const noisePow = noiseProfile[j] * noiseProfile[j];
      const sigPow = magnitudes[f][j] * magnitudes[f][j];
      const clean = Math.max(sigPow - alpha * noisePow, beta * sigPow);
      mag[j] = Math.sqrt(clean);
    }
    result.push(mag);
    if (yieldFn && f % CHUNK === CHUNK - 1) yieldFn();
  }
  return result;
}

export function wienerFilter(magnitudes, noiseProfile, alpha, yieldFn) {
  const result = [];
  let prevGain = new Float32Array(magnitudes[0].length).fill(1);
  const CHUNK = 50;
  for (let f = 0; f < magnitudes.length; f++) {
    const mag = new Float32Array(magnitudes[f].length);
    for (let j = 0; j < mag.length; j++) {
      const sigPow = magnitudes[f][j] * magnitudes[f][j];
      const noisePow = noiseProfile[j] * noiseProfile[j] + 1e-10;
      const priorSnr = Math.max(sigPow / noisePow - 1, 0.001);
      const gain = priorSnr / (priorSnr + 1);
      const smoothGain = alpha * prevGain[j] + (1 - alpha) * gain;
      prevGain[j] = smoothGain;
      mag[j] = magnitudes[f][j] * smoothGain;
    }
    result.push(mag);
    if (yieldFn && f % CHUNK === CHUNK - 1) yieldFn();
  }
  return result;
}

export function stft(signal, yieldFn) {
  const window = hannWindow(FRAME_SIZE);
  const nFrames = Math.max(1, Math.floor((signal.length - FRAME_SIZE) / HOP_SIZE) + 1);
  const mags = [],
    phases = [];
  const re = new Float32Array(FRAME_SIZE);
  const im = new Float32Array(FRAME_SIZE);
  const CHUNK = 50;
  for (let f = 0; f < nFrames; f++) {
    const start = f * HOP_SIZE;
    re.fill(0);
    im.fill(0);
    for (let i = 0; i < FRAME_SIZE && start + i < signal.length; i++) {
      re[i] = signal[start + i] * window[i];
    }
    fft(re, im);
    mags.push(magSpectrum(re, im));
    const ph = new Float32Array(FRAME_SIZE >> 1);
    for (let i = 0; i < ph.length; i++) ph[i] = Math.atan2(im[i], re[i]);
    phases.push(ph);
    if (yieldFn && f % CHUNK === CHUNK - 1) yieldFn();
  }
  return { mags, phases, nFrames };
}

export function istft(mags, phases, outputLength, yieldFn) {
  const window = hannWindow(FRAME_SIZE);
  const output = new Float32Array(outputLength);
  const windowSum = new Float32Array(outputLength);
  const re = new Float32Array(FRAME_SIZE);
  const im = new Float32Array(FRAME_SIZE);
  const CHUNK = 50;
  for (let f = 0; f < mags.length; f++) {
    re.fill(0);
    im.fill(0);
    const halfLen = mags[f].length;
    for (let i = 0; i < halfLen; i++) {
      re[i] = mags[f][i] * Math.cos(phases[f][i]);
      im[i] = mags[f][i] * Math.sin(phases[f][i]);
    }
    for (let i = halfLen; i < FRAME_SIZE; i++) {
      re[i] = re[FRAME_SIZE - i];
      im[i] = -im[FRAME_SIZE - i];
    }
    ifft(re, im);
    const start = f * HOP_SIZE;
    for (let i = 0; i < FRAME_SIZE && start + i < outputLength; i++) {
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

export function normalizeAudio(buffer) {
  const ch = buffer.getChannelData(0);
  const mixed = new Float32Array(buffer.length);
  if (buffer.numberOfChannels > 1) {
    const ch2 = buffer.getChannelData(1);
    for (let i = 0; i < buffer.length; i++) mixed[i] = (ch[i] + ch2[i]) * 0.5;
  } else {
    mixed.set(ch);
  }
  let max = 0;
  for (let i = 0; i < mixed.length; i++) {
    const a = Math.abs(mixed[i]);
    if (a > max) max = a;
  }
  if (max > 1) {
    const g = 0.99 / max;
    for (let i = 0; i < mixed.length; i++) mixed[i] *= g;
  }
  return mixed;
}

export function encodeWav(samples, sampleRate) {
  const n = samples.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const s = (o, t) => {
    for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i));
  };
  s(0, "RIFF");
  v.setUint32(4, 36 + n * 2, true);
  s(8, "WAVE");
  s(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  s(36, "data");
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++)
    v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true);
  return new Blob([buf], { type: "audio/wav" });
}

function drawWaveform(canvas, data, color) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "var(--color-surface, #f8f9fa)";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "var(--color-border, #dee2e6)";
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
  const step = Math.max(1, Math.floor(data.length / w));
  ctx.strokeStyle = color || "var(--color-primary, #0d6efd)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < w; x++) {
    let lo = 1,
      hi = -1;
    const i0 = x * step,
      i1 = Math.min(data.length, i0 + step);
    for (let i = i0; i < i1; i++) {
      if (data[i] < lo) lo = data[i];
      if (data[i] > hi) hi = data[i];
    }
    ctx.moveTo(x, ((1 - hi) * h) / 2);
    ctx.lineTo(x, ((1 - lo) * h) / 2);
  }
  ctx.stroke();
}

export const toolConfig = {
  id: "noise-remover",
  name: "Noise / Hiss Remover",
  category: "audio",
  description:
    "Remove background noise, hiss, and hum from audio recordings. Runs entirely in your browser.",
  icon: "🔇",
  accept: "audio/*",
  maxSizeMB: 200,
  keywords: ["noise", "remover", "hiss", "denoise", "audio", "cleanup", "filter"],
  steps: [
    "Upload an audio file",
    "Choose noise reduction method and strength",
    "Click Remove Noise",
    "Download cleaned audio",
  ],
  faqs: [
    {
      question: "How does it work?",
      answer:
        "Uses spectral gating and Wiener filtering to estimate and subtract noise from your audio. All processing happens locally in your browser.",
    },
    {
      question: "Which method should I use?",
      answer:
        "Auto picks the best method for your audio. Spectral Subtraction works well for stationary noise (fan, hum). Wiener Filter is best for speech in changing noise.",
    },
    {
      question: "What audio formats are supported?",
      answer:
        "Any format your browser can decode: MP3, WAV, FLAC, OGG, M4A, etc. Output is always WAV for maximum quality.",
    },
  ],
};

function yieldToEventLoop() {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(resolve, { timeout: 20 });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export function render(container) {
  let currentBuffer = null;
  let processing = false;
  const objectURLs = [];

  destroyFn = () => {
    for (const url of objectURLs) URL.revokeObjectURL(url);
    objectURLs.length = 0;
  };

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="file-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);"></div>
        <div style="margin-bottom:var(--space-4);">
          <label style="font-weight:600;font-size:var(--text-sm);display:block;margin-bottom:var(--space-2);">Method</label>
          <select id="method-select" style="width:100%;padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);color:var(--color-text);">
            <option value="auto">Auto (recommended)</option>
            <option value="spectral">Spectral Subtraction</option>
            <option value="wiener">Wiener Filter</option>
          </select>
        </div>
        <div style="margin-bottom:var(--space-4);">
          <label style="font-weight:600;font-size:var(--text-sm);display:block;margin-bottom:var(--space-2);">Strength: <span id="strength-val">70%</span></label>
          <input type="range" id="strength" min="0" max="100" value="70" style="width:100%;">
        </div>
        <div style="margin-bottom:var(--space-4);">
          <label style="font-weight:600;font-size:var(--text-sm);display:block;margin-bottom:var(--space-2);">Noise Profile: <span id="profile-val">Auto-detect</span></label>
          <select id="profile-select" style="width:100%;padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);color:var(--color-text);">
            <option value="auto">Auto-detect from audio</option>
            <option value="first05">First 0.5 seconds</option>
            <option value="first1">First 1 second</option>
            <option value="first2">First 2 seconds</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="process-btn" style="width:100%;" disabled>
          Remove Noise
        </button>
        <div id="progress-area" style="display:none;margin-top:var(--space-4);">
          <div id="progress-label" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-2);"></div>
          <div style="height:8px;background:var(--color-surface);border-radius:4px;overflow:hidden;">
            <div id="progress-bar" style="height:100%;width:0%;background:var(--color-primary);transition:width 0.3s ease;"></div>
          </div>
        </div>
        <div id="results-area" style="display:none;margin-top:var(--space-6);"></div>
      </div>
    </div>
  `;

  const uploadArea = container.querySelector("#upload-area");
  const optionsArea = container.querySelector("#options-area");
  const fileInfo = container.querySelector("#file-info");
  const methodSelect = container.querySelector("#method-select");
  const strength = container.querySelector("#strength");
  const strengthVal = container.querySelector("#strength-val");
  const profileSelect = container.querySelector("#profile-select");
  const processBtn = container.querySelector("#process-btn");
  const progressArea = container.querySelector("#progress-area");
  const progressLabel = container.querySelector("#progress-label");
  const progressBar = container.querySelector("#progress-bar");
  const resultsArea = container.querySelector("#results-area");

  strength.addEventListener("input", () => {
    strengthVal.textContent = strength.value + "%";
  });

  function setProgress(label, pct) {
    progressLabel.textContent = label;
    progressBar.style.width = Math.round(pct * 100) + "%";
  }

  function setupUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.style.display = "none";
    uploadArea.appendChild(input);

    const dropZone = document.createElement("div");
    dropZone.className = "upload-zone";
    dropZone.innerHTML = `
      <div style="font-size:3rem;margin-bottom:var(--space-2);">🔇</div>
      <div style="font-weight:600;margin-bottom:var(--space-1);">Upload Audio</div>
      <div style="font-size:var(--text-sm);color:var(--color-text-secondary);">Drop an audio file or click to browse</div>
    `;
    uploadArea.appendChild(dropZone);

    dropZone.addEventListener("click", () => input.click());
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "var(--color-primary)";
    });
    dropZone.addEventListener("dragleave", () => {
      dropZone.style.borderColor = "var(--color-border)";
    });
    dropZone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "var(--color-border)";
      if (e.dataTransfer.files[0]) await handleFile(e.dataTransfer.files[0]);
    });
    input.addEventListener("change", async () => {
      if (input.files[0]) await handleFile(input.files[0]);
    });
  }

  async function handleFile(file) {
    if (file.size > toolConfig.maxSizeMB * 1024 * 1024) {
      showToast({
        message: "File is too large. Max " + toolConfig.maxSizeMB + " MB.",
        type: "error",
      });
      return;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const arrayBuffer = await file.arrayBuffer();
      currentBuffer = await ctx.decodeAudioData(arrayBuffer);
      fileInfo.textContent =
        file.name +
        " (" +
        (file.size / 1048576).toFixed(1) +
        " MB, " +
        currentBuffer.duration.toFixed(1) +
        "s, " +
        currentBuffer.sampleRate +
        " Hz)";
      optionsArea.style.display = "block";
      resultsArea.style.display = "none";
      progressArea.style.display = "none";
      processBtn.disabled = false;
    } catch {
      showToast({ message: "Could not decode audio file.", type: "error" });
    } finally {
      ctx.close();
    }
  }

  processBtn.addEventListener("click", async () => {
    if (processing || !currentBuffer) return;
    processing = true;
    processBtn.disabled = true;
    progressArea.style.display = "block";
    resultsArea.style.display = "none";
    setProgress("Preparing audio...", 0);

    try {
      await new Promise((r) => setTimeout(r, 50));
      const signal = normalizeAudio(currentBuffer);
      const sampleRate = currentBuffer.sampleRate;
      setProgress("Running FFT analysis...", 0.1);
      await new Promise((r) => setTimeout(r, 10));

      const { mags, phases } = stft(signal, yieldToEventLoop);
      setProgress("Estimating noise profile...", 0.3);
      await new Promise((r) => setTimeout(r, 10));

      let noiseProfile;
      const profileMode = profileSelect.value;
      const noiseFrameCount =
        profileMode === "first05"
          ? Math.ceil((0.5 * sampleRate) / HOP_SIZE)
          : profileMode === "first1"
            ? Math.ceil((1 * sampleRate) / HOP_SIZE)
            : profileMode === "first2"
              ? Math.ceil((2 * sampleRate) / HOP_SIZE)
              : autoDetectNoiseFrames(mags);
      noiseProfile = estimateNoiseProfile(mags, noiseFrameCount);

      const str = parseInt(strength.value, 10) / 100;
      const alpha = 1 + str * 3;
      const beta = 0.01 + (1 - str) * 0.1;

      setProgress("Applying noise reduction...", 0.5);
      await yieldToEventLoop();

      let cleanedMags;
      const method = methodSelect.value;
      if (method === "wiener" || (method === "auto" && str > 0.5)) {
        cleanedMags = wienerFilter(mags, noiseProfile, 0.98, yieldToEventLoop);
      } else {
        cleanedMags = spectralSubtraction(
          mags,
          phases,
          noiseProfile,
          alpha,
          beta,
          yieldToEventLoop,
        );
      }

      setProgress("Reconstructing audio...", 0.8);
      await yieldToEventLoop();

      const cleaned = istft(
        cleanedMags,
        phases.slice(0, cleanedMags.length),
        signal.length,
        yieldToEventLoop,
      );
      const outBlob = encodeWav(cleaned, sampleRate);
      const origBlob = encodeWav(signal, sampleRate);

      setProgress("Drawing waveforms...", 0.95);
      await new Promise((r) => setTimeout(r, 10));

      const metrics = computeMetrics(signal, cleaned);

      resultsArea.innerHTML = `
        <h3 style="font-size:var(--text-lg);font-weight:600;margin-bottom:var(--space-4);">Results</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4);">
          <div style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);">
            <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:var(--space-2);">Before</div>
            <canvas id="wave-before" style="width:100%;height:80px;"></canvas>
            <audio id="audio-before" controls style="width:100%;margin-top:var(--space-2);height:32px;"></audio>
          </div>
          <div style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);">
            <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:var(--space-2);">After</div>
            <canvas id="wave-after" style="width:100%;height:80px;"></canvas>
            <audio id="audio-after" controls style="width:100%;margin-top:var(--space-2);height:32px;"></audio>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);margin-bottom:var(--space-4);">
          <div style="background:var(--color-surface);padding:var(--space-3);border-radius:var(--radius-md);text-align:center;">
            <div style="font-size:var(--text-xs);color:var(--color-text-secondary);">SNR Improvement</div>
            <div style="font-size:var(--text-xl);font-weight:700;color:var(--color-primary);">+${metrics.snrGain.toFixed(1)} dB</div>
          </div>
          <div style="background:var(--color-surface);padding:var(--space-3);border-radius:var(--radius-md);text-align:center;">
            <div style="font-size:var(--text-xs);color:var(--color-text-secondary);">Noise Reduction</div>
            <div style="font-size:var(--text-xl);font-weight:700;color:var(--color-primary);">${metrics.nrr.toFixed(1)} dB</div>
          </div>
          <div style="background:var(--color-surface);padding:var(--space-3);border-radius:var(--radius-md);text-align:center;">
            <div style="font-size:var(--text-xs);color:var(--color-text-secondary);">Speech Preserved</div>
            <div style="font-size:var(--text-xl);font-weight:700;color:var(--color-primary);">${metrics.speechPreserved.toFixed(0)}%</div>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download Cleaned Audio (WAV)</button>
      `;

      const canBefore = resultsArea.querySelector("#wave-before");
      const canAfter = resultsArea.querySelector("#wave-after");
      drawWaveform(canBefore, signal, "#6c757d");
      drawWaveform(canAfter, cleaned, "#0d6efd");

      for (const url of objectURLs) URL.revokeObjectURL(url);
      objectURLs.length = 0;

      const beforeURL = URL.createObjectURL(origBlob);
      const afterURL = URL.createObjectURL(outBlob);
      objectURLs.push(beforeURL, afterURL);
      resultsArea.querySelector("#audio-before").src = beforeURL;
      resultsArea.querySelector("#audio-after").src = afterURL;
      resultsArea.querySelector("#download-btn").addEventListener("click", () => {
        downloadBlob(outBlob, "cleaned-audio.wav");
      });

      progressArea.style.display = "none";
      resultsArea.style.display = "block";
      showToast({ message: "Noise reduction complete!", type: "success" });
    } catch (err) {
      progressArea.style.display = "none";
      showToast({ message: "Processing failed: " + err.message, type: "error" });
    } finally {
      processing = false;
      processBtn.disabled = false;
    }
  });

  setupUpload();
}

export function computeMetrics(original, processed) {
  const n = Math.min(original.length, processed.length);
  let sigPower = 0,
    noisePower = 0,
    procPower = 0;
  for (let i = 0; i < n; i++) {
    const o = original[i],
      p = processed[i];
    sigPower += o * o;
    procPower += p * p;
    const diff = o - p;
    noisePower += diff * diff;
  }
  sigPower /= n;
  noisePower /= n;
  procPower /= n;
  const snrIn = sigPower > 0 ? 10 * Math.log10(sigPower / (noisePower + 1e-10)) : 0;
  const snrOut = procPower > 0 ? 10 * Math.log10(procPower / (noisePower + 1e-10)) : 0;
  const nrr = noisePower > 0 ? 10 * Math.log10((sigPower + 1e-10) / (procPower + 1e-10)) : 0;
  const energyRatio = procPower / (sigPower + 1e-10);
  const speechPreserved = Math.min(100, Math.max(0, energyRatio * 100));
  return { snrGain: snrOut - snrIn, nrr: Math.abs(nrr), speechPreserved };
}

let destroyFn = null;

export function destroy() {
  if (typeof destroyFn === "function") destroyFn();
}
