import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import JSZip from "jszip";

const SAMPLE_RATE = 44100;
const SEGMENT_SAMPLES = Math.round(7.8 * SAMPLE_RATE);
const OVERLAP = Math.floor(SEGMENT_SAMPLES / 4);
const STRIDE = SEGMENT_SAMPLES - OVERLAP;
const STEM_NAMES = ["drums", "bass", "other", "vocals"];
const STEM_LABELS = ["Drums", "Bass", "Other", "Vocals"];
const MODEL_URL =
  "https://huggingface.co/StemSplitio/htdemucs-onnx/resolve/main/htdemucs_fp16weights.onnx";
const ORT_CDN = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.min.mjs";

export function makeTransitionWindow(seg, overlap) {
  const w = new Float32Array(seg).fill(1);
  for (let i = 0; i < overlap; i++) {
    const t = i / overlap;
    w[i] = t;
    w[seg - 1 - i] = t;
  }
  return w;
}

export function resampleAudio(buffer, targetRate) {
  const length = Math.ceil(buffer.duration * targetRate);
  const ctx = new OfflineAudioContext(2, length, targetRate);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  return ctx.startRendering();
}

function audioBufferToFloatArrays(buffer) {
  return [buffer.getChannelData(0), buffer.getChannelData(1)];
}



function encodeWavFloat(left, right, sampleRate) {
  const length = left.length;
  const channels = 2;
  const bytesPerSample = 4;
  const dataSize = length * channels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (off, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 3, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 32, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    view.setFloat32(offset, left[i], true);
    view.setFloat32(offset + 4, right[i], true);
    offset += 8;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function normalizeStem(left, right) {
  let max = 0;
  for (let i = 0; i < left.length; i++) {
    const a = Math.abs(left[i]),
      b = Math.abs(right[i]);
    if (a > max) max = a;
    if (b > max) max = b;
  }
  if (max > 1) {
    const gain = 0.99 / max;
    const nl = new Float32Array(left.length);
    const nr = new Float32Array(right.length);
    for (let i = 0; i < left.length; i++) {
      nl[i] = left[i] * gain;
      nr[i] = right[i] * gain;
    }
    return [nl, nr];
  }
  return [left, right];
}

async function loadORT() {
  return import(ORT_CDN);
}

async function loadModel(ort, onProgress) {
  const response = await fetch(MODEL_URL);
  const total = +response.headers.get("content-length") || 174483046;
  let loaded = 0;
  const reader = response.body.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress(loaded / total);
  }
  const blob = new Blob(chunks);
  const buffer = await blob.arrayBuffer();
  return ort.InferenceSession.create(buffer, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
}

async function separateChunks(ort, session, left, right, onProgress) {
  const total = left.length;
  const nChunks = Math.ceil(total / STRIDE);
  const out = STEM_NAMES.map(() => [new Float32Array(total), new Float32Array(total)]);
  const weight = new Float32Array(total);
  const window = makeTransitionWindow(SEGMENT_SAMPLES, OVERLAP);
  const chunkBuf = new Float32Array(2 * SEGMENT_SAMPLES);

  for (let i = 0; i < nChunks; i++) {
    const start = i * STRIDE;
    const end = Math.min(start + SEGMENT_SAMPLES, total);
    const clen = end - start;
    chunkBuf.fill(0);
    chunkBuf
      .subarray(0, clen)
      .set(left.subarray(start, end));
    chunkBuf
      .subarray(1 * SEGMENT_SAMPLES, 1 * SEGMENT_SAMPLES + clen)
      .set(right.subarray(start, end));

    const result = await session.run({
      mix: new ort.Tensor("float32", chunkBuf, [1, 2, SEGMENT_SAMPLES]),
    });
    const stems = result.stems.data;
    const rowLen = 2 * SEGMENT_SAMPLES;

    for (let s = 0; s < 4; s++) {
      const rowOff = s * rowLen;
      for (let c = 0; c < 2; c++) {
        const chOff = rowOff + c * SEGMENT_SAMPLES;
        for (let j = 0; j < clen; j++) {
          out[s][c][start + j] += stems[chOff + j] * window[j];
        }
      }
    }
    for (let j = 0; j < clen; j++) weight[start + j] += window[j];
    onProgress(i + 1, nChunks);
  }

  for (let s = 0; s < 4; s++) {
    for (let j = 0; j < total; j++) {
      const w = Math.max(weight[j], 1e-8);
      out[s][0][j] /= w;
      out[s][1][j] /= w;
    }
  }
  return out;
}

export const toolConfig = {
  id: "stem-separator",
  name: "Vocal / Stem Separator",
  category: "audio",
  description:
    "Split audio into vocals, drums, bass, and other stems using AI. Runs entirely in your browser.",
  icon: "🎵",
  accept: "audio/*",
  maxSizeMB: 200,
  keywords: ["vocal", "stems", "separator", "demucs", "audio", "isolation"],
  steps: [
    "Upload an audio file",
    'Click "Separate Stems"',
    "Wait for AI processing",
    "Download individual stems",
  ],
  faqs: [
    {
      question: "How does it work?",
      answer:
        "It uses Meta's Demucs AI model converted to ONNX format. The model runs entirely in your browser — no data leaves your device.",
    },
    {
      question: "How long does it take?",
      answer:
        "Processing time depends on your device. With WebGPU it's ~1-3x realtime. With WASM it's slower but works on any browser.",
    },
    {
      question: "What audio formats are supported?",
      answer: "Any format your browser can decode: MP3, WAV, FLAC, OGG, M4A, etc.",
    },
  ],
};

export function render(container) {
  let currentBuffer = null;
  let separating = false;

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="file-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);"></div>
        <button class="btn btn-primary btn-lg" id="separate-btn" style="width:100%;" disabled>
          Separate Stems
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
  const separateBtn = container.querySelector("#separate-btn");
  const progressArea = container.querySelector("#progress-area");
  const progressLabel = container.querySelector("#progress-label");
  const progressBar = container.querySelector("#progress-bar");
  const resultsArea = container.querySelector("#results-area");

  function setProgress(label, pct) {
    progressLabel.textContent = label;
    progressBar.style.width = `${Math.round(pct * 100)}%`;
  }

  function showResults(stems) {
    resultsArea.innerHTML = `
      <h3 style="font-size:var(--text-lg);font-weight:600;margin-bottom:var(--space-4);">Separated Stems</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-3);margin-bottom:var(--space-4);">
        ${STEM_LABELS.map(
          (name, i) => `
          <div class="result-card" style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);text-align:center;">
            <div style="font-size:2rem;margin-bottom:var(--space-2);">${["🥁", "🎸", "🎹", "🎤"][i]}</div>
            <div style="font-weight:600;margin-bottom:var(--space-3);">${name}</div>
            <button class="btn btn-sm btn-secondary play-btn" data-stem="${i}" style="margin-right:var(--space-2);">Play</button>
            <button class="btn btn-sm btn-primary download-btn" data-stem="${i}">Download</button>
            <audio class="stem-audio" data-stem="${i}" style="display:none;" controls></audio>
          </div>
        `,
        ).join("")}
      </div>
      <button class="btn btn-primary btn-lg" id="download-all-btn" style="width:100%;">Download All as ZIP</button>
    `;

    resultsArea.querySelectorAll(".play-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = +btn.dataset.stem;
        const audio = resultsArea.querySelector(`audio[data-stem="${i}"]`);
        if (audio.src) {
          if (audio.paused) audio.play();
          else audio.pause();
        } else {
          const blob = encodeWavFloat(...normalizeStem(stems[i][0], stems[i][1]), SAMPLE_RATE);
          audio.src = URL.createObjectURL(blob);
          audio.play();
        }
      });
    });

    resultsArea.querySelectorAll(".download-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = +btn.dataset.stem;
        const blob = encodeWavFloat(...normalizeStem(stems[i][0], stems[i][1]), SAMPLE_RATE);
        downloadBlob(blob, `${STEM_NAMES[i]}.wav`);
      });
    });

    resultsArea.querySelector("#download-all-btn").addEventListener("click", async () => {
      const zip = new JSZip();
      for (let i = 0; i < 4; i++) {
        const blob = encodeWavFloat(...normalizeStem(stems[i][0], stems[i][1]), SAMPLE_RATE);
        zip.file(`${STEM_NAMES[i]}.wav`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "stems.zip");
    });

    resultsArea.style.display = "block";
  }

  function setUpUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.style.display = "none";
    uploadArea.appendChild(input);

    const dropZone = document.createElement("div");
    dropZone.className = "upload-zone";
    dropZone.innerHTML = `
      <div style="font-size:3rem;margin-bottom:var(--space-2);">🎵</div>
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
      const file = e.dataTransfer.files[0];
      if (file) await handleFile(file);
    });
    input.addEventListener("change", async () => {
      if (input.files[0]) await handleFile(input.files[0]);
    });
  }

  async function handleFile(file) {
    if (file.size > toolConfig.maxSizeMB * 1024 * 1024) {
      showToast({ message: `File is too large. Max ${toolConfig.maxSizeMB} MB.`, type: "error" });
      return;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      if (audioBuffer.sampleRate !== SAMPLE_RATE || audioBuffer.numberOfChannels < 2) {
        currentBuffer = await resampleAudio(audioBuffer, SAMPLE_RATE);
      } else {
        currentBuffer = audioBuffer;
      }
      fileInfo.textContent = `${file.name} (${(file.size / 1048576).toFixed(1)} MB, ${currentBuffer.duration.toFixed(1)}s)`;
      optionsArea.style.display = "block";
      resultsArea.style.display = "none";
      progressArea.style.display = "none";
      separateBtn.disabled = false;
    } catch {
      showToast({ message: "Could not decode audio file", type: "error" });
    } finally {
      ctx.close();
    }
  }

  separateBtn.addEventListener("click", async () => {
    if (separating || !currentBuffer) return;
    separating = true;
    separateBtn.disabled = true;
    progressArea.style.display = "block";
    resultsArea.style.display = "none";
    setProgress("Loading AI model (~166 MB)...", 0);

    try {
      const ort = await loadORT();
      const session = await loadModel(ort, (pct) =>
        setProgress(`Loading AI model (${Math.round(pct * 100)}%)...`, pct),
      );

      setProgress("Processing audio...", 0.95);
      const [left, right] = audioBufferToFloatArrays(currentBuffer);
      const leftPadded = new Float32Array(
        Math.ceil(left.length / STRIDE) * STRIDE + SEGMENT_SAMPLES,
      );
      const rightPadded = new Float32Array(
        Math.ceil(right.length / STRIDE) * STRIDE + SEGMENT_SAMPLES,
      );
      leftPadded.set(left);
      rightPadded.set(right);

      const stems = await separateChunks(ort, session, leftPadded, rightPadded, (done, total) => {
        setProgress(`Separating: chunk ${done}/${total}`, 0.95 + (done / total) * 0.05);
      });

      for (let s = 0; s < 4; s++) {
        stems[s][0] = stems[s][0].slice(0, left.length);
        stems[s][1] = stems[s][1].slice(0, right.length);
      }

      progressArea.style.display = "none";
      showResults(stems);
      showToast({ message: "Separation complete!", type: "success" });
    } catch (err) {
      progressArea.style.display = "none";
      showToast({ message: "Separation failed: " + err.message, type: "error" });
    } finally {
      separating = false;
      separateBtn.disabled = false;
    }
  });

  setUpUpload();
}

export function destroy() {}
