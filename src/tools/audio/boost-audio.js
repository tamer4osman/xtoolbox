import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { audioBufferToWav, applyGain, drawWaveform, getPeakLevel } from "./audio-utils.js";
import { createAudioTool } from "./audio-tool-factory.js";

export const toolConfig = {
  id: "boost-audio",
  name: "Volume Booster",
  category: "audio",
  description: "Increase or decrease the volume of an audio file.",
  icon: "🔊",
  accept: "audio/*",
  maxSizeMB: 100,
  keywords: ["boost audio", "increase volume", "volume booster"],
  steps: ["Upload an audio file", "Adjust gain slider", "Preview waveform", "Download"],
  faqs: [
    {
      question: "Will boosting cause clipping?",
      answer:
        "Values above 100% may cause clipping (distortion). The tool clips to prevent exceeding maximum."
    }
  ]
};

export function render(container) {
  const { getAudioBuffer, optionsArea } = createAudioTool({
    container,
    onFileLoaded() {
      updatePreview();
    }
  });

  optionsArea.innerHTML = `
    <canvas id="waveform" style="width:100%;height:80px;border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-4);"></canvas>
    <div class="form-group">
      <label>Gain: <strong id="gain-display">100</strong>%</label>
      <input type="range" id="gain-slider" min="10" max="500" value="100" step="5" class="range-slider-input">
      <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-muted);"><span>10% (quiet)</span><span>500% (loud)</span></div>
    </div>
    <div id="peak-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);"></div>
    <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Apply & Download</button>
  `;

  const waveformCanvas = optionsArea.querySelector("#waveform");
  const gainSlider = optionsArea.querySelector("#gain-slider");
  const gainDisplay = optionsArea.querySelector("#gain-display");
  const peakInfo = optionsArea.querySelector("#peak-info");
  const downloadBtn = optionsArea.querySelector("#download-btn");

  function updatePreview() {
    const buf = getAudioBuffer();
    if (!buf) return;
    waveformCanvas.width = 600;
    waveformCanvas.height = 80;
    const gain = parseInt(gainSlider.value) / 100;
    const boosted = applyGain(buf, gain);
    const peak = getPeakLevel(boosted);
    drawWaveform(boosted, waveformCanvas, peak > 1 ? "#EF4444" : "#2563EB");
    peakInfo.textContent =
      peak > 1
        ? `⚠️ Peak: ${(peak * 100).toFixed(0)}% — will clip`
        : `Peak: ${(peak * 100).toFixed(0)}%`;
  }

  gainSlider.addEventListener("input", () => {
    gainDisplay.textContent = gainSlider.value;
    updatePreview();
  });

  downloadBtn.addEventListener("click", () => {
    const buf = getAudioBuffer();
    if (!buf) return;
    const gain = parseInt(gainSlider.value) / 100;
    downloadBlob(audioBufferToWav(applyGain(buf, gain)), `boosted-${gainSlider.value}pct.wav`);
    showToast({ message: `Volume set to ${gainSlider.value}%!`, type: "success" });
  });
}

export function destroy() {}
