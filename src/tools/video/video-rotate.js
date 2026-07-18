import { showToast } from "../../components/toast.js";
import { createVideoTool } from "./video-tool-factory.js";
import { readFFmpegFile } from "./video-utils.js";
import { downloadBlob } from "../../utils/file.js";

const ROTATIONS = [
  { id: "cw90", label: "90° CW", desc: "Clockwise", filter: "transpose=1" },
  { id: "180", label: "180°", desc: "Upside down", filter: "transpose=2,transpose=2" },
  { id: "ccw90", label: "90° CCW", desc: "Counter-CW", filter: "transpose=2" },
  { id: "hflip", label: "H-flip", desc: "Mirror", filter: "hflip" },
  { id: "vflip", label: "V-flip", desc: "Vertical mirror", filter: "vflip" }
];

const toolConfig = {
  id: "video-rotate",
  name: "Video Rotator",
  category: "video",
  description: "Rotate video 90°/180° or flip horizontally/vertically. Fixes sideways phone clips.",
  icon: "🔄",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["rotate video", "flip video", "turn video", "90 degrees", "sideways fix"],
  steps: ["Upload a video", "Choose rotation or flip", "Preview", "Download"],
  faqs: [
    {
      question: "Why is my phone video sideways?",
      answer:
        "Some players ignore rotation metadata. This tool physically rotates the pixels and clears the metadata so it plays correctly everywhere."
    },
    {
      question: "Does audio change?",
      answer: "No. Audio is stream-copied (-c:a copy), unchanged in length or quality."
    },
    {
      question: "Should I rotate before uploading to TikTok?",
      answer:
        "Yes. TikTok sometimes ignores rotation metadata. Pre-rotating physically is the safe path."
    }
  ]
};

const render = createVideoTool({
  optionsHTML: `
    <div id="preview-area"></div>
    <div class="form-group">
      <label>Rotation</label>
      <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-3);">
        <button class="btn btn-sm btn-primary" data-rotate="cw90">90° CW</button>
        <button class="btn btn-sm btn-secondary" data-rotate="180">180°</button>
        <button class="btn btn-sm btn-secondary" data-rotate="ccw90">90° CCW</button>
        <button class="btn btn-sm btn-secondary" data-rotate="hflip">H-flip</button>
        <button class="btn btn-sm btn-secondary" data-rotate="vflip">V-flip</button>
      </div>
    </div>
  `,
  processingText: "Rotating...",
  actionBtnLabel: "Rotate & Download",
  onFileLoaded(videoInfo, tctx) {
    const previewArea = tctx.query("#preview-area");
    previewArea.innerHTML = `<div class="stats-row" style="margin-bottom:var(--space-4);">
      <div class="stat"><span class="stat-label">Size</span><span class="stat-value">${videoInfo.sizeFormatted}</span></div>
      <div class="stat"><span class="stat-label">Duration</span><span class="stat-value">${Math.round(videoInfo.duration)}s</span></div>
    </div>`;
    tctx.container.querySelectorAll("[data-rotate]").forEach(btn => {
      btn.addEventListener("click", () => {
        tctx.container.querySelectorAll("[data-rotate]").forEach(b => {
          b.classList.remove("btn-primary");
          b.classList.add("btn-secondary");
        });
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
      });
    });
  },
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const activeBtn = tctx.container.querySelector("[data-rotate].btn-primary");
    const rotateId = activeBtn ? activeBtn.dataset.rotate : "cw90";
    const rotation = ROTATIONS.find(r => r.id === rotateId);
    if (!rotation) return;

    await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      rotation.filter,
      "-metadata:s:v",
      "rotate=0",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "20",
      "-c:a",
      "copy",
      "output.mp4"
    ]);

    const blob = await readFFmpegFile(ffmpeg, "output.mp4", "video/mp4");
    downloadBlob(blob, `rotated-${rotation.id}.mp4`);
    showToast({ message: `Video rotated! (${rotation.label})`, type: "success" });
    await ffmpeg.deleteFile("output.mp4");
  }
});

export { toolConfig, render };
