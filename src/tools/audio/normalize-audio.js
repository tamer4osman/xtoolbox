import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import {
  audioBufferToWav,
  getPeakLevel,
  applyGain,
  drawWaveform,
  measureLoudness
} from "./audio-utils.js";
import { createAudioTool } from "./audio-tool-factory.js";

const LUFS_PRESETS = [
  { id: "podcast", label: "Podcast", lufs: -16, desc: "Apple Podcasts / Spotify" },
  { id: "streaming", label: "Streaming", lufs: -14, desc: "Spotify / YouTube music" },
  { id: "broadcast", label: "Broadcast", lufs: -23, desc: "EBU R128 standard" }
];

export const toolConfig = {
  id: "normalize-audio",
  name: "Audio Normalizer",
  category: "audio",
  description:
    "Normalize audio volume using peak normalization or EBU R128 LUFS loudness standards.",
  icon: "📊",
  accept: "audio/*",
  maxSizeMB: 100,
  keywords: [
    "normalize audio",
    "volume normalizer",
    "loudness",
    "lufs",
    "ebu r128",
    "peak",
    "podcast"
  ],
  steps: [
    "Upload an audio file",
    "Choose normalization mode (Peak or Loudness)",
    "For Loudness mode, select a preset or enter custom LUFS target",
    'Click "Normalize" to download'
  ],
  faqs: [
    {
      question: "What is the difference between Peak and Loudness normalization?",
      answer:
        "Peak normalization boosts volume so the loudest sample reaches 0 dB — simple but ignores perceived loudness. Loudness normalization (EBU R128) targets perceived loudness in LUFS, ensuring consistent volume across different content — the broadcast standard for podcasts and streaming."
    },
    {
      question: "Which LUFS target should I use?",
      answer:
        "Podcast: -16 LUFS (Apple/Spotify standard). Streaming music: -14 LUFS. Broadcast TV/radio: -23 LUFS (EBU R128). When in doubt, -16 LUFS works well for most spoken-word content."
    }
  ]
};

export function render(container) {
  const { getAudioBuffer, optionsArea } = createAudioTool({
    container,
    onFileLoaded(buf) {
      updatePeakInfo(buf);
      if (modeSelect.value === "loudness") measureAndUpdateLufs(buf);
    }
  });

  optionsArea.innerHTML = `
    <canvas id="na-waveform" style="width:100%;height:80px;border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-4);"></canvas>
    <div class="stats-row">
      <div class="stat"><span class="stat-label">Peak Level</span><span class="stat-value" id="na-peak-db">-</span></div>
      <div class="stat"><span class="stat-label">Peak %</span><span class="stat-value" id="na-peak-pct">-</span></div>
    </div>

    <div class="na-mode-row">
      <label class="na-mode-label">Normalization Mode</label>
      <div class="na-mode-toggle">
        <button class="na-mode-btn active" data-mode="peak">Peak (0 dB)</button>
        <button class="na-mode-btn" data-mode="loudness">Loudness (LUFS)</button>
      </div>
    </div>

    <div id="na-lufs-section" style="display:none;">
      <div class="na-preset-row">
        ${LUFS_PRESETS.map(
          p => `
          <button class="na-preset-btn" data-lufs="${p.lufs}" title="${p.desc}">
            <span class="na-preset-label">${p.label}</span>
            <span class="na-preset-value">${p.lufs} LUFS</span>
          </button>
        `
        ).join("")}
        <div class="na-custom-preset">
          <label class="na-mode-label" style="margin-bottom:4px;">Custom</label>
          <input type="number" id="na-custom-lufs" class="na-input" value="-16" min="-70" max="0" step="0.1" placeholder="LUFS">
        </div>
      </div>
      <div id="na-lufs-info" class="na-lufs-info" style="display:none;">
        <div class="na-info-row"><span>Measured:</span><span id="na-measured-lufs">-</span></div>
        <div class="na-info-row"><span>Target:</span><span id="na-target-lufs">-</span></div>
        <div class="na-info-row"><span>Gain needed:</span><span id="na-gain-needed">-</span></div>
      </div>
    </div>

    <p id="na-hint" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">Normalization will boost the volume so the peak reaches 0 dB (100%).</p>
    <button class="btn btn-primary btn-lg" id="na-normalize-btn" style="width:100%;">Normalize & Download</button>
  `;

  const waveformCanvas = optionsArea.querySelector("#na-waveform");
  const peakDisplay = optionsArea.querySelector("#na-peak-db");
  const peakPercent = optionsArea.querySelector("#na-peak-pct");
  const modeSelect = optionsArea.querySelector(".na-mode-toggle");
  const lufsSection = optionsArea.querySelector("#na-lufs-section");
  const presetBtns = optionsArea.querySelectorAll(".na-preset-btn");
  const customInput = optionsArea.querySelector("#na-custom-lufs");
  const lufsInfo = optionsArea.querySelector("#na-lufs-info");
  const measuredDisplay = optionsArea.querySelector("#na-measured-lufs");
  const targetDisplay = optionsArea.querySelector("#na-target-lufs");
  const gainDisplay = optionsArea.querySelector("#na-gain-needed");
  const hintEl = optionsArea.querySelector("#na-hint");
  const normalizeBtn = optionsArea.querySelector("#na-normalize-btn");

  let currentMode = "peak";
  let currentTargetLufs = -16;

  function updatePeakInfo(buf) {
    const peak = getPeakLevel(buf);
    const peakDb = peak > 0 ? (20 * Math.log10(peak)).toFixed(1) : "-∞";
    peakDisplay.textContent = `${peakDb} dB`;
    peakPercent.textContent = `${(peak * 100).toFixed(1)}%`;
    waveformCanvas.width = 600;
    waveformCanvas.height = 80;
    drawWaveform(buf, waveformCanvas, peak > 0.95 ? "#EF4444" : "#10B981");
  }

  function measureAndUpdateLufs(buf) {
    const { integratedLoudness } = measureLoudness(buf);
    measuredDisplay.textContent = `${integratedLoudness.toFixed(1)} LUFS`;
    targetDisplay.textContent = `${currentTargetLufs} LUFS`;
    const gainDb = currentTargetLufs - integratedLoudness;
    gainDisplay.textContent = `${gainDb >= 0 ? "+" : ""}${gainDb.toFixed(1)} dB`;
    lufsInfo.style.display = "";
  }

  function setMode(mode) {
    currentMode = mode;
    modeSelect.querySelectorAll(".na-mode-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });
    lufsSection.style.display = mode === "loudness" ? "" : "none";
    hintEl.textContent =
      mode === "peak"
        ? "Normalization will boost the volume so the peak reaches 0 dB (100%)."
        : "Loudness normalization targets perceived volume per EBU R128 standard. Two-pass: measures first, then applies gain.";
    normalizeBtn.textContent = mode === "peak" ? "Normalize & Download" : "Measure & Normalize";

    const buf = getAudioBuffer();
    if (buf && mode === "loudness") measureAndUpdateLufs(buf);
  }

  modeSelect.querySelectorAll(".na-mode-btn").forEach(btn => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTargetLufs = parseFloat(btn.dataset.lufs);
      customInput.value = currentTargetLufs;
      const buf = getAudioBuffer();
      if (buf) measureAndUpdateLufs(buf);
    });
  });

  customInput.addEventListener("input", () => {
    currentTargetLufs = parseFloat(customInput.value) || -16;
    presetBtns.forEach(b => b.classList.remove("active"));
    const buf = getAudioBuffer();
    if (buf) measureAndUpdateLufs(buf);
  });

  normalizeBtn.addEventListener("click", () => {
    const buf = getAudioBuffer();
    if (!buf) return;

    if (currentMode === "peak") {
      const peak = getPeakLevel(buf);
      if (peak === 0) {
        showToast({ message: "Audio is silent", type: "warning" });
        return;
      }
      const gain = 1 / peak;
      downloadBlob(audioBufferToWav(applyGain(buf, gain)), "normalized.wav");
      showToast({ message: `Peak normalized! Gain: ${gain.toFixed(2)}x`, type: "success" });
    } else {
      const { integratedLoudness } = measureLoudness(buf);
      if (integratedLoudness === -Infinity) {
        showToast({ message: "Audio is silent", type: "warning" });
        return;
      }
      const gainDb = currentTargetLufs - integratedLoudness;
      const gainLinear = Math.pow(10, gainDb / 20);
      downloadBlob(audioBufferToWav(applyGain(buf, gainLinear)), "normalized-lufs.wav");
      showToast({
        message: `Loudness normalized: ${integratedLoudness.toFixed(1)} → ${currentTargetLufs} LUFS (${gainDb >= 0 ? "+" : ""}${gainDb.toFixed(1)} dB)`,
        type: "success"
      });
    }
  });
}

export function destroy() {}
