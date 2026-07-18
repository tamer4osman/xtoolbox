import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob, formatFileSize } from "../../utils/file.js";
import { getVideoInfo, formatTime, writeUploadedFile, loadFFmpeg } from "./video-utils.js";

export const toolConfig = {
  id: "video-stabilizer",
  name: "Video Stabilizer",
  category: "video",
  description: "Reduce camera shake and stabilize shaky video footage.",
  icon: "🎥",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["video stabilizer", "reduce shake", "steady video", "deshake"],
  steps: [
    "Upload a shaky video",
    "Adjust shakiness and smoothing",
    'Click "Stabilize"',
    "Download stabilized video"
  ],
  faqs: [
    {
      question: "What is shakiness?",
      answer:
        "Shakiness (1-10) sets how aggressively deshake corrects rotation and jitter. Higher values fix more severe shake but may crop the frame more."
    },
    {
      question: "What is smoothing?",
      answer:
        "Smoothing (1-30) averages the camera path over that many frames. Higher values produce smoother output but may soften intentional pans."
    },
    {
      question: "Why does it take a while?",
      answer:
        "Stabilization runs ffmpeg's deshake filter across the whole video in a single pass. Longer videos take more time to process."
    }
  ]
};

export function render(container) {
  let currentFile = null;
  let videoInfo = null;
  let stabilizedBlob = null;

  const upload = createFileUpload({
    accept: "video/*",
    multiple: false,
    maxSizeMB: 500,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      currentFile = files[0];
      videoInfo = await getVideoInfo(currentFile);
      tctx.query("#original-size").textContent = videoInfo.sizeFormatted;
      tctx.query("#original-dims").textContent = `${videoInfo.width}×${videoInfo.height}`;
      tctx.query("#original-duration").textContent = formatTime(videoInfo.duration);
      optionsArea.style.display = "block";
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="stats-row" style="margin-bottom:var(--space-4);">
          <div class="stat"><span class="stat-label">Size</span><span class="stat-value" id="original-size">-</span></div>
          <div class="stat"><span class="stat-label">Resolution</span><span class="stat-value" id="original-dims">-</span></div>
          <div class="stat"><span class="stat-label">Duration</span><span class="stat-value" id="original-duration">-</span></div>
        </div>
        <div class="form-group">
          <label>Shakiness (1-10)</label>
          <input type="range" id="shakiness" class="range-input" min="1" max="10" value="5" step="1">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);color:var(--text-muted);">
            <span>Low</span><span id="shakiness-val">5</span><span>High</span>
          </div>
        </div>
        <div class="form-group">
          <label>Smoothing (1-30)</label>
          <input type="range" id="smoothing" class="range-input" min="1" max="30" value="10" step="1">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);color:var(--text-muted);">
            <span>Subtle</span><span id="smoothing-val">10</span><span>Strong</span>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" id="stabilize-btn" style="width:100%;">
          Stabilize Video
        </button>
        <div id="result-area" style="display:none;margin-top:var(--space-4);">
          <div id="result-preview"></div>
          <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;margin-top:var(--space-3);">
            Download Stabilized Video
          </button>
        </div>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p id="pass-label">Stabilizing...</p>
        <p><span id="progress-pct">0</span>%</p>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const processing = container.querySelector("#processing");
  const passLabel = container.querySelector("#pass-label");
  const progressPct = container.querySelector("#progress-pct");
  const resultArea = container.querySelector("#result-area");
  const resultPreview = container.querySelector("#result-preview");
  const stabilizeBtn = container.querySelector("#stabilize-btn");
  const downloadBtn = container.querySelector("#download-btn");
  const shakinessInput = container.querySelector("#shakiness");
  const smoothingInput = container.querySelector("#smoothing");
  const shakinessVal = container.querySelector("#shakiness-val");
  const smoothingVal = container.querySelector("#smoothing-val");

  shakinessInput.addEventListener("input", () => {
    shakinessVal.textContent = shakinessInput.value;
  });
  smoothingInput.addEventListener("input", () => {
    smoothingVal.textContent = smoothingInput.value;
  });

  const tctx = { container, query: sel => container.querySelector(sel) };

  stabilizeBtn.addEventListener("click", async () => {
    if (!currentFile) return;

    stabilizeBtn.style.display = "none";
    resultArea.style.display = "none";
    processing.style.display = "block";

    try {
      const shakiness = parseInt(shakinessInput.value, 10);
      const smoothing = parseInt(smoothingInput.value, 10);

      passLabel.textContent = "Loading FFmpeg...";
      progressPct.textContent = "0";

      const ffmpeg = await loadFFmpeg(pct => {
        progressPct.textContent = pct;
      });

      const ext = currentFile.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;
      await writeUploadedFile(ffmpeg, currentFile, inputName);

      passLabel.textContent = "Stabilizing...";
      progressPct.textContent = "0";

      const rx = shakiness * 4;
      const ry = shakiness * 4;
      const filter = `deshake=rx=${rx}:ry=${ry}:smoothing=${smoothing}:edge=original`;

      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        filter,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "copy",
        "stabilized.mp4"
      ]);

      const outputData = await ffmpeg.readFile("stabilized.mp4");
      stabilizedBlob = new Blob([outputData.buffer], { type: "video/mp4" });

      const previewUrl = URL.createObjectURL(stabilizedBlob);
      resultPreview.innerHTML = `
        <video controls style="width:100%;max-height:400px;border-radius:var(--radius-md);">
          <source src="${previewUrl}" type="video/mp4">
        </video>
      `;
      resultArea.style.display = "block";

      showToast({
        message: `Stabilized! ${formatFileSize(videoInfo.size)} → ${formatFileSize(stabilizedBlob.size)}`,
        type: "success"
      });

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile("stabilized.mp4");
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
      stabilizeBtn.style.display = "inline-flex";
    }
  });

  downloadBtn.addEventListener("click", () => {
    if (stabilizedBlob) {
      downloadBlob(stabilizedBlob, `stabilized-${currentFile.name}`);
    }
  });
}

export function destroy() {}
