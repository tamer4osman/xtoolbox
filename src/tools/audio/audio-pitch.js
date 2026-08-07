import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { audioBufferToWav, drawWaveform, formatAudioTime } from "./audio-utils.js";
import { createAudioTool } from "./audio-tool-factory.js";
import { pitchShift } from "./dsp.js";

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const PRESET_SEMITONES = [-12, -7, -5, 0, 5, 7, 12];

export const toolConfig = {
  id: "audio-pitch",
  name: "Pitch Shifter",
  category: "audio",
  description: "Shift audio pitch up or down by semitones while keeping the same duration.",
  icon: "🎶",
  accept: "audio/*",
  maxSizeMB: 100,
  keywords: ["pitch shift", "pitch shifter", "transpose audio", "change pitch", "semitone"],
  steps: [
    "Upload an audio file",
    "Pick the shift (slider, key, or preset)",
    'Click "Apply Shift"',
    "Review, play, or download"
  ],
  faqs: [
    {
      question: "Does this change the audio speed?",
      answer: "No. The phase vocoder preserves duration while shifting pitch by semitones."
    },
    {
      question: "What are the limits?",
      answer: "You can shift within one octave: from -12 to +12 semitones."
    }
  ]
};

export function shiftSamples(samples, semitones, options = {}) {
  return pitchShift(samples, semitones, options);
}

export function shiftBuffer(buffer, semitones, options = {}) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const channels = buffer.numberOfChannels;
  const result = ctx.createBuffer(channels, buffer.length, buffer.sampleRate);
  for (let ch = 0; ch < channels; ch++) {
    result.getChannelData(ch).set(shiftSamples(buffer.getChannelData(ch), semitones, options));
  }
  return result;
}

export function render(container) {
  let shiftedBuffer = null;
  let sourceNode = null;
  let audioContext = null;

  function stopPlayback() {
    if (sourceNode) {
      try {
        sourceNode.stop();
      } catch {}
      sourceNode.disconnect();
      sourceNode = null;
    }
    playBtn.textContent = "▶ Preview";
  }

  const { getAudioBuffer, optionsArea } = createAudioTool({
    container,
    onFileLoaded(buf) {
      durationInfo.textContent = `Duration: ${formatAudioTime(buf.duration)} · ${buf.sampleRate} Hz`;
      resetResult();
    }
  });

  optionsArea.innerHTML = `
    <div id="duration-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
    <div class="form-group">
      <label>Pitch shift: <strong id="semitones-display">0</strong> st</label>
      <input type="range" id="semitones-slider" min="-12" max="12" value="0" step="1" class="range-slider-input">
      <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-muted);"><span>-12 (down)</span><span>0</span><span>+12 (up)</span></div>
    </div>
    <div class="form-group">
      <label for="key-select">Quick key (semitone from C):</label>
      <select id="key-select" class="select-input">
        ${NOTE_NAMES.map(n => `<option value="${NOTE_NAMES.indexOf(n)}">${n}</option>`).join("")}
      </select>
    </div>
    <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-4);">
      ${PRESET_SEMITONES.map(
        s =>
          `<button class="btn btn-sm btn-secondary${s === 0 ? " active" : ""}" data-semitones="${s}">${s > 0 ? "+" : ""}${s} st</button>`
      ).join("")}
    </div>
    <div id="result-info" style="font-size:var(--text-sm);color:var(--color-primary);font-weight:600;margin-bottom:var(--space-4);"></div>
    <button class="btn btn-primary btn-lg" id="apply-btn" style="width:100%;margin-bottom:var(--space-2);">Apply Shift</button>
    <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-4);">
      <button class="btn btn-secondary" id="play-btn" style="flex:1;display:none;" hidden>▶ Preview</button>
      <button class="btn btn-secondary" id="download-btn" style="flex:1;display:none;" hidden>Download WAV</button>
    </div>
    <canvas id="shifted-waveform" width="600" height="120" style="display:none;width:100%;height:120px;border:1px solid var(--color-border);border-radius:var(--radius-md);" hidden></canvas>
  `;

  const semiDisplay = optionsArea.querySelector("#semitones-display");
  const slider = optionsArea.querySelector("#semitones-slider");
  const keySelect = optionsArea.querySelector("#key-select");
  const durationInfo = optionsArea.querySelector("#duration-info");
  const resultInfo = optionsArea.querySelector("#result-info");
  const applyBtn = optionsArea.querySelector("#apply-btn");
  const playBtn = optionsArea.querySelector("#play-btn");
  const downloadBtn = optionsArea.querySelector("#download-btn");
  const waveform = optionsArea.querySelector("#shifted-waveform");

  function currentSemitones() {
    return parseInt(slider.value, 10);
  }

  function resetResult() {
    shiftedBuffer = null;
    stopPlayback();
    resultInfo.textContent = "";
    playBtn.style.display = "none";
    downloadBtn.style.display = "none";
    waveform.style.display = "none";
  }

  function updateControls() {
    const s = currentSemitones();
    semiDisplay.textContent = s > 0 ? `+${s}` : `${s}`;
    optionsArea.querySelectorAll("[data-semitones]").forEach(btn => {
      btn.classList.toggle("active", parseInt(btn.dataset.semitones, 10) === s);
    });
    const idx = ((s % 12) + 12) % 12;
    keySelect.value = String(idx);
  }

  slider.addEventListener("input", updateControls);
  keySelect.addEventListener("change", () => {
    slider.value = keySelect.value;
    updateControls();
  });
  optionsArea.querySelectorAll("[data-semitones]").forEach(btn => {
    btn.addEventListener("click", () => {
      slider.value = btn.dataset.semitones;
      updateControls();
    });
  });

  applyBtn.addEventListener("click", () => {
    const buf = getAudioBuffer();
    if (!buf) return;
    const semitones = currentSemitones();
    const label = semitones > 0 ? `+${semitones}` : `${semitones}`;
    stopPlayback();
    applyBtn.disabled = true;
    applyBtn.textContent = "Processing…";
    resultInfo.textContent = "Processing…";

    try {
      shiftedBuffer = shiftBuffer(buf, semitones, {});
      resultInfo.textContent = `Shifted ${label} st · duration preserved: ${formatAudioTime(shiftedBuffer.duration)}`;
      playBtn.style.display = "block";
      downloadBtn.style.display = "block";
      waveform.style.display = "block";
      drawWaveform(shiftedBuffer, waveform);
    } catch (err) {
      showToast({ message: "Failed to shift audio.", type: "error" });
      resultInfo.textContent = "";
      shiftedBuffer = null;
    } finally {
      applyBtn.disabled = false;
      applyBtn.textContent = "Apply Shift";
    }
  });

  playBtn.addEventListener("click", async () => {
    if (!shiftedBuffer) return;
    if (sourceNode) {
      stopPlayback();
      return;
    }
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    const source = audioContext.createBufferSource();
    source.buffer = shiftedBuffer;
    source.connect(audioContext.destination);
    source.onended = () => {
      playBtn.textContent = "▶ Preview";
    };
    source.start();
    sourceNode = source;
    playBtn.textContent = "⏸ Pause";
  });

  downloadBtn.addEventListener("click", () => {
    if (!shiftedBuffer) return;
    const s = currentSemitones();
    downloadBlob(audioBufferToWav(shiftedBuffer), `pitch-${s > 0 ? "+" : ""}${s}.wav`);
    showToast({ message: "Pitched audio downloaded!", type: "success" });
  });
}

export function destroy() {
  if (sourceNode) {
    try {
      sourceNode.stop();
    } catch {}
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
