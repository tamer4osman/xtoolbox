import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import {
  loadAudioFile,
  audioBufferToWav,
  sliceAudioBuffer,
  drawWaveform,
  formatAudioTime
} from "./audio-utils.js";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "trim-audio",
  name: "Audio Trimmer",
  category: "audio",
  description: "Cut and trim audio files by setting start and end time.",
  icon: "✂️",
  accept: "audio/*",
  maxSizeMB: 100,
  keywords: ["trim audio", "cut audio", "audio trimmer"],
  steps: [
    "Upload an audio file",
    "Set start and end time",
    'Click "Trim"',
    "Download trimmed audio"
  ],
  faqs: [
    {
      question: "What formats are supported?",
      answer: "MP3, WAV, OGG, FLAC, and more — any format your browser supports."
    }
  ]
};

export function render(container) {
  let audioBuffer = null;
  let duration = 0;

  const upload = createFileUpload({
    accept: "audio/*",
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      audioBuffer = await loadAudioFile(files[0]);
      duration = audioBuffer.duration;
      endTime.value = duration.toFixed(1);
      endLabel.textContent = `/ ${formatAudioTime(duration)}`;
      waveformCanvas.width = 600;
      waveformCanvas.height = 100;
      drawWaveform(audioBuffer, waveformCanvas);
      optionsArea.style.display = "block";
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <canvas id="waveform" style="width:100%;height:100px;border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-4);"></canvas>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
          <div class="form-group"><label>Start (seconds)</label><input type="number" id="start-time" class="text-input" value="0" min="0" step="0.1"></div>
          <div class="form-group"><label>End (seconds) <span id="end-label" style="color:var(--color-text-muted);">/ 0:00</span></label><input type="number" id="end-time" class="text-input" value="0" min="0" step="0.1"></div>
        </div>
        <button class="btn btn-primary btn-lg" id="trim-btn" style="width:100%;">Trim & Download</button>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const waveformCanvas = container.querySelector("#waveform");
  const startTime = container.querySelector("#start-time");
  const endTime = container.querySelector("#end-time");
  const endLabel = container.querySelector("#end-label");
  const trimBtn = container.querySelector("#trim-btn");

  trimBtn.addEventListener("click", () => {
    if (!audioBuffer) return;
    const start = parseFloat(startTime.value) || 0;
    const end = parseFloat(endTime.value) || duration;
    if (start >= end) {
      showToast({ message: "Start must be before end", type: "warning" });
      return;
    }

    const trimmed = sliceAudioBuffer(audioBuffer, start, end);
    const blob = audioBufferToWav(trimmed);
    downloadBlob(blob, "trimmed.wav");
    showToast({
      message: `Trimmed ${formatAudioTime(start)} → ${formatAudioTime(end)}`,
      type: "success"
    });
  });
}

export function destroy() {}
