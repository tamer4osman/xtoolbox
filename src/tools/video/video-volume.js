import { createVideoTool } from "./video-tool-factory.js";
import { readFFmpegFile } from "./video-utils.js";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "video-volume",
  name: "Video Volume Adjuster",
  category: "video",
  description: "Adjust or mute audio track volume in video files.",
  icon: "🔊",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["volume", "audio", "video", "mute", "loud"],
  steps: [
    "Upload a video",
    "Adjust volume slider or use presets",
    "Preview volume level",
    "Download adjusted video"
  ],
  faqs: [
    {
      question: "What volume levels are supported?",
      answer: "0% (mute) to 300% (triple volume). The slider goes from 0 to 300 in 1% increments."
    },
    {
      question: "Will adjusting volume affect video quality?",
      answer: "No. Only the audio track volume is modified. Video quality is preserved."
    }
  ]
};

export const render = createVideoTool({
  maxSizeMB: 500,
  processingText: "Processing...",
  actionBtnLabel: "🔊 Adjust Volume & Download",
  optionsHTML: `
    <div id="preview-area"></div>
    <div class="form-group">
      <label>Volume Level</label>
      <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);">
        <input type="range" id="volume-slider" min="0" max="300" value="100" style="flex:1;">
        <span id="volume-display" style="min-width:50px;text-align:right;font-weight:600;">100%</span>
      </div>
      <div id="volume-meter" style="height:8px;background:var(--color-border);border-radius:4px;overflow:hidden;margin-bottom:var(--space-3);">
        <div id="volume-fill" style="height:100%;width:33.33%;background:var(--color-primary);transition:width 0.1s;"></div>
      </div>
    </div>
    <div class="form-group">
      <label>Quick Presets</label>
      <div id="preset-buttons" style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
        <button class="btn btn-sm btn-secondary" data-volume="0">🔇 Mute</button>
        <button class="btn btn-sm btn-secondary" data-volume="50">50%</button>
        <button class="btn btn-sm btn-secondary active" data-volume="100">100%</button>
        <button class="btn btn-sm btn-secondary" data-volume="200">200%</button>
        <button class="btn btn-sm btn-secondary" data-volume="300">300%</button>
      </div>
    </div>
    <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3);">
      <button class="btn btn-sm btn-secondary" id="reset-btn">↺ Reset to 100%</button>
    </div>
  `,
  onFileLoaded(videoInfo, tctx) {
    const previewArea = tctx.query("#preview-area");
    previewArea.innerHTML = "";

    const slider = tctx.query("#volume-slider");
    const display = tctx.query("#volume-display");
    const fill = tctx.query("#volume-fill");
    const resetBtn = tctx.query("#reset-btn");

    const updateUI = val => {
      slider.value = val;
      display.textContent = `${val}%`;
      fill.style.width = `${(val / 300) * 100}%`;
      tctx.query("#preset-buttons .btn.active")?.classList.remove("active");
      tctx.query(`[data-volume="${val}"]`)?.classList.add("active");
    };

    slider.addEventListener("input", () => updateUI(parseInt(slider.value)));

    tctx.query("#preset-buttons").addEventListener("click", e => {
      const btn = e.target.closest("[data-volume]");
      if (btn) updateUI(parseInt(btn.dataset.volume));
    });

    resetBtn.addEventListener("click", () => updateUI(100));
  },
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const volume = parseFloat(tctx.getValue("volume-slider") || "100");
    const multiplier = volume / 100;

    const ext = inputName.split(".").pop() || "mp4";
    const outputName = `output.${ext}`;

    if (multiplier === 0) {
      await ffmpeg.exec(["-i", inputName, "-an", "-c:v", "copy", outputName]);
    } else {
      await ffmpeg.exec([
        "-i",
        inputName,
        "-af",
        `volume=${multiplier}`,
        "-c:v",
        "copy",
        outputName
      ]);
    }

    const blob = await readFFmpegFile(ffmpeg, outputName, `video/${ext}`);
    downloadBlob(blob, `volume-${volume}pct.${ext}`);
    await ffmpeg.deleteFile(outputName);
  }
});

export function destroy() {}
