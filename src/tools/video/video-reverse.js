import { createVideoTool } from "./video-tool-factory.js";
import { readFFmpegFile } from "./video-utils.js";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "video-reverse",
  name: "Video Reverser",
  category: "video",
  description: "Reverse video playback direction with audio.",
  icon: "⏪",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["reverse", "backward", "video", "rewind"],
  steps: ["Upload a video", "Choose reversal mode", "Click Reverse", "Download reversed video"],
  faqs: [
    {
      question: "Why is there a memory warning?",
      answer:
        "The reverse filter buffers the entire video into memory. Files over 50MB may cause issues on devices with limited RAM."
    },
    {
      question: "What is the boomerang effect?",
      answer: "The video plays forward, then immediately in reverse, creating a loop-like effect."
    }
  ]
};

export const render = createVideoTool({
  maxSizeMB: 500,
  processingText: "Reversing video...",
  actionBtnLabel: "⏪ Reverse & Download",
  optionsHTML: `
    <div id="preview-area"></div>
    <div id="memory-warning" style="display:none;padding:var(--space-3);background:var(--color-warning-bg,#fff3cd);border:1px solid var(--color-warning-border,#ffc107);border-radius:var(--radius);margin-bottom:var(--space-3);color:var(--color-warning-text,#856404);">
      ⚠️ Large file detected. Reversing requires loading the entire video into memory. Processing may be slow or fail on low-memory devices.
    </div>
    <div class="form-group">
      <label>Reversal Mode</label>
      <div id="mode-buttons" style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
        <button class="btn btn-sm btn-secondary active" data-mode="both">Reverse Both</button>
        <button class="btn btn-sm btn-secondary" data-mode="video">Video Only</button>
        <button class="btn btn-sm btn-secondary" data-mode="audio">Audio Only</button>
        <button class="btn btn-sm btn-secondary" data-mode="boomerang">Boomerang</button>
      </div>
    </div>
  `,
  onFileLoaded(videoInfo, tctx) {
    const previewArea = tctx.query("#preview-area");
    previewArea.innerHTML = "";

    const warning = tctx.query("#memory-warning");
    if (videoInfo.size > 50 * 1024 * 1024) {
      warning.style.display = "block";
    } else {
      warning.style.display = "none";
    }

    tctx.query("#mode-buttons").addEventListener("click", e => {
      const btn = e.target.closest("[data-mode]");
      if (btn) {
        tctx.query("#mode-buttons .btn.active")?.classList.remove("active");
        btn.classList.add("active");
      }
    });
  },
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const mode = tctx.query("[data-mode].active")?.dataset.mode || "both";
    const ext = inputName.split(".").pop() || "mp4";
    const outputName = `output.${ext}`;

    if (mode === "boomerang") {
      const tempForward = `forward.${ext}`;
      const tempReversed = `reversed.${ext}`;
      await ffmpeg.exec(["-i", inputName, "-c", "copy", tempForward]);
      await ffmpeg.exec(["-i", inputName, "-vf", "reverse", "-an", tempReversed]);
      await ffmpeg.exec([
        "-i",
        tempForward,
        "-i",
        tempReversed,
        "-filter_complex",
        "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[outv][outa]",
        "-map",
        "[outv]",
        "-map",
        "[outa]",
        outputName
      ]);
      await ffmpeg.deleteFile(tempForward);
      await ffmpeg.deleteFile(tempReversed);
    } else if (mode === "video") {
      await ffmpeg.exec(["-i", inputName, "-vf", "reverse", "-c:a", "copy", outputName]);
    } else if (mode === "audio") {
      await ffmpeg.exec(["-i", inputName, "-af", "areverse", "-c:v", "copy", outputName]);
    } else {
      await ffmpeg.exec(["-i", inputName, "-vf", "reverse", "-af", "areverse", outputName]);
    }

    const blob = await readFFmpegFile(ffmpeg, outputName, `video/${ext}`);
    downloadBlob(blob, `reversed.${ext}`);
    await ffmpeg.deleteFile(outputName);
  }
});

export function destroy() {}
